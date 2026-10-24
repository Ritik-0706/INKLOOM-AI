import os
import shutil
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.config import settings
from app.models.asset import AssetMetadata
from app.models.brand import BrandProfile
from app.models.user import User
from app.schemas.asset import AssetAnalyzeResponse, AssetResponse
from app.api.deps import get_current_user
from app.services.asset_analyzer import visual_analyzer

router = APIRouter()

ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]

@router.post("/analyze", response_model=AssetAnalyzeResponse)
async def upload_and_analyze_asset(
    file: UploadFile = File(...),
    brand_id: Optional[str] = Form(None),
    content_type: Optional[str] = Form("social_post"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{file.content_type}'. Allowed: JPEG, PNG, WebP, GIF."
        )

    # Securely save file to uploads folder
    safe_filename = f"{current_user.organization_id}_{file.filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, safe_filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    file_size = os.path.getsize(file_path)
    if file_size > settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024:
        os.remove(file_path)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE_MB}MB."
        )

    # Fetch brand colors if brand specified
    brand_colors = []
    if brand_id:
        brand = db.query(BrandProfile).filter(
            BrandProfile.id == brand_id,
            BrandProfile.organization_id == current_user.organization_id
        ).first()
        if brand and brand.brand_colors:
            brand_colors = brand.brand_colors

    # Analyze with genuine Pillow analyzer
    analysis = visual_analyzer.analyze_image(
        image_path=file_path,
        brand_colors=brand_colors,
        expected_content_type=content_type
    )

    asset = AssetMetadata(
        organization_id=current_user.organization_id,
        filename=file.filename,
        file_path=file_path,
        file_size_bytes=file_size,
        mime_type=file.content_type,
        width=analysis["width"],
        height=analysis["height"],
        aspect_ratio=analysis["aspect_ratio"],
        dominant_colors=analysis["dominant_colors"],
        brand_match_score=analysis["brand_match_score"],
        checks_result=analysis["checks_result"],
        uploaded_by_id=current_user.id
    )
    db.add(asset)
    db.commit()
    db.refresh(asset)

    return AssetAnalyzeResponse(
        asset=AssetResponse.model_validate(asset),
        summary=analysis["summary"],
        warnings=analysis["warnings"],
        recommendations=analysis["recommendations"]
    )

@router.get("", response_model=List[AssetResponse])
def get_assets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    assets = db.query(AssetMetadata).filter(
        AssetMetadata.organization_id == current_user.organization_id
    ).order_by(AssetMetadata.created_at.desc()).all()
    return assets
