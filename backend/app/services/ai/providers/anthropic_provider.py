from typing import Any, Dict, Iterable, List
from app.services.ai.providers.base_provider import BaseProvider
from app.core.config import settings


class AnthropicProvider(BaseProvider):
    name = 'anthropic'

    def __init__(self, api_key: str | None = None):
        self.api_key = api_key or getattr(settings, 'ANTHROPIC_API_KEY', None)

    def generate_text(self, prompt: str, model: str, max_tokens: int = 512, **kwargs) -> Dict[str, Any]:
        # Placeholder: actual implementation requires anthropic client
        raise RuntimeError('Anthropic provider not implemented')

    def stream_text(self, prompt: str, model: str, **kwargs):
        raise RuntimeError('Anthropic provider not implemented')

    def generate_embeddings(self, texts: Iterable[str], model: str) -> List[List[float]]:
        raise RuntimeError('Anthropic provider does not support embeddings in this placeholder')

    def estimate_cost(self, tokens_in: int, tokens_out: int, model: str) -> float:
        return 0.0

    def health_check(self) -> bool:
        return bool(self.api_key)
