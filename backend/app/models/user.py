"""
User ORM Model.
"""

import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Integer, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List, TYPE_CHECKING

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.game import GameSession
    from app.models.achievement import UserAchievement


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    username: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    display_name: Mapped[str] = mapped_column(String(100), nullable=True)
    avatar_seed: Mapped[str] = mapped_column(String(50), default="bull-1", nullable=False)
    
    # Financial/Trader Rank Title
    rank_title: Mapped[str] = mapped_column(String(50), default="Novice Trader", nullable=False)
    
    # Aggregate Stats for High-Performance Queries
    total_score: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    games_played: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    games_won: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    current_streak: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    max_streak: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    best_score: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    fastest_win_seconds: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    last_login_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # Relationships
    game_sessions: Mapped[List["GameSession"]] = relationship("GameSession", back_populates="user", cascade="all, delete-orphan")
    achievements: Mapped[List["UserAchievement"]] = relationship("UserAchievement", back_populates="user", cascade="all, delete-orphan")

    def update_rank(self):
        """Dynamic financial rank progression based on total score."""
        if self.total_score >= 50000:
            self.rank_title = "Market Maker"
        elif self.total_score >= 25000:
            self.rank_title = "Hedge Fund Titan"
        elif self.total_score >= 10000:
            self.rank_title = "Senior Portfolio Manager"
        elif self.total_score >= 5000:
            self.rank_title = "Floor Trader"
        elif self.total_score >= 2000:
            self.rank_title = "Junior Analyst"
        else:
            self.rank_title = "Novice Trader"
