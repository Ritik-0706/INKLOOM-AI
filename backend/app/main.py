import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.db.session import engine, Base
import app.models # Ensure all models are registered with Base

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Inkloom AI — Enterprise Brand Governance & Intelligent Content Approval Platform",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins in development for easy frontend connectivity
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads for asset previews
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include Routers
from app.api.v1 import (
    auth, organizations, users, brands, content, reviews,
    approvals, comments, analytics, assets, notifications, audit_logs, health
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

@app.get("/")
def root():
    return {
        "service": settings.PROJECT_NAME,
        "tagline": "Create confidently. Stay on-brand. Publish responsibly.",
        "documentation": "/docs",
        "api_v1": settings.API_V1_STR,
        "status": "operational"
    }
