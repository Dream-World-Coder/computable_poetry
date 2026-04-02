import { useState, useEffect } from "react";
import "./App.css";

const CHAPTERS = [
  { id: "intro", num: "00", title: "Computable Poetry" },
  { id: "poem", num: "01", title: "What is a Poem?" },
  { id: "chhondo", num: "02", title: "Bangla Prosody" },
  { id: "problem", num: "03", title: "The Problem" },
  { id: "prerequisites", num: "04", title: "Prerequisites" },
  { id: "architecture", num: "05", title: "The Architecture" },
  { id: "pipeline", num: "06", title: "The Pipeline" },
];

function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const observers = ids.map((id) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(id);
        },
        { rootMargin: "-30% 0px -60% 0px" },
      );
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach((o) => o && o.disconnect());
  }, [ids]);
  return active;
}

function Code({ children, lang = "" }) {
  return (
    <div
      style={{
        margin: "2rem 0",
        borderLeft: "2px solid #c8b89a",
        paddingLeft: "1.5rem",
      }}
    >
      {lang && (
        <div
          style={{
            fontSize: "0.65rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#9a8a78",
            marginBottom: "0.6rem",
            fontFamily: "'IBM Plex Mono', monospace",
          }}
        >
          {lang}
        </div>
      )}
      <pre
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: "0.78rem",
          lineHeight: 1.75,
          color: "#3d3530",
          background: "#f5f0e8",
          padding: "1.25rem 1.5rem",
          borderRadius: "2px",
          overflowX: "auto",
          margin: 0,
          whiteSpace: "pre",
        }}
      >
        {children}
      </pre>
    </div>
  );
}

function Placeholder({ label, height = 200 }) {
  return (
    <div
      style={{
        margin: "2.5rem 0",
        height,
        border: "1px dashed #c4b8a8",
        borderRadius: "2px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem",
        background: "#faf8f4",
        color: "#b0a090",
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          border: "1px dashed #c4b8a8",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.9rem",
          color: "#c4b8a8",
        }}
      >
        +
      </div>
      <div
        style={{
          fontSize: "0.68rem",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          fontFamily: "'IBM Plex Mono', monospace",
        }}
      >
        {label}
      </div>
    </div>
  );
}

function Divider() {
  return (
    <div
      style={{
        margin: "3.5rem 0",
        borderTop: "1px solid #e8e0d4",
      }}
    />
  );
}

function Tag({ children }) {
  return (
    <span
      style={{
        display: "inline-block",
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: "0.72rem",
        background: "#ede8df",
        color: "#7a6a58",
        padding: "0.15em 0.55em",
        borderRadius: "2px",
        margin: "0 0.15em",
        letterSpacing: "0.04em",
      }}
    >
      {children}
    </span>
  );
}

function Pull({ children }) {
  return (
    <blockquote
      style={{
        margin: "2.5rem 0",
        padding: "0 0 0 2rem",
        borderLeft: "3px solid #c8b89a",
        fontFamily: "'Crimson Pro', Georgia, serif",
        fontSize: "1.22rem",
        fontStyle: "italic",
        lineHeight: 1.65,
        color: "#5a4e42",
      }}
    >
      {children}
    </blockquote>
  );
}

function SectionLabel({ num, title }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: "1rem",
        marginBottom: "2.5rem",
      }}
    >
      <span
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: "0.68rem",
          color: "#b0a090",
          letterSpacing: "0.1em",
          minWidth: "2rem",
        }}
      >
        {num}
      </span>
      <h2
        style={{
          fontFamily: "'Crimson Pro', Georgia, serif",
          fontSize: "1.7rem",
          fontWeight: 600,
          color: "#2a2018",
          margin: 0,
          letterSpacing: "-0.01em",
        }}
      >
        {title}
      </h2>
    </div>
  );
}

function P({ children, style = {} }) {
  return (
    <p
      style={{
        fontFamily: "'Crimson Pro', Georgia, serif",
        fontSize: "1.05rem",
        lineHeight: 1.85,
        color: "#3d3530",
        margin: "0 0 1.2rem 0",
        ...style,
      }}
    >
      {children}
    </p>
  );
}

function H3({ children }) {
  return (
    <h3
      style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: "0.75rem",
        fontWeight: 500,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "#9a8a78",
        margin: "2.5rem 0 0.9rem 0",
      }}
    >
      {children}
    </h3>
  );
}

