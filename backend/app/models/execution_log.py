from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from app.database.base import Base


class ExecutionLog(Base):
    __tablename__ = 'execution_logs'

    id = Column(Integer, primary_key=True, index=True)
    workflow_execution_id = Column(Integer, ForeignKey('workflow_executions.id', ondelete='CASCADE'), nullable=False)
    level = Column(String(length=20), nullable=False)  # debug, info, warning, error
    message = Column(String(length=2000), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    execution = relationship('WorkflowExecution', back_populates='logs')
