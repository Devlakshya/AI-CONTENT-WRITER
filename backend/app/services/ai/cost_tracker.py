from datetime import datetime, timedelta
from typing import Dict
from app.models import GenerationLog
from app.database.session import get_sync_db


class CostTracker:
    def estimate(self, tokens_in: int, tokens_out: int, model_cfg) -> float:
        return tokens_in * model_cfg.input_cost + tokens_out * model_cfg.output_cost

    def record(self, db, **kwargs):
        log = GenerationLog(**kwargs)
        db.add(log)
        db.commit()
        db.refresh(log)
        return log


cost_tracker = CostTracker()
