# Computable Poetry

A Bangla poem generator built entirely from formal grammars, graph algorithms, and constraint satisfaction. No machine learning anywhere in the pipeline.

The system treats a poem as a sentence in a formally defined language. Generation is language inversion: given a grammar that accepts all valid poems, run it in reverse to produce one.

---

## The Problem

Bangla classical poetry is governed by a precise prosodic system called Chhondo. Every word carries a numerical weight (matra), and lines are composed so that the matra total of each rhythmic unit matches a fixed pattern exactly. There are three metres: Swarabritta (lightest), Matrabritta (medium), and Aksharabritta (heaviest). The system auto-detects which metre applies from the input pattern and treats its constraints as inviolable generation boundaries.

---

## Architecture

The pipeline maps directly onto compiler stages.

**Lexer.** The word database stores inflected forms directly, not stems, so matra is always accurate without runtime computation. Each entry carries its syllable breakdown, matra values per metre, POS tag, semantic tag, tag family, grammatical role, and rhyme class. An inverted index keyed by (semantic tag, matra) supports O(1) candidate lookup.

**Field Planner.** Before any words are chosen, Dijkstra runs on a layered directed graph to find the lowest-cost path of exactly k hops across semantic field families (NATURE, LIGHT, MOTION, SOUND, EMOTION, and so on), where k equals the number of lines. Edge weights are derived from a formal function using set membership in predefined SENSORY and INNER partitions and a declared set of natural poetic pairs. The planner assigns one thematic field per line and hands that sequence to the grammar.

**Line Structurer.** A two-level CFG expands each line. The upper level is a semantic grammar: productions like LINE → SETTING MOTION_PHRASE, constrained to the field Dijkstra assigned. The lower level is a standard POS grammar. Each terminal in the derivation becomes a typed slot carrying its matra budget, semantic tag, POS requirement, grammatical role, and rhyme constraint.

**Codegen.** Slot filling queries the inverted index, filters by POS and rhyme class, applies a poem-scoped memory set to prevent repetition, and falls back through a tag hierarchy (specific tag → tag family → relaxed POS → backtrack) if any candidate set is empty. Constraint priority is strict: matra is never relaxed.

---

## Constraint Satisfaction

Generation operates under four levels of constraint, applied in priority order.

Matra is the hardest constraint. A line with the wrong syllable weight is metrically broken and no other consideration overrides it.

Semantic tag comes second. Words are drawn from the field the planner assigned. If the exact tag has no candidates at the required matra, the system climbs the tag family hierarchy.

POS compatibility is third. A verb slot expects a verb. This constraint can be relaxed during fallback.

Rhyme class is softest. The final slot of each even line is constrained to the rhyme class of the matching odd line's last word. ABAB scheme falls out of the filter naturally.

---

## Semantic Distance and the Graph

Families form the graph nodes. The compute_weight function assigns an edge cost based on two rules: whether the pair belongs to the declared NATURAL_PAIRS set (cost 2), and whether the traversal crosses the SENSORY/INNER partition boundary (sensory to sensory costs 3, inner to inner costs 2, crossing costs 4). CONNECTOR nodes always cost 1 in both directions. No manual per-edge judgment is involved once the partition and pair set are declared.

---

## Lexicon Preparation

Words are scraped from 300 to 500 classical Bangla nature poems and tagged in three tiers. A seed list covers roughly 60 percent of stems automatically. POS-based heuristics handle another 20 percent as pre-filled defaults for review. The remaining words go through a CLI review tool at approximately 3 seconds per word. Since inflected forms are stored directly, a single seed entry covers all grammatical variants of a stem.

---

## What Is Working

Matra calculation for all three metres, Chhondo auto-detection from input pattern, pattern splitting into rhythmic slots, POS-level CFG generation, inverted index structure, rhyme class matching by final phoneme, and the core constraint priority ordering.

The semantic tag layer, Dijkstra field planner, full backtracking engine, and poem-scoped memory set are implemented and being integrated. Word scraping from nature poems and full lexicon tagging are ongoing.

---

## Design Rationale

Inflected forms are stored rather than stems because matra depends on the actual surface form. Computing matra from a stem plus suffix at runtime would require recomputing it for every candidate on every slot fill and introduce edge cases at morpheme boundaries.

Dijkstra is used rather than a fixed trajectory list because a static field sequence cannot generalise across different line counts or patterns. The layered graph produces the globally optimal coherence path for any k-line poem.

The two-level CFG exists because Bangla poetic language regularly violates standard syntax: inverted word order, noun-used-as-verb, ellipsis. Treating POS grammar as a hard constraint produces stilted output. The semantic grammar constrains meaning; POS is a secondary filter that can be relaxed when needed.

---

A formally defined language over matra, semantics, and syntax. Constraint satisfaction and graph planning operating together, without any learned parameters.
