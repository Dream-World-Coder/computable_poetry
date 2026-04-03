import { useState, useEffect } from "react";

// ─────────────────────────────────────────────────────────────
// Design tokens
// ─────────────────────────────────────────────────────────────
const MONO = "'IBM Plex Mono', monospace";
const SERIF = "'Crimson Pro', Georgia, serif";

const C = {
  bg: "#faf8f4",
  border: "#e8e0d4",
  softBg: "#f5f0e8",
  nodeBg: "#ede8df",
  nodeBorder: "#d4c8b8",
  muted: "#b0a090",
  dim: "#9a8a78",
  text: "#3d3530",
  dark: "#2a2018",
  accent: "#c8b89a",
  accentDark: "#8a7a68",
  gold: "#b8a070",
};

// ─────────────────────────────────────────────────────────────
// Layer data — each layer adds one constraint
// ─────────────────────────────────────────────────────────────
const LAYERS = [
  {
    num: "00",
    name: "Metre",
    tag: "mātrā match",
    rule: "Pattern: 4 | 4 | 4 | 2",
    ruleDetail:
      "Pick any word whose syllable count fills the parba weight. Domain, grammar, meaning — all unconstrained.",
    verdict: "Metrically correct. Says nothing.",
    verdictOk: false,
    lines: [
      [
        { word: "ভালো খেলা", gloss: "good · play" },
        { word: "কষ্ট বলা", gloss: "pain · say" },
        { word: "নেতা পথ", gloss: "leader · road" },
        { word: "রাত দিন", gloss: "night · day" },
      ],
      [
        { word: "মেলা তাই", gloss: "fair · so" },
        { word: "বাড়ি আলো", gloss: "home · light" },
        { word: "দেশ কাল", gloss: "land · time" },
        { word: "মন প্রাণ", gloss: "mind · soul" },
      ],
    ],
    metaLabel: "mātrā",
    metaRows: [
      ["4", "4", "4", "2"],
      ["4", "4", "4", "2"],
    ],
    color: C.muted,
    borderColor: C.nodeBorder,
    bgColor: C.nodeBg,
  },
  {
    num: "01",
    name: "Grammar",
    tag: "POS constraint",
    rule: "Slots:  JJ  →  NN  →  VB  →  NN",
    ruleDetail:
      "Each parba is assigned a part-of-speech. Adjective, Noun, Verb, Noun. Grammatically plausible — but word domain is still unrestricted.",
    verdict: "Grammatically plausible. Meaning is arbitrary.",
    verdictOk: false,
    lines: [
      [
        { word: "লাল বই", gloss: "red · book" },
        { word: "পড়ে রাজা", gloss: "reads · king" },
        { word: "নীল মাঠ", gloss: "blue · field" },
        { word: "কাঁদে তারা", gloss: "cries · star" },
      ],
      [
        { word: "সবুজ গান", gloss: "green · song" },
        { word: "গায় মেঘ", gloss: "sings · cloud" },
        { word: "ঠান্ডা রাত", gloss: "cold · night" },
        { word: "কাঁদে কবি", gloss: "cries · poet" },
      ],
    ],
    metaLabel: "POS",
    metaRows: [
      ["JJ · NN", "VB · NN", "JJ · NN", "VB · NN"],
      ["JJ · NN", "VB · NN", "JJ · NN", "VB · NN"],
    ],
    color: C.accentDark,
    borderColor: C.accent,
    bgColor: C.softBg,
  },
  {
    num: "02",
    name: "Semantics",
    tag: "scenario field",
    rule: "Field:  NATURE  ·  cheerful  ·  dawn",
    ruleDetail:
      "Every word must belong to the declared semantic scenario. Tags constrain each slot to NATURE_SKY, MOTION_GENTLE, NATURE_WATER, EMOTION_JOY — the poem now has a thematic arc.",
    verdict: "Thematically coherent. A poem.",
    verdictOk: true,
    lines: [
      [
        { word: "সোনালি আকাশ", gloss: "golden · sky" },
        { word: "ভাসে জল", gloss: "floats · water" },
        { word: "পাতা দোলে", gloss: "leaf · sways" },
        { word: "মাঠে বন", gloss: "field · forest" },
      ],
      [
        { word: "পাখির সুর", gloss: "bird's · song" },
        { word: "ওঠে ফুল", gloss: "rises · flower" },
        { word: "আনন্দ মন", gloss: "joy · mind" },
        { word: "ভরে আলো", gloss: "fills · light" },
      ],
    ],
    metaLabel: "TAG",
    metaRows: [
      ["DESC · SKY", "MOTION · WATER", "FLORA · MOTION", "EARTH · FLORA"],
      ["FAUNA · SOUND", "MOTION · FLORA", "EMOTION · ACTOR", "MOTION · LIGHT"],
    ],
    color: C.gold,
    borderColor: C.gold,
    bgColor: "#f0e8d8",
  },
];

