import { ThreeLayersDiagram } from "../animations/ThreeLayersDiagram";
import { Tag, Pull, SectionLabel, P, H3 } from "../components/components";

export function ChapterProblem() {
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

      <ThreeLayersDiagram />

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
