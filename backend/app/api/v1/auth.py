import re
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.security import (
    clear_failed_logins,
    create_access_token,
    get_password_hash,
    is_login_rate_limited,
    is_valid_password,
    record_failed_login,
    verify_password,
)
from app.db.session import get_db
from app.models.organization import Organization
from app.models.user import User
from app.schemas.user import Token, UserCreate, UserResponse
from app.services.audit_service import record_audit_event

router = APIRouter()


def _get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    if request.client:
        return request.client.host
    return "unknown"


@router.post("/register", response_model=Token)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    if not is_valid_password(user_in.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 12 characters long and cannot contain spaces.",
        )

    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists",
        )

    org_name = (user_in.organization_name or "Acme Corp").strip()
    org_slug = re.sub(r"[^a-zA-Z0-9-]", "", org_name.lower().replace(" ", "-")) or "acme-corp"
    org = db.query(Organization).filter(Organization.slug == org_slug).first()
    if not org:
        org = Organization(name=org_name, slug=org_slug)
        db.add(org)
        db.commit()
        db.refresh(org)

    hashed = get_password_hash(user_in.password)
    user = User(
        organization_id=org.id,
        email=user_in.email,
        hashed_password=hashed,
        full_name=user_in.full_name,
        role="creator",
        title=user_in.title or "Content Specialist",
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    record_audit_event(
        db=db,
        organization_id=org.id,
        action="user_registered",
        entity_type="user",
        entity_id=user.id,
        user=user,
        details={"email": user.email, "role": user.role},
    )

    access_token = create_access_token(data={"sub": user.id, "org": user.organization_id, "role": user.role})
    return {"access_token": access_token, "token_type": "bearer", "user": user}


@router.post("/login", response_model=Token)
async def login(request: Request, db: Session = Depends(get_db)):
    content_type = request.headers.get("content-type", "")
    email = ""
    password = ""

    if "application/json" in content_type:
        body = await request.json()
        email = (body.get("email") or body.get("username") or "").strip()
        password = body.get("password", "")
    else:
        form = await request.form()
        email = (form.get("username") or form.get("email") or "").strip()
        password = form.get("password", "")

    client_ip = _get_client_ip(request)
    if is_login_rate_limited(client_ip, email):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many failed login attempts. Please try again later.",
        )

    if not email or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email and password are required",
        )

    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.hashed_password):
        record_failed_login(client_ip, email)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user account",
        )

    clear_failed_logins(client_ip, email)
    access_token = create_access_token(data={"sub": user.id, "org": user.organization_id, "role": user.role})
    return {"access_token": access_token, "token_type": "bearer", "user": user}


@router.get("/me", response_model=UserResponse)
def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user
