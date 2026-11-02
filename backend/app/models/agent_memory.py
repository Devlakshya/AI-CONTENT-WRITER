from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, JSON, func
from sqlalchemy.orm import relationship
from app.database.base import Base


class AgentMemory(Base):
    __tablename__ = 'agent_memory'

    id = Column(Integer, primary_key=True, index=True)
    agent_execution_id = Column(Integer, ForeignKey('agent_executions.id', ondelete='CASCADE'), nullable=False)
    key = Column(String(length=500), nullable=False)
    value = Column(JSON, nullable=False)
    ttl_seconds = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=True)

    execution = relationship('AgentExecution', back_populates='memory')
