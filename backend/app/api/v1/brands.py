from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.brand import BrandProfile
from app.models.user import User
from app.schemas.brand import BrandCreate, BrandUpdate, BrandResponse
from app.api.deps import get_current_user
from app.services.audit_service import record_audit_event
import re

router = APIRouter()

@router.get("", response_model=List[BrandResponse])
def get_brands(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    brands = db.query(BrandProfile).filter(
        BrandProfile.organization_id == current_user.organization_id,
        BrandProfile.is_active == True
    ).all()
    return brands

@router.post("", response_model=BrandResponse)
def create_brand(
    brand_in: BrandCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    slug = re.sub(r'[^a-zA-Z0-9-]', '', brand_in.name.lower().replace(" ", "-"))
    brand = BrandProfile(
        organization_id=current_user.organization_id,
        name=brand_in.name,
        slug=slug,
        description=brand_in.description,
        industry=brand_in.industry,
        tone_voice=brand_in.tone_voice,
        tone_rules=brand_in.tone_rules or [],
        preferred_terms=brand_in.preferred_terms or [],
        prohibited_terms=brand_in.prohibited_terms or [],
        approved_facts=brand_in.approved_facts or [],
        brand_colors=brand_in.brand_colors or [],
        typography=brand_in.typography or {},
        logo_guidelines=brand_in.logo_guidelines,
        logo_url=brand_in.logo_url,
        content_restrictions=brand_in.content_restrictions or [],
        accessibility_reqs=brand_in.accessibility_reqs or [],
        required_disclaimers=brand_in.required_disclaimers or []
    )
    db.add(brand)
    db.commit()
    db.refresh(brand)

    record_audit_event(
        db=db,
        organization_id=current_user.organization_id,
        action="brand_created",
        entity_type="brand",
        entity_id=brand.id,
        user=current_user,
        details={"name": brand.name}
    )
    return brand

@router.get("/{brand_id}", response_model=BrandResponse)
def get_brand(
    brand_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    brand = db.query(BrandProfile).filter(
        BrandProfile.id == brand_id,
        BrandProfile.organization_id == current_user.organization_id
    ).first()
    if not brand:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Brand profile not found")
    return brand

@router.patch("/{brand_id}", response_model=BrandResponse)
def update_brand(
    brand_id: str,
    brand_in: BrandUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    brand = db.query(BrandProfile).filter(
        BrandProfile.id == brand_id,
        BrandProfile.organization_id == current_user.organization_id
    ).first()
    if not brand:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Brand profile not found")

    update_data = brand_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(brand, field, val)
    
    brand.version += 1
    db.commit()
    db.refresh(brand)

    record_audit_event(
        db=db,
        organization_id=current_user.organization_id,
        action="brand_updated",
        entity_type="brand",
        entity_id=brand.id,
        user=current_user,
        details={"version": brand.version}
    )
    return brand

@router.delete("/{brand_id}")
def delete_brand(
    brand_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    brand = db.query(BrandProfile).filter(
        BrandProfile.id == brand_id,
        BrandProfile.organization_id == current_user.organization_id
    ).first()
    if not brand:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Brand profile not found")

    brand.is_active = False
    db.commit()
    return {"status": "success", "message": f"Brand {brand.name} deactivated"}
