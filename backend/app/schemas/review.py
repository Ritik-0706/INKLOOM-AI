from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel

class ReviewCreate(BaseModel):
    content_id: str
    content_version_id: Optional[str] = None
    force_llm: Optional[bool] = False

class ReviewIssueResponse(BaseModel):
    id: str
    review_id: str
    rule_id: str
    category: str
    severity: str
    excerpt: str
    start_pos: int
    end_pos: int
    explanation: str
    guideline_reference: Optional[str] = None
    suggested_correction: Optional[str] = None
    confidence: float
    status: str
    dismissal_reason: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class IssueUpdate(BaseModel):
    status: str # "accepted", "dismissed", "resolved", "open"
    dismissal_reason: Optional[str] = None

class ApplySuggestionRequest(BaseModel):
    issue_id: str

class ReviewResponse(BaseModel):
    id: str
    organization_id: str
    content_id: str
    content_version_id: str
    brand_id: str
    compliance_score: float
    engine_type: str
    status: str
    critical_count: int
    high_count: int
    medium_count: int
    low_count: int
    info_count: int
    summary: Optional[str] = None
    created_at: datetime
    issues: List[ReviewIssueResponse] = []

    class Config:
        from_attributes = True
