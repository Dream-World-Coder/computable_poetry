# semantic_graph.py
# Formal semantic distance metric + graph construction + k-hop Dijkstra.
# No ML. All weights derived from set membership and declared natural pairs.

import heapq
from typing import Dict, List, Optional

# ─────────────────────────────────────────────────────────────
# Set-theoretic partition of semantic families
# SENSORY  — observable, external world
# INNER    — felt, internal world
# CONNECTOR is special — always low cost, handled separately
# ─────────────────────────────────────────────────────────────

SENSORY: frozenset = frozenset({
  "NATURE", "LIGHT", "SOUND", "MOTION", "DESCRIPTOR", "TIME"
})

INNER: frozenset = frozenset({
  "EMOTION", "ACTOR"
})

# Natural poetic pairs — order-agnostic via frozenset.
# These are the transitions a poet reaches for instinctively.
# Declared once, never hand-assigned per edge.
NATURAL_PAIRS: set = {
  frozenset({"NATURE",  "LIGHT"}),
  frozenset({"NATURE",  "MOTION"}),
  frozenset({"NATURE",  "SOUND"}),
  frozenset({"NATURE",  "DESCRIPTOR"}),
  frozenset({"LIGHT",   "EMOTION"}),
  frozenset({"MOTION",  "SOUND"}),
  frozenset({"SOUND",   "EMOTION"}),
  frozenset({"ACTOR",   "EMOTION"}),
  frozenset({"ACTOR",   "MOTION"}),
  frozenset({"TIME",    "NATURE"}),
  frozenset({"TIME",    "LIGHT"}),
}

# All semantic families (nodes in the graph)
FAMILIES: List[str] = [
  "NATURE", "LIGHT", "TIME", "MOTION",
  "SOUND",  "EMOTION", "ACTOR", "DESCRIPTOR", "CONNECTOR"
]

# Resolved families for cheerful/nature tone — poem should end here
RESOLVED: frozenset = frozenset({"EMOTION", "SOUND"})

# Weight function — fully derived, zero manual per-edge judgment
# ─────────────────────────────────────────────────────────────
def compute_weight(a: str, b: str) -> int:
  """
  Derive edge weight from set membership alone.

  Rules (in priority order):
    CONNECTOR involved  → 1   (bridge word, always cheap)
    natural poetic pair → 2   (instinctive transition)
    sensory → sensory   → 3   (same outer world, moderate)
    inner   → inner   → 2   (ACTOR↔EMOTION, tight coupling)
    sensory ↔ inner   → 4   (poetic turn, higher cost but valid)
  """
  if a == "CONNECTOR" or b == "CONNECTOR":
    return 1

  if frozenset({a, b}) in NATURAL_PAIRS:
    return 2

  a_sensory = a in SENSORY
  b_sensory = b in SENSORY

  if a_sensory and b_sensory:
    return 3   # sensory → sensory

  if not a_sensory and not b_sensory:
    return 2   # inner → inner

  return 4     # sensory ↔ inner — the poetic turn


def build_graph() -> Dict[str, Dict[str, int]]:
  """
  Build the complete directed weighted graph over FAMILIES.
  Every pair (a, b) where a != b gets a weight from compute_weight.
  O(n^2) where n = len(FAMILIES) — tiny, called once at startup.
  """
  graph: Dict[str, Dict[str, int]] = {}
  for a in FAMILIES:
    graph[a] = {}
    for b in FAMILIES:
      if a != b:
        graph[a][b] = compute_weight(a, b)
  return graph


# K-hop Dijkstra on layered graph
# ─────────────────────────────────────────────────────────────
def k_hop_dijkstra(
  graph:    Dict[str, Dict[str, int]],
  start:    str,
  resolved: frozenset,
  k:      int,
) -> Optional[List[str]]:
  """
  Find the minimum-cost path of exactly k hops from `start`
  that ends at any node in `resolved`.

  Models the poem as a layered graph:
    layer 0 = line 1 field, layer 1 = line 2 field, ..., layer k-1 = line k field.

  State: (field, layer)
  Returns the path as a list of k field names (one per line),
  or None if no valid path exists.

  Time complexity: O(k * |V|^2) — fine for |V|=9, k<=8 ig.
  """
  # dist[(node, layer)] = best cost to reach this state
  dist: Dict[tuple, int] = {(start, 0): 0}

  # priority queue: (cost, node, layer, path)
  pq = [(0, start, 0, [start])]

  best_path: Optional[List[str]] = None
  best_cost: int = 10**18

  while pq:
    cost, node, layer, path = heapq.heappop(pq)

    # pruning — already found a better path
    if cost >= best_cost:
      continue

    # reached target depth
    if layer == k - 1:
      if node in resolved and cost < best_cost:
        best_cost = cost
        best_path = path
      continue

    # expand neighbours
    for neighbour, weight in graph[node].items():
      new_cost = cost + weight
      state  = (neighbour, layer + 1)
      if new_cost < dist.get(state, float('inf')):
        dist[state] = new_cost
        heapq.heappush(pq, (new_cost, neighbour, layer + 1, path + [neighbour]))

  return best_path


# plan a full poem's field trajectory
# ─────────────────────────────────────────────────────────────
def plan_field_trajectory(num_lines: int, start: str = "NATURE") -> List[str]:
  """
  Run k-hop Dijkstra and return the field sequence for the poem.
  e.g. plan_field_trajectory(4) → ["NATURE", "MOTION", "SOUND", "EMOTION"]
  """
  graph = build_graph()
  path  = k_hop_dijkstra(graph, start, RESOLVED, num_lines)
  if path is None:
    raise ValueError(
      f"No valid {num_lines}-hop path from {start} to {RESOLVED}. "
      f"Try increasing num_lines or changing start."
    )
  return path


if __name__ == "__main__":
  graph = build_graph()

  print("── Graph (sample edges) ──")
  for src in ["NATURE", "LIGHT", "EMOTION", "CONNECTOR"]:
    row = "  ".join(f"{dst}:{w}" for dst, w in sorted(graph[src].items()))
    print(f"  {src:12s} → {row}")

  print("\n── Field trajectories ──")
  for k in [3, 4, 5, 6]:
    try:
      path = plan_field_trajectory(k)
      print(f"  {k} lines → {' → '.join(path)}")
    except ValueError as e:
      print(f"  {k} lines → {e}")
