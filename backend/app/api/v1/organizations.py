from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.organization import Organization
from app.models.user import User
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/current")
def get_current_organization(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    org = db.query(Organization).filter(Organization.id == current_user.organization_id).first()
    return {
        "id": org.id,
        "name": org.name,
        "slug": org.slug,
        "plan": org.plan,
        "member_count": db.query(User).filter(User.organization_id == org.id).count(),
        "created_at": org.created_at
    }
