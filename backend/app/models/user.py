from sqlalchemy import Column, Integer, String, DateTime, Boolean, func
from sqlalchemy.orm import relationship
from app.database.base import Base


class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(length=120), nullable=False)
    email = Column(String(length=200), unique=True, index=True, nullable=False)
    password_hash = Column(String(length=255), nullable=False)
    is_active = Column(Boolean, default=True, server_default='true', nullable=False)
    is_admin = Column(Boolean, default=False, server_default='false', nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    projects = relationship('Project', back_populates='owner', lazy='joined')
    content_generations = relationship('ContentGeneration', back_populates='user', lazy='joined')
