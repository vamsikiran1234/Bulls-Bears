"""
Game Management and Gameplay REST API Endpoints.
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.api.auth import get_optional_current_user
from app.models.user import User
from app.schemas.game import GameCreateRequest, GuessSubmitRequest, GameSessionOut
from app.services.game_service import GameService, sanitize_session_out

router = APIRouter(prefix="/games", tags=["Gameplay"])


@router.post("/new", response_model=GameSessionOut, status_code=status.HTTP_201_CREATED)
async def create_new_game(
    req: GameCreateRequest,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: AsyncSession = Depends(get_db)
):
    user_id = current_user.id if current_user else None
    session = await GameService.create_game(db, mode=req.mode, user_id=user_id)
    return sanitize_session_out(session)


@router.get("/daily/today", response_model=GameSessionOut)
async def get_today_daily_game(
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: AsyncSession = Depends(get_db)
):
    user_id = current_user.id if current_user else None
    session = await GameService.create_game(db, mode="daily", user_id=user_id)
    return sanitize_session_out(session)


@router.get("/{session_id}", response_model=GameSessionOut)
async def get_game_state(
    session_id: str,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: AsyncSession = Depends(get_db)
):
    session = await GameService.get_session_by_id(db, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Game session not found.")
    return sanitize_session_out(session)


@router.post("/{session_id}/guess", response_model=GameSessionOut)
async def submit_guess(
    session_id: str,
    req: GuessSubmitRequest,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: AsyncSession = Depends(get_db)
):
    user_id = current_user.id if current_user else None
    session = await GameService.submit_guess(
        db,
        session_id=session_id,
        guess_word=req.guess,
        seconds_taken=req.seconds_taken,
        user_id=user_id
    )
    return sanitize_session_out(session)


@router.post("/{session_id}/abandon", response_model=GameSessionOut)
async def abandon_game(
    session_id: str,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: AsyncSession = Depends(get_db)
):
    user_id = current_user.id if current_user else None
    session = await GameService.abandon_game(db, session_id=session_id, user_id=user_id)
    return sanitize_session_out(session)
