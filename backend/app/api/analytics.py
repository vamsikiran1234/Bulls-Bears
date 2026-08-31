"""
Player Performance Analytics Endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.user import User
from app.schemas.analytics import UserStatsAnalyticsOut, GameReplayOut
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/me", response_model=UserStatsAnalyticsOut)
async def get_my_analytics(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await AnalyticsService.get_user_analytics(db, current_user.id)


@router.get("/user/{user_id}", response_model=UserStatsAnalyticsOut)
async def get_player_analytics(
    user_id: str,
    db: AsyncSession = Depends(get_db)
):
    return await AnalyticsService.get_user_analytics(db, user_id)


@router.get("/replay/{session_id}", response_model=GameReplayOut)
async def get_game_replay(
    session_id: str,
    db: AsyncSession = Depends(get_db)
):
    return await AnalyticsService.get_game_replay(db, session_id)
