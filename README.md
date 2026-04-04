<img src="./images/graph.png" alt="planner graph"/>

# Computable Poetry

**Generating metrically correct, semantically plausible Bangla poems using formal grammars, constraint satisfaction, and graph-based planning. No machine learning anywhere in the pipeline.**

---

## Overview

This project treats Bangla poem generation as a formal language inversion problem. A compiler takes source text, validates it against formal rules, and produces structured output. This system runs that process in reverse: it starts from formal rules and produces text. The same stages apply — lexer, parser, code generator — just pointed in the other direction.

The result is a system that guarantees three properties by construction: every poem satisfies its declared mātrā pattern exactly, maintains a globally coherent thematic arc across lines, and produces ABAB end-rhyme. These guarantees hold not probabilistically but provably, as consequences of the formal structure.

---

## The Core Problem

Start with the simplest possible approach: build a database of Bangla words, store the mātrā of each word, and pick matching ones at random to fill the pattern slots. This generates metrically correct output. It does not generate poems.

Metre without meaning is a crossword puzzle. The grid is filled correctly, but nothing is being said. The solution is layered constraint satisfaction: metre first, then semantic field, then part of speech, then rhyme class. No single constraint produces a poem. The poem emerges from their intersection.

---

## Bangla Prosody

Bangla poetry is governed by **Chhondo** (ছন্দ), the science of poetic metre. Every word carries a numerical weight called **mātrā**, and a line is composed so that the total mātrā of each rhythmic unit — a **parba** — matches a fixed pattern. The system handles all three classical metres:

| Metre | Weight Rule | Typical Pattern |
|---|---|---|
| Swarabritta (স্বরবৃত্ত) | All syllables count as 1 | 4 \| 4 \| 4 \| 2 |
| Matrabritta (মাত্রাবৃত্ত) | Open syllable = 1, closed = 2 | 6 \| 6 \| 6 \| 4 |
| Aksharabritta (অক্ষরবৃত্ত) | Closed at word-end = 2, elsewhere = 1 | 8 \| 8 \| 8 \| 6 |

The metre is auto-detected from the input pattern string and enforced as an inviolable hard constraint throughout generation. mātrā is never relaxed at any stage.

---

## Architecture

The generation system is five modules, each corresponding to a classical compiler stage, composed strictly in pipeline order. No module reaches backward into a previous stage.

```
LEXICON → SEMANTIC_GRAPH → CFG → WORD_PICKER → POEM_ENGINE
```

### 1. Lexicon

The foundation everything else sits on. Given a semantic tag and a mātrā number, it returns every word in the database satisfying both constraints in O(1) time.

The lexicon stores inflected forms directly rather than root words. This is a deliberate design choice: grammatical suffixes change the mātrā, so storing roots and applying suffixes at runtime would require recomputing mātrā for every candidate on every slot fill. By storing inflected forms, the mātrā in the database is always the mātrā of the actual word that will appear in the poem.

Two in-memory indices are built once at startup and then only read:

- **Inverted index**: keyed by `(TAG, mātrā)` pairs, enabling single-dictionary-lookup candidate retrieval
- **Rhyme index**: keyed by rhyme class character, consulted only when a rhyme constraint is active

When a `(TAG, mātrā)` bucket is empty, a hierarchical fallback chain walks through sibling tags in the same family, then cross-family neighbours. At every step, only the tag changes — the mātrā stays fixed.

The lexicon was built from a tagged, inflected-form corpus scraped from 300+ classical Bangla poems.

### 2. Semantic Graph

Before a single word is chosen, the system decides what each line of the poem will be about. The semantic graph answers: given that the poem starts in field X and must end in a resolved field in exactly k lines, what is the most coherent thematic sequence of fields to traverse?

The nine semantic families are divided into two partitions:

**Sensory partition** (external observable world): NATURE, LIGHT, TIME, MOTION, SOUND, DESCRIPTOR

**Inner partition** (felt or imagined experience): EMOTION, ACTOR

CONNECTOR sits outside both and acts as a cheap bridge.

Edge weights are derived from a formal metric rather than declared by hand. The rules are:

- CONNECTOR edges always cost 1
- Declared natural poetic pairs cost 2 (e.g., NATURE–LIGHT, SOUND–EMOTION, LIGHT–EMOTION)
- Sensory-to-sensory transitions cost 3
- Sensory-to-inner crossings cost 4

