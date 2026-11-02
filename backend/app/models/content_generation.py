from datetime import datetime
from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, Text, DateTime
from sqlalchemy.orm import relationship
from app.database.base import Base


class ContentGeneration(Base):
    __tablename__ = 'content_generations'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    project_id = Column(Integer, ForeignKey('projects.id', ondelete='SET NULL'), nullable=True)
    title = Column(String(length=255), nullable=True)
    content_type = Column(String(length=50), nullable=False)
    prompt = Column(Text, nullable=False)
    generated_content = Column(Text, nullable=True)
    favorite = Column(Boolean, default=False)
    tone = Column(String(length=50), nullable=True)
    word_count = Column(Integer, nullable=True)
    target_audience = Column(String(length=255), nullable=True)
    keywords = Column(String(length=1024), nullable=True)
    language = Column(String(length=50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship('User', back_populates='content_generations')
    project = relationship('Project', back_populates='content_generations')