function MatraBox({ pattern, label }) {
  return (
    <div style={{ margin: "1.5rem 0" }}>
      <div
        style={{
          fontSize: "0.65rem",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          fontFamily: "'IBM Plex Mono', monospace",
          color: "#9a8a78",
          marginBottom: "0.7rem",
        }}
      >
        {label}
      </div>
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        {pattern.map((m, i) => (
          <div
            key={i}
            style={{
              width: m * 22,
              height: 36,
              background: "#ede8df",
              border: "1px solid #d4c8b8",
              borderRadius: "2px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "0.78rem",
              color: "#7a6a58",
            }}
          >
            {m}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CHAPTERS
// ─────────────────────────────────────────────────────────────

function ChapterIntro() {
  return (
    <section
      id="intro"
      style={{
        paddingTop: "5rem",
        minHeight: "90vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: "0.65rem",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "#b0a090",
          marginBottom: "2.5rem",
        }}
      >
        A project by me under the guidance of Prof. Sukanta Das Sir
      </div>

      <h1
        style={{
          fontFamily: "'Crimson Pro', Georgia, serif",
          fontSize: "clamp(2.8rem, 6vw, 4.5rem)",
          fontWeight: 700,
          color: "#1e1810",
          lineHeight: 1.08,
          letterSpacing: "-0.025em",
          margin: "0 0 1.5rem 0",
          maxWidth: "780px",
        }}
      >
        Computable
        <br />
        Poetry
      </h1>

      <p
        style={{
          fontFamily: "'Crimson Pro', Georgia, serif",
          fontSize: "1.18rem",
          lineHeight: 1.75,
          color: "#6a5a4a",
          maxWidth: "520px",
          margin: "0 0 3rem 0",
        }}
      >
        Generating metrically correct, semantically plausible Bangla poems using
        formal grammars, constraint satisfaction, and graph-based planning
        &mdash; with no machine learning anywhere in the pipeline.
      </p>

      <div
        style={{
          display: "flex",
          gap: "2.5rem",
          flexWrap: "wrap",
        }}
      >
        {[
          ["Method", "Formal Grammars"],
          ["Metre", "স্বরবৃত্ত / মাত্রাবৃত্ত / অক্ষরবৃত্ত"],
          ["ML used", "None"],
        ].map(([k, v]) => (
          <div key={k}>
            <div
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: "0.62rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#b0a090",
                marginBottom: "0.3rem",
              }}
            >
              {k}
            </div>
            <div
              style={{
                fontFamily: "'Crimson Pro', Georgia, serif",
                fontSize: "1rem",
                color: "#3d3530",
              }}
            >
              {v}
            </div>
          </div>
        ))}
      </div>

      <Divider />

      <P style={{ maxWidth: "620px" }}>
        This page documents, chapter by chapter, the system built to answer one
        question: can a poem be generated algorithmically, with correct metre
        and plausible meaning, without ever invoking a neural network?
      </P>
    </section>
  );
}

function ChapterPoem() {
  return (
    <section id="poem" style={{ paddingTop: "5rem" }}>
      <SectionLabel num="01" title="What is a Poem?" />

      <P>
        A poem is two things held in tension: <em>pattern</em> and{" "}
        <em>meaning</em>. Strip away the meaning and you have music &mdash;
        rhythmic sound that pleases the ear. Strip away the pattern and you have
        prose. The poem lives exactly at their intersection.
      </P>

      <Pull>
        Pattern without meaning is noise. Meaning without pattern is prose.
        Poetry is the discipline of sustaining both at once.
      </Pull>

      <P>
        The pattern side is tractable. It is a formal system: syllables have
        weights, weights sum to fixed targets, line endings match phonetically.
        A machine can reason about this. The meaning side is harder. Words must
        cohere &mdash; they must collectively point at something, evoke
        something, carry a reader somewhere.
      </P>

      <P>
        This project begins with the pattern &mdash; building the formal
        skeleton of a poem &mdash; and then progressively introduces constraints
        that push the output toward meaning. No single constraint produces a
        poem. The poem emerges from their intersection.
      </P>

      <Placeholder
        label="Animation: pattern vs meaning spectrum"
        height={160}
      />

      <H3>The compiler analogy</H3>
      <P>
        A compiler takes source text, validates it against formal rules, and
        produces structured output. A poem generator runs this process in
        reverse: it starts from formal rules and produces text. The same stages
        apply &mdash; lexer, parser, code generator &mdash; just pointed in the
        other direction. This analogy is not decorative. It is the actual
        architecture used here.
      </P>
    </section>
  );
}

function ChapterChhondo() {
  return (
    <section id="chhondo" style={{ paddingTop: "5rem" }}>
      <SectionLabel num="02" title="Bangla Prosody" />

      <P>
        Bangla poetry is governed by a system called <strong>ছন্দ</strong>{" "}
        (Chhondo) &mdash; the science of poetic metre. Every word is assigned a
        numerical weight called
        <strong> মাত্রা</strong> (mātrā), and a line is composed so that the
        total mātrā of each rhythmic unit &mdash; called a <strong>পর্ব</strong>{" "}
        (parba) &mdash; matches a fixed pattern.
      </P>

      <H3>Three classical metres</H3>

      <P>
        Bangla has three principal metres, each with a different weight system:
      </P>

      <div
        style={{
          margin: "2rem 0",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
        }}
      >
        {[
          {
            name: "স্বরবৃত্ত",
            roman: "Sarabritto",
            rule: "Lightest. Every syllable counts as 1 mātrā, regardless of whether it is open or closed.",
            pattern: [4, 4, 4, 2],
            label: "Typical pattern: 4 | 4 | 4 | 2",
          },
          {
            name: "মাত্রাবৃত্ত",
            roman: "Matrabritto",
            rule: "Medium weight. Open syllable (vowel-ending) = 1 mātrā, closed syllable (consonant-ending) = 2 mātrā.",
            pattern: [6, 6, 6, 4],
            label: "Typical pattern: 6 | 6 | 6 | 4",
          },
          {
            name: "অক্ষরবৃত্ত",
            roman: "Okkhorbritto",
            rule: "Heaviest. Pure syllable counting with positional adjustments — a closed syllable at word-end counts 2, elsewhere counts 1.",
            pattern: [8, 8, 8, 6],
            label: "Typical pattern: 8 | 8 | 8 | 6",
          },
        ].map((c) => (
          <div
            key={c.name}
            style={{
              padding: "1.5rem",
              background: "#faf8f4",
              border: "1px solid #e8e0d4",
              borderRadius: "2px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "0.8rem",
                marginBottom: "0.7rem",
              }}
            >
              <span
                style={{
                  fontFamily: "'Crimson Pro', Georgia, serif",
                  fontSize: "1.2rem",
                  fontWeight: 600,
                  color: "#2a2018",
                }}
              >
                {c.name}
              </span>
              <span
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: "0.65rem",
                  color: "#b0a090",
                  letterSpacing: "0.06em",
                }}
              >
                {c.roman}
              </span>
            </div>
            <P style={{ margin: "0 0 1rem 0", fontSize: "0.95rem" }}>
              {c.rule}
            </P>
            <MatraBox pattern={c.pattern} label={c.label} />
          </div>
        ))}
      </div>

      <H3>Syllable types: মুক্তদল and রুদ্ধদল</H3>
      <P>
        Every Bengali syllable is one of two kinds. A <strong>মুক্তদল</strong>{" "}
        (muktodul, open syllable) ends in a vowel. A <strong>রুদ্ধদল</strong>{" "}
        (ruddhodul, closed syllable) ends in a consonant, marked by the হসন্ত
        (্) sign. This distinction is what separates the three metres: in
        স্বরবৃত্ত both count equally; in মাত্রাবৃত্ত and অক্ষরবৃত্ত the closed
        syllable is heavier, because more phonetic weight is carried by the
        final consonant.
      </P>

      <Placeholder
        label="Visualisation: syllable type classification with examples"
        height={180}
      />

      <H3>Rhyme through matching mātrā</H3>
      <P>
        Metre creates rhyme in Bangla poetry independently of phonetic
        similarity. A line of pattern{" "}
        <code
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "0.85em",
            background: "#ede8df",
            padding: "0.1em 0.4em",
            borderRadius: "2px",
          }}
        >
          4|4|4|2
        </code>{" "}
        always feels complete because the ear expects that final parba of weight
        2 after three parbas of weight 4. The pattern itself produces rhythmic
        satisfaction. If the last word of alternating lines also share a final
        vowel sound &mdash; their <em>rhyme class</em> &mdash; the effect is
        compounded.
      </P>
    </section>
  );
}

