import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.db.session import Base

def generate_uuid():
    return str(uuid.uuid4())

class ApprovalRequest(Base):
    __tablename__ = "approval_requests"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    content_id = Column(String(36), ForeignKey("content_items.id", ondelete="CASCADE"), nullable=False, index=True)
    content_version_id = Column(String(36), ForeignKey("content_versions.id", ondelete="CASCADE"), nullable=False, index=True)
    requester_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    reviewer_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)

    status = Column(String(50), default="in_review", nullable=False) # in_review, approved, changes_requested, rejected, archived
    decision_notes = Column(Text, nullable=True)
    requested_version_number = Column(String(20), nullable=True)
    is_superseded = Column(Boolean, default=False)

    requested_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    decided_at = Column(DateTime, nullable=True)

    # Relationships
    content = relationship("ContentItem", back_populates="approvals")
    content_version = relationship("ContentVersion", back_populates="approvals")
    requester = relationship("User", back_populates="requested_approvals", foreign_keys=[requester_id])
    reviewer = relationship("User", back_populates="assigned_approvals", foreign_keys=[reviewer_id])
