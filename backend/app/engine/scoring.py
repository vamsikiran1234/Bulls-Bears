"""
Financial-Themed Scoring Engine for Bulls & Bears.

Formula:
Total Score = (Base Win Bonus + Attempt Efficiency Bonus + Time Bonus + Accuracy Bonus) * Streak Multiplier
- If Lost: Consolation points for discovery (Bulls & Bears found).
"""

from typing import Dict, Any
from pydantic import BaseModel


class ScoreBreakdown(BaseModel):
    base_points: int
    attempt_bonus: int
    time_bonus: int
    accuracy_bonus: int
    subtotal: int
    streak_multiplier: float
    total_score: int
    is_win: bool
    description: str


def calculate_score(
    is_win: bool,
    attempts_used: int,
    max_attempts: int = 6,
    time_elapsed_seconds: int = 0,
    time_limit_seconds: int = 120,
    total_bulls_discovered: int = 5,
    total_bears_discovered: int = 0,
    current_streak: int = 0,
    game_mode: str = "classic"
) -> ScoreBreakdown:
    """
    Calculates final game score with transparent multipliers and breakdown.
    """
    if is_win:
        # Base Win Points
        base_points = 1000

        # Attempt Efficiency Bonus: Higher bonus for fewer attempts
        # e.g., 1 attempt = 6 * 250 = 1500 bonus; 6 attempts = 1 * 250 = 250 bonus
        attempts_left = max(0, max_attempts - attempts_used + 1)
        attempt_bonus = attempts_left * 250

        # Time Bonus: Remaining seconds reward
        time_remaining = max(0, time_limit_seconds - time_elapsed_seconds)
        time_bonus = time_remaining * 15

        # Accuracy Bonus
        accuracy_bonus = (total_bulls_discovered * 30) + (total_bears_discovered * 10)

        subtotal = base_points + attempt_bonus + time_bonus + accuracy_bonus

        # Streak Multiplier: +5% per current streak, max 2.0x (20 streak)
        # Game mode multiplier: Blitz gives 1.5x mode multiplier
        mode_multiplier = 1.5 if game_mode == "blitz" else 1.0
        streak_bonus = min(1.0, current_streak * 0.05)
        effective_multiplier = round((1.0 + streak_bonus) * mode_multiplier, 2)

        total_score = int(subtotal * effective_multiplier)
        description = f"Win in {attempts_used}/{max_attempts} attempts with {time_remaining}s remaining ({effective_multiplier}x multiplier)."
    else:
        # Consolation for losing: Points for letters uncovered
        base_points = 0
        attempt_bonus = 0
        time_bonus = 0
        accuracy_bonus = (total_bulls_discovered * 25) + (total_bears_discovered * 10)
        subtotal = accuracy_bonus
        effective_multiplier = 1.0
        total_score = subtotal
        description = f"Attempted puzzle: {total_bulls_discovered} Bulls, {total_bears_discovered} Bears discovered."

    return ScoreBreakdown(
        base_points=base_points,
        attempt_bonus=attempt_bonus,
        time_bonus=time_bonus,
        accuracy_bonus=accuracy_bonus,
        subtotal=subtotal,
        streak_multiplier=effective_multiplier,
        total_score=total_score,
        is_win=is_win,
        description=description
    )

