"""
Core Bulls and Bears Guess Evaluation Engine.

Definitions:
- BULL: Letter is correct and in the exact correct position.
- BEAR: Letter is present in the target word, but in a different position.
- MISS: Letter is not present in the target word (or its occurrences have already been consumed by Bulls/Bears).
"""

from enum import Enum
from typing import List, Dict
from pydantic import BaseModel


class FeedbackType(str, Enum):
    BULL = "BULL"
    BEAR = "BEAR"
    MISS = "MISS"


class LetterFeedback(BaseModel):
    index: int
    letter: str
    status: FeedbackType


class GuessEvaluationResult(BaseModel):
    guess: str
    target: str = ""  # Only populated when game is finished
    feedback: List[LetterFeedback]
    bulls_count: int
    bears_count: int
    misses_count: int
    is_correct: bool


def evaluate_guess(guess: str, target: str) -> GuessEvaluationResult:
    """
    Evaluates a 5-letter guess against the target word using a two-pass algorithm
    that strictly resolves duplicate letters without false positives.

    Algorithm:
    1. Validate equal lengths and uppercase normalization.
    2. Pass 1 (Bulls): Match characters where guess[i] == target[i].
       Increment bulls count and reduce target letter availability pool.
    3. Pass 2 (Bears): For unmatched positions, if guess[i] in pool and pool[guess[i]] > 0,
       mark as BEAR and decrement pool. Otherwise mark as MISS.
    """
    guess_clean = guess.strip().upper()
    target_clean = target.strip().upper()

    if len(guess_clean) != len(target_clean):
        raise ValueError(f"Guess length ({len(guess_clean)}) does not match target length ({len(target_clean)})")

    n = len(target_clean)
    feedback: List[LetterFeedback] = [None] * n  # type: ignore

    # Count frequencies of letters in target
    target_letter_pool: Dict[str, int] = {}
    for char in target_clean:
        target_letter_pool[char] = target_letter_pool.get(char, 0) + 1

    bulls = 0
    # Pass 1: Identify all BULLS (exact position matches)
    for i in range(n):
        if guess_clean[i] == target_clean[i]:
            feedback[i] = LetterFeedback(index=i, letter=guess_clean[i], status=FeedbackType.BULL)
            target_letter_pool[guess_clean[i]] -= 1
            bulls += 1

    bears = 0
    misses = 0
    # Pass 2: Identify BEARS (wrong position) and MISSES
    for i in range(n):
        if feedback[i] is not None:
            continue  # Already marked as BULL

        char = guess_clean[i]
        if target_letter_pool.get(char, 0) > 0:
            feedback[i] = LetterFeedback(index=i, letter=char, status=FeedbackType.BEAR)
            target_letter_pool[char] -= 1
            bears += 1
        else:
            feedback[i] = LetterFeedback(index=i, letter=char, status=FeedbackType.MISS)
            misses += 1

    is_correct = (bulls == n)

    return GuessEvaluationResult(
        guess=guess_clean,
        feedback=feedback,
        bulls_count=bulls,
        bears_count=bears,
        misses_count=misses,
        is_correct=is_correct
    )

