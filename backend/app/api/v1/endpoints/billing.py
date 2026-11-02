from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.auth.security import get_current_user
from app.database.session import get_db
from app.schemas.user import UserDB
from app.schemas.billing import (
    BillingPlan,
    CheckoutSessionResponse,
    PortalSessionResponse,
    BillingOverview,
    BillingAnalytics,
)
from app.services.billing_service import BillingService

router = APIRouter()


@router.get('/pricing', response_model=list[BillingPlan])
async def get_pricing() -> list[BillingPlan]:
    return await BillingService.get_billing_plans()


@router.get('/status', response_model=BillingOverview)
async def get_billing_overview(
    current_user: UserDB = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> BillingOverview:
    service = BillingService(db)
    return {
        'subscription': await service.get_subscription_status(current_user.id),
        'usage': await service.get_usage_status(current_user.id),
    }


@router.post('/checkout-session', response_model=CheckoutSessionResponse)
async def create_checkout_session(
    current_user: UserDB = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CheckoutSessionResponse:
    service = BillingService(db)
    url = await service.create_checkout_session(current_user.id, current_user.email)
    return {'url': url}


@router.post('/customer-portal', response_model=PortalSessionResponse)
async def create_customer_portal(
    current_user: UserDB = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> PortalSessionResponse:
    service = BillingService(db)
    url = await service.create_customer_portal_session(current_user.id)
    return {'url': url}


@router.post('/cancel')
async def cancel_subscription(
    current_user: UserDB = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    service = BillingService(db)
    return await service.cancel_subscription(current_user.id)


@router.post('/downgrade')
async def downgrade_subscription(
    current_user: UserDB = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    service = BillingService(db)
    return await service.downgrade_subscription(current_user.id)


@router.post('/webhooks/stripe')
async def stripe_webhook(request: Request, db: AsyncSession = Depends(get_db)) -> dict:
    service = BillingService(db)
    raw_body = await request.body()
    signature = request.headers.get('stripe-signature')
    await service.handle_webhook(raw_body, signature)
    return {'received': True}


@router.get('/analytics', response_model=BillingAnalytics)
async def get_billing_analytics(
    current_user: UserDB = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> BillingAnalytics:
    if not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Admin access required')
    service = BillingService(db)
    return await service.get_admin_analytics()
