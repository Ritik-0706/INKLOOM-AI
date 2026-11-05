from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str = "creator"  # admin, manager, approver, creator
    title: Optional[str] = "Content Specialist"


class UserCreate(UserBase):
    password: str = Field(..., min_length=12, description="Password must be at least 12 characters and include uppercase, lowercase, digits, and a symbol.")
    organization_name: Optional[str] = "Acme Corp"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: str
    organization_id: str
    avatar_url: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class TokenData(BaseModel):
    sub: Optional[str] = None
    org: Optional[str] = None
    role: Optional[str] = None
