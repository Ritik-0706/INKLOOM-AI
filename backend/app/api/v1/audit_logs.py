from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.audit_log import AuditLog
from app.models.user import User
from app.api.deps import get_current_user

router = APIRouter()

@router.get("")
def get_audit_logs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    logs = db.query(AuditLog).filter(
        AuditLog.organization_id == current_user.organization_id
    ).order_by(AuditLog.created_at.desc()).limit(100).all()

    return [{
        "id": log.id,
        "action": log.action,
        "entity_type": log.entity_type,
        "entity_id": log.entity_id,
        "user_email": log.user_email,
        "user_name": log.user_name,
        "details": log.details,
        "created_at": log.created_at
    } for log in logs]
