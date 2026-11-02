from app.services.ai.providers.openai_provider import OpenAIProvider
from app.services.ai.providers.anthropic_provider import AnthropicProvider
from app.services.ai.providers.gemini_provider import GeminiProvider
from app.core.config import settings

from .mock_provider import MockProvider


class ProviderFactory:
    def __init__(self):
        self._providers = {
            'openai': OpenAIProvider,
            'anthropic': AnthropicProvider,
            'gemini': GeminiProvider,
        }

    def get_provider(self, provider_name: str, api_key: str | None = None):
        cls = self._providers.get(provider_name)
        if not cls:
            raise RuntimeError(f'Provider {provider_name} not supported')
        return cls(api_key=api_key)


provider_factory = ProviderFactory()


def get_provider():
    provider = (settings.AI_PROVIDER or "local").lower()
    if provider == "openai":
        from .openai_provider import OpenAIProvider as AsyncOpenAIProvider

        return AsyncOpenAIProvider()
    if provider == "local":
        from .local_provider import LocalProvider

        return LocalProvider()
    return MockProvider()
