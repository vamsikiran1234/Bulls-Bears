"""
Competitive Leaderboard Endpoints.
"""

from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.api.auth import get_optional_current_user
from app.models.user import User
from app.schemas.leaderboard import LeaderboardResponse
from app.services.leaderboard_service import LeaderboardService

router = APIRouter(prefix="/leaderboard", tags=["Leaderboard"])


@router.get("", response_model=LeaderboardResponse)
async def get_leaderboard(
    period: str = Query("all_time", description="all_time, weekly, daily"),
    mode: str = Query("all", description="all, classic, blitz, daily"),
    sort_by: str = Query("total_score", description="total_score, win_rate, current_streak, best_score"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: AsyncSession = Depends(get_db)
):
    user_id = current_user.id if current_user else None
    return await LeaderboardService.get_leaderboard(
        db,
        period=period,
        mode=mode,
        sort_by=sort_by,
        limit=limit,
        offset=offset,
        current_user_id=user_id
    )
