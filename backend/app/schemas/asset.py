from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class ColorInfo(BaseModel):
    hex: str
    percentage: float
    rgb: List[int]
    closest_brand_color: Optional[str] = None
    delta_e: Optional[float] = None
    is_brand_compliant: Optional[bool] = None

class AssetResponse(BaseModel):
    id: str
    organization_id: str
    filename: str
    file_path: str
    file_size_bytes: int
    mime_type: str
    width: int
    height: int
    aspect_ratio: Optional[str] = None
    dominant_colors: List[ColorInfo] = []
    brand_match_score: float
    checks_result: Dict[str, Any] = {}
    created_at: datetime

    class Config:
        from_attributes = True

class AssetAnalyzeResponse(BaseModel):
    asset: AssetResponse
    summary: str
    warnings: List[str] = []
    recommendations: List[str] = []
