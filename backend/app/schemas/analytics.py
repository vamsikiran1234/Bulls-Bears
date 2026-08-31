"""
Pydantic Schemas for Player Performance Analytics.
"""

from typing import List, Dict, Optional
from datetime import datetime
from pydantic import BaseModel


class GuessDistributionItem(BaseModel):
    attempt_number: int  # 1 to 6
    count: int
    percentage: float


class ScoreHistoryItem(BaseModel):
    game_id: str
    game_number: int
    score: int
    attempts: int
    time_seconds: int
    is_win: bool
    mode: str
    date: str


class GameReplayMove(BaseModel):
    move_number: int
    guess_word: str
    feedback: list
    bulls_count: int
    bears_count: int
    seconds_taken: int


class GameReplayOut(BaseModel):
    id: str
    mode: str
    target_word: str
    status: str
    final_score: int
    attempts_used: int
    time_elapsed_seconds: int
    started_at: datetime
    completed_at: Optional[datetime]
    moves: List[GameReplayMove]


class UserStatsAnalyticsOut(BaseModel):
    user_id: str
    username: str
    display_name: Optional[str]
    avatar_seed: str
    rank_title: str
    total_score: int
    games_played: int
    games_won: int
    win_rate: float
    current_streak: int
    max_streak: int
    best_score: int
    average_score: float
    average_solve_time: float
    average_attempts: float
    fastest_win_seconds: int
    bull_accuracy_rate: float
    bear_accuracy_rate: float
    guess_distribution: List[GuessDistributionItem]
    recent_history: List[ScoreHistoryItem]
