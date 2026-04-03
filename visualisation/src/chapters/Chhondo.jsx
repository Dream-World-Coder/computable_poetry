import { SyllableVisualizer } from "../animations/SyllableVisualiser";
import { SectionLabel, P, H3, MatraBox } from "../components/components";

export function ChapterChhondo() {
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

      <SyllableVisualizer />

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
