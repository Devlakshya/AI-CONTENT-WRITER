import pytest

from app.services.ai.mock_provider import MockProvider
from app.services.ai.prompt_templates import build_prompt


@pytest.mark.asyncio
async def test_mock_provider_generates_text():
    prov = MockProvider()
    prompt = build_prompt('blog', title='Test', prompt='Write about testing', tone='friendly', target_audience='developers', keywords='testing,pytest', language='English', word_count=100)
    out = await prov.generate(prompt, 'blog', tone='friendly', target_audience='developers', keywords='testing')
    assert '[MOCK]' in out
    assert 'testing' in out
