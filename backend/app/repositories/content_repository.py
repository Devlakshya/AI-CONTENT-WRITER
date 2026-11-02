from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.content_generation import ContentGeneration
from app.schemas.content import ContentCreate
from sqlalchemy import update, delete


class ContentRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def create_content(self, user_id: int, payload: ContentCreate) -> ContentGeneration:
        record = ContentGeneration(
            user_id=user_id,
            project_id=payload.project_id,
            title=payload.title,
            content_type=payload.content_type.value,
            prompt=payload.prompt,
            generated_content=payload.generated_content,
            favorite=False,
            tone=payload.tone,
            word_count=payload.word_count,
            target_audience=getattr(payload, "target_audience", None),
            keywords=payload.keywords,
            language=payload.language,
        )
        self.db.add(record)
        await self.db.commit()
        await self.db.refresh(record)
        return record

    async def list_by_user(self, user_id: int) -> list[ContentGeneration]:
        result = await self.db.execute(select(ContentGeneration).where(ContentGeneration.user_id == user_id))
        return result.scalars().all()

    async def get_by_id(self, user_id: int, content_id: int) -> ContentGeneration | None:
        result = await self.db.execute(
            select(ContentGeneration).where(ContentGeneration.id == content_id, ContentGeneration.user_id == user_id)
        )
        return result.scalars().first()

    async def update_content(self, user_id: int, content_id: int, payload: dict) -> ContentGeneration | None:
        stmt = (
            update(ContentGeneration)
            .where(ContentGeneration.id == content_id, ContentGeneration.user_id == user_id)
            .values(**payload)
            .returning(ContentGeneration)
        )
        result = await self.db.execute(stmt)
        await self.db.commit()
        return result.fetchone()

    async def delete_content(self, user_id: int, content_id: int) -> bool:
        stmt = delete(ContentGeneration).where(ContentGeneration.id == content_id, ContentGeneration.user_id == user_id)
        await self.db.execute(stmt)
        await self.db.commit()
        return True

    async def set_favorite(self, user_id: int, content_id: int, favorite: bool) -> ContentGeneration | None:
        stmt = (
            update(ContentGeneration)
            .where(ContentGeneration.id == content_id, ContentGeneration.user_id == user_id)
            .values(favorite=favorite)
            .returning(ContentGeneration)
        )
        result = await self.db.execute(stmt)
        await self.db.commit()
        return result.fetchone()
