import {
  Placeholder,
  Pull,
  SectionLabel,
  P,
  H3,
} from "../components/components";

export function ChapterPoem() {
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
