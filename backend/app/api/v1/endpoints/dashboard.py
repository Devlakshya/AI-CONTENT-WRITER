from fastapi import APIRouter, Depends
from app.auth.security import get_current_user
from app.schemas.user import UserDB

router = APIRouter()

@router.get('/overview')
async def get_dashboard_overview(current_user: UserDB = Depends(get_current_user)) -> dict:
    return {
        'user': {'id': current_user.id, 'name': current_user.name, 'email': current_user.email},
        'stats': {
            'projects': 0,
            'content_generations': 0,
            'favorites': 0,
        },
    }
