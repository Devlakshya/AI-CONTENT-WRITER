from abc import ABC, abstractmethod
from app.schemas.content import ContentCreate


class AIProvider(ABC):
    @abstractmethod
    async def generate_content(self, payload: ContentCreate) -> str:
        raise NotImplementedError


class MockAIProvider(AIProvider):
    async def generate_content(self, payload: ContentCreate) -> str:
        return f"[MOCK] Generated {payload.content_type} content for {payload.audience or 'audience'} in {payload.language or 'English'}."
