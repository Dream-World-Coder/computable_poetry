# poem_engine.py
# Wires all components together.
#
# Pipeline:
# 1. Load lexicon + build indices
# 2. Build semantic graph
# 3. K-hop Dijkstra → field trajectory
# 4. For each line: CFG → slots → word picker → words
# 5. Assemble and return poem
#
# Backtracking: if a line fails after MAX_LINE_RETRIES,
# the whole poem is retried up to MAX_POEM_RETRIES times.

import os
from typing import List, Optional

from lexicon import Lexicon
from semantic_graph import plan_field_trajectory
from cfg import CFG
from word_picker import WordPicker

MAX_LINE_RETRIES = 10 # retries per line before giving up on the poem
MAX_POEM_RETRIES = 5  # retries for the whole poem

DB_PATH = os.path.join(os.getcwd(), "database", "db", "prakriti_words.json")


def parse_pattern(pattern: str):
  """
  "4|4|4|2" → ("স্বরবৃত্ত", [4, 4, 4, 2])
  Raises ValueError on bad input.
  """
  import re
  if not re.fullmatch(r'(\d+\|)*\d+', pattern):
    raise ValueError(f"Invalid pattern '{pattern}'. Use e.g. '4|4|4|2'.")
  parts = list(map(int, pattern.split("|")))
  highest = max(parts)
  if highest < 2:
    raise ValueError("mātrā must be at least 2.")
  if 2 <= highest <= 4:
    chhondo = "স্বরবৃত্ত"
  elif 5 <= highest <= 7:
    chhondo = "মাত্রাবৃত্ত"
  elif 8 <= highest <= 12:
    chhondo = "অক্ষরবৃত্ত"
  else:
    raise ValueError(f"Highest mātrā {highest} out of supported range.")
  return chhondo, parts


class PoemEngine:
  def __init__(self, db_path: str = DB_PATH, pattern: str = "4|4|4|2"):
    self.pattern_str     = pattern
    self.chhondo, self.matra_pattern = parse_pattern(pattern)

    # load lexicon once — indices built in memory
    self.lexicon   = Lexicon(db_path)
    self.cfg     = CFG(self.matra_pattern)
    self.picker    = WordPicker(self.lexicon)

  # Rhyme class extraction
  # ─────────────────────────────────────────────────────────
  def _get_rhyme_class(self, word: str) -> str:
    """Extract rhyme class from a word — last vowel sound."""
    ALL_VOWELS = set("অআইঈউঊঋএঐওঔ") | set("ািীুূৃেৈোৌ")
    for ch in reversed(word):
      if ch in ALL_VOWELS:
        return ch
    return word[-1] if word else ""

  # Single line generation
  # ─────────────────────────────────────────────────────────
  def _generate_line(
    self,
    family:    str,
    line_index:  int,
    poem_used:   set,
    rhyme_class: str = None,
  ) -> Optional[List[str]]:
    """
    Try to generate one line up to MAX_LINE_RETRIES times.
    Each retry re-expands the CFG (fresh slot selection).
    Returns list of words or None on total failure.
    """
    is_even = (line_index % 2 == 1)   # 0-indexed: lines 1,3,5... are even

    for attempt in range(MAX_LINE_RETRIES):
      slots = self.cfg.get_slots(family, is_even_line=is_even)
      words = self.picker.fill_line(slots, poem_used, rhyme_class)
      if words is not None:
        return words

    return None   # failed after all retries

  # Full poem generation
  # ─────────────────────────────────────────────────────────
  def generate(
    self,
    num_lines:  int  = 4,
    start:    str  = "NATURE",
    verbose:  bool = False,
  ) -> List[str]:
    """
    Generate a poem of num_lines lines.

    Returns list of line strings.
    Raises RuntimeError if generation fails after MAX_POEM_RETRIES.
    """
    for poem_attempt in range(MAX_POEM_RETRIES):

      # ── Step 1: plan field trajectory ─────────────────
      trajectory = plan_field_trajectory(num_lines, start)
      if verbose:
        print(f"\nTrajectory: {' → '.join(trajectory)}")

      # ── Step 2: generate lines ─────────────────────────
      poem_used:   set     = set()
      poem_lines:  List[str] = []
      rhyme_class: str     = None # set from last word of odd lines
      failed = False

      for line_idx, family in enumerate(trajectory):
        is_even = (line_idx % 2 == 1)

        # even lines must rhyme with the previous odd line's last word
        target_rhyme = rhyme_class if is_even else None

        words = self._generate_line(
          family, line_idx, poem_used, target_rhyme
        )

        if words is None:
          if verbose:
            print(f"  Line {line_idx+1} ({family}): FAILED — retrying poem")
          failed = True
          break

        # update poem-scoped memory
        for w in words:
          poem_used.add(w)

        # capture rhyme class from last word of odd lines (0,2,4...)
        if not is_even:
          rhyme_class = self._get_rhyme_class(words[-1])

        line_str = " ".join(words)
        poem_lines.append(line_str)

        if verbose:
          rhyme_marker = f"  [rhyme→{target_rhyme}]" if is_even else f"  [sets rhyme:{rhyme_class}]"
          print(f"  Line {line_idx+1} ({family}): {line_str}{rhyme_marker}")

      if not failed:
        return poem_lines

    raise RuntimeError(
      f"Failed to generate a {num_lines}-line poem after "
      f"{MAX_POEM_RETRIES} attempts. "
      f"Check lexicon coverage — run lexicon.py stats()."
    )


# CLI entry point
# ─────────────────────────────────────────────────────────────
def main():
  import argparse

  parser = argparse.ArgumentParser(description="Algorithmic Bangla poem generator")
  parser.add_argument("--pattern",   default="4|4|4|2",  help="mātrā pattern e.g. 4|4|4|2")
  parser.add_argument("--lines",     default=4, type=int, help="number of lines")
  parser.add_argument("--start",     default="NATURE",  help="starting semantic field")
  parser.add_argument("--db",      default=DB_PATH,   help="path to words JSON")
  parser.add_argument("--verbose",   action="store_true", help="print trajectory and slot info")
  parser.add_argument("--poems",     default=1, type=int, help="how many poems to generate")
  parser.add_argument("--output",    default=None,    help="file to append output to")
  args = parser.parse_args()

  engine = PoemEngine(db_path=args.db, pattern=args.pattern)

  results = []
  for i in range(args.poems):
    print(f"\n{'─'*40}")
    print(f"Poem {i+1}  |  pattern={args.pattern}  |  lines={args.lines}")
    print(f"{'─'*40}")
    try:
      poem = engine.generate(
        num_lines=args.lines,
        start=args.start,
        verbose=args.verbose,
      )
      for line in poem:
        print(line)
      results.append(poem)
    except RuntimeError as e:
      print(f"ERROR: {e}")

  if args.output:
    out_path = os.path.join(os.getcwd(), args.output)
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "a", encoding="utf-8") as f:
      for poem in results:
        f.write(f"\npattern={args.pattern} lines={args.lines}\n")
        f.write("─" * 30 + "\n")
        for line in poem:
          f.write(line + "\n")
        f.write("\n")
    print(f"\nOutput written to {args.output}")


if __name__ == "__main__":
  main()
