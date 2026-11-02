from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, JSON, func
from sqlalchemy.orm import relationship
from app.database.base import Base


class WorkflowStep(Base):
    __tablename__ = 'workflow_steps'

    id = Column(Integer, primary_key=True, index=True)
    version_id = Column(Integer, ForeignKey('workflow_versions.id', ondelete='CASCADE'), nullable=False)
    node_id = Column(String(length=100), nullable=False)
    node_type = Column(String(length=50), nullable=False)  # agent, condition, delay, approval, start, end
    agent_id = Column(Integer, ForeignKey('agents.id', ondelete='SET NULL'), nullable=True)
    config = Column(JSON, nullable=True)
    next_nodes = Column(JSON, nullable=True)  # list of (next_node_id, condition) or just [next_node_id]
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    version = relationship('WorkflowVersion', back_populates='steps')
    agent = relationship('Agent', lazy='joined')