function ChapterProblem() {
  return (
    <section id="problem" style={{ paddingTop: "5rem" }}>
      <SectionLabel num="03" title="The Problem" />

      <P>
        Start with the simplest possible system: build a database of Bangla
        words, store the mātrā of each word, and pick matching ones at random to
        fill the pattern slots. This generates metrically correct output. It
        does not generate poems.
      </P>

      <Pull>
        Metre without meaning is a crossword puzzle. The grid is filled
        correctly, but nothing is being said.
      </Pull>

      <H3>Layer 1: Add grammar</H3>
      <P>
        The first move toward meaning is grammatical correction. Define a
        context-free grammar over parts-of-speech and pick words that match the
        POS of each slot. Now the output is grammatically plausible. It still
        says nothing in particular. And poetry frequently violates grammar
        deliberately, so enforcing it strictly produces stilted, mechanical
        lines.
      </P>

      <H3>Layer 2: Narrow the scenario</H3>
      <P>
        The key insight: general-purpose meaning is an unsolved problem. But{" "}
        <em>bounded</em> meaning is tractable. A poem about nature at dawn,
        cheerful and resolved &mdash; that is a constraint narrow enough to work
        with. Once the scenario is fixed, every word in the database can be
        tagged according to what semantic role it plays within that scenario.
      </P>

      <Placeholder
        label="Diagram: the three layers — metre, grammar, semantics"
        height={220}
      />

      <H3>The formal solution</H3>
      <P>
        Given a fixed scenario, the generation problem becomes constraint
        satisfaction over three ordered constraints:
      </P>

      <div
        style={{
          margin: "1.5rem 0 2rem 0",
          paddingLeft: "1.5rem",
          borderLeft: "2px solid #e8e0d4",
        }}
      >
        {[
          ["mātrā", "Inviolable. Never relaxed. The metre is the skeleton."],
          ["Semantic tag", "The word must belong to the right thematic class."],
          [
            "Part of speech",
            "The word should fit the grammatical slot. Can be relaxed.",
          ],
          [
            "Rhyme class",
            "The last word of even lines must rhyme with the previous odd line. Relaxed last.",
          ],
        ].map(([k, v], i) => (
          <div
            key={k}
            style={{
              display: "flex",
              gap: "1.2rem",
              marginBottom: "1.2rem",
              alignItems: "flex-start",
            }}
          >
            <span
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: "0.62rem",
                color: "#b0a090",
                minWidth: "1.5rem",
                paddingTop: "0.25rem",
              }}
            >
              {i + 1}
            </span>
            <div>
              <Tag>{k}</Tag>
              <span
                style={{
                  fontFamily: "'Crimson Pro', Georgia, serif",
                  fontSize: "1rem",
                  color: "#3d3530",
                  marginLeft: "0.5rem",
                }}
              >
                {v}
              </span>
            </div>
          </div>
        ))}
      </div>

      <P>
        Match these four constraints and the output is metrically correct,
        thematically coherent within the scenario, grammatically plausible, and
        phonetically rhymed. That is the formal definition of the poem this
        system generates. No neural network is involved at any stage. The
        intelligence is in the constraint system, not in a model.
      </P>
    </section>
  );
}

