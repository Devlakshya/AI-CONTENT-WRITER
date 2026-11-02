from typing import Optional, Tuple
from app.models import ModelConfiguration, AIProvider


class RoutingEngine:
    def select(self, prompt: str, user_plan: str | None = None, mode: str = 'automatic') -> Tuple[str, str]:
        # returns (provider_name, model_name)
        # Modes: cheapest, fastest, highest_quality, user_selected, automatic
        mode = (mode or 'automatic').lower()
        if mode == 'cheapest':
            cfg = self._select_cheapest()
        elif mode == 'fastest':
            cfg = self._select_fastest()
        elif mode == 'highest_quality':
            cfg = self._select_highest_quality()
        elif mode == 'user_selected':
            cfg = self._select_user_default()
        else:
            cfg = self._select_automatic(prompt, user_plan)
        return cfg.provider.name, cfg.model_name

    def _select_cheapest(self) -> ModelConfiguration:
        # naive: pick lowest input_cost + output_cost
        cfg = ModelConfiguration
        raise NotImplementedError('DB-backed selection required')

    def _select_fastest(self) -> ModelConfiguration:
        raise NotImplementedError('DB-backed selection required')

    def _select_highest_quality(self) -> ModelConfiguration:
        raise NotImplementedError('DB-backed selection required')

    def _select_user_default(self) -> ModelConfiguration:
        raise NotImplementedError('User preference selection required')

    def _select_automatic(self, prompt: str, user_plan: str | None) -> ModelConfiguration:
        # heuristic: short prompts -> cheaper small model; long or complex -> higher quality
        # Placeholder: return a sensible default
        # Attempt to pick OpenAI default model
        return ModelConfiguration(provider_id=1, model_name='gpt-4o-mini', max_tokens=1024, input_cost=0, output_cost=0)


routing_engine = RoutingEngine()
