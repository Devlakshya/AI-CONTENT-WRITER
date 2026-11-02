from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, func
from sqlalchemy.orm import relationship
from app.database.base import Base


class KnowledgeBase(Base):
    __tablename__ = 'knowledge_bases'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(length=200), nullable=False)
    description = Column(Text, nullable=True)
    workspace_id = Column(Integer, ForeignKey('workspaces.id', ondelete='CASCADE'), nullable=False)
    owner_id = Column(Integer, ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    workspace = relationship('Workspace', lazy='joined')
    owner = relationship('User', lazy='joined')
    documents = relationship('Document', back_populates='knowledge_base', cascade='all, delete-orphan')