function ChapterPrerequisites() {
  return (
    <section id="prerequisites" style={{ paddingTop: "5rem" }}>
      <SectionLabel num="04" title="Prerequisites" />

      <P>
        Before the generation pipeline can run, two foundational pieces must be
        built: a syllable splitter that can decompose any Bangla word and assign
        it a mātrā, and a tagger that assigns each word a semantic role.
      </P>

      <H3>Syllable splitting</H3>
      <P>
        The splitter in <Tag>splitBanglaSyllables.py</Tag> applies regex pattern
        matching over the Unicode character stream of a word, classifying
        characters as consonants or vowels using two declared sets. It then
        matches patterns in priority order: CVC &rarr; CCV &rarr; CV &rarr; VC.
        Each matched unit is examined to determine whether it is a মুক্তদল or
        রুদ্ধদল, and a হসন্ত (্) is appended to closed syllables.
      </P>

      <Code lang="python">
        {`# The two character classes
bangla_vowels = {("অ",""),("আ","া"),("ই","ি"),("ঈ","ী"),
                 ("উ","ু"),("ঊ","ূ"),("ঋ","ৃ"),("এ","ে"),
                 ("ঐ","ৈ"),("ও","ো"),("ঔ","ৌ")}

bangla_consonants = {"ক","খ","গ","ঘ","ঙ","চ","ছ",... }

# Pattern priority: CVC | CCV | CV | VC
pattern = f'{c}{v}{c}|{c}{{2}}{v}|{c}{v}|{v}{c}'`}
      </Code>

      <P>
        Once syllables are in hand, mātrā is assigned per-syllable according to
        the target Chhondo. In স্বরবৃত্ত every syllable &mdash; open or closed
        &mdash; contributes exactly 1. In মাত্রাবৃত্ত a closed syllable
        contributes 2. In অক্ষরবৃত্ত a closed syllable at word-end contributes
        2; elsewhere it contributes 1.
      </P>

      <Code lang="python">
        {`def get_matra(syllables, chhondo):
    total = 0
    for i, syl in enumerate(syllables):
        if is_swaranto(syl):          # open syllable — always 1
            total += 1
        elif is_banjonanto(syl):      # closed syllable
            if chhondo == "স্বরবৃত্ত":
                total += 1            # equal weight
            elif chhondo == "মাত্রাবৃত্ত":
                total += 2            # always heavier
            elif chhondo == "অক্ষরবৃত্ত":
                # word-final or standalone → 2, otherwise → 1
                if i == len(syllables)-1:
                    total += 2
                else:
                    total += 1
    return total`}
      </Code>

      <Placeholder
        label="Animation: word → syllables → mātrā assignment"
        height={180}
      />

      <H3>Tagging</H3>
      <P>
        The tagger in <Tag>tagger.py</Tag> assigns three attributes to every
        word: a semantic <Tag>TAG</Tag>, a <Tag>TAG_FAMILY</Tag>, and a{" "}
        <Tag>rhyme_class</Tag>. It operates in three tiers, stopping at the
        first match.
      </P>

      <div
        style={{
          margin: "1.5rem 0",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        {[
          {
            tier: "Tier 1",
            name: "Seed list substring match",
            desc: "The word is checked against a curated list of root words for each tag. Longest matching root wins. A hit here is confident — the tag is marked reviewed=True.",
          },
          {
            tier: "Tier 2",
            name: "POS heuristic fallback",
            desc: "If no seed root matches, the POS tag from the model drives a default tag assignment. A noun defaults to NATURE_FLORA, a verb to MOTION_GENTLE, and so on. Not confident — reviewed=False.",
          },
          {
            tier: "Tier 3",
            name: "UNTAGGED",
            desc: "If neither tier matches, the word is flagged for manual review. It will not appear in the index until tagged.",
          },
        ].map((t) => (
          <div
            key={t.tier}
            style={{
              display: "flex",
              gap: "1.5rem",
              alignItems: "flex-start",
              padding: "1.2rem 1.5rem",
              background: "#faf8f4",
              border: "1px solid #e8e0d4",
              borderRadius: "2px",
            }}
          >
            <div
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: "0.62rem",
                color: "#b0a090",
                letterSpacing: "0.06em",
                minWidth: "3.5rem",
                paddingTop: "0.15rem",
              }}
            >
              {t.tier}
            </div>
            <div>
              <div
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: "0.72rem",
                  color: "#5a4e42",
                  marginBottom: "0.4rem",
                }}
              >
                {t.name}
              </div>
              <P style={{ margin: 0, fontSize: "0.95rem" }}>{t.desc}</P>
            </div>
          </div>
        ))}
      </div>

      <P>
        The rhyme class is simply the last vowel character found by scanning the
        word backwards. Words sharing the same last vowel will rhyme
        phonetically.
      </P>

      <Code lang="python">
        {`def get_rhyme_class(word):
    ALL_VOWELS = set("অআইঈউঊঋএঐওঔ") | set("ািীুূৃেৈোৌ")
    for ch in reversed(word):
        if ch in ALL_VOWELS:
            return ch
    return word[-1] if word else ""`}
      </Code>
    </section>
  );
}

