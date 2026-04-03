import { Divider, P } from "../components/components";

export function ChapterIntro() {
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
