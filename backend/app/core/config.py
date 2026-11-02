import json
from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings
from pydantic import AnyUrl, field_validator


class Settings(BaseSettings):
    PROJECT_NAME: str = 'AI Content Writer SaaS'
    DATABASE_URL: str = 'sqlite+aiosqlite:///./app.db'
    SECRET_KEY: str = 'dev-secret-key-change-me'
    ALGORITHM: str = 'HS256'
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    CORS_ORIGINS: List[str] = ['http://localhost:3000']
    OPENAI_API_KEY: str | None = None
    AI_PROVIDER: str = 'local'
    LOCAL_MODEL_PATH: str = 'models/qwen2.5-0.5b-instruct-q4_k_m.gguf'
    LOCAL_N_CTX: int = 2048
    LOCAL_N_THREADS: int = 4
    REDIS_URL: str | None = 'redis://localhost:6379/0'
    CELERY_BROKER_URL: str | None = 'redis://localhost:6379/1'
    CELERY_RESULT_BACKEND: str | None = 'redis://localhost:6379/2'
    EMBEDDING_MODEL: str | None = 'text-embedding-3-small'
    FRONTEND_URL: str = 'http://localhost:3000'
    STRIPE_API_KEY: str | None = None
    STRIPE_WEBHOOK_SECRET: str | None = None
    STRIPE_PRO_PRICE_ID: str | None = None
    PRO_MONTHLY_PRICE_USD: float = 20.0

    @field_validator('CORS_ORIGINS', mode='before')
    @classmethod
    def parse_cors_origins(cls, value):
        if isinstance(value, str):
            if value.startswith('['):
                return json.loads(value)
            return [item.strip() for item in value.split(',') if item.strip()]
        return value

    class Config:
        env_file = Path(__file__).resolve().parents[3] / '.env'
        env_file_encoding = 'utf-8'
        extra = 'ignore'


settings = Settings()
