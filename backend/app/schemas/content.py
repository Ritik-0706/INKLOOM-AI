from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel

class ContentBase(BaseModel):
    title: str
    content_type: str = "blog" # blog, advertisement, social_post, email, landing_page, document, image
    brand_id: str

class ContentCreate(ContentBase):
    text_content: str
    visual_asset_url: Optional[str] = None

class ContentUpdate(BaseModel):
    title: Optional[str] = None
    text_content: Optional[str] = None
    visual_asset_url: Optional[str] = None
    change_summary: Optional[str] = "Updated content"

class ContentVersionResponse(BaseModel):
    id: str
    content_id: str
    version_number: int
    text_content: str
    visual_asset_url: Optional[str] = None
    change_summary: Optional[str] = None
    created_by_id: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ContentResponse(BaseModel):
    id: str
    organization_id: str
    brand_id: str
    creator_id: Optional[str] = None
    title: str
    content_type: str
    status: str
    current_version_number: int
    latest_score: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ContentDetailResponse(ContentResponse):
    current_version: Optional[ContentVersionResponse] = None
    versions: List[ContentVersionResponse] = []
