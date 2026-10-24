from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.schemas.analytics import AnalyticsOverviewResponse
from app.api.deps import get_current_user
from app.services.analytics_service import get_organization_analytics

router = APIRouter()

@router.get("/overview", response_model=AnalyticsOverviewResponse)
def get_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    data = get_organization_analytics(db=db, organization_id=current_user.organization_id)
    return data
