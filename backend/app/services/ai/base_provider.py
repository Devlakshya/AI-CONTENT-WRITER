from abc import ABC, abstractmethod


class BaseAIProvider(ABC):
    @abstractmethod
    async def generate(self, prompt: str, content_type: str, **kwargs) -> str:
        """Generate content from a prompt.

        Returns generated text.
        """
        raise NotImplementedError()
