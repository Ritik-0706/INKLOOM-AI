from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.audit_log import AuditLog
from app.models.user import User

def record_audit_event(
    db: Session,
    organization_id: str,
    action: str,
    entity_type: str,
    entity_id: str,
    user: Optional[User] = None,
    details: Optional[Dict[str, Any]] = None
) -> AuditLog:
    log = AuditLog(
        organization_id=organization_id,
        user_id=user.id if user else None,
        user_email=user.email if user else "system",
        user_name=user.full_name if user else "System Automated",
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        details=details or {}
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log
