import {
  Divider,
  Tag,
  Pull,
  SectionLabel,
  P,
  H3,
} from "../components/components";

export function ChapterPipeline() {
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

      <Pull>
        Code:{" "}
        <a href="https://github.com/Dream-World-Coder/computable_poetry">
          github.com/Dream-World-Coder/computable_poetry
        </a>
      </Pull>
      {/* <code className="whitespace-pre">
        {`(bnlp-env) miniproject  (git)-[main]- ➤ tree --gitignore
        .
        ├── LICENSE
        ├── README.md
        ├── data.txt
        ├── database
        │   ├── create_db.py
        │   ├── passage-new.txt
        │   ├── passage_prakriti.txt
        │   ├── sanitise2.py
        │   ├── sanitise_passage.py
        │   ├── scraped.txt
        │   ├── scraper.py
        │   ├── scraper1.py
        │   ├── scraper2.py
        │   └── suff_trie.py
        ├── generate
        │   ├── algorithmic_poem_generator.py
        │   ├── cfg.py
        │   ├── lexicon.py
        │   ├── poem_engine.py
        │   ├── random_poem.py
        │   ├── semantic_graph.py
        │   ├── v1_algo.py
        │   ├── v2_algo.py
        │   └── word_picker.py
        ├── poems
        │   └── generated
        │       ├── outputs
        │       │   ├── output.txt
        │       │   ├── poem-op.txt
        │       │   ├── sel-output.txt
        │       │   └── sel-poem-op.txt
        │       └── res.txt
        ├── pyproject.toml
        ├── requirements.txt
        ├── tagger
        │   └── tagger.py
        ├── visualisation
        │   ├── README.md
        │   ├── eslint.config.js
        │   ├── index.html
        │   ├── package.json
        │   ├── pnpm-lock.yaml
        │   ├── public
        │   │   └── favicon.svg
        │   ├── src
        │   │   ├── App.css
        │   │   ├── App.jsx
        │   │   ├── assets
        │   │   ├── index.css
        │   │   └── main.jsx
        │   └── vite.config.js
        └── word_to_syllables
            ├── backup.py
            ├── logic.md
            ├── output.txt
            ├── splitBanglaSyllables.py
            ├── t1.py
            ├── t2.py
            └── t3.py

        12 directories, 48 files`}
      </code>*/}

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
