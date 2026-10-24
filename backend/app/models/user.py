import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="creator", nullable=False)  # admin, manager, approver, creator
    title = Column(String(100), default="Content Specialist")
    avatar_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    organization = relationship("Organization", back_populates="users")
    created_contents = relationship("ContentItem", back_populates="creator", foreign_keys="ContentItem.creator_id")
    requested_approvals = relationship("ApprovalRequest", back_populates="requester", foreign_keys="ApprovalRequest.requester_id")
    assigned_approvals = relationship("ApprovalRequest", back_populates="reviewer", foreign_keys="ApprovalRequest.reviewer_id")
    comments = relationship("ContentComment", back_populates="author")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
