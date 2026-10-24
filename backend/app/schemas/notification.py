from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class NotificationResponse(BaseModel):
    id: str
    user_id: str
    title: str
    message: str
    link: Optional[str] = None
    notification_type: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True
