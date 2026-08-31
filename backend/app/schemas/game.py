"""
Pydantic Schemas for Game Sessions and Moves.
"""

from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, Field, ConfigDict


class GameCreateRequest(BaseModel):
    mode: str = Field("classic", description="classic, daily, blitz, zen")


class GuessSubmitRequest(BaseModel):
    guess: str = Field(..., min_length=5, max_length=5)
    seconds_taken: int = Field(0, ge=0)


class LetterFeedbackOut(BaseModel):
    index: int
    letter: str
    status: str


class GuessMoveOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    move_number: int
    guess_word: str
    feedback: List[LetterFeedbackOut]
    bulls_count: int
    bears_count: int
    seconds_taken: int
    created_at: datetime


class GameSessionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: Optional[str] = None
    mode: str
    daily_date: Optional[str] = None
    status: str
    attempts_used: int
    max_attempts: int
    time_limit_seconds: int
    time_elapsed_seconds: int
    final_score: int
    score_breakdown: Optional[dict] = None
    target_word: Optional[str] = None
    moves: List[GuessMoveOut] = []
    keyboard_status: dict[str, str] = {}
    started_at: datetime
    completed_at: Optional[datetime] = None
