from typing import List, Sequence
from app.core.config import settings


class EmbeddingService:
    def __init__(self):
        self.provider = settings.OPENAI_API_KEY and 'openai' or None

    def embed_texts(self, texts: Sequence[str]) -> List[List[float]]:
        if self.provider == 'openai':
            return self._embed_openai(texts)
        raise RuntimeError('No embedding provider configured')

    def _embed_openai(self, texts: Sequence[str]) -> List[List[float]]:
        try:
            import openai
        except Exception:
            raise RuntimeError('openai package required')
        openai.api_key = settings.OPENAI_API_KEY
        model = getattr(settings, 'EMBEDDING_MODEL', 'text-embedding-3-small')
        resp = openai.Embeddings.create(model=model, input=list(texts))
        return [e['embedding'] for e in resp['data']]


embedding_service = EmbeddingService()
