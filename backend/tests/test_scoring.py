import pytest
from app.engine.scoring import calculate_score


def test_perfect_first_guess_score():
    score = calculate_score(
        is_win=True,
        attempts_used=1,
        max_attempts=6,
        time_elapsed_seconds=10,
        time_limit_seconds=120,
        total_bulls_discovered=5,
        total_bears_discovered=0,
        current_streak=0,
        game_mode="classic"
    )
    assert score.is_win is True
    assert score.base_points == 1000
    assert score.attempt_bonus == 1500
    assert score.time_bonus == 1650
    assert score.accuracy_bonus == 150
    assert score.total_score == 4300


def test_streak_multiplier():
    score = calculate_score(
        is_win=True,
        attempts_used=3,
        max_attempts=6,
        time_elapsed_seconds=40,
        time_limit_seconds=120,
        total_bulls_discovered=5,
        total_bears_discovered=2,
        current_streak=10,
        game_mode="classic"
    )
    assert score.streak_multiplier == 1.5
    assert score.total_score == int(score.subtotal * 1.5)


def test_blitz_mode_multiplier():
    score = calculate_score(
        is_win=True,
        attempts_used=2,
        max_attempts=5,
        time_elapsed_seconds=20,
        time_limit_seconds=90,
        total_bulls_discovered=5,
        total_bears_discovered=0,
        current_streak=0,
        game_mode="blitz"
    )
    assert score.streak_multiplier == 1.5
    assert score.total_score == int(score.subtotal * 1.5)


def test_loss_consolation_score():
    score = calculate_score(
        is_win=False,
        attempts_used=6,
        max_attempts=6,
        time_elapsed_seconds=120,
        time_limit_seconds=120,
        total_bulls_discovered=3,
        total_bears_discovered=4,
        current_streak=5,
        game_mode="classic"
    )
    assert score.is_win is False
    assert score.base_points == 0
    assert score.attempt_bonus == 0
    assert score.time_bonus == 0
    assert score.accuracy_bonus == 115
    assert score.total_score == 115
