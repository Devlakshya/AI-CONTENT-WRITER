from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.base import Base


class Project(Base):
    __tablename__ = 'projects'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    title = Column(String(length=200), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship('User', back_populates='projects')
    content_generations = relationship('ContentGeneration', back_populates='project')
