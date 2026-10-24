import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Integer, Float, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.db.session import Base

def generate_uuid():
    return str(uuid.uuid4())

class ReviewSession(Base):
    __tablename__ = "review_sessions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    content_id = Column(String(36), ForeignKey("content_items.id", ondelete="CASCADE"), nullable=False, index=True)
    content_version_id = Column(String(36), ForeignKey("content_versions.id", ondelete="CASCADE"), nullable=False, index=True)
    brand_id = Column(String(36), ForeignKey("brand_profiles.id", ondelete="CASCADE"), nullable=False, index=True)

    compliance_score = Column(Float, default=100.0, nullable=False)
    engine_type = Column(String(50), default="local_deterministic", nullable=False)
    status = Column(String(50), default="completed", nullable=False) # completed, critical_flags, passed
    
    critical_count = Column(Integer, default=0)
    high_count = Column(Integer, default=0)
    medium_count = Column(Integer, default=0)
    low_count = Column(Integer, default=0)
    info_count = Column(Integer, default=0)

    summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    content = relationship("ContentItem", back_populates="reviews")
    content_version = relationship("ContentVersion", back_populates="reviews")
    brand = relationship("BrandProfile", back_populates="reviews")
    issues = relationship("ReviewIssue", back_populates="review", cascade="all, delete-orphan", order_by="ReviewIssue.severity.asc()")

class ReviewIssue(Base):
    __tablename__ = "review_issues"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    review_id = Column(String(36), ForeignKey("review_sessions.id", ondelete="CASCADE"), nullable=False, index=True)

    rule_id = Column(String(100), nullable=False)
    category = Column(String(50), nullable=False) # tone_of_voice, terminology, messaging, factual_accuracy, unsupported_claims, visual_consistency, accessibility, policy_violations
    severity = Column(String(30), nullable=False) # critical, high, medium, low, informational
    
    excerpt = Column(Text, nullable=False)
    start_pos = Column(Integer, default=0)
    end_pos = Column(Integer, default=0)

    explanation = Column(Text, nullable=False)
    guideline_reference = Column(String(255), nullable=True)
    suggested_correction = Column(Text, nullable=True)
    confidence = Column(Float, default=0.95)

    status = Column(String(30), default="open", nullable=False) # open, accepted, dismissed, resolved
    dismissal_reason = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    review = relationship("ReviewSession", back_populates="issues")