function ChapterArchitecture() {
  return (
    <section id="architecture" style={{ paddingTop: "5rem" }}>
      <SectionLabel num="05" title="The Architecture" />

      <P>
        The generation system is five modules, each corresponding to a classical
        compiler stage. They are loaded once and then composed to produce any
        number of poems.
      </P>

      <Placeholder
        label="Diagram: full pipeline — Lexicon → Graph → CFG → WordPicker → Engine"
        height={200}
      />

      {/* LEXICON */}
      <H3>lexicon.py &mdash; the inverted index</H3>
      <P>
        The word database stores inflected forms directly, not stems. This is
        deliberate: attaching grammatical suffixes at runtime would change the
        mātrā, requiring recomputation on every candidate word during every slot
        fill. Storing inflected forms keeps mātrā lookup O(1).
      </P>
      <P>
        On startup, the lexicon builds two in-memory indices from the JSON
        database:
      </P>

      <Code lang="python">
        {`# Key: (TAG, matra) — Value: list of word entries
inverted_index = {
    ("NATURE_WATER", 3): ["নদী", "ঢেউ", "জলে"],
    ("NATURE_SKY",   2): ["চাঁদ", "মেঘ"],
    ("EMOTION_JOY",  4): ["আনন্দ", "উল্লাস"],
    ...
}

# Key: rhyme class — Value: list of word entries
rhyme_index = {
    "এ": ["নদীতে", "আকাশে", "মেঘে"],
    "অ": ["মন", "বন", "গগন", "পবন"],
    ...
}`}
      </Code>

      <P>
        If the exact <Tag>(TAG, matra)</Tag> bucket is empty, the lexicon walks
        a declared fallback chain: sibling tags in the same family, then
        cross-family neighbours. mātrā is never relaxed at any point in the
        fallback.
      </P>

      <Divider />

      {/* SEMANTIC GRAPH */}
      <H3>semantic_graph.py &mdash; the field planner</H3>
      <P>
        Before any word is chosen, the system plans the entire thematic arc of
        the poem. Nine semantic families form the nodes of a weighted directed
        graph. Edge weights are not assigned manually per-pair; they are derived
        from three structural rules:
      </P>

      <div style={{ margin: "1.5rem 0 2rem 0" }}>
        {[
          ["CONNECTOR involved", "1", "Bridge word — always cheap to cross"],
          ["Natural poetic pair", "2", "NATURE↔LIGHT, MOTION↔SOUND, etc."],
          ["Sensory → Sensory", "3", "Both in the external world"],
          ["Inner → Inner", "2", "ACTOR↔EMOTION, tight coupling"],
          ["Sensory ↔ Inner", "4", "The poetic turn — higher cost, valid"],
        ].map(([rule, cost, note]) => (
          <div
            key={rule}
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "1rem",
              padding: "0.7rem 0",
              borderBottom: "1px solid #ede8df",
            }}
          >
            <div
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: "0.72rem",
                color: "#5a4e42",
                minWidth: "170px",
              }}
            >
              {rule}
            </div>
            <div
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: "0.85rem",
                color: "#c8b89a",
                minWidth: "2rem",
                textAlign: "right",
              }}
            >
              → {cost}
            </div>
            <div
              style={{
                fontFamily: "'Crimson Pro', Georgia, serif",
                fontSize: "0.95rem",
                color: "#6a5a4a",
              }}
            >
              {note}
            </div>
          </div>
        ))}
      </div>

      <P>
        A k-hop Dijkstra runs on a layered graph where the state is{" "}
        <Tag>(field, layer)</Tag> &mdash; which field at which line number. It
        finds the globally minimum-cost path of
        <em> exactly k hops</em>, ending at any resolved field (EMOTION or
        SOUND, for the nature/cheerful scenario). This is not a greedy local
        choice. It is the globally optimal thematic arc for the given line
        count.
      </P>

      <Code lang="python">
        {`def k_hop_dijkstra(graph, start, resolved, k):
    dist = {(start, 0): 0}
    pq   = [(0, start, 0, [start])]
    best, best_cost = None, float('inf')

    while pq:
        cost, node, layer, path = heappop(pq)
        if cost >= best_cost:
            continue

        if layer == k - 1:          # reached target depth
            if node in resolved and cost < best_cost:
                best_cost = cost
                best = path
            continue

        for neighbour, weight in graph[node].items():
            new_cost = cost + weight
            state = (neighbour, layer + 1)
            if new_cost < dist.get(state, float('inf')):
                dist[state] = new_cost
                heappush(pq, (new_cost, neighbour,
                              layer + 1, path + [neighbour]))
    return best`}
      </Code>

      <Placeholder
        label="Visualisation: Dijkstra field trajectory for a 4-line poem"
        height={200}
      />

      <Divider />

      {/* CFG */}
      <H3>cfg.py &mdash; the line structurer</H3>
      <P>
        Given the field family assigned to a line by Dijkstra, the CFG expands
        it into a concrete sequence of <em>slots</em> &mdash; one per parba.
        Each slot carries the tag, POS, and mātrā budget for that position.
      </P>
      <P>
        Productions are declared as lists of <Tag>(TAG, POS)</Tag> pairs. One
        production is chosen randomly per line, giving structural variety while
        staying within the semantic field. Every production must have exactly as
        many pairs as there are parbas in the pattern &mdash; this is validated
        at startup.
      </P>

      <Code lang="python">
        {`# A sample production for the NATURE family, pattern 4|4|4|2
# → 4 parbas → 4 (TAG, POS) pairs per production

SEMANTIC_PRODUCTIONS["NATURE"] = [
    [("DESC_COLOR",   "JJ"),
     ("NATURE_SKY",   "NN"),
     ("MOTION_GENTLE","VB"),
     ("NATURE_WATER", "NN")],

    [("TIME_DAWN",    "NN"),
     ("NATURE_FLORA", "NN"),
     ("MOTION_GENTLE","VB"),
     ("NATURE_SKY",   "NN")],
    ...
]`}
      </Code>

      <P>
        The last slot of every even-indexed line is marked{" "}
        <Tag>is_rhyme_slot=True</Tag>. The word picker will later apply the
        phonetic rhyme constraint to that slot only. ABAB rhyme falls out
        naturally from this marking &mdash; no special logic is needed.
      </P>

      <Divider />

      {/* WORD PICKER */}
      <H3>word_picker.py &mdash; constraint satisfaction</H3>
      <P>
        The word picker fills each slot by attempting six ordered passes,
        relaxing constraints from tightest to loosest. mātrā is not listed
        because it is never relaxed &mdash; it is a precondition, not a
        constraint.
      </P>

      <div style={{ margin: "1.5rem 0" }}>
        {[
          ["Pass 1", "Exact tag + exact POS + rhyme class (rhyme slots only)"],
          ["Pass 2", "Exact tag + exact POS"],
          ["Pass 3", "Exact tag, POS relaxed"],
          ["Pass 4", "Sibling tag fallback + exact POS"],
          ["Pass 5", "Sibling tag fallback, POS relaxed"],
          ["Pass 6", "Cross-family fallback, POS relaxed"],
        ].map(([pass_, desc]) => (
          <div
            key={pass_}
            style={{
              display: "flex",
              gap: "1.2rem",
              alignItems: "flex-start",
              padding: "0.65rem 0",
              borderBottom: "1px solid #ede8df",
            }}
          >
            <Tag>{pass_}</Tag>
            <P style={{ margin: 0, fontSize: "0.95rem" }}>{desc}</P>
          </div>
        ))}
      </div>

      <P>
        If all six passes fail, the picker returns <Tag>None</Tag>, signalling
        the engine to retry the line. Within-line deduplication stacks on top of
        poem-scoped deduplication &mdash; the same word will not appear twice in
        a line, and an attempt is made not to repeat across lines either.
      </P>

      <Divider />

      {/* POEM ENGINE */}
      <H3>poem_engine.py &mdash; the orchestrator</H3>
      <P>
        The engine wires all components together. It parses the input pattern,
        auto-detects the Chhondo from the highest mātrā value, loads the
        lexicon, runs Dijkstra, then generates lines one by one.
      </P>

      <Code lang="python">
        {`def parse_pattern(pattern):
    parts   = list(map(int, pattern.split("|")))
    highest = max(parts)
    if 2 <= highest <= 4:
        chhondo = "স্বরবৃত্ত"
    elif 5 <= highest <= 7:
        chhondo = "মাত্রাবৃত্ত"
    elif 8 <= highest <= 12:
        chhondo = "অক্ষরবৃত্ত"
    return chhondo, parts`}
      </Code>

      <P>
        Two retry loops handle failures gracefully. If a single line cannot be
        filled after <Tag>MAX_LINE_RETRIES=10</Tag> attempts (each re-expanding
        the CFG with fresh randomness), the entire poem is retried. If the poem
        fails after
        <Tag>MAX_POEM_RETRIES=5</Tag> attempts, a <Tag>RuntimeError</Tag> is
        raised pointing toward lexicon coverage gaps as the likely cause.
      </P>

      <Code lang="python">
        {`for poem_attempt in range(MAX_POEM_RETRIES):
    trajectory = plan_field_trajectory(num_lines, start)

    for line_idx, family in enumerate(trajectory):
        is_even      = (line_idx % 2 == 1)
        target_rhyme = rhyme_class if is_even else None

        for attempt in range(MAX_LINE_RETRIES):
            slots = cfg.get_slots(family, is_even_line=is_even)
            words = picker.fill_line(slots, poem_used, target_rhyme)
            if words is not None:
                break   # line succeeded

        if words is None:
            break       # line failed — retry poem

        if not is_even:
            rhyme_class = get_rhyme_class(words[-1])`}
      </Code>

      <Placeholder
        label="Animation: full poem generation — trajectory → slots → words"
        height={240}
      />
    </section>
  );
}

