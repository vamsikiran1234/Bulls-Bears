"""
Game Session and Move Models.
"""

import uuid
from datetime import datetime, timezone
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import String, Integer, DateTime, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.user import User


class GameSession(Base):
    __tablename__ = "game_sessions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    
    # Target word is strictly stored server-side and never returned until game completion
    target_word: Mapped[str] = mapped_column(String(10), nullable=False)
    
    # Mode: classic, daily, blitz, zen
    mode: Mapped[str] = mapped_column(String(20), default="classic", nullable=False)
    daily_date: Mapped[Optional[str]] = mapped_column(String(10), nullable=True, index=True) # YYYY-MM-DD for daily puzzles
    
    # Status: in_progress, won, lost, abandoned
    status: Mapped[str] = mapped_column(String(20), default="in_progress", nullable=False, index=True)
    
    attempts_used: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    max_attempts: Mapped[int] = mapped_column(Integer, default=6, nullable=False)
    
    time_limit_seconds: Mapped[int] = mapped_column(Integer, default=120, nullable=False)
    time_elapsed_seconds: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    
    final_score: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    score_breakdown: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)

    total_bulls_found: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_bears_found: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    completed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )

    # Relationships
    user: Mapped[Optional["User"]] = relationship("User", back_populates="game_sessions")
    moves: Mapped[List["GuessMove"]] = relationship("GuessMove", back_populates="session", cascade="all, delete-orphan", order_by="GuessMove.move_number")


class GuessMove(Base):
    __tablename__ = "guess_moves"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id: Mapped[str] = mapped_column(String(36), ForeignKey("game_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    
    move_number: Mapped[int] = mapped_column(Integer, nullable=False)
    guess_word: Mapped[str] = mapped_column(String(10), nullable=False)
    
    # Detailed feedback array: [{index: 0, letter: 'T', status: 'BULL'}, ...]
    feedback: Mapped[list] = mapped_column(JSON, nullable=False)
    
    bulls_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    bears_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    seconds_taken: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    session: Mapped["GameSession"] = relationship("GameSession", back_populates="moves")
