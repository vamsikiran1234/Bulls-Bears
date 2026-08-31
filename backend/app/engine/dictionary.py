"""
Word Dictionary Manager for Bulls & Bears.
Loads and manages curated target words and valid guess dictionary.
"""

import os
from pathlib import Path
from typing import Set, List
import random

DATA_DIR = Path(__file__).parent.parent / "data"
TARGET_WORDS_FILE = DATA_DIR / "words_target.txt"
VALID_WORDS_FILE = DATA_DIR / "words_valid.txt"


class WordDictionary:
    _instance = None

    def __init__(self):
        self.target_words: List[str] = []
        self.valid_guesses: Set[str] = set()
        self._load_dictionaries()

    def _load_dictionaries(self):
        # Load curated target words
        if TARGET_WORDS_FILE.exists():
            with open(TARGET_WORDS_FILE, "r", encoding="utf-8") as f:
                self.target_words = [
                    line.strip().upper() for line in f if len(line.strip()) == 5 and line.strip().isalpha()
                ]

        # Load valid guess words
        if VALID_WORDS_FILE.exists():
            with open(VALID_WORDS_FILE, "r", encoding="utf-8") as f:
                self.valid_guesses = {
                    line.strip().upper() for line in f if len(line.strip()) == 5 and line.strip().isalpha()
                }

        # Ensure all target words are in valid guesses
        self.valid_guesses.update(self.target_words)

        # Fallback if files don't exist yet
        if not self.target_words:
            fallback = [
                "BULLS", "BEARS", "TRADE", "STOCK", "INDEX", "ASSET", "YIELD", "FUNDS",
                "MONEY", "PRICE", "SHARE", "VALUE", "BONDS", "COINS", "RISKS", "SMART",
                "POWER", "SHARK", "CLEAR", "BRAIN", "FOCUS", "TREND", "RATES", "EARNS",
                "SPLIT", "SHORT", "HEDGE", "CRYPT", "FLOAT", "AUDIT", "ORDER", "CRASH",
                "RALLY", "RISING", "TRUST", "TOKEN", "SURGE", "PROFIT", "GRAVY", "CHART"
            ]
            self.target_words = [w for w in fallback if len(w) == 5]
            self.valid_guesses.update(self.target_words)

    def is_valid_guess(self, word: str) -> bool:
        """Check if a 5-letter word is in the dictionary of valid English words."""
        cleaned = word.strip().upper()
        return len(cleaned) == 5 and cleaned in self.valid_guesses

    def get_random_target_word(self) -> str:
        """Select a random target word for classic/blitz game modes."""
        return random.choice(self.target_words)

    def get_daily_target_word(self, date_str: str) -> str:
        """
        Deterministic daily target word based on date string (YYYY-MM-DD).
        Ensures all players globally get the exact same daily puzzle.
        """
        import hashlib
        hash_val = int(hashlib.sha256(date_str.encode("utf-8")).hexdigest(), 16)
        index = hash_val % len(self.target_words)
        return self.target_words[index]


# Singleton instance
_dictionary_instance = None


def get_dictionary() -> WordDictionary:
    global _dictionary_instance
    if _dictionary_instance is None:
        _dictionary_instance = WordDictionary()
    return _dictionary_instance

