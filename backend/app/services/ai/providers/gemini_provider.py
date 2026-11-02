from typing import Any, Dict, Iterable, List
from app.services.ai.providers.base_provider import BaseProvider
from app.core.config import settings


class GeminiProvider(BaseProvider):
    name = 'gemini'

    def __init__(self, api_key: str | None = None):
        self.api_key = api_key or getattr(settings, 'GEMINI_API_KEY', None)

    def generate_text(self, prompt: str, model: str, max_tokens: int = 512, **kwargs) -> Dict[str, Any]:
        # Placeholder: implement using Google Gemini client
        raise RuntimeError('Gemini provider not implemented')

    def stream_text(self, prompt: str, model: str, **kwargs):
        raise RuntimeError('Gemini provider not implemented')

    def generate_embeddings(self, texts: Iterable[str], model: str) -> List[List[float]]:
        raise RuntimeError('Gemini provider embeddings not implemented')

    def estimate_cost(self, tokens_in: int, tokens_out: int, model: str) -> float:
        return 0.0

    def health_check(self) -> bool:
        return bool(self.api_key)
