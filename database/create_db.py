# create_db.py
"""
{
    "word": "আমি",
    "syllables": [
        "আ",
        "মি"
    ],
    "totalMatra": {
        "স্বরবৃত্ত": 2,
        "মাত্রাবৃত্ত": 2,
        "অক্ষরবৃত্ত": 2
    },
    "POS": "PRP",
    "TAG": "UNTAGGED",
    "TAG_FAMILY": "UNTAGGED",
    "rhyme_class": "ি",
    "reviewed": false
}
"""

import json
import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from word_to_syllables.splitBanglaSyllables import SplitBanglaSyllables
from tagger.tagger import tag_entry

CHECKPOINT = 100  # n words


def _checkpoint(write_path: str, word_entries: list) -> None:
  """Overwrite the output file with current progress."""
  with open(write_path, "w", encoding="utf-8") as f:
    json.dump({"words": word_entries}, f, ensure_ascii=False, indent=4)


def create_word_database(read_file="passage.txt", write_file="db/words.json"):
  read_path  = os.path.join(os.getcwd(), "database", read_file)
  write_path = os.path.join(os.getcwd(), "database", write_file)

  splitter = SplitBanglaSyllables()

  with open(read_path, "r", encoding="utf-8") as f:
    content = f.read()

  word_syllable_pairs = splitter.split_sentence_into_syllables(content)
  total_words = len(word_syllable_pairs)

  os.makedirs(os.path.dirname(write_path), exist_ok=True)

  word_entries  = []
  untagged_count = 0

  for i, (word, sylls) in enumerate(word_syllable_pairs):
    if not word:
      continue

    # POS —> from huggingface pipeline
    try:
      pos = splitter.get_parts_of_speech(word)
    except Exception:
      pos = "UNKNOWN"

    matra = {
      "স্বরবৃত্ত":  splitter.get_matra(sylls, "স্বরবৃত্ত"),
      "মাত্রাবৃত্ত": splitter.get_matra(sylls, "মাত্রাবৃত্ত"),
      "অক্ষরবৃত্ত": splitter.get_matra(sylls, "অক্ষরবৃত্ত"),
    }

    # tagging —> TAG, TAG_FAMILY, rhyme_class, reviewed
    tagging = tag_entry(word, pos)

    if tagging["TAG"] == "UNTAGGED":
      untagged_count += 1

    entry = {
      "word":     word,
      "syllables":  sylls,
      "totalMatra": matra,
      "POS":      pos,
      **tagging,    # TAG, TAG_FAMILY, rhyme_class, reviewed
    }

    word_entries.append(entry)

    # checkpoint every n words
    processed = i + 1
    if processed % CHECKPOINT == 0:
      _checkpoint(write_path, word_entries)
      print(f"  [{processed}/{total_words}] checkpoint written", end="\r")

  # final write —> catches the last partial batch
  _checkpoint(write_path, word_entries)

  total  = len(word_entries)
  tagged = total - untagged_count
  print(f"\nWritten to: {write_path}")
  print(f"Total words: {total}")
  print(f"Auto-tagged : {tagged}  ({100*tagged//total}%)")
  print(f"UNTAGGED: {untagged_count}  — these need manual review")


if __name__ == "__main__":
  create_word_database(
    read_file="passage_prakriti.txt",
    write_file="db/prakriti_words.json"
  )
