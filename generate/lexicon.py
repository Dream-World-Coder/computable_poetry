# lexicon.py
# Loads the word DB once and builds two in-memory indices:
# inverted_index[(TAG, matra)]  → [word_entry, ...] O(1) candidate lookup
# rhyme_index[rhyme_class]    → [word_entry, ...] O(1) rhyme lookup
#
# স্বরবৃত্ত only — max mātrā is 4, so index keys are small.

import json
import os
from typing import Dict, List, Tuple, Any

WordEntry = Dict[str, Any]
InvertedIndex = Dict[Tuple[str, int], List[WordEntry]]
RhymeIndex    = Dict[str, List[WordEntry]]

# TAG_FAMILY fallback chain — if a specific tag bucket is empty,
# walk up to the family root, then try siblings.
# Matches the hierarchy defined in tagger.py.
TAG_FAMILY_FALLBACK: Dict[str, List[str]] = {
  "NATURE_SKY":    ["NATURE_FLORA", "NATURE_WATER", "NATURE_EARTH", "NATURE_FAUNA"],
  "NATURE_WATER":    ["NATURE_SKY", "NATURE_FLORA", "NATURE_EARTH", "NATURE_FAUNA"],
  "NATURE_FLORA":    ["NATURE_WATER", "NATURE_SKY", "NATURE_EARTH", "NATURE_FAUNA"],
  "NATURE_FAUNA":    ["NATURE_FLORA", "NATURE_SKY", "NATURE_WATER", "NATURE_EARTH"],
  "NATURE_EARTH":    ["NATURE_FLORA", "NATURE_WATER", "NATURE_SKY", "NATURE_FAUNA"],
  "LIGHT_BRIGHT":    ["LIGHT_SOFT"],
  "LIGHT_SOFT":    ["LIGHT_BRIGHT"],
  "TIME_DAWN":     ["TIME_DAY",   "TIME_DUSK"],
  "TIME_DAY":      ["TIME_DAWN",  "TIME_DUSK"],
  "TIME_DUSK":     ["TIME_DAY",   "TIME_DAWN"],
  "MOTION_GENTLE":   ["MOTION_VIVID"],
  "MOTION_VIVID":    ["MOTION_GENTLE"],
  "SOUND_NATURE":    ["SOUND_HUMAN"],
  "SOUND_HUMAN":     ["SOUND_NATURE"],
  "EMOTION_JOY":     ["EMOTION_PEACE",  "EMOTION_WONDER"],
  "EMOTION_PEACE":   ["EMOTION_JOY",    "EMOTION_WONDER"],
  "EMOTION_WONDER":  ["EMOTION_JOY",    "EMOTION_PEACE"],
  "ACTOR_HUMAN":     ["ACTOR_ABSTRACT"],
  "ACTOR_ABSTRACT":  ["ACTOR_HUMAN"],
  "DESC_COLOR":    ["DESC_TEXTURE",   "DESC_SIZE"],
  "DESC_TEXTURE":    ["DESC_COLOR",   "DESC_SIZE"],
  "DESC_SIZE":     ["DESC_COLOR",   "DESC_TEXTURE"],
  "CONN_BRIDGE":     [],
}

# Family-level fallback — if all siblings fail, try these cross-family neighbours
FAMILY_FALLBACK: Dict[str, List[str]] = {
  "NATURE":   ["LIGHT", "MOTION", "DESCRIPTOR"],
  "LIGHT":    ["NATURE", "EMOTION"],
  "TIME":     ["NATURE", "LIGHT"],
  "MOTION":   ["NATURE", "SOUND"],
  "SOUND":    ["MOTION", "EMOTION"],
  "EMOTION":    ["ACTOR",  "SOUND"],
  "ACTOR":    ["EMOTION", "NATURE"],
  "DESCRIPTOR": ["NATURE",  "LIGHT"],
  "CONNECTOR":  [],
}


