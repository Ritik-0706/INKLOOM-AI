from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class CommentCreate(BaseModel):
    message: str
    parent_id: Optional[str] = None

class CommentResponse(BaseModel):
    id: str
    content_id: str
    user_id: Optional[str] = None
    user_name: Optional[str] = None
    user_avatar: Optional[str] = None
    user_role: Optional[str] = None
    message: str
    parent_id: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
