from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, JSON, Float, Boolean, func
from sqlalchemy.orm import relationship
from app.database.base import Base


class AgentExecution(Base):
    __tablename__ = 'agent_executions'

    id = Column(Integer, primary_key=True, index=True)
    workflow_execution_id = Column(Integer, ForeignKey('workflow_executions.id', ondelete='CASCADE'), nullable=False)
    step_id = Column(String(length=100), nullable=False)
    agent_impl_id = Column(Integer, ForeignKey('agent_implementations.id', ondelete='SET NULL'), nullable=True)
    input_data = Column(JSON, nullable=False)
    output_data = Column(JSON, nullable=True)
    status = Column(String(length=50), nullable=False, server_default='pending')  # pending, running, completed, failed
    error = Column(String(length=1000), nullable=True)
    retries = Column(Integer, nullable=False, server_default='0')
    tokens_used = Column(Integer, nullable=True)
    estimated_cost = Column(Float, nullable=True)
    latency_ms = Column(Float, nullable=True)
    idempotency_key = Column(String(length=255), nullable=True)
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    workflow_execution = relationship('WorkflowExecution', back_populates='agent_executions')
    implementation = relationship('AgentImplementation', back_populates='executions')
    memory = relationship('AgentMemory', back_populates='execution', cascade='all, delete-orphan')
