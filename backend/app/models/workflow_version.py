from sqlalchemy import Column, Integer, ForeignKey, DateTime, JSON, func
from sqlalchemy.orm import relationship
from app.database.base import Base


class WorkflowVersion(Base):
    __tablename__ = 'workflow_versions'

    id = Column(Integer, primary_key=True, index=True)
    workflow_id = Column(Integer, ForeignKey('workflows.id', ondelete='CASCADE'), nullable=False)
    version_number = Column(Integer, nullable=False)
    graph_json = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    workflow = relationship('Workflow', back_populates='versions')
    steps = relationship('WorkflowStep', back_populates='version', cascade='all, delete-orphan')
    executions = relationship('WorkflowExecution', back_populates='version')
