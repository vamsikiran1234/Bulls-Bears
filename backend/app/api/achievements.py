"""
Achievements Endpoints.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.api.auth import get_optional_current_user
from app.models.user import User
from app.schemas.achievement import AchievementOut
from app.services.achievement_service import AchievementService

router = APIRouter(prefix="/achievements", tags=["Achievements"])


@router.get("", response_model=List[AchievementOut])
async def get_all_achievements(
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: AsyncSession = Depends(get_db)
):
    user_id = current_user.id if current_user else None
    return await AchievementService.get_user_achievements(db, user_id=user_id)
