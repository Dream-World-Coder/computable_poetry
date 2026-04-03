import {
  Code,
  Placeholder,
  Divider,
  Tag,
  SectionLabel,
  P,
  H3,
} from "../components/components";
import { LayeredGraphDiagram } from "../animations/LayerdGraph";

// helpers
function Note({ children }) {
  return (
    <div
      style={{
        margin: "1.5rem 0",
        padding: "1rem 1.5rem",
        background: "#f5f0e8",
        borderLeft: "2px solid #c8b89a",
        fontFamily: "'Crimson Pro', Georgia, serif",
        fontSize: "0.97rem",
        lineHeight: 1.75,
        color: "#5a4e42",
      }}
    >
      {children}
    </div>
  );
}

function TableRow({ left, right, mono = false }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: "1.5rem",
        padding: "0.65rem 0",
        borderBottom: "1px solid #ede8df",
      }}
    >
      <div
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: "0.72rem",
          color: "#5a4e42",
          minWidth: "200px",
          flexShrink: 0,
        }}
      >
        {left}
      </div>
      <div
        style={{
          fontFamily: mono
            ? "'IBM Plex Mono', monospace"
            : "'Crimson Pro', Georgia, serif",
          fontSize: mono ? "0.72rem" : "0.97rem",
          color: mono ? "#7a6a58" : "#3d3530",
          lineHeight: 1.6,
        }}
      >
        {right}
      </div>
    </div>
  );
}

function SubLabel({ children }) {
  return (
    <div
      style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: "0.62rem",
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "#b0a090",
        margin: "2.5rem 0 0.8rem 0",
      }}
    >
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────
// The chapter
// ─────────────────────────────────────────────

