from app.repositories.user_repository import UserRepository
from app.auth.security import verify_password, get_password_hash
from app.models.user import User
from sqlalchemy.ext.asyncio import AsyncSession


class AuthService:
    def __init__(self, db: AsyncSession) -> None:
        self.repo = UserRepository(db)

    async def register(self, name: str, email: str, password: str) -> User:
        hashed = get_password_hash(password)
        return await self.repo.create_user(name, email, hashed)

    async def authenticate(self, email: str, password: str) -> User | None:
        user = await self.repo.get_by_email(email)
        if not user:
            return None
        if not verify_password(password, user.password_hash):
            return None
        return user