class Lexicon:
  def __init__(self, db_path: str):
    self.db_path    = db_path
    self.words:      List[WordEntry]  = []
    self.inverted_index: InvertedIndex    = {}
    self.rhyme_index:  RhymeIndex     = {}
    self._load()

  def _load(self) -> None:
    if not os.path.exists(self.db_path):
      raise FileNotFoundError(f"DB not found: {self.db_path}")

    with open(self.db_path, "r", encoding="utf-8") as f:
      data = json.load(f)

    self.words = data.get("words", [])
    if not self.words:
      raise ValueError("DB is empty.")

    self._build_inverted_index()
    self._build_rhyme_index()
    print(f"Lexicon loaded: {len(self.words)} words | "
        f"{len(self.inverted_index)} index buckets | "
        f"{len(self.rhyme_index)} rhyme classes")

  def _build_inverted_index(self) -> None:
    """
    Key: (TAG, matra_স্বরবৃত্ত)
    Value: list of word entries with that tag and mātrā.
    O(n) to build, O(1) to query.
    """
    for entry in self.words:
      tag   = entry.get("TAG", "UNTAGGED")
      matra = entry.get("totalMatra", {}).get("স্বরবৃত্ত", 0)

      if tag == "UNTAGGED" or matra == 0:
        continue   # skip untagged and zero-matra words

      key = (tag, matra)
      if key not in self.inverted_index:
        self.inverted_index[key] = []
      self.inverted_index[key].append(entry)

  def _build_rhyme_index(self) -> None:
    """
    Key: rhyme_class character
    Value: list of word entries with that rhyme class.
    """
    for entry in self.words:
      rc = entry.get("rhyme_class", "")
      if not rc:
        continue
      if rc not in self.rhyme_index:
        self.rhyme_index[rc] = []
      self.rhyme_index[rc].append(entry)

  # Public lookup
  # ─────────────────────────────────────────────────────────

  def get_candidates(self, tag: str, matra: int) -> List[WordEntry]:
    """
    O(1) lookup. Returns all words matching (tag, matra).
    Empty list if no match — caller handles fallback.
    """
    return self.inverted_index.get((tag, matra), [])

  def get_candidates_with_fallback(self, tag: str, matra: int) -> List[WordEntry]:
    """
    Try exact (tag, matra) first.
    Fall back through sibling tags, then cross-family tags.
    Matra constraint is NEVER relaxed — it is inviolable.
    """
    # exact
    candidates = self.get_candidates(tag, matra)
    if candidates:
      return candidates

    # sibling tags in same family
    for fallback_tag in TAG_FAMILY_FALLBACK.get(tag, []):
      candidates = self.get_candidates(fallback_tag, matra)
      if candidates:
        return candidates

    # cross-family fallback — derive family from tag prefix
    family = tag.split("_")[0]
    for fallback_family in FAMILY_FALLBACK.get(family, []):
      # try all tags in that family by scanning the index
      for (idx_tag, idx_matra), entries in self.inverted_index.items():
        if idx_matra == matra and idx_tag.startswith(fallback_family):
          if entries:
            return entries

    return [] # truly empty — word picker will backtrack

  def get_rhyme_candidates(self, rhyme_class: str) -> List[WordEntry]:
    """Return all words sharing the given rhyme class."""
    return self.rhyme_index.get(rhyme_class, [])

  def stats(self) -> None:
    """Print coverage stats — useful for debugging seed list gaps."""
    print("\n── Inverted index coverage ──")
    from collections import defaultdict
    tag_counts: Dict[str, int] = defaultdict(int)
    for (tag, matra), entries in self.inverted_index.items():
      tag_counts[tag] += len(entries)
    for tag, count in sorted(tag_counts.items()):
      print(f"  {tag:25s} {count:4d} words")

    print("\n── Matra distribution (স্বরবৃত্ত) ──")
    matra_counts: Dict[int, int] = defaultdict(int)
    for (tag, matra), entries in self.inverted_index.items():
      matra_counts[matra] += len(entries)
    for m in sorted(matra_counts):
      print(f"  matra={m}  {matra_counts[m]:4d} words")


if __name__ == "__main__":
  import sys
  db = sys.argv[1] if len(sys.argv) > 1 else "database/db/prakriti_words.json"
  lex = Lexicon(db)
  lex.stats()
  print("\n── Sample lookup ──")
  for tag, m in [("NATURE_WATER", 3), ("NATURE_SKY", 2), ("EMOTION_JOY", 4)]:
    results = lex.get_candidates(tag, m)
    words = [e["word"] for e in results[:5]]
    print(f"  ({tag}, matra={m}) → {words}")
