from sqlalchemy import Column, Integer, String, Boolean, DateTime, func
from app.database.base import Base


class AIProvider(Base):
    __tablename__ = 'ai_providers'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(length=100), nullable=False, unique=True)
    enabled = Column(Boolean(), nullable=False, server_default='true')
    api_key_reference = Column(String(length=255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
