from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.content import ContentItem, ContentVersion
from app.models.brand import BrandProfile
from app.models.user import User
from app.schemas.content import (
    ContentCreate, ContentUpdate, ContentResponse, ContentDetailResponse, ContentVersionResponse
)
from app.api.deps import get_current_user
from app.services.audit_service import record_audit_event

router = APIRouter()

@router.get("", response_model=List[ContentResponse])
def get_contents(
    brand_id: Optional[str] = None,
    content_type: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(ContentItem).filter(ContentItem.organization_id == current_user.organization_id)
    if brand_id:
        query = query.filter(ContentItem.brand_id == brand_id)
    if content_type:
        query = query.filter(ContentItem.content_type == content_type)
    if status_filter:
        query = query.filter(ContentItem.status == status_filter)
    
    return query.order_by(ContentItem.updated_at.desc()).all()

@router.post("", response_model=ContentDetailResponse)
def create_content(
    content_in: ContentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    brand = db.query(BrandProfile).filter(
        BrandProfile.id == content_in.brand_id,
        BrandProfile.organization_id == current_user.organization_id
    ).first()
    if not brand:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Brand profile not found")

    content = ContentItem(
        organization_id=current_user.organization_id,
        brand_id=brand.id,
        creator_id=current_user.id,
        title=content_in.title,
        content_type=content_in.content_type,
        status="draft",
        current_version_number=1,
        latest_score=100.0
    )
    db.add(content)
    db.commit()
    db.refresh(content)

    # Initial version
    v1 = ContentVersion(
        content_id=content.id,
        version_number=1,
        text_content=content_in.text_content,
        visual_asset_url=content_in.visual_asset_url,
        change_summary="Initial content draft",
        created_by_id=current_user.id
    )
    db.add(v1)
    db.commit()
    db.refresh(v1)

    record_audit_event(
        db=db,
        organization_id=current_user.organization_id,
        action="content_created",
        entity_type="content",
        entity_id=content.id,
        user=current_user,
        details={"title": content.title, "type": content.content_type}
    )

    return ContentDetailResponse(
        id=content.id,
        organization_id=content.organization_id,
        brand_id=content.brand_id,
        creator_id=content.creator_id,
        title=content.title,
        content_type=content.content_type,
        status=content.status,
        current_version_number=content.current_version_number,
        latest_score=content.latest_score,
        created_at=content.created_at,
        updated_at=content.updated_at,
        current_version=ContentVersionResponse.model_validate(v1),
        versions=[ContentVersionResponse.model_validate(v1)]
    )

@router.get("/{content_id}", response_model=ContentDetailResponse)
def get_content_detail(
    content_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    content = db.query(ContentItem).filter(
        ContentItem.id == content_id,
        ContentItem.organization_id == current_user.organization_id
    ).first()
    if not content:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Content item not found")

    versions = db.query(ContentVersion).filter(
        ContentVersion.content_id == content.id
    ).order_by(ContentVersion.version_number.desc()).all()

    current_v = next((v for v in versions if v.version_number == content.current_version_number), versions[0] if versions else None)

    return ContentDetailResponse(
        id=content.id,
        organization_id=content.organization_id,
        brand_id=content.brand_id,
        creator_id=content.creator_id,
        title=content.title,
        content_type=content.content_type,
        status=content.status,
        current_version_number=content.current_version_number,
        latest_score=content.latest_score,
        created_at=content.created_at,
        updated_at=content.updated_at,
        current_version=ContentVersionResponse.model_validate(current_v) if current_v else None,
        versions=[ContentVersionResponse.model_validate(v) for v in versions]
    )

@router.patch("/{content_id}", response_model=ContentDetailResponse)
def update_content(
    content_id: str,
    update_in: ContentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    content = db.query(ContentItem).filter(
        ContentItem.id == content_id,
        ContentItem.organization_id == current_user.organization_id
    ).first()
    if not content:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Content item not found")

    if update_in.title:
        content.title = update_in.title

    latest_v = db.query(ContentVersion).filter(
        ContentVersion.content_id == content.id,
        ContentVersion.version_number == content.current_version_number
    ).first()

    # If text is updated or asset is updated, create a new version
    if update_in.text_content is not None or update_in.visual_asset_url is not None:
        new_version_num = content.current_version_number + 1
        new_text = update_in.text_content if update_in.text_content is not None else (latest_v.text_content if latest_v else "")
        new_asset = update_in.visual_asset_url if update_in.visual_asset_url is not None else (latest_v.visual_asset_url if latest_v else None)

        new_v = ContentVersion(
            content_id=content.id,
            version_number=new_version_num,
            text_content=new_text,
            visual_asset_url=new_asset,
            change_summary=update_in.change_summary or f"Version {new_version_num} updates",
            created_by_id=current_user.id
        )
        db.add(new_v)
        content.current_version_number = new_version_num
        
        # If content was previously approved or under review, invalidate it back to draft/in_review
        if content.status == "approved":
            content.status = "draft"

    db.commit()
    db.refresh(content)

    return get_content_detail(content_id=content_id, db=db, current_user=current_user)

@router.delete("/{content_id}")
def delete_content(
    content_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    content = db.query(ContentItem).filter(
        ContentItem.id == content_id,
        ContentItem.organization_id == current_user.organization_id
    ).first()
    if not content:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Content item not found")

    db.delete(content)
    db.commit()
    return {"status": "success", "message": "Content deleted successfully"}
