from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.project import Project


class ProjectRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_by_user(self, user_id: int) -> list[Project]:
        result = await self.db.execute(select(Project).where(Project.user_id == user_id))
        return result.scalars().all()
