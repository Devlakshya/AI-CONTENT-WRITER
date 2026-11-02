from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from app.database.base import Base


class Plan(Base):
    __tablename__ = 'plans'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(length=100), unique=True, nullable=False)
    description = Column(String(length=255), nullable=True)
    monthly_limit = Column(Integer, nullable=False, default=20)
    unlimited = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
