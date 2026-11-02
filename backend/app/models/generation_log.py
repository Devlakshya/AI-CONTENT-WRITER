from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, DateTime, Float, func
from app.database.base import Base


class GenerationLog(Base):
    __tablename__ = 'generation_logs'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    provider = Column(String(length=100), nullable=False)
    model = Column(String(length=200), nullable=False)
    tokens_in = Column(Integer, nullable=True)
    tokens_out = Column(Integer, nullable=True)
    latency_ms = Column(Float, nullable=True)
    estimated_cost = Column(Float, nullable=True)
    success = Column(Boolean(), nullable=False, server_default='true')
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
