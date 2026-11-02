from datetime import datetime
from pydantic import BaseModel
from typing import Literal


class BillingPlan(BaseModel):
    name: str
    description: str
    price: float
    monthly_limit: int | None
    unlimited: bool


class CheckoutSessionResponse(BaseModel):
    url: str


class PortalSessionResponse(BaseModel):
    url: str


class SubscriptionStatus(BaseModel):
    plan_name: str
    status: str
    current_period_end: datetime | None
    stripe_customer_id: str | None
    stripe_subscription_id: str | None


class UsageStatus(BaseModel):
    month: str
    generation_count: int
    limit: int
    remaining: int


class BillingOverview(BaseModel):
    subscription: SubscriptionStatus
    usage: UsageStatus


class BillingAnalytics(BaseModel):
    mrr: float
    active_subscribers: int
    churn_rate: float
    total_generations: int
