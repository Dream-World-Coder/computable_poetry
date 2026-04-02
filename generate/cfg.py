# cfg.py
# Two-level CFG:
# Level 1 — Semantic grammar: field family → (TAG, POS) sequence
# Level 2 — POS grammar: already encoded in the TAG→POS mapping per slot
#
# For each line, given its field family from Dijkstra,
# randomly pick one semantic production and return a list of Slots —
# one slot per parba in the mātrā pattern.
#
# Option A: one slot per parba, mātrā assigned directly from pattern.
# Splits (Option B) are a planned extension.

import random
from dataclasses import dataclass, field
from typing import List, Dict, Optional


# ─────────────────────────────────────────────────────────────
# Slot — the unit the word picker fills
# ─────────────────────────────────────────────────────────────

@dataclass
class Slot:
  tag:      str      # semantic tag e.g. "NATURE_WATER"
  pos:      str      # POS tag e.g. "NN", "VB"
  matra:      int      # mātrā budget for this slot (inviolable)
  is_rhyme_slot: bool = False  # True for last slot of even lines
  rhyme_class:  Optional[str] = None  # set by word picker at runtime


# ─────────────────────────────────────────────────────────────
# Semantic productions
#
# Structure:
# FAMILY → [ [(TAG, POS), (TAG, POS), ...], ← production 1
#       [(TAG, POS), (TAG, POS), ...],   ← production 2
#       ...
#       ]
#
# Each production must have exactly as many (TAG, POS) pairs
# as there are parbas in the mātrā pattern.
# For pattern 4|4|4|2 → 4 parbas → 4 pairs per production.
#
# POS tags used:
# NN  = common noun
# VB  = verb (base)
# JJ  = adjective
# RB  = adverb
# CC  = conjunction / connector
# ─────────────────────────────────────────────────────────────

SEMANTIC_PRODUCTIONS: Dict[str, List[List[tuple]]] = {

  # ── NATURE ──────────────────────────────────────────────
  # Scene-setting lines — establish the natural environment
  "NATURE": [
    [("DESC_COLOR",    "JJ"),
     ("NATURE_SKY",    "NN"),
     ("MOTION_GENTLE", "VB"),
     ("NATURE_WATER",  "NN")],

    [("TIME_DAWN",     "NN"),
     ("NATURE_FLORA",  "NN"),
     ("MOTION_GENTLE", "VB"),
     ("NATURE_SKY",    "NN")],

    [("NATURE_EARTH",  "NN"),
     ("NATURE_FLORA",  "NN"),
     ("DESC_COLOR",    "JJ"),
     ("NATURE_WATER",  "NN")],

    [("NATURE_SKY",    "NN"),
     ("DESC_COLOR",    "JJ"),
     ("NATURE_FLORA",  "NN"),
     ("MOTION_GENTLE", "VB")],
  ],

  # ── LIGHT ───────────────────────────────────────────────
  # Illumination lines — light quality, how it falls
  "LIGHT": [
    [("LIGHT_BRIGHT",  "NN"),
     ("NATURE_SKY",    "NN"),
     ("MOTION_GENTLE", "VB"),
     ("DESC_COLOR",    "JJ")],

    [("TIME_DAWN",     "NN"),
     ("LIGHT_SOFT",    "NN"),
     ("NATURE_FLORA",  "NN"),
     ("DESC_COLOR",    "JJ")],

    [("LIGHT_BRIGHT",  "NN"),
     ("NATURE_WATER",  "NN"),
     ("MOTION_GENTLE", "VB"),
     ("LIGHT_SOFT",    "NN")],
  ],

  # ── TIME ────────────────────────────────────────────────
  # Time-anchoring lines — when the poem is set
  "TIME": [
    [("TIME_DAWN",     "NN"),
     ("NATURE_SKY",    "NN"),
     ("LIGHT_BRIGHT",  "NN"),
     ("MOTION_GENTLE", "VB")],

    [("TIME_DUSK",     "NN"),
     ("LIGHT_SOFT",    "NN"),
     ("NATURE_FLORA",  "NN"),
     ("DESC_COLOR",    "JJ")],

    [("TIME_DAY",    "NN"),
     ("NATURE_EARTH",  "NN"),
     ("DESC_COLOR",    "JJ"),
     ("MOTION_GENTLE", "VB")],
  ],

  # ── MOTION ──────────────────────────────────────────────
  # Motion lines — nature coming alive
  "MOTION": [
    [("NATURE_FLORA",  "NN"),
     ("MOTION_GENTLE", "VB"),
     ("NATURE_WATER",  "NN"),
     ("MOTION_GENTLE", "VB")],

    [("NATURE_FAUNA",  "NN"),
     ("MOTION_VIVID",  "VB"),
     ("NATURE_SKY",    "NN"),
     ("DESC_COLOR",    "JJ")],

    [("NATURE_WATER",  "NN"),
     ("MOTION_GENTLE", "VB"),
     ("NATURE_FLORA",  "NN"),
     ("MOTION_VIVID",  "VB")],

    [("NATURE_FAUNA",  "NN"),
     ("NATURE_SKY",    "NN"),
     ("MOTION_VIVID",  "VB"),
     ("CONN_BRIDGE",   "CC")],
  ],

  # ── SOUND ───────────────────────────────────────────────
  # Sound lines — auditory scene
  "SOUND": [
    [("NATURE_FAUNA",  "NN"),
     ("SOUND_NATURE",  "NN"),
     ("MOTION_GENTLE", "VB"),
     ("NATURE_FLORA",  "NN")],

    [("SOUND_NATURE",  "NN"),
     ("NATURE_WATER",  "NN"),
     ("MOTION_GENTLE", "VB"),
     ("CONN_BRIDGE",   "CC")],

    [("SOUND_HUMAN",   "NN"),
     ("NATURE_SKY",    "NN"),
     ("MOTION_GENTLE", "VB"),
     ("NATURE_FLORA",  "NN")],
  ],

  # ── EMOTION ─────────────────────────────────────────────
  # Resolution lines — feeling, cheerful close
  "EMOTION": [
    [("ACTOR_HUMAN",   "NN"),
     ("EMOTION_JOY",   "NN"),
     ("MOTION_GENTLE", "VB"),
     ("NATURE_FLORA",  "NN")],

    [("EMOTION_PEACE", "NN"),
     ("NATURE_SKY",    "NN"),
     ("LIGHT_BRIGHT",  "NN"),
     ("DESC_COLOR",    "JJ")],

    [("ACTOR_ABSTRACT","NN"),
     ("EMOTION_WONDER","NN"),
     ("NATURE_WATER",  "NN"),
     ("MOTION_GENTLE", "VB")],

    [("EMOTION_JOY",   "NN"),
     ("NATURE_FLORA",  "NN"),
     ("MOTION_VIVID",  "VB"),
     ("DESC_COLOR",    "JJ")],
  ],

  # ── ACTOR ───────────────────────────────────────────────
  # Actor lines — a presence enters the scene
  "ACTOR": [
    [("ACTOR_HUMAN",   "NN"),
     ("NATURE_FLORA",  "NN"),
     ("MOTION_GENTLE", "VB"),
     ("NATURE_WATER",  "NN")],

    [("ACTOR_ABSTRACT","NN"),
     ("NATURE_SKY",    "NN"),
     ("MOTION_GENTLE", "VB"),
     ("LIGHT_SOFT",    "NN")],
  ],

  # ── DESCRIPTOR ──────────────────────────────────────────
  # Descriptive lines — colour, texture, quality
  "DESCRIPTOR": [
    [("DESC_COLOR",    "JJ"),
     ("NATURE_FLORA",  "NN"),
     ("DESC_TEXTURE",  "JJ"),
     ("NATURE_WATER",  "NN")],

    [("DESC_COLOR",    "JJ"),
     ("NATURE_SKY",    "NN"),
     ("LIGHT_BRIGHT",  "NN"),
     ("DESC_SIZE",     "JJ")],
  ],

  # ── CONNECTOR ───────────────────────────────────────────
  # Transition lines — bridge between themes
  "CONNECTOR": [
    [("CONN_BRIDGE",   "CC"),
     ("NATURE_FLORA",  "NN"),
     ("MOTION_GENTLE", "VB"),
     ("NATURE_WATER",  "NN")],

    [("CONN_BRIDGE",   "CC"),
     ("NATURE_SKY",    "NN"),
     ("LIGHT_BRIGHT",  "NN"),
     ("MOTION_GENTLE", "VB")],
  ],
}


