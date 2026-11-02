from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, JSON, func
from sqlalchemy.orm import relationship
from app.database.base import Base


class WorkflowExecution(Base):
    __tablename__ = 'workflow_executions'

    id = Column(Integer, primary_key=True, index=True)
    version_id = Column(Integer, ForeignKey('workflow_versions.id', ondelete='SET NULL'), nullable=True)
    status = Column(String(length=50), nullable=False, server_default='queued')  # queued, running, completed, failed, cancelled
    owner_id = Column(Integer, ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    workspace_id = Column(Integer, ForeignKey('workspaces.id', ondelete='CASCADE'), nullable=False)
    input_data = Column(JSON, nullable=True)
    output_data = Column(JSON, nullable=True)
    error = Column(String(length=1000), nullable=True)
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    version = relationship('WorkflowVersion', back_populates='executions')
    owner = relationship('User', lazy='joined')
    workspace = relationship('Workspace', lazy='joined')
    agent_executions = relationship('AgentExecution', back_populates='workflow_execution', cascade='all, delete-orphan')
    logs = relationship('ExecutionLog', back_populates='execution', cascade='all, delete-orphan')
