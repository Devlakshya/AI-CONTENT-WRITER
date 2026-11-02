from abc import ABC, abstractmethod
from typing import Any, Dict, Iterable, List


class BaseProvider(ABC):
    name: str

    @abstractmethod
    def generate_text(self, prompt: str, model: str, max_tokens: int = 512, **kwargs) -> Dict[str, Any]:
        pass

    @abstractmethod
    def stream_text(self, prompt: str, model: str, **kwargs):
        pass

    @abstractmethod
    def generate_embeddings(self, texts: Iterable[str], model: str) -> List[List[float]]:
        pass

    @abstractmethod
    def estimate_cost(self, tokens_in: int, tokens_out: int, model: str) -> float:
        pass

    @abstractmethod
    def health_check(self) -> bool:
        pass
