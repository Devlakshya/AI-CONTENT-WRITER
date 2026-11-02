from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, JSON, func
from app.database.base import Base


class AuditLog(Base):
    __tablename__ = 'audit_logs'

    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String(length=100), nullable=False)
    user_id = Column(Integer, nullable=True)
    actor_id = Column(Integer, nullable=True)
    ip_address = Column(String(length=50), nullable=True)
    payload = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
