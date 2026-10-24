from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class ApprovalCreate(BaseModel):
    content_id: str
    reviewer_id: Optional[str] = None
    notes: Optional[str] = None

class ApprovalDecisionRequest(BaseModel):
    decision_notes: Optional[str] = None

class ApprovalResponse(BaseModel):
    id: str
    organization_id: str
    content_id: str
    content_version_id: str
    requester_id: Optional[str] = None
    reviewer_id: Optional[str] = None
    status: str
    decision_notes: Optional[str] = None
    requested_version_number: Optional[str] = None
    is_superseded: bool
    requested_at: datetime
    decided_at: Optional[datetime] = None

    content_title: Optional[str] = None
    content_type: Optional[str] = None
    requester_name: Optional[str] = None
    reviewer_name: Optional[str] = None

    class Config:
        from_attributes = True
