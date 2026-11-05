import re
import time
from collections import defaultdict
from threading import Lock
from datetime import datetime, timedelta, timezone
from typing import Optional

import bcrypt
import jwt

from app.core.config import settings

PASSWORD_MIN_LENGTH = 12
_LOGIN_FAILURES: dict[str, list[float]] = defaultdict(list)
_LOGIN_LOCK = Lock()


def is_valid_password(password: str) -> bool:
    if len(password) < PASSWORD_MIN_LENGTH:
        return False
    if any(ch.isspace() for ch in password):
        return False
    return True


def get_password_hash(password: str) -> str:
    """Hash a password using bcrypt."""
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a bcrypt hash."""
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False


def _now() -> float:
    return time.monotonic()


def get_login_key(ip_address: str, email: str) -> str:
    return f"{ip_address}:{email.lower()}"


def is_login_rate_limited(ip_address: str, email: str) -> bool:
    key = get_login_key(ip_address, email)
    window_seconds = settings.AUTH_LOCKOUT_SECONDS
    max_attempts = settings.AUTH_MAX_LOGIN_ATTEMPTS
    with _LOGIN_LOCK:
        attempts = [ts for ts in _LOGIN_FAILURES.get(key, []) if _now() - ts < window_seconds]
        if len(attempts) >= max_attempts:
            return True
        _LOGIN_FAILURES[key] = attempts
    return False


def record_failed_login(ip_address: str, email: str) -> None:
    key = get_login_key(ip_address, email)
    with _LOGIN_LOCK:
        _LOGIN_FAILURES[key].append(_now())
        cutoff = _now() - settings.AUTH_LOCKOUT_SECONDS
        _LOGIN_FAILURES[key] = [ts for ts in _LOGIN_FAILURES[key] if ts >= cutoff]


def clear_failed_logins(ip_address: str, email: str) -> None:
    key = get_login_key(ip_address, email)
    with _LOGIN_LOCK:
        _LOGIN_FAILURES.pop(key, None)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({
        "iss": settings.JWT_ISSUER,
        "iat": int(now.timestamp()),
        "nbf": int(now.timestamp()),
        "exp": int(expire.timestamp()),
        "token_type": "access"
    })
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY.get_secret_value(),
        algorithm=settings.ALGORITHM,
    )
    return encoded_jwt


def decode_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY.get_secret_value(),
            algorithms=[settings.ALGORITHM],
            issuer=settings.JWT_ISSUER,
            options={"require": ["exp", "iss", "sub", "token_type"]},
        )
        if payload.get("token_type") != "access":
            return None
        return payload
    except Exception:
        return None
