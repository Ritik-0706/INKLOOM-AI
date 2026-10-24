import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.db.session import Base

def generate_uuid():
    return str(uuid.uuid4())

class AssetMetadata(Base):
    __tablename__ = "asset_metadata"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size_bytes = Column(Integer, nullable=False)
    mime_type = Column(String(100), nullable=False)
    
    width = Column(Integer, default=0)
    height = Column(Integer, default=0)
    aspect_ratio = Column(String(50), nullable=True)

    dominant_colors = Column(JSON, default=list) # [{"hex": "#...", "percentage": float, "rgb": [r,g,b]}]
    brand_match_score = Column(Float, default=0.0) # 0 to 100
    checks_result = Column(JSON, default=dict)     # color deviations, dimension checks, alt text status

    uploaded_by_id = Column(String(36), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    organization = relationship("Organization", back_populates="assets")
