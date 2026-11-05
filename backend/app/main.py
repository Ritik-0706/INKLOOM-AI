from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.core.security import get_password_hash
from app.db.session import engine, Base, SessionLocal
from app.models.organization import Organization
from app.models.user import User
import app.models # Ensure all models are registered with Base

# Create tables
Base.metadata.create_all(bind=engine)

def bootstrap_admin():
    email = settings.BOOTSTRAP_ADMIN_EMAIL
    password = settings.BOOTSTRAP_ADMIN_PASSWORD
    if email is None and password is None:
        return
    if email is None or password is None:
        raise RuntimeError("Both bootstrap administrator environment variables must be configured together.")

    raw_password = password.get_secret_value()
    if len(raw_password) < 16:
        raise RuntimeError("The bootstrap administrator password must be at least 16 characters.")

    db = SessionLocal()
    try:
        existing_user = db.query(User).filter(User.email == str(email)).first()
        if existing_user:
            if existing_user.role != "admin":
                raise RuntimeError("The bootstrap administrator email is already assigned to a non-admin account.")
            return

        organization = db.query(Organization).filter(Organization.slug == "inkloom").first()
        if organization is None:
            organization = Organization(name="Inkloom", slug="inkloom")
            db.add(organization)
            db.flush()

        db.add(
            User(
                organization_id=organization.id,
                email=str(email),
                hashed_password=get_password_hash(raw_password),
                full_name="Inkloom Administrator",
                role="admin",
                title="Administrator",
            )
        )
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()

bootstrap_admin()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Inkloom AI — Enterprise Brand Governance & Intelligent Content Approval Platform",
    docs_url="/docs",
    redoc_url="/redoc"
)

@app.middleware("http")
async def security_headers_middleware(request, call_next):
    response = await call_next(request)
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "no-referrer"
    response.headers["Permissions-Policy"] = "accelerometer=(), camera=(), geolocation=()"
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "base-uri 'self'; "
        "object-src 'none'; "
        "frame-ancestors 'none'; "
        "img-src 'self' data:; "
        "style-src 'self' 'unsafe-inline'; "
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
        "connect-src 'self' http://localhost:5173 http://127.0.0.1:5173 http://localhost:3000 http://127.0.0.1:3000"
    )
    return response

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads for asset previews
from fastapi.staticfiles import StaticFiles
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include Routers
from app.api.v1 import (
    auth, organizations, users, brands, content, reviews,
    approvals, comments, analytics, assets, notifications, audit_logs, health, chat
)

# Top-level health endpoints
app.include_router(health.router, tags=["Health"])
app.include_router(health.router, prefix=settings.API_V1_STR, tags=["Health"])

app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["Authentication"])
app.include_router(organizations.router, prefix=f"{settings.API_V1_STR}/organizations", tags=["Organizations"])
app.include_router(users.router, prefix=f"{settings.API_V1_STR}/users", tags=["Team & Users"])
app.include_router(brands.router, prefix=f"{settings.API_V1_STR}/brands", tags=["Brand Guidelines"])
app.include_router(content.router, prefix=f"{settings.API_V1_STR}/content", tags=["Content"])
app.include_router(reviews.router, prefix=f"{settings.API_V1_STR}/reviews", tags=["Review Studio"])
app.include_router(approvals.router, prefix=f"{settings.API_V1_STR}/approvals", tags=["Approvals"])
app.include_router(comments.router, prefix=f"{settings.API_V1_STR}", tags=["Collaboration"])
app.include_router(analytics.router, prefix=f"{settings.API_V1_STR}/analytics", tags=["Analytics"])
app.include_router(assets.router, prefix=f"{settings.API_V1_STR}/assets", tags=["Visual Assets"])
app.include_router(notifications.router, prefix=f"{settings.API_V1_STR}/notifications", tags=["Notifications"])
app.include_router(audit_logs.router, prefix=f"{settings.API_V1_STR}/audit-logs", tags=["Audit Trail"])
app.include_router(chat.router, prefix=f"{settings.API_V1_STR}/chat", tags=["Brand Copilot AI"])

@app.get(f"{settings.API_V1_STR}/", tags=["Health"])
def api_root():
    return {
        "service": settings.PROJECT_NAME,
        "api_version": settings.API_V1_STR,
        "documentation": "/docs",
        "status": "operational",
    }

@app.api_route(
    "/api/{unmatched_path:path}",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
    include_in_schema=False,
)
def api_not_found():
    return JSONResponse(status_code=404, content={"detail": "Not Found"})

frontend_dir = Path(__file__).resolve().parents[2] / "frontend" / "dist"
if frontend_dir.is_dir():
    app.frontend("/", directory=frontend_dir, fallback="index.html")
else:
    @app.get("/")
    def root():
        return {
            "service": settings.PROJECT_NAME,
            "tagline": "Create confidently. Stay on-brand. Publish responsibly.",
            "documentation": "/docs",
            "api_v1": settings.API_V1_STR,
            "status": "operational",
        }
