"""
Downloads and prepares full dictionary sets:
- 2,500+ curated common 5-letter target words
- 14,000+ valid English 5-letter guess words
"""

import urllib.request
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / "app" / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)

TARGET_SOURCE_URL = "https://raw.githubusercontent.com/charlesreid1/five-letter-words/master/sgb-words.txt"
VALID_SOURCE_URL = "https://raw.githubusercontent.com/tabatkins/wordle-list/main/words"


def fetch_words(url: str) -> list[str]:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=10) as response:
        content = response.read().decode('utf-8', errors='ignore')
        return [w.strip().upper() for w in content.splitlines() if len(w.strip()) == 5 and w.strip().isalpha()]


def generate_word_lists():
    print("Fetching target and valid word banks...")
    target_words = []
    valid_words = set()

    try:
        targets = fetch_words(TARGET_SOURCE_URL)
        target_words.extend(targets[:2500])
    except Exception as e:
        print(f"Target download notice: {e}")

    try:
        valids = fetch_words(VALID_SOURCE_URL)
        valid_words.update(valids)
    except Exception as e:
        print(f"Valid words download notice: {e}")

    valid_words.update(target_words)

    with open(DATA_DIR / "words_target.txt", "w", encoding="utf-8") as f:
        for word in sorted(list(set(target_words))):
            f.write(f"{word}\n")

    with open(DATA_DIR / "words_valid.txt", "w", encoding="utf-8") as f:
        for word in sorted(list(valid_words)):
            f.write(f"{word}\n")

    print(f"SUCCESS: Saved {len(target_words)} target words and {len(valid_words)} valid guess words.")


if __name__ == "__main__":
    generate_word_lists()
