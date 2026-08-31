import pytest
from app.engine.solver import evaluate_guess, FeedbackType
from app.engine.dictionary import WordDictionary, get_dictionary


def test_perfect_guess_all_bulls():
    result = evaluate_guess("TRADE", "TRADE")
    assert result.is_correct is True
    assert result.bulls_count == 5
    assert result.bears_count == 0
    assert result.misses_count == 0
    for fb in result.feedback:
        assert fb.status == FeedbackType.BULL


def test_complete_miss():
    result = evaluate_guess("LUCKY", "TRADE")
    assert result.is_correct is False
    assert result.bulls_count == 0
    assert result.bears_count == 0
    assert result.misses_count == 5
    for fb in result.feedback:
        assert fb.status == FeedbackType.MISS


def test_all_bears_anagram():
    result = evaluate_guess("HEART", "EARTH")
    assert result.is_correct is False
    assert result.bulls_count == 0
    assert result.bears_count == 5
    for fb in result.feedback:
        assert fb.status == FeedbackType.BEAR


def test_duplicate_letters_guess_has_more_than_target():
    result = evaluate_guess("SPEED", "CRANE")
    assert result.bulls_count == 0
    assert result.bears_count == 1
    assert result.misses_count == 4
    assert result.feedback[2].letter == "E" and result.feedback[2].status == FeedbackType.BEAR
    assert result.feedback[3].letter == "E" and result.feedback[3].status == FeedbackType.MISS


def test_duplicate_letters_bull_takes_priority_over_bear():
    result = evaluate_guess("EERIE", "CRANE")
    assert result.bulls_count == 1
    assert result.bears_count == 1
    assert result.feedback[0].status == FeedbackType.MISS
    assert result.feedback[1].status == FeedbackType.MISS
    assert result.feedback[2].status == FeedbackType.BEAR
    assert result.feedback[3].status == FeedbackType.MISS
    assert result.feedback[4].status == FeedbackType.BULL


def test_target_has_more_duplicates_than_guess():
    result = evaluate_guess("CRANE", "SPEED")
    assert result.bulls_count == 0
    assert result.bears_count == 1
    assert result.feedback[4].status == FeedbackType.BEAR


def test_case_insensitivity_and_whitespace():
    result = evaluate_guess("  trade  ", "TRADE")
    assert result.is_correct is True
    assert result.bulls_count == 5


def test_word_length_mismatch():
    with pytest.raises(ValueError):
        evaluate_guess("FOUR", "TRADE")


def test_dictionary_validation():
    d = get_dictionary()
    assert d.is_valid_guess("TRADE") is True
    assert d.is_valid_guess("BULLS") is True
    assert d.is_valid_guess("BEARS") is True
    assert d.is_valid_guess("XYZQQ") is False


def test_daily_word_consistency():
    d = get_dictionary()
    word1 = d.get_daily_target_word("2026-08-31")
    word2 = d.get_daily_target_word("2026-08-31")
    word3 = d.get_daily_target_word("2026-09-01")
    assert word1 == word2
    assert len(word1) == 5
    assert d.is_valid_guess(word1) is True
