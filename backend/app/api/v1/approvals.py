from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.approval import ApprovalRequest
from app.models.content import ContentItem, ContentVersion
from app.models.user import User
from app.models.notification import Notification
from app.schemas.approval import ApprovalCreate, ApprovalDecisionRequest, ApprovalResponse
from app.api.deps import get_current_user, require_approver
from app.services.audit_service import record_audit_event

router = APIRouter()

@router.post("", response_model=ApprovalResponse)
def submit_approval(
    approval_in: ApprovalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    content = db.query(ContentItem).filter(
        ContentItem.id == approval_in.content_id,
        ContentItem.organization_id == current_user.organization_id
    ).first()
    if not content:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Content item not found")

    current_v = db.query(ContentVersion).filter(
        ContentVersion.content_id == content.id,
        ContentVersion.version_number == content.current_version_number
    ).first()

    # Create approval request
    req = ApprovalRequest(
        organization_id=current_user.organization_id,
        content_id=content.id,
        content_version_id=current_v.id if current_v else "",
        requester_id=current_user.id,
        reviewer_id=approval_in.reviewer_id,
        status="in_review",
        decision_notes=approval_in.notes,
        requested_version_number=str(content.current_version_number)
    )
    db.add(req)
    content.status = "in_review"
    db.commit()
    db.refresh(req)

    # Notify reviewer if assigned
    if approval_in.reviewer_id:
        notif = Notification(
            user_id=approval_in.reviewer_id,
            title="Content Approval Requested",
            message=f"{current_user.full_name} submitted '{content.title}' (v{content.current_version_number}) for your review.",
            link=f"/approvals",
            notification_type="approval_request"
        )
        db.add(notif)
        db.commit()

    record_audit_event(
        db=db,
        organization_id=current_user.organization_id,
        action="approval_submitted",
        entity_type="approval",
        entity_id=req.id,
        user=current_user,
        details={"content_title": content.title, "version": content.current_version_number}
    )

    return ApprovalResponse(
        id=req.id,
        organization_id=req.organization_id,
        content_id=req.content_id,
        content_version_id=req.content_version_id,
        requester_id=req.requester_id,
        reviewer_id=req.reviewer_id,
        status=req.status,
        decision_notes=req.decision_notes,
        requested_version_number=req.requested_version_number,
        is_superseded=req.is_superseded,
        requested_at=req.requested_at,
        decided_at=req.decided_at,
        content_title=content.title,
        content_type=content.content_type,
        requester_name=current_user.full_name
    )

@router.get("", response_model=List[ApprovalResponse])
def list_approvals(
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(ApprovalRequest).filter(
        ApprovalRequest.organization_id == current_user.organization_id
    )
    if status_filter:
        query = query.filter(ApprovalRequest.status == status_filter)

    approvals = query.order_by(ApprovalRequest.requested_at.desc()).all()
    results = []
    for app in approvals:
        content = db.query(ContentItem).filter(ContentItem.id == app.content_id).first()
        requester = db.query(User).filter(User.id == app.requester_id).first() if app.requester_id else None
        reviewer = db.query(User).filter(User.id == app.reviewer_id).first() if app.reviewer_id else None

        results.append(ApprovalResponse(
            id=app.id,
            organization_id=app.organization_id,
            content_id=app.content_id,
            content_version_id=app.content_version_id,
            requester_id=app.requester_id,
            reviewer_id=app.reviewer_id,
            status=app.status,
            decision_notes=app.decision_notes,
            requested_version_number=app.requested_version_number,
            is_superseded=app.is_superseded,
            requested_at=app.requested_at,
            decided_at=app.decided_at,
            content_title=content.title if content else "Untitled",
            content_type=content.content_type if content else "content",
            requester_name=requester.full_name if requester else "Team Member",
            reviewer_name=reviewer.full_name if reviewer else "Unassigned"
        ))
    return results

@router.post("/{approval_id}/approve", response_model=ApprovalResponse)
def approve_content(
    approval_id: str,
    decision: ApprovalDecisionRequest,
    db: Session = Depends(get_db),
    approver: User = Depends(require_approver)
):
    req = db.query(ApprovalRequest).filter(
        ApprovalRequest.id == approval_id,
        ApprovalRequest.organization_id == approver.organization_id
    ).first()
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Approval request not found")

    content = db.query(ContentItem).filter(ContentItem.id == req.content_id).first()
    req.status = "approved"
    req.reviewer_id = approver.id
    req.decided_at = datetime.now(timezone.utc)
    if decision.decision_notes:
        req.decision_notes = decision.decision_notes

    if content:
        content.status = "approved"

    db.commit()
    db.refresh(req)

    # Notify requester
    if req.requester_id:
        notif = Notification(
            user_id=req.requester_id,
            title="Content Approved!",
            message=f"'{content.title if content else 'Your content'}' has been approved by {approver.full_name}.",
            link=f"/approvals",
            notification_type="approval_decision"
        )
        db.add(notif)
        db.commit()

    record_audit_event(
        db=db,
        organization_id=approver.organization_id,
        action="content_approved",
        entity_type="approval",
        entity_id=req.id,
        user=approver,
        details={"content_id": req.content_id, "notes": decision.decision_notes}
    )

    return ApprovalResponse(
        id=req.id,
        organization_id=req.organization_id,
        content_id=req.content_id,
        content_version_id=req.content_version_id,
        requester_id=req.requester_id,
        reviewer_id=req.reviewer_id,
        status=req.status,
        decision_notes=req.decision_notes,
        requested_version_number=req.requested_version_number,
        is_superseded=req.is_superseded,
        requested_at=req.requested_at,
        decided_at=req.decided_at,
        content_title=content.title if content else "Untitled",
        reviewer_name=approver.full_name
    )

@router.post("/{approval_id}/request-changes", response_model=ApprovalResponse)
def request_changes(
    approval_id: str,
    decision: ApprovalDecisionRequest,
    db: Session = Depends(get_db),
    approver: User = Depends(require_approver)
):
    req = db.query(ApprovalRequest).filter(
        ApprovalRequest.id == approval_id,
        ApprovalRequest.organization_id == approver.organization_id
    ).first()
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Approval request not found")

    content = db.query(ContentItem).filter(ContentItem.id == req.content_id).first()
    req.status = "changes_requested"
    req.reviewer_id = approver.id
    req.decided_at = datetime.now(timezone.utc)
    req.decision_notes = decision.decision_notes or "Revisions requested before brand sign-off."

    if content:
        content.status = "changes_requested"

    db.commit()
    db.refresh(req)

    # Notify requester
    if req.requester_id:
        notif = Notification(
            user_id=req.requester_id,
            title="Changes Requested",
            message=f"{approver.full_name} requested modifications on '{content.title if content else 'your content'}': {req.decision_notes}",
            link=f"/content/{content.id if content else ''}",
            notification_type="approval_decision"
        )
        db.add(notif)
        db.commit()

    record_audit_event(
        db=db,
        organization_id=approver.organization_id,
        action="changes_requested",
        entity_type="approval",
        entity_id=req.id,
        user=approver,
        details={"content_id": req.content_id, "notes": req.decision_notes}
    )

    return ApprovalResponse(
        id=req.id,
        organization_id=req.organization_id,
        content_id=req.content_id,
        content_version_id=req.content_version_id,
        requester_id=req.requester_id,
        reviewer_id=req.reviewer_id,
        status=req.status,
        decision_notes=req.decision_notes,
        requested_version_number=req.requested_version_number,
        is_superseded=req.is_superseded,
        requested_at=req.requested_at,
        decided_at=req.decided_at,
        content_title=content.title if content else "Untitled",
        reviewer_name=approver.full_name
    )

@router.post("/{approval_id}/reject", response_model=ApprovalResponse)
def reject_approval(
    approval_id: str,
    decision: ApprovalDecisionRequest,
    db: Session = Depends(get_db),
    approver: User = Depends(require_approver)
):
    req = db.query(ApprovalRequest).filter(
        ApprovalRequest.id == approval_id,
        ApprovalRequest.organization_id == approver.organization_id
    ).first()
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Approval request not found")

    content = db.query(ContentItem).filter(ContentItem.id == req.content_id).first()
    req.status = "rejected"
    req.reviewer_id = approver.id
    req.decided_at = datetime.now(timezone.utc)
    req.decision_notes = decision.decision_notes or "Rejected due to brand guideline divergence."

    if content:
        content.status = "rejected"

    db.commit()
    db.refresh(req)

    return ApprovalResponse(
        id=req.id,
        organization_id=req.organization_id,
        content_id=req.content_id,
        content_version_id=req.content_version_id,
        requester_id=req.requester_id,
        reviewer_id=req.reviewer_id,
        status=req.status,
        decision_notes=req.decision_notes,
        requested_version_number=req.requested_version_number,
        is_superseded=req.is_superseded,
        requested_at=req.requested_at,
        decided_at=req.decided_at,
        content_title=content.title if content else "Untitled",
        reviewer_name=approver.full_name
    )
