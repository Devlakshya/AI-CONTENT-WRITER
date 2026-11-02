from app.repositories.content_repository import ContentRepository
from app.schemas.content import ContentCreate
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.ai.provider_factory import get_provider
from app.services.ai.prompt_templates import build_prompt
from app.services.billing_service import BillingService


class ContentService:
    def __init__(self, db: AsyncSession) -> None:
        self.repo = ContentRepository(db)
        self.provider = get_provider()
        self.billing_service = BillingService(db)

    async def create_generation(self, user_id: int, payload: ContentCreate):
        await self.billing_service.ensure_generation_allowed(user_id)
        # build prompt
        built = build_prompt(
            payload.content_type.value,
            title=getattr(payload, "title", None),
            prompt=payload.prompt,
            tone=payload.tone,
            target_audience=getattr(payload, "target_audience", None),
            keywords=payload.keywords,
            language=payload.language,
            word_count=payload.word_count,
        )

        # call provider
        generated = await self.provider.generate(built, payload.content_type.value,
                                                 tone=payload.tone,
                                                 target_audience=getattr(payload, "target_audience", None),
                                                 keywords=payload.keywords,
                                                 language=payload.language,
                                                 word_count=payload.word_count)

        # persist
        payload.generated_content = generated
        return await self.repo.create_content(user_id, payload)

    async def list_user_content(self, user_id: int):
        return await self.repo.list_by_user(user_id)

    async def get_content(self, user_id: int, content_id: int):
        return await self.repo.get_by_id(user_id, content_id)

    async def update_content(self, user_id: int, content_id: int, payload: dict):
        return await self.repo.update_content(user_id, content_id, payload)

    async def delete_content(self, user_id: int, content_id: int):
        return await self.repo.delete_content(user_id, content_id)

    async def favorite_content(self, user_id: int, content_id: int, favorite: bool = True):
        return await self.repo.set_favorite(user_id, content_id, favorite)
