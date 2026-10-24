import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Integer, Float, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.db.session import Base

def generate_uuid():
    return str(uuid.uuid4())

class ContentItem(Base):
    __tablename__ = "content_items"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    brand_id = Column(String(36), ForeignKey("brand_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    creator_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    
    title = Column(String(255), nullable=False)
    content_type = Column(String(50), default="blog", nullable=False) # blog, advertisement, social_post, email, landing_page, document, image
    status = Column(String(50), default="draft", nullable=False)      # draft, in_review, changes_requested, approved, rejected, archived
    current_version_number = Column(Integer, default=1, nullable=False)
    latest_score = Column(Float, default=100.0, nullable=False)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    organization = relationship("Organization", back_populates="contents")
    brand = relationship("BrandProfile", back_populates="contents")
    creator = relationship("User", back_populates="created_contents", foreign_keys=[creator_id])
    versions = relationship("ContentVersion", back_populates="content", cascade="all, delete-orphan", order_by="ContentVersion.version_number.desc()")
    reviews = relationship("ReviewSession", back_populates="content", cascade="all, delete-orphan")
    approvals = relationship("ApprovalRequest", back_populates="content", cascade="all, delete-orphan")
    comments = relationship("ContentComment", back_populates="content", cascade="all, delete-orphan")

class ContentVersion(Base):
    __tablename__ = "content_versions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    content_id = Column(String(36), ForeignKey("content_items.id", ondelete="CASCADE"), nullable=False, index=True)
    version_number = Column(Integer, nullable=False)
    text_content = Column(Text, nullable=False)
    visual_asset_url = Column(String(500), nullable=True)
    change_summary = Column(String(500), default="Initial draft")
    created_by_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    content = relationship("ContentItem", back_populates="versions")
    reviews = relationship("ReviewSession", back_populates="content_version", cascade="all, delete-orphan")
    approvals = relationship("ApprovalRequest", back_populates="content_version")
