"""
Pydantic Schemas for Leaderboards.
"""

from typing import List, Optional
from pydantic import BaseModel


class LeaderboardEntryOut(BaseModel):
    rank: int
    user_id: str
    username: str
    display_name: Optional[str] = None
    avatar_seed: str
    rank_title: str
    total_score: int
    games_played: int
    games_won: int
    win_rate: float
    current_streak: int
    best_score: int
    fastest_win_seconds: int


class LeaderboardResponse(BaseModel):
    period: str  # all_time, weekly, daily
    mode: str
    total_players: int
    user_rank: Optional[int] = None
    entries: List[LeaderboardEntryOut]