// ─────────────────────────────────────────────────────────────
// Nested frames — the visual heart of the diagram
// Three rectangles nesting outward: Metre (inner) → Grammar → Semantics
// ─────────────────────────────────────────────────────────────
function NestedFrames({ activeLayer }) {
  // Rendered outermost-first so inner boxes sit on top
  const FRAME_DATA = [
    { label: "METRE", sub: "4 | 4 | 4 | 2", color: C.nodeBorder, bg: C.nodeBg },
    { label: "GRAMMAR", sub: "JJ  NN  VB  NN", color: C.accent, bg: C.softBg },
    {
      label: "SEMANTICS",
      sub: "NATURE · cheerful · dawn",
      color: C.gold,
      bg: "#f0e8d8",
    },
  ];

  const PAD = 20; // padding between frames in px

  return (
    <div
      style={{
        position: "relative",
        // Height grows with each frame — 3 frames × PAD each side + inner min
        minHeight: `${3 * PAD * 2 + 36}px`,
        margin: "1rem 0",
      }}
    >
      {/* Render outermost (index 2) first, then 1, then 0 on top */}
      {[2, 1, 0].map((i) => {
        const isVisible = i <= activeLayer;
        const isActive = i === activeLayer;
        const f = FRAME_DATA[i];
        const inset = (2 - i) * PAD;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: `${inset}px`,
              left: `${inset}px`,
              right: `${inset}px`,
              bottom: `${inset}px`,
              border: `${isActive ? 2 : 1}px solid ${isVisible ? f.color : C.border}`,
              borderRadius: "2px",
              background: isVisible ? f.bg : "transparent",
              opacity: isVisible ? 1 : 0,
              transition:
                "opacity 0.45s ease, border-color 0.35s ease, background 0.35s ease",
            }}
          >
            {/* Label tab */}
            {isVisible && (
              <div
                style={{
                  position: "absolute",
                  top: "-1px",
                  left: "10px",
                  transform: "translateY(-50%)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  background: C.bg,
                  padding: "0 0.4rem",
                }}
              >
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: "0.55rem",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: f.color,
                    fontWeight: isActive ? "500" : "400",
                  }}
                >
                  {f.label}
                </span>
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: "0.5rem",
                    color: C.muted,
                    letterSpacing: "0.04em",
                  }}
                >
                  {f.sub}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Single word chip
// ─────────────────────────────────────────────────────────────
function WordChip({ chip, meta, color, borderColor, bgColor, delay, trigger }) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    setShown(false);
    const id = setTimeout(() => setShown(true), delay + 60);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger, delay]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.22rem",
        opacity: shown ? 1 : 0,
        transform: shown ? "none" : "translateY(5px)",
        transition: "opacity 0.32s ease, transform 0.32s ease",
      }}
    >
      {/* Word */}
      <div
        style={{
          padding: "0.4rem 0.6rem",
          border: `1px solid ${borderColor}`,
          borderRadius: "2px",
          background: bgColor,
          fontFamily: SERIF,
          fontSize: "1.0rem",
          color: C.dark,
          whiteSpace: "nowrap",
          lineHeight: 1.3,
        }}
      >
        {chip.word}
      </div>
      {/* Gloss */}
      <div
        style={{
          fontFamily: MONO,
          fontSize: "0.5rem",
          color: C.muted,
          letterSpacing: "0.03em",
          whiteSpace: "nowrap",
        }}
      >
        {chip.gloss}
      </div>
      {/* Meta badge */}
      <div
        style={{
          padding: "0.08rem 0.3rem",
          border: `1px solid ${borderColor}`,
          borderRadius: "2px",
          background: C.bg,
          fontFamily: MONO,
          fontSize: "0.48rem",
          color: color,
          letterSpacing: "0.03em",
          whiteSpace: "nowrap",
        }}
      >
        {meta}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Example output panel
