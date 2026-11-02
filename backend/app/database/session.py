from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from sqlalchemy import create_engine
from sqlalchemy.orm import Session as SyncSession
from contextlib import contextmanager
from app.database.base import Base

engine = create_async_engine(str(settings.DATABASE_URL), echo=False, future=True)
AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

async def init_db() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session


# Synchronous session helper for background workers (Celery)
sync_db_url = str(settings.DATABASE_URL)
if '+asyncpg' in sync_db_url:
    sync_db_url = sync_db_url.replace('+asyncpg', '+psycopg')
if '+psycopg2' in sync_db_url:
    sync_db_url = sync_db_url.replace('+psycopg2', '+psycopg')
sync_engine = create_engine(sync_db_url, future=True)
SyncSessionLocal = sessionmaker(bind=sync_engine, class_=SyncSession, expire_on_commit=False)


@contextmanager
def get_sync_db() -> SyncSession:
    db = SyncSessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_sync_db_dep():
    """Dependency for FastAPI to provide a synchronous DB session."""
    db = SyncSessionLocal()
    try:
        yield db
    finally:
        db.close()
