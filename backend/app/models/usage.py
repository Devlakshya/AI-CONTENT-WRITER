from datetime import datetime
from sqlalchemy import Column, Integer, ForeignKey, String, DateTime, func
from app.database.base import Base


class UsageTracking(Base):
    __tablename__ = 'usage_tracking'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    month = Column(String(length=7), nullable=False, index=True)
    generation_count = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=func.now(), nullable=False)
