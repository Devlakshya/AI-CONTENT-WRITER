from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from app.auth.jwt import create_access_token
from app.auth.security import get_current_user
from app.database.session import get_db
from app.models.user import User
from app.schemas.auth import Token, UserCreate
from app.schemas.user import UserDB
from app.services.auth_service import AuthService
from app.services.billing_service import BillingService

router = APIRouter()

@router.post('/register', status_code=status.HTTP_201_CREATED)
async def register_user(
    data: UserCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> UserDB:
    service = AuthService(db)
    existing = await service.repo.get_by_email(data.email)
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Email already registered')
    display_name = data.name or data.full_name or data.email.split('@')[0]
    user = await service.register(display_name, data.email, data.password)
    await BillingService(db).get_or_create_subscription(user.id)
    return user

@router.post('/login')
async def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> Token:
    service = AuthService(db)
    user = await service.authenticate(form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid credentials')
    access_token = create_access_token(subject=user.id)
    return {'access_token': access_token, 'token_type': 'bearer'}

@router.get('/me')
async def get_me(current_user: Annotated[User, Depends(get_current_user)]) -> UserDB:
    return current_user
