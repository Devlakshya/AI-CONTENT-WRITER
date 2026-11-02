from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
import time
from app.services.ai.provider_factory import provider_factory
from app.services.ai.routing_engine import routing_engine
from app.services.ai.fallback_engine import fallback_engine
from app.services.ai.cost_tracker import cost_tracker
from app.database.session import get_sync_db_dep
from sqlalchemy.orm import Session
from app.auth.security import get_current_user
from app.models import ModelConfiguration

router = APIRouter()


class GenerateRequest(BaseModel):
    prompt: str
    max_tokens: Optional[int] = 512
    mode: Optional[str] = 'automatic'
    model_config_id: Optional[int] = None


@router.post('/generate')
def generate(req: GenerateRequest, db: Session = Depends(get_sync_db_dep), user=Depends(get_current_user)):
    # select model
    if req.model_config_id:
        cfg = db.query(ModelConfiguration).filter_by(id=req.model_config_id, active=True).first()
        if not cfg:
            raise HTTPException(status_code=404, detail='Model configuration not found')
        provider_name = cfg.provider.name
        model_name = cfg.model_name
    else:
        provider_name, model_name = routing_engine.select(req.prompt, user_plan=None, mode=req.mode)

    def call_provider(name):
        provider = provider_factory.get_provider(name)
        return provider.generate_text(req.prompt, model=model_name, max_tokens=req.max_tokens)

    start = time.time()
    try:
        used_provider, result = fallback_engine.run_with_fallback(lambda p: call_provider(p))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
    latency = (time.time() - start) * 1000.0

    # estimate cost (best-effort)
    tokens_in = result.get('usage', {}).get('prompt_tokens') if isinstance(result.get('usage'), dict) else None
    tokens_out = result.get('usage', {}).get('completion_tokens') if isinstance(result.get('usage'), dict) else None
    est_cost = 0.0
    if tokens_in is not None and tokens_out is not None:
        # model config lookup
        if req.model_config_id:
            est_cost = cost_tracker.estimate(tokens_in, tokens_out, cfg)
        else:
            est_cost = 0.0

    # record generation
    cost_tracker.record(db, user_id=user.id if user else None, provider=used_provider, model=model_name, tokens_in=tokens_in or 0, tokens_out=tokens_out or 0, latency_ms=latency, estimated_cost=est_cost, success=True)

    return {'provider': used_provider, 'model': model_name, 'text': result.get('text'), 'usage': result.get('usage'), 'latency_ms': latency, 'estimated_cost': est_cost}


@router.get('/providers')
def list_providers():
    # simplified; in production read from DB
    return [{'name':'openai','enabled':True},{'name':'anthropic','enabled':False},{'name':'gemini','enabled':False}]

@router.get('/health')
def health():
    # simple health across providers
    statuses = {}
    for name in ['openai','anthropic','gemini']:
        try:
            p = provider_factory.get_provider(name)
            statuses[name] = p.health_check()
        except Exception:
            statuses[name] = False
    return statuses
