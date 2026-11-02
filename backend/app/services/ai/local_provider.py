import asyncio
import threading
from pathlib import Path

from llama_cpp import Llama

from app.core.config import settings

from .base_provider import BaseAIProvider

SYSTEM_PROMPT = (
    "You are a professional copywriter. Write only about the exact topic the user "
    "asks for. Never switch to an unrelated topic or reuse text from previous "
    "requests. Output only the final polished copy. Never include outlines, steps, "
    "notes, explanations, headings, or quotation marks."
)

_models: dict[str, Llama] = {}
_models_lock = threading.Lock()
_generation_lock = threading.Lock()


def resolve_model_path(value: str | Path) -> Path:
    path = Path(value).expanduser()
    if path.is_absolute():
        return path
    backend_root = Path(__file__).resolve().parents[3]
    return (backend_root / path).resolve()


class LocalProvider(BaseAIProvider):
    name = "local"

    def __init__(self, model_path: str | Path | None = None) -> None:
        self.model_path = resolve_model_path(model_path or settings.LOCAL_MODEL_PATH)
        self.n_ctx = settings.LOCAL_N_CTX
        self.n_threads = settings.LOCAL_N_THREADS

    def _get_model(self) -> Llama:
        key = f"{self.model_path}:{self.n_ctx}:{self.n_threads}"
        with _models_lock:
            model = _models.get(key)
            if model is None:
                if not self.model_path.is_file():
                    raise FileNotFoundError(
                        f"Local model not found at {self.model_path}. Download a small GGUF model "
                        "such as Qwen2.5-0.5B-Instruct-Q4_K_M and set LOCAL_MODEL_PATH."
                    )
                model = Llama(
                    model_path=str(self.model_path),
                    n_ctx=self.n_ctx,
                    n_threads=self.n_threads,
                    verbose=False,
                )
                _models[key] = model
            return model

    def _generate_sync(self, messages: list[dict[str, str]], max_tokens: int) -> str:
        model = self._get_model()
        with _generation_lock:
            result = model.create_chat_completion(
                messages=messages,
                max_tokens=max_tokens,
                temperature=0.6,
                top_p=0.9,
                repeat_penalty=1.1,
            )
        text = (result["choices"][0]["message"].get("content") or "").strip()
        if not text:
            raise RuntimeError("Local model returned an empty response")
        return text

    async def generate(self, prompt: str, content_type: str, **kwargs) -> str:
        word_count = int(kwargs.get("word_count") or 200)
        max_tokens = max(96, min(int(word_count * 1.6) + 64, 1024))
        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt},
        ]
        return await asyncio.to_thread(self._generate_sync, messages, max_tokens)