// ─────────────────────────────────────────────────────────────
function ExamplePanel({ layer, trigger }) {
  return (
    <div style={{ marginTop: "1.25rem" }}>
      {/* Parba pattern ruler */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          marginBottom: "0.85rem",
        }}
      >
        <span
          style={{
            fontFamily: MONO,
            fontSize: "0.55rem",
            letterSpacing: "0.06em",
            color: C.muted,
            marginRight: "0.2rem",
          }}
        >
          pattern
        </span>
        {[4, 4, 4, 2].map((m, i) => (
          <div
            key={i}
            style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}
          >
            <div
              style={{
                width: `${m * 9}px`,
                height: "3px",
                borderRadius: "2px",
                background: layer.borderColor,
                opacity: 0.65,
                transition: "background 0.35s ease",
              }}
            />
            <span
              style={{ fontFamily: MONO, fontSize: "0.58rem", color: C.dim }}
            >
              {m}
            </span>
            {i < 3 && (
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: "0.55rem",
                  color: C.border,
                }}
              >
                |
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Lines */}
      {layer.lines.map((line, li) => (
        <div
          key={li}
          style={{
            display: "flex",
            gap: "0.35rem",
            alignItems: "flex-start",
            marginBottom: li < layer.lines.length - 1 ? "1rem" : 0,
            flexWrap: "wrap",
          }}
        >
          {/* Line index */}
          <span
            style={{
              fontFamily: MONO,
              fontSize: "0.52rem",
              color: C.muted,
              paddingTop: "0.5rem",
              minWidth: "0.8rem",
            }}
          >
            {li + 1}
          </span>

          {line.map((chip, ci) => (
            <div
              key={ci}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "0.35rem",
              }}
            >
              <WordChip
                chip={chip}
                meta={layer.metaRows[li]?.[ci] ?? ""}
                color={layer.color}
                borderColor={layer.borderColor}
                bgColor={layer.bgColor}
                delay={li * 80 + ci * 85}
                trigger={trigger}
              />
              {ci < line.length - 1 && (
                <div
                  style={{
                    width: "1px",
                    height: "28px",
                    background: C.border,
                    marginTop: "8px",
                    flexShrink: 0,
                  }}
                />
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────────────────────
export function ThreeLayersDiagram() {
  const [activeLayer, setActiveLayer] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [entered, setEntered] = useState(false);
  const [trigger, setTrigger] = useState(0); // bumped on layer change

  useEffect(() => {
    const id = setTimeout(() => setEntered(true), 80);
    return () => clearTimeout(id);
  }, []);

  // auto-play
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setActiveLayer((l) => {
        if (l >= LAYERS.length - 1) {
          setPlaying(false);
          return l;
        }
        const next = l + 1;
        setTrigger((t) => t + 1);
        return next;
      });
    }, 2400);
    return () => clearInterval(id);
  }, [playing]);

  const handlePlay = () => {
    if (activeLayer >= LAYERS.length - 1) {
      setActiveLayer(0);
      setTrigger((t) => t + 1);
      setTimeout(() => setPlaying(true), 80);
    } else {
      setPlaying((p) => !p);
    }
  };

  const handleStep = (dir) => {
    setPlaying(false);
    setActiveLayer((l) => {
      const next = Math.max(0, Math.min(LAYERS.length - 1, l + dir));
      if (next !== l) setTrigger((t) => t + 1);
      return next;
    });
  };

  const handleTabClick = (i) => {
    setPlaying(false);
    if (i !== activeLayer) {
      setTrigger((t) => t + 1);
      setActiveLayer(i);
    }
  };

  const layer = LAYERS[activeLayer];

  return (
    <div
      style={{
        margin: "2.5rem 0",
        background: C.bg,
        border: `1px solid ${C.border}`,
        borderRadius: "2px",
        padding: "1.5rem 1.5rem 1.25rem",
        opacity: entered ? 1 : 0,
        transform: entered ? "none" : "translateY(6px)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
        userSelect: "none",
      }}
    >
      {/* ── Tab row ── */}
      <div style={{ display: "flex", gap: "0.4rem", marginBottom: "1rem" }}>
        {LAYERS.map((l, i) => (
          <button
            key={i}
            onClick={() => handleTabClick(i)}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: "0.18rem",
              background: activeLayer === i ? l.bgColor : "none",
              border: `1px solid ${activeLayer === i ? l.borderColor : C.border}`,
              borderRadius: "2px",
              cursor: "pointer",
              padding: "0.45rem 0.75rem",
              transition: "all 0.25s ease",
              minWidth: 0,
            }}
          >
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
            >
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: "0.53rem",
                  color: activeLayer === i ? l.color : C.muted,
                  letterSpacing: "0.08em",
                  transition: "color 0.25s ease",
                }}
              >
                {l.num}
              </span>
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: "0.63rem",
                  color: activeLayer === i ? C.dark : C.dim,
                  fontWeight: activeLayer === i ? "500" : "400",
                  letterSpacing: "0.04em",
                  transition: "color 0.25s ease",
                }}
              >
                {l.name}
              </span>
            </div>
            <span
              style={{
                fontFamily: MONO,
                fontSize: "0.5rem",
                color: activeLayer === i ? l.color : C.muted,
                letterSpacing: "0.03em",
                opacity: 0.85,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: "100%",
                transition: "color 0.25s ease",
              }}
            >
              + {l.tag}
            </span>
          </button>
        ))}
      </div>

      {/* ── Nested frame diagram ── */}
      <NestedFrames activeLayer={activeLayer} />

      {/* ── Constraint rule box ── */}
      <div
        style={{
          padding: "0.7rem 1rem",
          background: layer.bgColor,
          border: `1px solid ${layer.borderColor}`,
          borderRadius: "2px",
          transition: "all 0.35s ease",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: "0.7rem",
            marginBottom: "0.3rem",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontFamily: MONO,
              fontSize: "0.58rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: layer.color,
              transition: "color 0.35s ease",
            }}
          >
            {layer.name}
          </span>
          <span
            style={{
              fontFamily: MONO,
              fontSize: "0.65rem",
              color: C.dark,
              letterSpacing: "0.04em",
            }}
          >
            {layer.rule}
          </span>
        </div>
        <p
          style={{
            fontFamily: SERIF,
            fontSize: "0.97rem",
            lineHeight: 1.7,
            color: C.text,
            margin: 0,
          }}
        >
          {layer.ruleDetail}
        </p>
      </div>

      {/* ── Example output ── */}
      <ExamplePanel layer={layer} trigger={trigger} />

      {/* ── Verdict ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.6rem",
          marginTop: "1.25rem",
          paddingTop: "0.9rem",
          borderTop: `1px solid ${C.border}`,
        }}
      >
        <div
          style={{
            width: "7px",
            height: "7px",
            borderRadius: "50%",
            background: layer.verdictOk ? C.gold : C.nodeBorder,
            flexShrink: 0,
            boxShadow: layer.verdictOk ? `0 0 0 3px ${C.gold}33` : "none",
            transition: "background 0.35s ease, box-shadow 0.35s ease",
          }}
        />
        <span
          style={{
            fontFamily: SERIF,
            fontSize: "1.05rem",
            fontStyle: "italic",
            color: layer.verdictOk ? C.dark : C.dim,
            transition: "color 0.35s ease",
          }}
        >
          {layer.verdict}
        </span>
      </div>

      {/* ── Controls ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          marginTop: "1rem",
          paddingTop: "0.9rem",
          borderTop: `1px solid ${C.border}`,
        }}
      >
        {[{ label: "← prev", dir: -1, disabled: activeLayer === 0 }].map(
          ({ label, dir, disabled }) => (
            <button
              key={label}
              onClick={() => handleStep(dir)}
              disabled={disabled}
              style={{
                background: "none",
                border: `1px solid ${C.nodeBorder}`,
                borderRadius: "2px",
                cursor: disabled ? "default" : "pointer",
                padding: "0.28rem 0.65rem",
                fontFamily: MONO,
                fontSize: "0.62rem",
                color: disabled ? C.muted : C.dim,
                opacity: disabled ? 0.4 : 1,
              }}
            >
              {label}
            </button>
          ),
        )}

        <button
          onClick={handlePlay}
          style={{
            background: playing ? C.nodeBg : "none",
            border: `1px solid ${playing ? C.nodeBorder : C.border}`,
            borderRadius: "2px",
            cursor: "pointer",
            padding: "0.28rem 0.9rem",
            fontFamily: MONO,
            fontSize: "0.62rem",
            color: playing ? C.text : C.dim,
            minWidth: "4rem",
            textAlign: "center",
          }}
        >
          {activeLayer >= LAYERS.length - 1
            ? "replay"
            : playing
              ? "pause"
              : "play"}
        </button>

        <button
          onClick={() => handleStep(1)}
          disabled={activeLayer >= LAYERS.length - 1}
          style={{
            background: "none",
            border: `1px solid ${C.nodeBorder}`,
            borderRadius: "2px",
            cursor: activeLayer >= LAYERS.length - 1 ? "default" : "pointer",
            padding: "0.28rem 0.65rem",
            fontFamily: MONO,
            fontSize: "0.62rem",
            color: activeLayer >= LAYERS.length - 1 ? C.muted : C.dim,
            opacity: activeLayer >= LAYERS.length - 1 ? 0.4 : 1,
          }}
        >
          next →
        </button>

        {/* Progress dots */}
        <div style={{ marginLeft: "auto", display: "flex", gap: "0.35rem" }}>
          {LAYERS.map((l, i) => (
            <div
              key={i}
              onClick={() => handleTabClick(i)}
              style={{
                width: activeLayer === i ? "20px" : "6px",
                height: "6px",
                borderRadius: "3px",
                background: i <= activeLayer ? l.borderColor : C.border,
                cursor: "pointer",
                transition: "width 0.25s ease, background 0.25s ease",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
