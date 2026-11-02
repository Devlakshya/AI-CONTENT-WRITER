from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, update
from app.models.subscription import Subscription
from app.models.usage import UsageTracking
from app.models.content_generation import ContentGeneration
from app.models.plan import Plan


class SubscriptionRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_plan_by_name(self, name: str) -> Plan | None:
        result = await self.db.execute(select(Plan).where(Plan.name == name))
        return result.scalars().first()

    async def get_subscription(self, user_id: int) -> Subscription | None:
        result = await self.db.execute(select(Subscription).where(Subscription.user_id == user_id))
        return result.scalars().first()

    async def create_subscription(self, user_id: int, plan_name: str, status: str = 'active', stripe_customer_id: str | None = None, stripe_subscription_id: str | None = None, current_period_end: datetime | None = None) -> Subscription:
        record = Subscription(
            user_id=user_id,
            plan_name=plan_name,
            status=status,
            stripe_customer_id=stripe_customer_id,
            stripe_subscription_id=stripe_subscription_id,
            current_period_end=current_period_end,
        )
        self.db.add(record)
        await self.db.commit()
        await self.db.refresh(record)
        return record

    async def update_subscription(self, user_id: int, **data) -> Subscription | None:
        stmt = update(Subscription).where(Subscription.user_id == user_id).values(**data).returning(Subscription)
        result = await self.db.execute(stmt)
        await self.db.commit()
        return result.scalars().first()

    async def get_usage(self, user_id: int, month: str) -> UsageTracking | None:
        result = await self.db.execute(select(UsageTracking).where(UsageTracking.user_id == user_id, UsageTracking.month == month))
        return result.scalars().first()

    async def create_usage(self, user_id: int, month: str) -> UsageTracking:
        record = UsageTracking(user_id=user_id, month=month, generation_count=0)
        self.db.add(record)
        await self.db.commit()
        await self.db.refresh(record)
        return record

    async def increment_usage(self, user_id: int, month: str) -> UsageTracking:
        record = await self.get_usage(user_id, month)
        if not record:
            record = await self.create_usage(user_id, month)
        stmt = update(UsageTracking).where(UsageTracking.id == record.id).values(generation_count=UsageTracking.generation_count + 1)
        await self.db.execute(stmt)
        await self.db.commit()
        result = await self.db.execute(select(UsageTracking).where(UsageTracking.id == record.id))
        return result.scalars().first()

    async def get_total_generations(self) -> int:
        result = await self.db.execute(select(func.count(ContentGeneration.id)))
        return result.scalar_one() or 0

    async def get_active_pro_subscribers(self) -> int:
        result = await self.db.execute(select(func.count(Subscription.id)).where(Subscription.plan_name == 'pro', Subscription.status == 'active'))
        return result.scalar_one() or 0

    async def get_recent_churn(self, since: datetime) -> int:
        result = await self.db.execute(select(func.count(Subscription.id)).where(Subscription.plan_name == 'pro', Subscription.status == 'canceled', Subscription.current_period_end >= since))
        return result.scalar_one() or 0
