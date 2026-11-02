from app.repositories.user_repository import UserRepository
from app.schemas.user import UserCreate
from sqlalchemy.ext.asyncio import AsyncSession


class UserService:
    def __init__(self, db: AsyncSession) -> None:
        self.repo = UserRepository(db)

    async def create_user(self, payload: UserCreate):
        return await self.repo.create_user(payload.name, payload.email, payload.password)

    async def get_user_by_email(self, email: str):
        return await self.repo.get_by_email(email)
