import json
from datetime import datetime, timedelta, timezone
from fastapi import HTTPException, status
import stripe
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.repositories.subscription_repository import SubscriptionRepository


class BillingService:
    FREE_MONTHLY_LIMIT = 20

    def __init__(self, db: AsyncSession | None = None) -> None:
        self.repo = SubscriptionRepository(db) if db is not None else None
        self.settings = settings
        if self.settings.STRIPE_API_KEY:
            stripe.api_key = self.settings.STRIPE_API_KEY

    def _current_month(self) -> str:
        return datetime.utcnow().strftime('%Y-%m')

    def _parse_timestamp(self, value: int | None) -> datetime | None:
        if not value:
            return None
        return datetime.fromtimestamp(value, tz=timezone.utc)

    async def get_or_create_subscription(self, user_id: int):
        subscription = await self.repo.get_subscription(user_id)
        if subscription:
            return subscription
        current_period_end = datetime.utcnow().replace(day=1) + timedelta(days=32)
        current_period_end = current_period_end.replace(day=1)
        return await self.repo.create_subscription(
            user_id=user_id,
            plan_name='free',
            status='active',
            current_period_end=current_period_end,
        )

    async def ensure_generation_allowed(self, user_id: int):
        subscription = await self.get_or_create_subscription(user_id)
        if subscription.plan_name == 'pro':
            if subscription.status not in ('active', 'trialing', 'cancel_at_period_end'):
                raise HTTPException(status_code=status.HTTP_402_PAYMENT_REQUIRED, detail='Pro subscription is not active')
            return subscription

        month = self._current_month()
        usage = await self.repo.get_usage(user_id, month)
        count = usage.generation_count if usage else 0
        if count >= self.FREE_MONTHLY_LIMIT:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail='Free plan monthly quota exceeded. Upgrade to Pro for unlimited generations.',
            )
        await self.repo.increment_usage(user_id, month)
        return subscription

    async def get_subscription_status(self, user_id: int) -> dict:
        subscription = await self.get_or_create_subscription(user_id)
        return {
            'plan_name': subscription.plan_name,
            'status': subscription.status,
            'current_period_end': subscription.current_period_end,
            'stripe_customer_id': subscription.stripe_customer_id,
            'stripe_subscription_id': subscription.stripe_subscription_id,
        }

    async def get_usage_status(self, user_id: int) -> dict:
        month = self._current_month()
        usage = await self.repo.get_usage(user_id, month)
        count = usage.generation_count if usage else 0
        return {
            'month': month,
            'generation_count': count,
            'limit': self.FREE_MONTHLY_LIMIT,
            'remaining': max(self.FREE_MONTHLY_LIMIT - count, 0),
        }

    async def create_checkout_session(self, user_id: int, user_email: str) -> str:
        if not self.settings.STRIPE_API_KEY or not self.settings.STRIPE_PRO_PRICE_ID:
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail='Stripe configuration is incomplete')

        subscription = await self.get_or_create_subscription(user_id)
        customer_id = subscription.stripe_customer_id
        if not customer_id:
            customer = stripe.Customer.create(email=user_email, metadata={'user_id': user_id})
            customer_id = customer.id
            await self.repo.update_subscription(user_id, stripe_customer_id=customer_id)

        success_url = f'{self.settings.FRONTEND_URL}/billing?status=success'
        cancel_url = f'{self.settings.FRONTEND_URL}/billing?status=canceled'
        session = stripe.checkout.Session.create(
            mode='subscription',
            payment_method_types=['card'],
            customer=customer_id,
            line_items=[{'price': self.settings.STRIPE_PRO_PRICE_ID, 'quantity': 1}],
            success_url=success_url,
            cancel_url=cancel_url,
            subscription_data={'metadata': {'user_id': str(user_id)}},
        )
        return session.url

    async def create_customer_portal_session(self, user_id: int) -> str:
        subscription = await self.get_or_create_subscription(user_id)
        if not subscription.stripe_customer_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='No Stripe customer found for this account')
        if not self.settings.STRIPE_API_KEY:
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail='Stripe integration is not configured')

        session = stripe.billing_portal.Session.create(
            customer=subscription.stripe_customer_id,
            return_url=f'{self.settings.FRONTEND_URL}/billing',
        )
        return session.url

    async def cancel_subscription(self, user_id: int) -> dict:
        subscription = await self.get_or_create_subscription(user_id)
        if subscription.stripe_subscription_id and self.settings.STRIPE_API_KEY:
            stripe.Subscription.modify(subscription.stripe_subscription_id, cancel_at_period_end=True)
            updated = await self.repo.update_subscription(user_id, status='cancel_at_period_end')
            return {'status': updated.status, 'plan_name': updated.plan_name}

        await self.repo.update_subscription(user_id, plan_name='free', status='active', stripe_subscription_id=None, stripe_customer_id=subscription.stripe_customer_id)
        return {'status': 'active', 'plan_name': 'free'}

    async def downgrade_subscription(self, user_id: int) -> dict:
        return await self.cancel_subscription(user_id)

    async def handle_webhook(self, raw_body: bytes, signature: str | None) -> None:
        if self.settings.STRIPE_WEBHOOK_SECRET and signature:
            try:
                event = stripe.Webhook.construct_event(raw_body, signature, self.settings.STRIPE_WEBHOOK_SECRET)
            except (ValueError, stripe.error.SignatureVerificationError):
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Invalid Stripe webhook signature')
        else:
            event = json.loads(raw_body)

        data = event.get('data', {}).get('object', {})
        event_type = event.get('type')
        metadata = data.get('metadata', {}) or {}
        user_id = int(metadata.get('user_id')) if metadata.get('user_id') else None
        stripe_customer_id = data.get('customer')
        stripe_subscription_id = data.get('subscription') or data.get('id')
        status = data.get('status')
        current_period_end = self._parse_timestamp(data.get('current_period_end'))

        if event_type == 'checkout.session.completed' and user_id:
            await self.repo.update_subscription(
                user_id,
                plan_name='pro',
                status='active',
                stripe_customer_id=stripe_customer_id,
                stripe_subscription_id=stripe_subscription_id,
                current_period_end=current_period_end,
            )
            return

        if event_type in {'customer.subscription.updated', 'invoice.payment_succeeded'} and user_id:
            await self.repo.update_subscription(
                user_id,
                plan_name='pro',
                status=status or 'active',
                stripe_subscription_id=stripe_subscription_id,
                stripe_customer_id=stripe_customer_id,
                current_period_end=current_period_end,
            )
            return

        if event_type == 'customer.subscription.deleted' and user_id:
            await self.repo.update_subscription(
                user_id,
                plan_name='free',
                status='canceled',
                current_period_end=current_period_end,
            )
            return

    @staticmethod
    async def get_billing_plans() -> list[dict]:
        return [
            {
                'name': 'Free',
                'description': '20 generations per month',
                'price': 0,
                'monthly_limit': BillingService.FREE_MONTHLY_LIMIT,
                'unlimited': False,
            },
            {
                'name': 'Pro',
                'description': 'Unlimited AI generations and priority support',
                'price': settings.PRO_MONTHLY_PRICE_USD,
                'monthly_limit': None,
                'unlimited': True,
            },
        ]

    async def get_admin_analytics(self) -> dict:
        total_generations = await self.repo.get_total_generations()
        active_subscribers = await self.repo.get_active_pro_subscribers()
        churn_since = datetime.utcnow() - timedelta(days=30)
        churn = await self.repo.get_recent_churn(churn_since)
        denominator = max(active_subscribers + churn, 1)
        return {
            'mrr': active_subscribers * self.settings.PRO_MONTHLY_PRICE_USD,
            'active_subscribers': active_subscribers,
            'churn_rate': round(churn / denominator, 4),
            'total_generations': total_generations,
        }
