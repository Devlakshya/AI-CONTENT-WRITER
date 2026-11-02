from datetime import datetime
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from app.database.base import Base


class WorkspaceMember(Base):
    __tablename__ = 'workspace_members'

    id = Column(Integer, primary_key=True, index=True)
    workspace_id = Column(Integer, ForeignKey('workspaces.id', ondelete='CASCADE'), nullable=False)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    role = Column(String(length=50), nullable=False, default='viewer')
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    workspace = relationship('Workspace', back_populates='members')
    user = relationship('User', lazy='joined')