function ChapterPipeline() {
  return (
    <section
      id="pipeline"
      style={{ paddingTop: "5rem", paddingBottom: "8rem" }}
    >
      <SectionLabel num="06" title="The Pipeline" />

      <P>
        Putting it all together: a single call to{" "}
        <Tag>poem_engine.generate()</Tag>
        runs this sequence exactly once per poem.
      </P>

      <div
        style={{
          margin: "2rem 0",
          display: "flex",
          flexDirection: "column",
          gap: 0,
        }}
      >
        {[
          {
            step: "1",
            label: "parse_pattern",
            detail: "Input: '4|4|4|2' → Chhondo: স্বরবৃত্ত, parbas: [4,4,4,2]",
          },
          {
            step: "2",
            label: "Lexicon._load()",
            detail:
              "Reads the word DB, builds inverted_index and rhyme_index in memory.",
          },
          {
            step: "3",
            label: "plan_field_trajectory()",
            detail: "k-hop Dijkstra → e.g. [NATURE → MOTION → SOUND → EMOTION]",
          },
          {
            step: "4",
            label: "CFG.get_slots()",
            detail:
              "For each line: pick one semantic production → typed Slot list.",
          },
          {
            step: "5",
            label: "WordPicker.fill_line()",
            detail: "For each slot: six-pass constraint lookup → chosen word.",
          },
          {
            step: "6",
            label: "Assemble & rhyme",
            detail: "Odd-line last word sets rhyme_class. Even lines match it.",
          },
        ].map((s, i, arr) => (
          <div
            key={s.step}
            style={{
              display: "flex",
              gap: "1.5rem",
              alignItems: "stretch",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "2rem",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  background: "#ede8df",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: "0.65rem",
                  color: "#7a6a58",
                  flexShrink: 0,
                }}
              >
                {s.step}
              </div>
              {i < arr.length - 1 && (
                <div
                  style={{
                    width: 1,
                    flex: 1,
                    background: "#e0d8cc",
                    margin: "4px 0",
                  }}
                />
              )}
            </div>
            <div style={{ paddingBottom: "1.5rem", flex: 1 }}>
              <div
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: "0.75rem",
                  color: "#5a4e42",
                  marginBottom: "0.3rem",
                }}
              >
                {s.label}
              </div>
              <P style={{ margin: 0, fontSize: "0.95rem", color: "#6a5a4a" }}>
                {s.detail}
              </P>
            </div>
          </div>
        ))}
      </div>

      <Divider />

      <H3>What this system is</H3>
      <P>
        A formal constraint satisfaction system that generates metrically
        correct, thematically bounded, phonetically rhymed Bangla poems. The
        skeleton is always correct: a poem produced by this system will always
        satisfy its declared mātrā pattern, always end with ABAB rhyme, and
        always stay within the declared semantic scenario.
      </P>

      <H3>What this system is not</H3>
      <P>
        A general-purpose poem generator. The system is intentionally scoped to
        one scenario (nature, cheerful) because depth within a narrow boundary
        produces more interesting output than shallow coverage of a wide one.
        Generalising to arbitrary scenarios is an extension, not a correction.
      </P>
      <P>
        A machine learning system. Every weight, every rule, every fallback
        chain is declared explicitly. There is no training, no inference, no
        embedding space. The intelligence is in the formal structure, not in a
        model. This is the point.
      </P>

      <Pull>
        Structured randomness, operating within hard prosodic constraints and
        soft semantic constraints, with graph-based planning for cross-line
        coherence. No AI. Just form.
      </Pull>

      <Divider />

      <div
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: "0.65rem",
          letterSpacing: "0.1em",
          color: "#b0a090",
          textAlign: "center",
          paddingTop: "1rem",
        }}
      >
        &mdash; Computable Poetry &mdash;
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// ROOT
// ─────────────────────────────────────────────────────────────