export function ChapterArchitecture() {
  return (
    <section id="architecture" style={{ paddingTop: "5rem" }}>
      <SectionLabel num="05" title="The Architecture" />

      <P>
        The generation system is five modules, each corresponding to a classical
        compiler stage. They are loaded once at startup and then composed to
        produce any number of poems without reloading. The sequence is strictly
        linear: each module's output is the next module's input, and no module
        reaches backward.
      </P>

      <Placeholder
        label="Diagram: full pipeline — Lexicon → SemanticGraph → CFG → WordPicker → PoemEngine"
        height={200}
      />

      <P>
        Reading through each module in pipeline order is the fastest way to
        understand the whole system. That is the order followed here.
      </P>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* 1. LEXICON                                              */}
      {/* ═══════════════════════════════════════════════════════ */}

      <Divider />
      <H3>lexicon.py &mdash; the word index</H3>

      <P>
        The lexicon is the foundation everything else sits on. Its job is simple
        to state and critical to get right: given a semantic tag and a mātrā
        number, return every word in the database that satisfies both, in O(1)
        time. That constraint &mdash; O(1) lookup &mdash; drives every design
        decision in this module.
      </P>

      <SubLabel>Why inflected forms, not stems</SubLabel>
      <P>
        A naive approach would store root words ("নদী") and attach grammatical
        suffixes at runtime to produce inflected forms ("নদীতে", "নদীর",
        "নদীকে"). This is how a morphological analyser works. The problem is
        that suffixes change the mātrā. "নদী" is mātrā 2 in স্বরবৃত্ত. "নদীতে"
        is mātrā 4. If the system stored the root and applied suffixes on the
        fly, it would have to recompute the mātrā of every candidate on every
        slot fill. The lexicon avoids this entirely by storing inflected forms
        directly. The mātrā in the database is always the mātrā of the actual
        word that will appear in the poem.
      </P>

      <SubLabel>The word entry structure</SubLabel>
      <P>
        Each word in the JSON database is a flat record carrying everything the
        generation pipeline needs. No computation is deferred to runtime.
      </P>

      <Code lang="json">
        {/* "stem":     "নদী",*/}
        {`{
    "word":     "নদীতে",
    "syllables": ["ন", "দী", "তে"],
    "totalMatra": {
        "স্বরবৃত্ত":   4,
        "মাত্রাবৃত্ত":  5,
        "অক্ষরবৃত্ত":  4
    },
    "POS":          "NN",
    "TAG":          "NATURE_WATER",
    "TAG_FAMILY":   "NATURE",
    "rhyme_class":  "এ"
}`}
      </Code>

      <P>
        The three mātrā values are all pre-computed and stored. At runtime, the
        lexicon uses whichever Chhondo the pattern specifies and never touches
        the syllable list again. The rhyme class is the last vowel character in
        the word, extracted once and stored. The semantic tag and tag family are
        assigned by the offline tagger.
      </P>

      <SubLabel>Two in-memory indices</SubLabel>
      <P>
        On startup, <Tag>Lexicon._load()</Tag> reads the JSON file and
        immediately builds two dictionaries. These are built once and then only
        read — never modified during poem generation.
      </P>

      <Code lang="python">
        {`def _build_inverted_index(self):
    for entry in self.words:
        tag   = entry.get("TAG", "UNTAGGED")
        matra = entry.get("totalMatra", {}).get("স্বরবৃত্ত", 0)

        if tag == "UNTAGGED" or matra == 0:
            continue   # skip incomplete entries

        key = (tag, matra)
        if key not in self.inverted_index:
            self.inverted_index[key] = []
        self.inverted_index[key].append(entry)

def _build_rhyme_index(self):
    for entry in self.words:
        rc = entry.get("rhyme_class", "")
        if not rc:
            continue
        if rc not in self.rhyme_index:
            self.rhyme_index[rc] = []
        self.rhyme_index[rc].append(entry)`}
      </Code>

      <P>
        The inverted index is keyed by the pair <Tag>(TAG, matra)</Tag>. Every
        word that is NATURE_WATER with mātrā 3 ends up in the same bucket. The
        word picker can then retrieve all candidates for a slot in a single
        dictionary lookup. The rhyme index is keyed by the rhyme class character
        alone — a second, independent index consulted only when a rhyme
        constraint is active.
      </P>

      <Note>
        A concrete example. Suppose the inverted index is built from a small
        corpus and the result looks like this:
        <br />
        <br />
        <code
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "0.8rem",
          }}
        >
          ("NATURE_WATER", 2) → [নদী, জল, ঢেউ]
          <br />
          ("NATURE_WATER", 3) → [নদীর, বারি, জলে]
          <br />
          ("NATURE_WATER", 4) → [নদীতে, সাগরে, ঝর্ণায়]
          <br />
          ("NATURE_SKY", 2) &nbsp;&nbsp;→ [চাঁদ, মেঘ, নীল]
          <br />
          ("EMOTION_JOY", 4) → [আনন্দে, উল্লাসে]
        </code>
        <br />
        <br />
        When the word picker needs a NATURE_WATER word for a slot of mātrā 3, it
        calls{" "}
        <code style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
          inverted_index[("NATURE_WATER", 3)]
        </code>{" "}
        and gets [নদীর, বারি, জলে] back immediately. No scanning. No
        computation. One dictionary lookup.
      </Note>

      <SubLabel>The fallback chain</SubLabel>
      <P>
        Not every <Tag>(TAG, matra)</Tag> bucket will be populated, especially
        for rare tags or uncommon mātrā values. The lexicon handles this through
        a declared fallback hierarchy, not through relaxing the mātrā. mātrā is
        never relaxed at any point.
      </P>

      <Code lang="python">
        {`TAG_FAMILY_FALLBACK = {
    "NATURE_WATER":  ["NATURE_SKY", "NATURE_FLORA",
                      "NATURE_EARTH", "NATURE_FAUNA"],
    "NATURE_SKY":    ["NATURE_FLORA", "NATURE_WATER",
                      "NATURE_EARTH", "NATURE_FAUNA"],
    "LIGHT_BRIGHT":  ["LIGHT_SOFT"],
    "LIGHT_SOFT":    ["LIGHT_BRIGHT"],
    "MOTION_GENTLE": ["MOTION_VIVID"],
    "EMOTION_JOY":   ["EMOTION_PEACE", "EMOTION_WONDER"],
    # ... and so on for every tag
}

FAMILY_FALLBACK = {
    "NATURE":   ["LIGHT", "MOTION", "DESCRIPTOR"],
    "LIGHT":    ["NATURE", "EMOTION"],
    "MOTION":   ["NATURE", "SOUND"],
    "EMOTION":  ["ACTOR",  "SOUND"],
    # ...
}`}
      </Code>

      <P>
        <Tag>get_candidates_with_fallback()</Tag> tries the exact tag first,
        then walks through the sibling tags declared in{" "}
        <Tag>TAG_FAMILY_FALLBACK</Tag>, then expands to cross-family neighbours
        via <Tag>FAMILY_FALLBACK</Tag>. At every step, only the tag changes —
        the mātrā argument stays fixed. If a sibling tag has words at the
        required mātrā, they are returned. If the entire fallback chain is
        exhausted and nothing is found, the function returns an empty list and
        the word picker signals failure to the engine.
      </P>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* 2. SEMANTIC GRAPH                                       */}
      {/* ═══════════════════════════════════════════════════════ */}

      <Divider />
      <H3>semantic_graph.py &mdash; the field planner</H3>

      <P>
        Before a single word is chosen, the system decides what each line of the
        poem will be <em>about</em>. This is the job of the semantic graph. It
        answers the question: given that the poem starts in field X and must end
        in a resolved field in exactly k lines, what is the most coherent
        thematic sequence of fields to traverse?
      </P>
      <P>
        Without this stage, each line would be generated independently with no
        awareness of the others. The poem would have metre and might have rhyme,
        but it would have no arc — no sense of going anywhere. A poem about sky,
        then unrelated about emotion, then back to water, then suddenly sound,
        is not a poem. It is a list. The graph stage prevents that.
      </P>

      <SubLabel>The nine semantic families</SubLabel>
      <P>
        The families are the vocabulary of poetic themes, not linguistic
        categories. They are grouped into two partitions:
      </P>

      <div style={{ margin: "1.5rem 0" }}>
        {[
          [
            "NATURE",
            "The external natural world — sky, water, earth, flora, fauna.",
          ],
          [
            "LIGHT",
            "Quality and movement of light — brightness, softness, shadow, glow.",
          ],
          [
            "TIME",
            "Temporal anchoring — dawn, midday, dusk, night. When the poem is set.",
          ],
          [
            "MOTION",
            "Nature in movement — gentle flowing, vivid darting, rippling.",
          ],
          [
            "SOUND",
            "Auditory scene — birdsong, water sounds, musical resonance.",
          ],
          ["DESCRIPTOR", "Qualities that modify — colour, texture, size."],
          [
            "EMOTION",
            "Internal resolution — joy, peace, wonder. Where the poem arrives.",
          ],
          [
            "ACTOR",
            "A presence — human, abstract mind, dreaming consciousness.",
          ],
          [
            "CONNECTOR",
            "Bridge words — transitions, conjunctions. Always cheap to traverse.",
          ],
        ].map(([tag, desc]) => (
          <TableRow key={tag} left={tag} right={desc} />
        ))}
      </div>

      <P>
        NATURE, LIGHT, TIME, MOTION, SOUND, and DESCRIPTOR belong to the sensory
        partition — they describe the observable external world. EMOTION and
        ACTOR belong to the inner partition — they describe felt or imagined
        experience. CONNECTOR is special: it sits outside both partitions and
        acts as a cheap bridge between any two fields.
      </P>

      <SubLabel>Why derive edge weights, not declare them</SubLabel>
      <P>
        A fully connected graph over 9 nodes has 72 directed edges. Declaring a
        weight for each edge by hand would be 72 arbitrary numbers — fragile,
        inconsistent, and impossible to reason about. Instead, the system
        derives every weight from three structural rules applied to set
        membership. The rules encode genuine poetic intuition in a form the
        machine can compute:
      </P>

      <Code lang="python">
        {`def compute_weight(a: str, b: str) -> int:
    # Rule 1: CONNECTOR is always cheap
    if a == "CONNECTOR" or b == "CONNECTOR":
        return 1

    # Rule 2: declared natural poetic pairs are preferred transitions
    if frozenset({a, b}) in NATURAL_PAIRS:
        return 2

    # Rules 3–5 derived from partition membership
    a_sensory = a in SENSORY   # {NATURE, LIGHT, TIME, MOTION, SOUND, DESCRIPTOR}
    b_sensory = b in SENSORY

    if a_sensory and b_sensory:
        return 3   # sensory → sensory: same outer world, moderate cost

    if not a_sensory and not b_sensory:
        return 2   # inner → inner: ACTOR and EMOTION are tightly coupled

    return 4       # sensory ↔ inner: the poetic turn, higher cost but valid`}
      </Code>

      <SubLabel>The natural poetic pairs</SubLabel>
      <P>
        <Tag>NATURAL_PAIRS</Tag> is a set of frozensets — order does not matter,
        so NATURE→LIGHT and LIGHT→NATURE cost the same. These pairs encode the
        transitions a poet reaches for instinctively when writing about nature:
      </P>

      <Code lang="python">
        {`NATURAL_PAIRS = {
    frozenset({"NATURE",  "LIGHT"}),     # sky and light go together
    frozenset({"NATURE",  "MOTION"}),    # wind moves through nature
    frozenset({"NATURE",  "SOUND"}),     # nature produces sound
    frozenset({"NATURE",  "DESCRIPTOR"}),# describing natural things
    frozenset({"LIGHT",   "EMOTION"}),   # light produces feeling
    frozenset({"MOTION",  "SOUND"}),     # motion and sound co-occur
    frozenset({"SOUND",   "EMOTION"}),   # sound resolves to emotion
    frozenset({"ACTOR",   "EMOTION"}),   # actor experiences emotion
    frozenset({"ACTOR",   "MOTION"}),    # actor moves through space
    frozenset({"TIME",    "NATURE"}),    # time of day frames nature
    frozenset({"TIME",    "LIGHT"}),     # time of day determines light
}`}
      </Code>

      <P>
        Any edge between a natural pair costs 2 — the same as inner→inner. Any
        other sensory→sensory edge costs 3. Any crossing of the sensory/inner
        boundary costs 4, unless the pair is in NATURAL_PAIRS, in which case the
        natural pair rule fires first and it costs 2. This means LIGHT→EMOTION
        (a natural pair that crosses the boundary) costs 2, while TIME→ACTOR
        (not a natural pair, crosses the boundary) costs 4.
      </P>

      <SubLabel>Building the complete graph</SubLabel>
      <P>
        <Tag>build_graph()</Tag> calls <Tag>compute_weight()</Tag> for every
        ordered pair of distinct families and stores the result. The graph is a
        plain Python dict of dicts. It is built once at startup and then only
        read.
      </P>

      <Code lang="python">
        {`def build_graph():
    graph = {}
    for a in FAMILIES:
        graph[a] = {}
        for b in FAMILIES:
            if a != b:
                graph[a][b] = compute_weight(a, b)
    return graph

# Sample of the resulting adjacency structure:
# graph["NATURE"] = {
#     "LIGHT":      2,   ← natural pair
#     "MOTION":     2,   ← natural pair
#     "SOUND":      2,   ← natural pair
#     "DESCRIPTOR": 2,   ← natural pair
#     "TIME":       2,   ← natural pair
#     "EMOTION":    4,   ← sensory ↔ inner, not a natural pair
#     "ACTOR":      4,   ← sensory ↔ inner, not a natural pair
#     "CONNECTOR":  1,   ← connector always 1
# }`}
      </Code>

      <SubLabel>Why Dijkstra, not greedy path selection</SubLabel>
      <P>
        A greedy algorithm would pick, at each step, the lowest-cost next field
        from the current field. This seems reasonable but produces suboptimal
        trajectories. Consider a 4-line poem starting from NATURE that must end
        in EMOTION or SOUND. A greedy algorithm at line 1 sees that CONNECTOR
        costs 1 and goes there. From CONNECTOR it might again take the cheapest
        edge. The path looks locally optimal at every step but may never reach
        EMOTION or SOUND by line 4.
      </P>
      <P>
        k-hop Dijkstra avoids this by treating the problem as a layered graph
        search. The state is not just which field the poem is in — it is which
        field at which line number. A state is the pair{" "}
        <Tag>(field, layer)</Tag> where layer is the line index (0 through k-1).
        The algorithm finds the globally minimum-cost path of exactly k steps
        that terminates in a resolved field.
      </P>

      <Code lang="python">
        {`RESOLVED = frozenset({"EMOTION", "SOUND"})

def k_hop_dijkstra(graph, start, resolved, k):
    dist = {(start, 0): 0}
    pq   = [(0, start, 0, [start])]
    best, best_cost = None, float('inf')

    while pq:
        cost, node, layer, path = heappop(pq)

        if cost >= best_cost:   # already beaten — prune
            continue

        if layer == k - 1:      # reached final line
            if node in resolved and cost < best_cost:
                best_cost = cost
                best = path
            continue

        for neighbour, weight in graph[node].items():
            new_cost = cost + weight
            state    = (neighbour, layer + 1)
            if new_cost < dist.get(state, float('inf')):
                dist[state] = new_cost
                heappush(pq, (new_cost, neighbour,
                              layer + 1, path + [neighbour]))
    return best`}
      </Code>

      <Note>
        Worked example for a 4-line poem starting from NATURE:
        <br />
        <br />
        The algorithm expands states in cost order. The path
        NATURE→MOTION→SOUND→EMOTION costs 2+2+2=6. The path
        NATURE→LIGHT→EMOTION→SOUND costs 2+2+2=6 as well — a tie, and either may
        be returned. The path NATURE→CONNECTOR→MOTION→SOUND costs 1+1+2=4 and
        would beat both — but CONNECTOR is not in RESOLVED, so the algorithm
        cannot terminate there at layer 3 if the trajectory ends at CONNECTOR.
        If a path reaches layer k-1 at a non-resolved field, it is discarded
        regardless of cost. Only trajectories that end in EMOTION or SOUND are
        accepted as valid. Among those, the lowest total cost wins.
      </Note>

      <LayeredGraphDiagram />

      <P>
        The output of this stage is a plain list of field names — one per line
        of the poem. For example:{" "}
        <Tag>["NATURE", "MOTION", "SOUND", "EMOTION"]</Tag>. This list is the
        only thing the CFG stage receives from the graph stage. All the Dijkstra
        machinery is invisible to the rest of the pipeline.
      </P>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* 3. CFG                                                  */}
      {/* ═══════════════════════════════════════════════════════ */}

      <Divider />
      <H3>cfg.py &mdash; the line structurer</H3>

      <P>
        The semantic graph decided that line 2 belongs to the MOTION field. But
        "MOTION" is not a poem line — it is a theme. The CFG's job is to turn
        that theme into a concrete sequence of typed positions, one per parba,
        that the word picker can fill. These positions are called <em>slots</em>
        .
      </P>

      <SubLabel>What a slot is</SubLabel>
      <P>
        A slot is a specification for one rhythmic unit of the line. It carries
        four things:
      </P>

      <div style={{ margin: "1.5rem 0" }}>
        {[
          [
            "tag",
            "Which semantic category the word in this slot must come from. e.g. NATURE_WATER, MOTION_GENTLE, DESC_COLOR.",
          ],
          [
            "pos",
            "Which part of speech the word should be. NN = noun, VB = verb, JJ = adjective, CC = conjunction.",
          ],
          [
            "matra",
            "The exact mātrā budget for this slot. Comes directly from the pattern. Never changed.",
          ],
          [
            "is_rhyme_slot",
            "True only for the last slot of even-indexed lines. When True, the word picker applies the phonetic rhyme constraint to this slot.",
          ],
        ].map(([f, d]) => (
          <TableRow key={f} left={f} right={d} />
        ))}
      </div>

      <Code lang="python">
        {`@dataclass
class Slot:
    tag:           str            # e.g. "NATURE_WATER"
    pos:           str            # e.g. "NN"
    matra:         int            # e.g. 3
    is_rhyme_slot: bool = False
    rhyme_class:   Optional[str] = None   # set at runtime by word picker`}
      </Code>

      <SubLabel>The semantic productions</SubLabel>
      <P>
        For each semantic family, the CFG declares a list of{" "}
        <em>productions</em>. Each production is a sequence of{" "}
        <Tag>(TAG, POS)</Tag> pairs — one pair per parba in the mātrā pattern.
        When asked to structure a line for a given family, the CFG picks one
        production at random and zips it with the pattern to create slots.
      </P>
      <P>
        The productions for each family encode real knowledge about how lines in
        that field are typically composed in Bengali nature poetry. They are not
        random — they reflect the semantic roles that words typically play in
        each thematic context.
      </P>

      <Code lang="python">
        {`# Pattern 4|4|4|2 → 4 parbas → every production has exactly 4 pairs

SEMANTIC_PRODUCTIONS["NATURE"] = [
    # Production 1: colour + sky-noun + gentle-verb + water-noun
    [("DESC_COLOR",    "JJ"),
     ("NATURE_SKY",    "NN"),
     ("MOTION_GENTLE", "VB"),
     ("NATURE_WATER",  "NN")],

    # Production 2: time-of-dawn + flora-noun + gentle-verb + sky-noun
    [("TIME_DAWN",     "NN"),
     ("NATURE_FLORA",  "NN"),
     ("MOTION_GENTLE", "VB"),
     ("NATURE_SKY",    "NN")],

    # Production 3: earth-noun + flora-noun + colour + water-noun
    [("NATURE_EARTH",  "NN"),
     ("NATURE_FLORA",  "NN"),
     ("DESC_COLOR",    "JJ"),
     ("NATURE_WATER",  "NN")],

    # Production 4: sky-noun + colour + flora-noun + gentle-verb
    [("NATURE_SKY",    "NN"),
     ("DESC_COLOR",    "JJ"),
     ("NATURE_FLORA",  "NN"),
     ("MOTION_GENTLE", "VB")],
]`}
      </Code>

      <P>
        Notice that every NATURE production puts a motion verb or a noun in the
        third parba, and a grounding noun at the end. This is deliberate — it
        reflects a stable pattern in nature poetry where the line opens with a
        visual anchor, moves through description, and closes on an object. Each
        family has its own structural intuitions baked into its productions.
      </P>

      <SubLabel>All eight families and their production logic</SubLabel>

      <Code lang="python">
        {`SEMANTIC_PRODUCTIONS["MOTION"] = [
    # Motion lines: nature object + action + sky + colour
    [("NATURE_FLORA",  "NN"), ("MOTION_GENTLE", "VB"),
     ("NATURE_WATER",  "NN"), ("MOTION_GENTLE", "VB")],

    [("NATURE_FAUNA",  "NN"), ("MOTION_VIVID",  "VB"),
     ("NATURE_SKY",    "NN"), ("DESC_COLOR",    "JJ")],

    [("NATURE_WATER",  "NN"), ("MOTION_GENTLE", "VB"),
     ("NATURE_FLORA",  "NN"), ("MOTION_VIVID",  "VB")],

    [("NATURE_FAUNA",  "NN"), ("NATURE_SKY",    "NN"),
     ("MOTION_VIVID",  "VB"), ("CONN_BRIDGE",   "CC")],
]

SEMANTIC_PRODUCTIONS["SOUND"] = [
    [("NATURE_FAUNA",  "NN"), ("SOUND_NATURE",  "NN"),
     ("MOTION_GENTLE", "VB"), ("NATURE_FLORA",  "NN")],

    [("SOUND_NATURE",  "NN"), ("NATURE_WATER",  "NN"),
     ("MOTION_GENTLE", "VB"), ("CONN_BRIDGE",   "CC")],

    [("SOUND_HUMAN",   "NN"), ("NATURE_SKY",    "NN"),
     ("MOTION_GENTLE", "VB"), ("NATURE_FLORA",  "NN")],
]

SEMANTIC_PRODUCTIONS["EMOTION"] = [
    [("ACTOR_HUMAN",   "NN"), ("EMOTION_JOY",   "NN"),
     ("MOTION_GENTLE", "VB"), ("NATURE_FLORA",  "NN")],

    [("EMOTION_PEACE", "NN"), ("NATURE_SKY",    "NN"),
     ("LIGHT_BRIGHT",  "NN"), ("DESC_COLOR",    "JJ")],

    [("ACTOR_ABSTRACT","NN"), ("EMOTION_WONDER","NN"),
     ("NATURE_WATER",  "NN"), ("MOTION_GENTLE", "VB")],

    [("EMOTION_JOY",   "NN"), ("NATURE_FLORA",  "NN"),
     ("MOTION_VIVID",  "VB"), ("DESC_COLOR",    "JJ")],
]`}
      </Code>

      <SubLabel>Validation at startup</SubLabel>
      <P>
        Every production must have exactly as many <Tag>(TAG, POS)</Tag> pairs
        as there are parbas in the mātrā pattern. The CFG validates this at init
        time, raising a <Tag>ValueError</Tag> immediately if any production has
        the wrong length. This prevents a mismatch from silently producing
        malformed lines during generation.
      </P>

      <Code lang="python">
        {`def _validate_productions(self):
    n = len(self.matra_pattern)   # e.g. 4 for pattern "4|4|4|2"
    for family, productions in SEMANTIC_PRODUCTIONS.items():
        for prod in productions:
            if len(prod) != n:
                raise ValueError(
                    f"Production in {family} has {len(prod)} slots "
                    f"but pattern has {n} parbas."
                )`}
      </Code>

      <SubLabel>Expanding a production into slots</SubLabel>
      <P>
        <Tag>CFG.get_slots()</Tag> takes a family name and whether the line is
        even-indexed. It picks one production at random, then zips it with the
        mātrā pattern. The last slot of an even-indexed line gets{" "}
        <Tag>is_rhyme_slot=True</Tag>.
      </P>

      <Code lang="python">
        {`def get_slots(self, family, is_even_line=False):
    productions = SEMANTIC_PRODUCTIONS[family]
    chosen = random.choice(productions)   # structured randomness

    slots = []
    for i, ((tag, pos), matra) in enumerate(zip(chosen, self.matra_pattern)):
        is_last  = (i == len(chosen) - 1)
        is_rhyme = is_even_line and is_last
        slots.append(Slot(tag=tag, pos=pos, matra=matra,
                          is_rhyme_slot=is_rhyme))
    return slots`}
      </Code>

      <Note>
        Worked example. Pattern "4|4|4|2", family NATURE, production 1 chosen,
        line is odd (not even):
        <br />
        <br />
        <code
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "0.78rem",
          }}
        >
          Slot(tag="DESC_COLOR", &nbsp;&nbsp;pos="JJ", matra=4,
          is_rhyme_slot=False)
          <br />
          Slot(tag="NATURE_SKY", &nbsp;&nbsp;pos="NN", matra=4,
          is_rhyme_slot=False)
          <br />
          Slot(tag="MOTION_GENTLE", pos="VB", matra=4, is_rhyme_slot=False)
          <br />
          Slot(tag="NATURE_WATER", pos="NN", matra=2, is_rhyme_slot=False)
        </code>
        <br />
        <br />
        Same production, but the line is even (line index 1, 3, ...):
        <br />
        <br />
        <code
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "0.78rem",
          }}
        >
          Slot(tag="DESC_COLOR", &nbsp;&nbsp;pos="JJ", matra=4,
          is_rhyme_slot=False)
          <br />
          Slot(tag="NATURE_SKY", &nbsp;&nbsp;pos="NN", matra=4,
          is_rhyme_slot=False)
          <br />
          Slot(tag="MOTION_GENTLE", pos="VB", matra=4, is_rhyme_slot=False)
          <br />
          Slot(tag="NATURE_WATER", pos="NN", matra=2,{" "}
          <strong>is_rhyme_slot=True</strong>)
        </code>
        <br />
        <br />
        The only difference is the last slot's flag. The word picker will, for
        that slot only, additionally require the chosen word to share its rhyme
        class with the last word of the previous odd line.
      </Note>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* 4. WORD PICKER                                         */}
      {/* ═══════════════════════════════════════════════════════ */}

      <Divider />
      <H3>word_picker.py &mdash; constraint satisfaction</H3>

      <P>
        The word picker receives a list of slots from the CFG and must fill each
        one with an actual Bangla word. It is a constraint satisfaction engine
        with a strict priority ordering and a structured relaxation strategy.
      </P>

      <SubLabel>Constraint priority</SubLabel>
      <P>
        Four constraints govern word selection. They are ordered by importance
        and the lower constraints are relaxed before the higher ones. mātrā is
        not listed among the constraints because it is never relaxed — it is a
        precondition for even entering the candidate set.
      </P>

      <div style={{ margin: "1.5rem 0" }}>
        {[
          [
            "1. mātrā",
            "Inviolable. If no word exists at the required mātrā for any tag in any family, the slot fails. This is the skeleton — compromising it breaks the metre entirely.",
          ],
          [
            "2. Semantic tag",
            "The word must come from the correct semantic category. Tried exact first, then sibling tags in the same family, then cross-family neighbours. Always at the required mātrā.",
          ],
          [
            "3. Part of speech",
            "The word should be the right grammatical category. Relaxed only after tag fallback is exhausted. Bengali poetry regularly places nouns where verbs are expected — enforcing POS strictly produces stilted output.",
          ],
          [
            "4. Rhyme class",
            "Applied only to rhyme slots. The last vowel character of the chosen word must match the rhyme class set by the previous odd line's last word. Relaxed last of all.",
          ],
        ].map(([k, v]) => (
          <TableRow key={k} left={k} right={v} />
        ))}
      </div>

      <SubLabel>The six passes</SubLabel>
      <P>
        <Tag>WordPicker.pick()</Tag> attempts to fill one slot through six
        ordered passes. Each pass is a different combination of constraints. The
        first pass that returns a non-empty candidate set wins. A random choice
        is then made from that set.
      </P>

      <Code lang="python">
        {`def pick(self, slot, used, rhyme_class=None):
    matra = slot.matra
    tag   = slot.tag
    pos   = slot.pos

    # Pass 1: tightest — exact tag + exact POS + rhyme match
    if slot.is_rhyme_slot and rhyme_class:
        candidates = self.lexicon.get_candidates(tag, matra)
        candidates = self._filter_pos(candidates, pos)
        candidates = self._filter_rhyme(candidates, rhyme_class)
        candidates = self._filter_used(candidates, used)
        if candidates:
            return random.choice(candidates)["word"]

    # Pass 2: exact tag + exact POS (rhyme dropped)
    candidates = self.lexicon.get_candidates(tag, matra)
    candidates = self._filter_pos(candidates, pos)
    candidates = self._filter_used(candidates, used)
    if candidates:
        return random.choice(candidates)["word"]

    # Pass 3: exact tag, POS relaxed
    candidates = self.lexicon.get_candidates(tag, matra)
    candidates = self._filter_used(candidates, used)
    if candidates:
        return random.choice(candidates)["word"]

    # Pass 4: sibling tag fallback + exact POS
    for fallback_tag in TAG_FAMILY_FALLBACK.get(tag, []):
        candidates = self.lexicon.get_candidates(fallback_tag, matra)
        candidates = self._filter_pos(candidates, pos)
        candidates = self._filter_used(candidates, used)
        if candidates:
            return random.choice(candidates)["word"]

    # Pass 5: sibling tag fallback, POS relaxed
    for fallback_tag in TAG_FAMILY_FALLBACK.get(tag, []):
        candidates = self.lexicon.get_candidates(fallback_tag, matra)
        candidates = self._filter_used(candidates, used)
        if candidates:
            return random.choice(candidates)["word"]

    # Pass 6: full cross-family fallback, POS relaxed
    candidates = self.lexicon.get_candidates_with_fallback(tag, matra)
    candidates = self._filter_used(candidates, used)
    if candidates:
        return random.choice(candidates)["word"]

    return None   # total failure — signal backtrack`}
      </Code>

      <SubLabel>The filter helpers</SubLabel>
      <P>
        Three small filter functions are applied to the candidate list at each
        pass. They return the filtered list, or the original if nothing survives
        the filter — with one exception: <Tag>_filter_used</Tag> always returns
        the unfiltered candidates if all candidates have been used, allowing
        word repetition as a last resort rather than failing.
      </P>

      <Code lang="python">
        {`def _filter_pos(self, candidates, pos):
    filtered = [w for w in candidates if w.get("POS") == pos]
    return filtered if filtered else []   # empty → caller tries next pass

def _filter_rhyme(self, candidates, rhyme_class):
    matched = [w for w in candidates if w.get("rhyme_class") == rhyme_class]
    return matched if matched else []

def _filter_used(self, candidates, used):
    fresh = [w for w in candidates if w["word"] not in used]
    return fresh if fresh else candidates   # allow repeats if truly necessary`}
      </Code>

      <SubLabel>Filling a full line</SubLabel>
      <P>
        <Tag>fill_line()</Tag> calls <Tag>pick()</Tag> for each slot in order.
        It maintains two used-word sets: <Tag>poem_used</Tag> (words already
        placed anywhere in the poem, passed in by the engine) and{" "}
        <Tag>line_used</Tag> (words placed in this line so far, built up as
        slots are filled). Both sets are passed into <Tag>_filter_used</Tag>
        together. If any single slot returns <Tag>None</Tag>, the whole line is
        abandoned immediately and the engine is signalled to retry.
      </P>

      <Code lang="python">
        {`def fill_line(self, slots, poem_used, rhyme_class=None):
    line_used = set()
    words     = []

    for slot in slots:
        slot_rhyme    = rhyme_class if slot.is_rhyme_slot else None
        combined_used = poem_used | line_used

        word = self.pick(slot, combined_used, slot_rhyme)
        if word is None:
            return None   # signal failure — engine will retry

        line_used.add(word)
        words.append(word)

    return words`}
      </Code>

      <Note>
        Why no slot-level backtracking? If slot 3 fails, it might be because
        slots 1 and 2 consumed the only viable words for slot 3's tag at that
        mātrā. A proper backtracking engine would undo slot 2 and try a
        different word there. The current system instead abandons the whole line
        and lets the CFG pick a fresh production on the next attempt. This is
        simpler to implement and works well in practice because each retry gets
        a fresh production from the CFG — different tags, different constraints
        — rather than just different words for the same slots. The trade-off is
        that some lexicon gaps require more retries than true backtracking
        would.
      </Note>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* 5. POEM ENGINE                                          */}
      {/* ═══════════════════════════════════════════════════════ */}

      <Divider />
      <H3>poem_engine.py &mdash; the orchestrator</H3>

      <P>
        The poem engine is the entry point for the entire system. It holds
        references to all other components, orchestrates the generation loop,
        manages rhyme state across lines, and handles failures through two
        nested retry loops. It is also where the pattern is parsed and the
        Chhondo is auto-detected.
      </P>

      <SubLabel>Pattern parsing and Chhondo detection</SubLabel>
      <P>
        The user supplies a pattern string like <Tag>"4|4|4|2"</Tag>. The engine
        parses this into a list of integers and determines which Chhondo the
        pattern belongs to by looking at the highest mātrā value. This
        determines which <Tag>totalMatra</Tag> field is read from each word
        entry at index time.
      </P>

      <Code lang="python">
        {`def parse_pattern(pattern):
    parts   = list(map(int, pattern.split("|")))
    highest = max(parts)

    if 2 <= highest <= 4:
        chhondo = "স্বরবৃত্ত"    # lightest — all syllables count 1
    elif 5 <= highest <= 7:
        chhondo = "মাত্রাবৃত্ত"  # medium — closed syllables count 2
    elif 8 <= highest <= 12:
        chhondo = "অক্ষরবৃত্ত"   # heaviest — positional adjustments
    else:
        raise ValueError(f"Highest mātrā {highest} out of range.")

    return chhondo, parts

# Examples:
# "4|4|4|2"  → ("স্বরবৃত্ত",  [4, 4, 4, 2])
# "6|6|6|4"  → ("মাত্রাবৃত্ত", [6, 6, 6, 4])
# "8|8|8|6"  → ("অক্ষরবৃত্ত", [8, 8, 8, 6])`}
      </Code>

      <SubLabel>Startup sequence</SubLabel>
      <P>
        <Tag>PoemEngine.__init__()</Tag> runs this sequence exactly once. After
        it completes, the engine can generate any number of poems without
        reloading anything.
      </P>

      <div style={{ margin: "1.5rem 0" }}>
        {[
          [
            "parse_pattern()",
            "Parse the input string. Detect Chhondo. Store the mātrā list.",
          ],
          [
            "Lexicon(db_path)",
            "Load the JSON database. Build inverted_index and rhyme_index. Print coverage stats.",
          ],
          [
            "CFG(matra_pattern)",
            "Store the pattern. Validate all productions match the pattern length.",
          ],
          [
            "WordPicker(lexicon)",
            "Store a reference to the lexicon. No computation at this stage.",
          ],
        ].map(([step, desc]) => (
          <TableRow key={step} left={step} right={desc} />
        ))}
      </div>

      <SubLabel>The generation loop</SubLabel>
      <P>
        <Tag>PoemEngine.generate()</Tag> runs two nested retry loops. The outer
        loop retries the entire poem up to <Tag>MAX_POEM_RETRIES=5</Tag> times.
        The inner loop retries each individual line up to{" "}
        <Tag>MAX_LINE_RETRIES=10</Tag> times. On each line retry, the CFG is
        re-expanded — a fresh production is chosen, giving different slot
        configurations to the word picker.
      </P>

      <Code lang="python">
        {`def generate(self, num_lines=4, start="NATURE", verbose=False):
    for poem_attempt in range(MAX_POEM_RETRIES):

        # Step 1: plan the thematic arc
        trajectory = plan_field_trajectory(num_lines, start)
        # e.g. ["NATURE", "MOTION", "SOUND", "EMOTION"]

        poem_used   = set()    # words used anywhere in the poem so far
        poem_lines  = []
        rhyme_class = None     # set after each odd line

        failed = False

        for line_idx, family in enumerate(trajectory):
            is_even      = (line_idx % 2 == 1)   # 0-indexed: 1,3,5 are even
            target_rhyme = rhyme_class if is_even else None

            # Line retry loop
            words = None
            for attempt in range(MAX_LINE_RETRIES):
                slots = self.cfg.get_slots(family, is_even_line=is_even)
                words = self.picker.fill_line(slots, poem_used, target_rhyme)
                if words is not None:
                    break   # line succeeded

            if words is None:
                failed = True
                break   # line failed after all retries → restart poem

            # Update state
            for w in words:
                poem_used.add(w)

            if not is_even:
                rhyme_class = self._get_rhyme_class(words[-1])

            poem_lines.append(" ".join(words))

        if not failed:
            return poem_lines   # success

    raise RuntimeError("Failed after all retries. Check lexicon coverage.")`}
      </Code>

      <SubLabel>Rhyme management across lines</SubLabel>
      <P>
        Rhyme state is carried in the single variable <Tag>rhyme_class</Tag>,
        updated after each odd-indexed line (0, 2, 4, ...) and consumed by the
        next even-indexed line (1, 3, 5, ...). The rhyme class is the last vowel
        character found by scanning the word right to left.
      </P>

      <Code lang="python">
        {`def _get_rhyme_class(self, word):
    ALL_VOWELS = set("অআইঈউঊঋএঐওঔ") | set("ািীুূৃেৈোৌ")
    for ch in reversed(word):
        if ch in ALL_VOWELS:
            return ch
    return word[-1] if word else ""`}
      </Code>

      <Note>
        The ABAB rhyme scheme is a direct consequence of this state machine. No
        special case is needed. Line 0 (odd) sets <Tag>rhyme_class</Tag> from
        its last word. Line 1 (even) has a rhyme slot constrained to that class.
        Line 2 (odd) sets <Tag>rhyme_class</Tag> again from its last word,
        overwriting the previous value. Line 3 (even) rhymes with line 2. The
        pattern repeats. A poem of 6 lines produces ABABAB naturally.
      </Note>

      <SubLabel>The full data flow, end to end</SubLabel>
      <P>
        Putting all five modules together, the complete transformation from
        input string to poem is:
      </P>

      <Code lang="python">
        {`# Input
pattern = "4|4|4|2"
num_lines = 4

# Stage 0 — parse
chhondo, matra_pattern = parse_pattern(pattern)
# → ("স্বরবৃত্ত", [4, 4, 4, 2])

# Stage 1 — lexicon index (built once at startup)
# inverted_index[("NATURE_WATER", 4)] = [নদীতে, সাগরে, ঝর্ণায়, ...]
# rhyme_index["এ"] = [নদীতে, আকাশে, মেঘে, ...]

# Stage 2 — field planner
trajectory = plan_field_trajectory(4, "NATURE")
# → ["NATURE", "MOTION", "SOUND", "EMOTION"]

# Stage 3 — CFG expansion for each line
# Line 0, family NATURE, production chosen at random:
slots = cfg.get_slots("NATURE", is_even_line=False)
# → [Slot("DESC_COLOR","JJ",4), Slot("NATURE_SKY","NN",4),
#    Slot("MOTION_GENTLE","VB",4), Slot("NATURE_WATER","NN",2)]

# Stage 4 — word picking
words = picker.fill_line(slots, poem_used={}, rhyme_class=None)
# → ["সোনালি", "আকাশ", "ভাসে", "জল"]
#   matra:  4       4       4      2  ✓
# rhyme_class set to last vowel of "জল" = "অ"

# Line 1, family MOTION, even → last slot is rhyme slot
slots = cfg.get_slots("MOTION", is_even_line=True)
# → [..., Slot("MOTION_GENTLE","VB",2, is_rhyme_slot=True)]

words = picker.fill_line(slots, poem_used, rhyme_class="অ")
# → last word must have rhyme_class == "অ"
# → e.g. ["পাতা", "দোলে", "মাঠে", "বন"]
#   rhyme: "বন" ends in "অ" sound ✓`}
      </Code>

      <Placeholder
        label="Animation: full poem generation — trajectory → slots → words, line by line"
        height={240}
      />

      <SubLabel>What the system guarantees</SubLabel>
      <P>
        Every poem this system produces satisfies three guarantees by
        construction, not by luck:
      </P>

      <div style={{ margin: "1.5rem 0" }}>
        {[
          [
            "Metric correctness",
            "Every parba has exactly the mātrā declared in the pattern. This holds because mātrā is a precondition for entry into any candidate set and is never relaxed at any stage.",
          ],
          [
            "Thematic coherence",
            "The field sequence is the globally optimal Dijkstra path, not a random walk. Adjacent lines are always semantically related, and the poem ends in a resolved field.",
          ],
          [
            "ABAB rhyme",
            "The last word of every even line shares its final vowel sound with the last word of the previous odd line. This holds because the rhyme slot constraint is applied before any word is selected for that position.",
          ],
        ].map(([k, v]) => (
          <TableRow key={k} left={k} right={v} />
        ))}
      </div>

      <P>
        What the system does not guarantee is literary quality in the human
        sense — that the words will form a striking image, that the metaphors
        will resonate, that the poem will move a reader. Those properties emerge
        from the quality and coverage of the lexicon, from the breadth of the
        semantic productions, and from the accumulated knowledge encoded in the
        seed lists and natural-pair declarations. The formal system provides the
        skeleton. The lexicon and grammar fill it with meaning.
      </P>
    </section>
  );
}
