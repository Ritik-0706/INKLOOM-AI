import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base

def generate_uuid():
    return str(uuid.uuid4())

class ContentComment(Base):
    __tablename__ = "content_comments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    content_id = Column(String(36), ForeignKey("content_items.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    message = Column(Text, nullable=False)
    parent_id = Column(String(36), nullable=True) # For threaded replies
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    content = relationship("ContentItem", back_populates="comments")
    author = relationship("User", back_populates="comments")
