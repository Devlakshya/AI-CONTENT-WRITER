from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, Float, DateTime, func
from sqlalchemy.orm import relationship
from app.database.base import Base


class ModelConfiguration(Base):
    __tablename__ = 'model_configurations'

    id = Column(Integer, primary_key=True, index=True)
    provider_id = Column(Integer, ForeignKey('ai_providers.id', ondelete='CASCADE'), nullable=False)
    model_name = Column(String(length=200), nullable=False)
    max_tokens = Column(Integer, nullable=False, default=1024)
    input_cost = Column(Float, nullable=False, default=0.0)  # cost per input token
    output_cost = Column(Float, nullable=False, default=0.0)  # cost per output token
    active = Column(Boolean(), nullable=False, server_default='true')
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    provider = relationship('AIProvider', lazy='joined')
