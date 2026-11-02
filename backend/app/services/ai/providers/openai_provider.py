from typing import Any, Dict, Iterable, List
from app.services.ai.providers.base_provider import BaseProvider
from app.core.config import settings
import time


class OpenAIProvider(BaseProvider):
    name = 'openai'

    def __init__(self, api_key: str | None = None):
        self.api_key = api_key or settings.OPENAI_API_KEY

    def generate_text(self, prompt: str, model: str, max_tokens: int = 512, **kwargs) -> Dict[str, Any]:
        try:
            import openai
        except Exception:
            raise RuntimeError('openai package is required')
        openai.api_key = self.api_key
        start = time.time()
        resp = openai.ChatCompletion.create(model=model, messages=[{'role':'user','content':prompt}], max_tokens=max_tokens)
        end = time.time()
        text = resp['choices'][0]['message']['content']
        usage = resp.get('usage', {})
        return {
            'text': text,
            'usage': usage,
            'latency_ms': (end-start)*1000,
            'raw': resp,
        }

    def stream_text(self, prompt: str, model: str, **kwargs):
        try:
            import openai
        except Exception:
            raise RuntimeError('openai package is required')
        openai.api_key = self.api_key
        # streaming implementation omitted for brevity; yield chunks
        for _ in []:
            yield ''

    def generate_embeddings(self, texts: Iterable[str], model: str) -> List[List[float]]:
        try:
            import openai
        except Exception:
            raise RuntimeError('openai package is required')
        openai.api_key = self.api_key
        resp = openai.Embeddings.create(model=model, input=list(texts))
        return [d['embedding'] for d in resp['data']]

    def estimate_cost(self, tokens_in: int, tokens_out: int, model: str) -> float:
        # Use model configuration rates elsewhere; return rough estimate placeholder
        return 0.0

    def health_check(self) -> bool:
        # simple health: check API key present
        return bool(self.api_key)