export default function App() {
  const ids = CHAPTERS.map((c) => c.id);
  const active = useActiveSection(ids);
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <>
      {/* Sidebar nav — desktop */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "200px",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 0 0 2rem",
          zIndex: 100,
          pointerEvents: "none",
        }}
      >
        <div style={{ pointerEvents: "auto" }}>
          {CHAPTERS.map((c) => (
            <button
              key={c.id}
              onClick={() => scrollTo(c.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "0.35rem 0",
                textAlign: "left",
                width: "100%",
              }}
            >
              <div
                style={{
                  width: active === c.id ? 18 : 8,
                  height: 1,
                  background: active === c.id ? "#8a7a68" : "#d4c8b8",
                  transition: "width 0.25s ease, background 0.25s ease",
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: "0.6rem",
                  letterSpacing: "0.06em",
                  color: active === c.id ? "#3d3530" : "#b0a090",
                  transition: "color 0.25s ease",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: "130px",
                }}
              >
                {c.title}
              </span>
            </button>
          ))}
        </div>
      </nav>

      {/* Main content */}
      <main
        style={{
          marginLeft: "200px",
          maxWidth: "768px",
          padding: "0 3rem 0 2rem",
          minHeight: "100vh",
        }}
      >
        <ChapterIntro />
        <Divider />
        <ChapterPoem />
        <Divider />
        <ChapterChhondo />
        <Divider />
        <ChapterProblem />
        <Divider />
        <ChapterPrerequisites />
        <Divider />
        <ChapterArchitecture />
        <Divider />
        <ChapterPipeline />
      </main>
    </>
  );
}
