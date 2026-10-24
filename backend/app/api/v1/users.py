from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserResponse
from app.api.deps import get_current_user, require_admin

router = APIRouter()

@router.get("", response_model=List[UserResponse])
def get_team_members(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    users = db.query(User).filter(User.organization_id == current_user.organization_id).all()
    return users

@router.patch("/{user_id}/role", response_model=UserResponse)
def update_user_role(
    user_id: str,
    new_role: str,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    user = db.query(User).filter(
        User.id == user_id,
        User.organization_id == admin.organization_id
    ).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    if new_role not in ["admin", "manager", "approver", "creator"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid role specified")

    user.role = new_role
    db.commit()
    db.refresh(user)
    return user
