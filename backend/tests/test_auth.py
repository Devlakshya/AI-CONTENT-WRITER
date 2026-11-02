import pytest
from httpx import AsyncClient
from app.main import app


@pytest.mark.asyncio
async def test_register_login_and_fetch_current_user(initialized_db):
    async with AsyncClient(app=app, base_url='http://testserver') as client:
        register_response = await client.post(
            '/api/auth/register',
            json={
                'name': 'Jane Doe',
                'email': 'jane@example.com',
                'password': 'strongpassword',
            },
        )
        assert register_response.status_code == 201
        registered_user = register_response.json()
        assert registered_user['email'] == 'jane@example.com'
        assert registered_user['name'] == 'Jane Doe'
        assert registered_user['is_active'] is True

        login_response = await client.post(
            '/api/auth/login',
            data={'username': 'jane@example.com', 'password': 'strongpassword'},
        )
        assert login_response.status_code == 200
        tokens = login_response.json()
        assert tokens['token_type'] == 'bearer'
        assert 'access_token' in tokens

        auth_headers = {'Authorization': f"Bearer {tokens['access_token']}"}
        me_response = await client.get('/api/auth/me', headers=auth_headers)
        assert me_response.status_code == 200
        current_user = me_response.json()
        assert current_user['email'] == 'jane@example.com'
        assert current_user['name'] == 'Jane Doe'


@pytest.mark.asyncio
async def test_invalid_login_is_rejected(initialized_db):
    async with AsyncClient(app=app, base_url='http://testserver') as client:
        response = await client.post(
            '/api/auth/login',
            data={'username': 'unknown@example.com', 'password': 'badpassword'},
        )
        assert response.status_code == 401
        assert response.json()['detail'] == 'Invalid credentials'
