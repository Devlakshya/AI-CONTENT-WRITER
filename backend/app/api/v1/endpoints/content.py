from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.auth.security import get_current_user
from app.database.session import get_db
from app.schemas.content import ContentCreate, ContentDB
from app.services.content_service import ContentService
from app.schemas.user import UserDB
from typing import Optional
import time

router = APIRouter()

# simple in-memory rate limiter per user for generation endpoint
_RATE_WINDOW = 60  # seconds
_RATE_LIMIT = 10  # requests per window
_rate_state: dict[int, dict] = {}


def _check_rate(user_id: int):
    now = int(time.time())
    state = _rate_state.get(user_id)
    if not state:
        _rate_state[user_id] = {"window_start": now, "count": 1}
        return True
    if now - state["window_start"] > _RATE_WINDOW:
        _rate_state[user_id] = {"window_start": now, "count": 1}
        return True
    if state["count"] >= _RATE_LIMIT:
        return False
    state["count"] += 1
    return True


@router.post("/generate", response_model=ContentDB, status_code=status.HTTP_201_CREATED)
async def generate_content(
    payload: ContentCreate,
    current_user: UserDB = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ContentDB:
    if not _check_rate(current_user.id):
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="Rate limit exceeded")

    service = ContentService(db)
    record = await service.create_generation(current_user.id, payload)
    return record


@router.get("/", response_model=list[ContentDB])
async def list_content(
    content_type: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: UserDB = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[ContentDB]:
    # simple list implementation; repository currently supports listing by user
    service = ContentService(db)
    return await service.list_user_content(current_user.id)


@router.get("/{content_id}", response_model=ContentDB)
async def get_content(
    content_id: int,
    current_user: UserDB = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ContentService(db)
    record = await service.get_content(current_user.id, content_id)
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Content not found")
    return record


@router.put("/{content_id}", response_model=ContentDB)
async def update_content(
    content_id: int,
    payload: ContentCreate,
    current_user: UserDB = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ContentService(db)
    # only allow updating certain fields
    data = {
        "title": payload.title,
        "generated_content": payload.generated_content,
        "tone": payload.tone,
        "word_count": payload.word_count,
        "target_audience": getattr(payload, "target_audience", None),
        "keywords": payload.keywords,
    }
    updated = await service.update_content(current_user.id, content_id, data)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Content not found or not owned")
    return updated


@router.delete("/{content_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_content(
    content_id: int,
    current_user: UserDB = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ContentService(db)
    await service.delete_content(current_user.id, content_id)
    return None


@router.post("/{content_id}/favorite", response_model=ContentDB)
async def favorite_content(
    content_id: int,
    current_user: UserDB = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ContentService(db)
    updated = await service.favorite_content(current_user.id, content_id, True)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Content not found or not owned")
    return updated
