from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.auth.security import get_current_user
from app.database.session import get_db
from app.schemas.user import UserDB

router = APIRouter()

@router.get('/me', response_model=UserDB)
async def read_current_user(current_user: UserDB = Depends(get_current_user)) -> UserDB:
    return current_user