A greedy path selection would be locally optimal at each step but may never reach a resolved field by the final line. The system instead applies **k-hop Dijkstra** on a layered directed graph, treating the state as `(field, line_index)`. It finds the globally minimum-cost path of exactly k steps that terminates in EMOTION or SOUND. Paths ending at non-resolved fields are discarded regardless of cost.

### 3. Context-Free Grammar

The semantic graph produces a field sequence like `[NATURE, MOTION, SOUND, EMOTION]`. The CFG turns each field name into a concrete sequence of typed slot specifications — one slot per parba — that the word picker can fill.

This is a two-level grammar: a semantic grammar above a standard POS grammar. For each semantic family, the CFG declares a list of productions encoding real knowledge about how lines in that field are typically composed in Bengali nature poetry. A NATURE production might specify: colour adjective, sky noun, gentle verb, water noun. These structural intuitions are baked into the productions, not inferred.

Productions are expanded via randomized recursive descent. On a line retry, the CFG selects a fresh production — yielding different tag and POS slot configurations — rather than simply retrying the same slots with different words.

Every production is validated at startup to have exactly as many pairs as there are parbas in the mātrā pattern. A mismatch raises an error immediately.

### 4. Word Picker

The word picker is a constraint satisfaction engine with strict priority ordering and structured relaxation. It fills each slot through six ordered passes, each representing a different combination of active constraints:

1. Exact tag + exact POS + rhyme match (tightest)
2. Exact tag + exact POS (rhyme dropped)
3. Exact tag, POS relaxed
4. Sibling tag fallback + exact POS
5. Sibling tag fallback, POS relaxed
6. Full cross-family fallback, POS relaxed

The first pass returning a non-empty candidate set wins; a random choice is made from that set. mātrā is not listed among the passes because it is a precondition for entering any candidate set at all.

### 5. Poem Engine

The orchestrator. It parses the input pattern string, detects the Chhondo, initialises all components in sequence, and runs the generation loop. Two nested retry loops manage failures: up to 10 retries per line (each with a fresh CFG production), and up to 5 retries for the whole poem.

Rhyme state is carried in a single variable updated after each odd-indexed line and consumed by the next even-indexed line. The ABAB scheme emerges from this state machine with no special-casing required.

---

## What the System Guarantees

**Metric correctness.** Every parba has exactly the mātrā declared in the pattern. mātrā is a precondition for entry into any candidate set and is never relaxed at any stage.

**Thematic coherence.** The field sequence is the globally optimal Dijkstra path, not a random walk. Adjacent lines are always semantically related, and the poem ends in a resolved field.

**ABAB rhyme.** The last word of every even line shares its final vowel sound with the last word of the previous odd line. The rhyme slot constraint is applied before any word is selected for that position.

What the system does not guarantee is literary quality in the human sense. Those properties emerge from the quality and coverage of the lexicon, the breadth of the semantic productions, and the accumulated knowledge encoded in the seed lists and natural-pair declarations. The formal system provides the skeleton. The lexicon and grammar fill it with meaning.

---

## What This System Is Not

**Not a general-purpose poem generator.** The system is intentionally scoped to one scenario — nature, cheerful and resolved — because depth within a narrow boundary produces more interesting output than shallow coverage of a wide one. Generalising to arbitrary scenarios is an extension, not a correction.

**Not a machine learning system.** Every weight, every rule, every fallback chain is declared explicitly. There is no training, no inference, no embedding space. The intelligence is in the formal structure. This is the point.

---

## Technical Summary

- **Language**: Python
- **Method**: Formal grammars, constraint satisfaction, graph-based planning
- **ML used**: None
- **Prosody systems**: Swarabritta, Matrabritta, Aksharabritta
- **Lookup complexity**: O(1) candidate retrieval via inverted index
- **Path planning**: k-hop Dijkstra on a layered directed semantic graph
- **Rhyme scheme**: ABAB, enforced structurally

---

*Structured randomness, operating within hard prosodic constraints and soft semantic constraints, with graph-based planning for cross-line coherence. No AI. Just form.*

**Code**: [github.com/Dream-World-Coder/computable_poetry](https://github.com/Dream-World-Coder/computable_poetry)

*Project by ME, under the guidance of Prof. Sukanta Das. December 2025 – Present.*
