"""
Pydantic Schemas for Users & Authentication.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=30, pattern="^[a-zA-Z0-9_-]+$")
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=100)
    display_name: Optional[str] = Field(None, max_length=50)
    avatar_seed: Optional[str] = "bull-1"


class UserLogin(BaseModel):
    username: str
    password: str


class UserUpdate(BaseModel):
    display_name: Optional[str] = Field(None, max_length=50)
    avatar_seed: Optional[str] = None


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    username: str
    email: str
    display_name: Optional[str] = None
    avatar_seed: str
    rank_title: str
    total_score: int
    games_played: int
    games_won: int
    current_streak: int
    max_streak: int
    best_score: int
    fastest_win_seconds: int
    win_rate: float = 0.0
    created_at: datetime


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class GuestGameSyncItem(BaseModel):
    mode: str
    status: str
    attempts_used: int
    time_elapsed_seconds: int
    final_score: int
    total_bulls: int
    total_bears: int
    completed_at: Optional[str] = None


class GuestSyncRequest(BaseModel):
    guest_games: list[GuestGameSyncItem]
