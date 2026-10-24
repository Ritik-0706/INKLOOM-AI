from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.content import ContentItem, ContentVersion
from app.models.brand import BrandProfile
from app.models.review import ReviewSession, ReviewIssue
from app.models.user import User
from app.schemas.review import (
    ReviewCreate, ReviewResponse, ReviewIssueResponse, IssueUpdate, ApplySuggestionRequest
)
from app.api.deps import get_current_user
from app.services.llm_provider import get_analysis_provider
from app.services.audit_service import record_audit_event

router = APIRouter()

@router.post("", response_model=ReviewResponse)
async def create_review(
    review_in: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    content = db.query(ContentItem).filter(
        ContentItem.id == review_in.content_id,
        ContentItem.organization_id == current_user.organization_id
    ).first()
    if not content:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Content item not found")

    brand = db.query(BrandProfile).filter(
        BrandProfile.id == content.brand_id,
        BrandProfile.organization_id == current_user.organization_id
    ).first()
    if not brand:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Associated brand profile not found")

    # Get target version
    if review_in.content_version_id:
        version = db.query(ContentVersion).filter(
            ContentVersion.id == review_in.content_version_id,
            ContentVersion.content_id == content.id
        ).first()
    else:
        version = db.query(ContentVersion).filter(
            ContentVersion.content_id == content.id,
            ContentVersion.version_number == content.current_version_number
        ).first()

    if not version:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Content version not found")

    # Run analysis
    provider = get_analysis_provider(prefer_llm=review_in.force_llm)
    score, detected_issues, summary, provider_used = await provider.analyze_content(
        text=version.text_content,
        brand_profile=brand,
        content_type=content.content_type,
        has_visual=bool(version.visual_asset_url),
        image_alt=""
    )

    # Count issues by severity
    critical_c = sum(1 for i in detected_issues if i.severity == "critical")
    high_c = sum(1 for i in detected_issues if i.severity == "high")
    med_c = sum(1 for i in detected_issues if i.severity == "medium")
    low_c = sum(1 for i in detected_issues if i.severity == "low")
    info_c = sum(1 for i in detected_issues if i.severity == "informational")

    rev_status = "critical_flags" if critical_c > 0 else ("passed" if len(detected_issues) == 0 else "completed")

    session = ReviewSession(
        organization_id=current_user.organization_id,
        content_id=content.id,
        content_version_id=version.id,
        brand_id=brand.id,
        compliance_score=score,
        engine_type=provider_used,
        status=rev_status,
        critical_count=critical_c,
        high_count=high_c,
        medium_count=med_c,
        low_count=low_c,
        info_count=info_c,
        summary=summary
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    # Save issues
    issue_objects = []
    for issue in detected_issues:
        iss = ReviewIssue(
            review_id=session.id,
            rule_id=issue.rule_id,
            category=issue.category,
            severity=issue.severity,
            excerpt=issue.excerpt,
            start_pos=issue.start_pos,
            end_pos=issue.end_pos,
            explanation=issue.explanation,
            guideline_reference=issue.guideline_reference,
            suggested_correction=issue.suggested_correction,
            confidence=issue.confidence,
            status="open"
        )
        db.add(iss)
        issue_objects.append(iss)

    # Update content score
    content.latest_score = score
    db.commit()
    db.refresh(session)

    record_audit_event(
        db=db,
        organization_id=current_user.organization_id,
        action="review_executed",
        entity_type="review",
        entity_id=session.id,
        user=current_user,
        details={"score": score, "issues_count": len(detected_issues), "engine": provider_used}
    )

    return session

@router.get("/{review_id}", response_model=ReviewResponse)
def get_review(
    review_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session = db.query(ReviewSession).filter(
        ReviewSession.id == review_id,
        ReviewSession.organization_id == current_user.organization_id
    ).first()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review session not found")
    return session

@router.get("", response_model=List[ReviewResponse])
def get_reviews(
    content_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(ReviewSession).filter(
        ReviewSession.organization_id == current_user.organization_id
    )
    if content_id:
        query = query.filter(ReviewSession.content_id == content_id)
    return query.order_by(ReviewSession.created_at.desc()).limit(50).all()

@router.patch("/issues/{issue_id}", response_model=ReviewIssueResponse)
def update_issue_status(
    issue_id: str,
    update_in: IssueUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    issue = db.query(ReviewIssue).join(ReviewSession).filter(
        ReviewIssue.id == issue_id,
        ReviewSession.organization_id == current_user.organization_id
    ).first()
    if not issue:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Issue not found")

    issue.status = update_in.status
    if update_in.dismissal_reason:
        issue.dismissal_reason = update_in.dismissal_reason

    db.commit()
    db.refresh(issue)
    return issue

@router.post("/issues/{issue_id}/apply-suggestion")
def apply_suggestion(
    issue_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    issue = db.query(ReviewIssue).join(ReviewSession).filter(
        ReviewIssue.id == issue_id,
        ReviewSession.organization_id == current_user.organization_id
    ).first()
    if not issue:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Issue not found")

    if not issue.suggested_correction:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No suggested correction available for this issue")

    review = db.query(ReviewSession).filter(ReviewSession.id == issue.review_id).first()
    content = db.query(ContentItem).filter(ContentItem.id == review.content_id).first()
    current_v = db.query(ContentVersion).filter(
        ContentVersion.content_id == content.id,
        ContentVersion.version_number == content.current_version_number
    ).first()

    old_text = current_v.text_content
    # Replace the excerpt with the suggested correction
    if issue.excerpt in old_text:
        new_text = old_text.replace(issue.excerpt, issue.suggested_correction, 1)
    else:
        # Fallback if text shifted slightly
        new_text = old_text.replace(issue.excerpt.lower(), issue.suggested_correction, 1)

    # Create new version to preserve audit trail
    new_version_num = content.current_version_number + 1
    new_version = ContentVersion(
        content_id=content.id,
        version_number=new_version_num,
        text_content=new_text,
        visual_asset_url=current_v.visual_asset_url,
        change_summary=f"Applied fix for {issue.rule_id}: '{issue.excerpt}' → '{issue.suggested_correction}'",
        created_by_id=current_user.id
    )
    db.add(new_version)
    content.current_version_number = new_version_num
    
    # Mark issue as accepted/resolved
    issue.status = "accepted"

    db.commit()
    db.refresh(content)
    db.refresh(new_version)

    record_audit_event(
        db=db,
        organization_id=current_user.organization_id,
        action="suggestion_applied",
        entity_type="content",
        entity_id=content.id,
        user=current_user,
        details={"issue_id": issue.id, "rule": issue.rule_id, "new_version": new_version_num}
    )

    return {
        "status": "success",
        "message": f"Applied fix and generated version {new_version_num}",
        "new_version_number": new_version_num,
        "new_text_content": new_text,
        "issue": ReviewIssueResponse.model_validate(issue)
    }
