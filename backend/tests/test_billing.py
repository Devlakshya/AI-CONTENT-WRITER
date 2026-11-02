import pytest
from httpx import AsyncClient
from app.main import app


@pytest.mark.asyncio
async def test_free_plan_quota_blocks_after_twenty_generations(initialized_db):
    async with AsyncClient(app=app, base_url='http://testserver') as client:
        await client.post('/api/auth/register', json={'name': 'Quota User', 'email': 'quota@example.com', 'password': 'pass1234'})
        login = await client.post('/api/auth/login', data={'username': 'quota@example.com', 'password': 'pass1234'})
        headers = {'Authorization': f"Bearer {login.json()['access_token']}"}

        payload = {
            'title': 'Limit Test',
            'content_type': 'blog',
            'prompt': 'Write a short article about limit enforcement',
            'tone': 'informal',
            'word_count': 100,
            'target_audience': 'developers',
            'keywords': 'limits,testing',
        }

        for _ in range(20):
            response = await client.post('/api/v1/content/generate', json=payload, headers=headers)
            assert response.status_code == 201

        blocked = await client.post('/api/v1/content/generate', json=payload, headers=headers)
        assert blocked.status_code == 402
        assert 'quota' in blocked.json()['detail'].lower()


@pytest.mark.asyncio
async def test_billing_pricing_route_returns_expected_plans(initialized_db):
    async with AsyncClient(app=app, base_url='http://testserver') as client:
        response = await client.get('/api/v1/billing/pricing')
        assert response.status_code == 200
        plans = response.json()
        assert any(plan['name'] == 'Free' for plan in plans)
        assert any(plan['name'] == 'Pro' for plan in plans)


@pytest.mark.asyncio
async def test_webhook_checkout_completed_creates_pro_subscription(initialized_db):
    async with AsyncClient(app=app, base_url='http://testserver') as client:
        await client.post('/api/auth/register', json={'name': 'Webhook User', 'email': 'webhook@example.com', 'password': 'pass1234'})
        login = await client.post('/api/auth/login', data={'username': 'webhook@example.com', 'password': 'pass1234'})
        headers = {'Authorization': f"Bearer {login.json()['access_token']}"}

        event = {
            'id': 'evt_test_checkout_completed',
            'object': 'event',
            'type': 'checkout.session.completed',
            'data': {
                'object': {
                    'id': 'cs_test_123',
                    'object': 'checkout.session',
                    'customer': 'cus_test_123',
                    'subscription': 'sub_test_123',
                    'metadata': {'user_id': '1'},
                }
            }
        }

        webhook_response = await client.post('/api/v1/billing/webhooks/stripe', json=event)
        assert webhook_response.status_code == 200
        assert webhook_response.json()['received'] is True

        status_response = await client.get('/api/v1/billing/status', headers=headers)
        assert status_response.status_code == 200
        overview = status_response.json()
        assert overview['subscription']['plan_name'] == 'pro'
        assert overview['subscription']['status'] == 'active'
