from app.core.celery_app import celery_app
from app.services.embedding_service import embedding_service
from app.utils.rag import clean_text, chunk_text
from app.database.session import get_sync_db
from app.models import Document, DocumentChunk, EmbeddingMetadata
from sqlalchemy.orm import Session


@celery_app.task(bind=True)
def process_document(self, document_id: int, filepath: str, content_type: str):
    with get_sync_db() as db:
        try:
            from app.utils.rag import (
                extract_text_from_pdf,
                extract_text_from_docx,
                extract_text_from_txt,
                extract_text_from_md,
            )

            if content_type == 'application/pdf':
                text = extract_text_from_pdf(filepath)
            elif content_type in ('application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'docx'):
                text = extract_text_from_docx(filepath)
            elif content_type in ('text/markdown', 'text/md'):
                text = extract_text_from_md(filepath)
            else:
                text = extract_text_from_txt(filepath)

            cleaned = clean_text(text)
            chunks = chunk_text(cleaned)

            for idx, ch in enumerate(chunks):
                chunk = DocumentChunk(document_id=document_id, chunk_index=idx, text=ch)
                db.add(chunk)
                db.flush()
                vec = embedding_service.embed_texts([ch])[0]
                emb = EmbeddingMetadata(chunk_id=chunk.id, vector=vec, provider='openai', model='default')
                db.add(emb)

            db.commit()
        except Exception:
            db.rollback()
            raise
