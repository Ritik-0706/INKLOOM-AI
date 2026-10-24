from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class BrandBase(BaseModel):
    name: str
    description: Optional[str] = None
    industry: Optional[str] = "Technology"
    tone_voice: Optional[str] = "Confident, accessible, authoritative yet empathetic."
    tone_rules: Optional[List[Dict[str, Any]]] = []
    preferred_terms: Optional[List[Dict[str, Any]]] = []
    prohibited_terms: Optional[List[Dict[str, Any]]] = []
    approved_facts: Optional[List[Dict[str, Any]]] = []
    brand_colors: Optional[List[Dict[str, Any]]] = []
    typography: Optional[Dict[str, Any]] = {}
    logo_guidelines: Optional[str] = None
    logo_url: Optional[str] = None
    content_restrictions: Optional[List[str]] = []
    accessibility_reqs: Optional[List[str]] = []
    required_disclaimers: Optional[List[Dict[str, Any]]] = []

class BrandCreate(BrandBase):
    pass

class BrandUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    industry: Optional[str] = None
    tone_voice: Optional[str] = None
    tone_rules: Optional[List[Dict[str, Any]]] = None
    preferred_terms: Optional[List[Dict[str, Any]]] = None
    prohibited_terms: Optional[List[Dict[str, Any]]] = None
    approved_facts: Optional[List[Dict[str, Any]]] = None
    brand_colors: Optional[List[Dict[str, Any]]] = None
    typography: Optional[Dict[str, Any]] = None
    logo_guidelines: Optional[str] = None
    logo_url: Optional[str] = None
    content_restrictions: Optional[List[str]] = None
    accessibility_reqs: Optional[List[str]] = None
    required_disclaimers: Optional[List[Dict[str, Any]]] = None

class BrandResponse(BrandBase):
    id: str
    organization_id: str
    slug: str
    version: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
