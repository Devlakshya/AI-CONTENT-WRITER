import pytest
from httpx import AsyncClient
from app.main import app


@pytest.mark.asyncio
async def test_generate_content_endpoint(initialized_db):
    async with AsyncClient(app=app, base_url='http://testserver') as client:
        # register and login
        await client.post('/api/auth/register', json={'name': 'Gen User', 'email': 'gen@example.com', 'password': 'pass1234'})
        login = await client.post('/api/auth/login', data={'username': 'gen@example.com', 'password': 'pass1234'})
        tokens = login.json()
        headers = {'Authorization': f"Bearer {tokens['access_token']}"}

        payload = {
            'title': 'Test Blog',
            'content_type': 'blog',
            'prompt': 'Write a short article about testing',
            'tone': 'informal',
            'word_count': 150,
            'target_audience': 'developers',
            'keywords': 'testing,pytest',
        }

        resp = await client.post('/api/v1/content/generate', json=payload, headers=headers)
        assert resp.status_code == 201
        body = resp.json()
        assert 'generated_content' in body
        assert body['content_type'] == 'blog'
