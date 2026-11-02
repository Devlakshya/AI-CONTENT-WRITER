import time
from typing import Callable, List, Tuple


class FallbackEngine:
    def __init__(self, providers_order: List[str] | None = None):
        self.providers_order = providers_order or ['openai', 'anthropic', 'gemini']

    def run_with_fallback(self, func: Callable[[str], dict], *args, **kwargs) -> Tuple[str, dict]:
        # func(provider_name, *args)
        last_exc = None
        delay = 1
        for provider in self.providers_order:
            try:
                result = func(provider, *args, **kwargs)
                return provider, result
            except Exception as exc:
                last_exc = exc
                time.sleep(delay)
                delay = min(delay * 2, 16)
                continue
        raise last_exc


fallback_engine = FallbackEngine()
