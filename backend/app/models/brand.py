import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Boolean, Integer, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.db.session import Base

def generate_uuid():
    return str(uuid.uuid4())

class BrandProfile(Base):
    __tablename__ = "brand_profiles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    slug = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    industry = Column(String(100), default="Technology")
    version = Column(Integer, default=1)
    is_active = Column(Boolean, default=True)

    # Voice & Tone Guidelines
    tone_voice = Column(Text, default="Confident, professional, accessible, and empathetic.")
    tone_rules = Column(JSON, default=list)  # list of {"rule": str, "description": str}

    # Terminology Guidelines
    preferred_terms = Column(JSON, default=list)  # list of {"term": str, "replaces": [str], "rationale": str}
    prohibited_terms = Column(JSON, default=list)  # list of {"term": str, "severity": str, "reason": str, "suggestion": str}

    # Factual Knowledge Base / Approved Claims
    approved_facts = Column(JSON, default=list)  # list of {"id": str, "claim": str, "source": str, "category": str}

    # Visual Guidelines
    brand_colors = Column(JSON, default=list)  # list of {"name": str, "hex": str, "type": str}
    typography = Column(JSON, default=dict)    # {"headings": str, "body": str, "min_font_size": int}
    logo_guidelines = Column(Text, nullable=True)
    logo_url = Column(String(500), nullable=True)

    # Restrictions & Governance
    content_restrictions = Column(JSON, default=list)  # list of prohibited topics/promises
    accessibility_reqs = Column(JSON, default=list)   # list of requirements (alt text, plain English, etc.)
    required_disclaimers = Column(JSON, default=list) # disclaimers that must appear for certain topics

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    organization = relationship("Organization", back_populates="brands")
    contents = relationship("ContentItem", back_populates="brand", cascade="all, delete-orphan")
    reviews = relationship("ReviewSession", back_populates="brand", cascade="all, delete-orphan")
