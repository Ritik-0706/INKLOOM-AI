from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db.session import get_db
from app.core.config import settings
from app.services.llm_provider import get_analysis_provider

router = APIRouter()

@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    db_ok = False
    try:
        db.execute(text("SELECT 1"))
        db_ok = True
    except Exception:
        db_ok = False

    provider = get_analysis_provider()

    return {
        "status": "healthy" if db_ok else "degraded",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "database_connected": db_ok,
        "ai_engine": {
            "provider": provider.provider_name,
            "mode": "deterministic_local_rules",
            "fallback_ready": True,
            "external_llm_configured": bool(settings.OPENAI_API_KEY)
        }
    }
