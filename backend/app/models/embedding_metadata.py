from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Float, JSON, func
from sqlalchemy.orm import relationship
from app.database.base import Base
try:
    from pgvector.sqlalchemy import Vector
except Exception:
    Vector = None


class EmbeddingMetadata(Base):
    __tablename__ = 'embeddings'

    id = Column(Integer, primary_key=True, index=True)
    chunk_id = Column(Integer, ForeignKey('document_chunks.id', ondelete='CASCADE'), nullable=False)
    # if pgvector is available, use Vector column; otherwise store as JSON
    vector = Column(Vector(1536)) if Vector is not None else Column(JSON, nullable=False)
    provider = Column(String(length=50), nullable=False)
    model = Column(String(length=100), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    chunk = relationship('DocumentChunk', back_populates='embedding')
