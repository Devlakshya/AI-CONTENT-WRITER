from .base_provider import BaseAIProvider


class MockProvider(BaseAIProvider):
    async def generate(self, prompt: str, content_type: str, **kwargs) -> str:
        # simple deterministic mock for testing and local development
        tone = kwargs.get("tone") or "neutral"
        keywords = kwargs.get("keywords") or ""
        audience = kwargs.get("target_audience") or kwargs.get("audience") or "general"
        return (
            f"[MOCK] {content_type.title()} in {tone} tone for {audience}. "
            f"Keywords: {keywords}. Prompt: {prompt}"
        )
