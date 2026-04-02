# word_picker.py
# Fills each Slot with an actual word from the lexicon.
#
# Constraint priority (never violate a higher constraint to satisfy a lower one):
# 1. mātrā      — inviolable, never relaxed
# 2. semantic TAG   — try exact, then sibling tags, then cross-family
# 3. POS        — relaxed only after tag fallback exhausted
# 4. rhyme class    — applied only on rhyme slots, relaxed if truly empty
#
# Backtracking: if a slot cannot be filled after all fallbacks,
# the picker signals failure and poem_engine retries the line.

import random
from typing import List, Optional, Set
from cfg import Slot
from lexicon import Lexicon


class WordPicker:
  def __init__(self, lexicon: Lexicon):
    self.lexicon = lexicon

  # ─────────────────────────────────────────────────────────
  # Internal helpers
  # ─────────────────────────────────────────────────────────

  def _filter_pos(self, candidates: list, pos: str) -> list:
    filtered = [w for w in candidates if w.get("POS") == pos]
    return filtered if filtered else []

  def _filter_used(self, candidates: list, used: Set[str]) -> list:
    fresh = [w for w in candidates if w["word"] not in used]
    return fresh if fresh else candidates # if all used, allow repeats

  def _filter_rhyme(self, candidates: list, rhyme_class: str) -> list:
    matched = [w for w in candidates if w.get("rhyme_class") == rhyme_class]
    return matched if matched else []

  # ─────────────────────────────────────────────────────────
  # Core pick logic for one slot
  # ─────────────────────────────────────────────────────────

  def pick(
    self,
    slot:    Slot,
    used:    Set[str],
    rhyme_class: Optional[str] = None,
  ) -> Optional[str]:
    """
    Try to fill one slot. Returns the chosen word string, or None on failure.

    Constraint relaxation order:
      Pass 1: exact tag  + exact POS  + rhyme (if rhyme slot)
      Pass 2: exact tag  + exact POS  (rhyme relaxed)
      Pass 3: exact tag  + POS relaxed
      Pass 4: tag family fallback + exact POS
      Pass 5: tag family fallback + POS relaxed
      Pass 6: cross-family fallback + POS relaxed
    mātrā is never relaxed at any pass.
    """
    matra = slot.matra
    tag   = slot.tag
    pos   = slot.pos

    # ── Pass 1 — exact tag + POS + rhyme ──────────────────
    if slot.is_rhyme_slot and rhyme_class:
      candidates = self.lexicon.get_candidates(tag, matra)
      candidates = self._filter_pos(candidates, pos)
      candidates = self._filter_rhyme(candidates, rhyme_class)
      candidates = self._filter_used(candidates, used)
      if candidates:
        return random.choice(candidates)["word"]

    # ── Pass 2 — exact tag + POS (rhyme relaxed) ──────────
    candidates = self.lexicon.get_candidates(tag, matra)
    candidates = self._filter_pos(candidates, pos)
    candidates = self._filter_used(candidates, used)
    if candidates:
      word = random.choice(candidates)["word"]
      return word

    # ── Pass 3 — exact tag, POS relaxed ───────────────────
    candidates = self.lexicon.get_candidates(tag, matra)
    candidates = self._filter_used(candidates, used)
    if candidates:
      return random.choice(candidates)["word"]

    # ── Pass 4 — sibling tag fallback + exact POS ─────────
    from lexicon import TAG_FAMILY_FALLBACK
    for fallback_tag in TAG_FAMILY_FALLBACK.get(tag, []):
      candidates = self.lexicon.get_candidates(fallback_tag, matra)
      candidates = self._filter_pos(candidates, pos)
      candidates = self._filter_used(candidates, used)
      if candidates:
        return random.choice(candidates)["word"]

    # ── Pass 5 — sibling tag fallback, POS relaxed ────────
    for fallback_tag in TAG_FAMILY_FALLBACK.get(tag, []):
      candidates = self.lexicon.get_candidates(fallback_tag, matra)
      candidates = self._filter_used(candidates, used)
      if candidates:
        return random.choice(candidates)["word"]

    # ── Pass 6 — cross-family fallback, POS relaxed ───────
    candidates = self.lexicon.get_candidates_with_fallback(tag, matra)
    candidates = self._filter_used(candidates, used)
    if candidates:
      return random.choice(candidates)["word"]

    # truly failed — signal backtrack
    return None

  # ─────────────────────────────────────────────────────────
  # Fill a full line of slots
  # ─────────────────────────────────────────────────────────

  def fill_line(
    self,
    slots:     List[Slot],
    poem_used:   Set[str],
    rhyme_class: Optional[str] = None,
  ) -> Optional[List[str]]:
    """
    Fill all slots for one line.
    poem_used: words already used anywhere in the poem (cross-line memory).
    rhyme_class: the rhyme class to match for the last slot of even lines.

    Returns list of word strings, or None if any slot fails after retries.

    Backtracking strategy: if a slot fails, retry the whole line up to
    MAX_LINE_RETRIES times with fresh randomness (CFG re-expansion happens
    in poem_engine, not here — here we just signal failure).
    """
    line_used: Set[str] = set()   # within-line dedup on top of poem_used
    words: List[str] = []

    for slot in slots:
      # determine rhyme target for this slot
      slot_rhyme = rhyme_class if slot.is_rhyme_slot else None

      combined_used = poem_used | line_used

      word = self.pick(slot, combined_used, slot_rhyme)
      if word is None:
        return None   # signal failure — poem_engine will retry

      line_used.add(word)
      words.append(word)

      # if this was the rhyme slot, capture the rhyme class for the caller
      if slot.is_rhyme_slot:
        slot.rhyme_class = word  # store the actual word; engine extracts class

    return words
