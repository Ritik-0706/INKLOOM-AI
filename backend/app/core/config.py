import os
from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import EmailStr, Field, SecretStr

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=Path(__file__).resolve().parents[2] / ".env",
        case_sensitive=True,
        extra="ignore",
    )

    PROJECT_NAME: str = "Inkloom AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: SecretStr = Field(min_length=32)
    JWT_ISSUER: str = "inkloom-ai"
    BOOTSTRAP_ADMIN_EMAIL: EmailStr | None = None
    BOOTSTRAP_ADMIN_PASSWORD: SecretStr | None = None
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    ALGORITHM: str = "HS256"
    AUTH_MAX_LOGIN_ATTEMPTS: int = 6
    AUTH_LOCKOUT_SECONDS: int = 900
    
    # Database
    DATABASE_URL: str = Field(min_length=1)
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ]

    # AI Engine Configuration
    AI_PROVIDER: str = "local_deterministic"  # "local_deterministic" or "openai"
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o-mini"
    
    # Groq AI & LangChain Chatbot Configuration
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "qwen/qwen3.8-27b"

    # Upload storage
    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE_MB: int = 15

settings = Settings()

upload_dir = Path(settings.UPLOAD_DIR)
if not upload_dir.is_absolute():
    upload_dir = Path(__file__).resolve().parents[2] / upload_dir
settings.UPLOAD_DIR = str(upload_dir)
os.makedirs(upload_dir, exist_ok=True)