# ─────────────────────────────────────────────────────────────
# CFG engine
# ─────────────────────────────────────────────────────────────

class CFG:
  def __init__(self, matra_pattern: List[int]):
    """
    matra_pattern: list of ints from the pattern string
    e.g. "4|4|4|2" → [4, 4, 4, 2]
    Must match the number of (TAG, POS) pairs in every production.
    """
    self.matra_pattern = matra_pattern
    self._validate_productions()

  def _validate_productions(self) -> None:
    n = len(self.matra_pattern)
    for family, productions in SEMANTIC_PRODUCTIONS.items():
      for prod in productions:
        if len(prod) != n:
          raise ValueError(
            f"Production in {family} has {len(prod)} slots "
            f"but pattern has {n} parbas. They must match."
          )

  def get_slots(
    self,
    family:     str,
    is_even_line: bool = False,
  ) -> List[Slot]:
    """
    Given a semantic family (from Dijkstra) and whether this is an even line,
    randomly pick one production and return typed Slots with mātrā assigned.

    is_even_line=True → last slot marked as rhyme slot.
    """
    productions = SEMANTIC_PRODUCTIONS.get(family)
    if not productions:
      raise ValueError(f"No productions defined for family '{family}'")

    # randomised recursive descent — pick one production
    chosen: List[tuple] = random.choice(productions)

    slots: List[Slot] = []
    for i, ((tag, pos), matra) in enumerate(zip(chosen, self.matra_pattern)):
      is_last  = (i == len(chosen) - 1)
      is_rhyme = is_even_line and is_last
      slots.append(Slot(tag=tag, pos=pos, matra=matra, is_rhyme_slot=is_rhyme))

    return slots


if __name__ == "__main__":
  pattern = [4, 4, 4, 2]
  cfg   = CFG(pattern)

  trajectory = ["NATURE", "MOTION", "SOUND", "EMOTION"]

  print(f"Pattern: {pattern}")
  print(f"Trajectory: {trajectory}\n")

  for line_idx, family in enumerate(trajectory):
    is_even = (line_idx % 2 == 1) # 0-indexed: lines 1,3 are even
    slots = cfg.get_slots(family, is_even_line=is_even)
    print(f"Line {line_idx + 1} ({family}) {'[rhyme]' if is_even else ''}:")
    for s in slots:
      rhyme_marker = " ← rhyme slot" if s.is_rhyme_slot else ""
      print(f"  matra={s.matra}  tag={s.tag:20s}  pos={s.pos}{rhyme_marker}")
    print()
