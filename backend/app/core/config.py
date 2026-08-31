"""
Application Settings & Configuration.
"""

from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Bulls & Bears Word Puzzle Platform"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api"
    
    # Security & JWT
    SECRET_KEY: str = "bulls-and-bears-ultra-secure-trading-secret-key-2026-xyz"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Database
    # Default is SQLite for instant local execution, PostgreSQL can be set via env var
    DATABASE_URL: str = "sqlite+aiosqlite:///./bulls_bears.db"

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
