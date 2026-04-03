import { useState, useEffect, useCallback } from "react";

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
  open: "#8a9a78",
  openBg: "#eef2e8",
  openBorder: "#c0ceb0",
  closed: "#9a7860",
  closedBg: "#f2ece4",
  closedBorder: "#c8b0a0",
};

// ─────────────────────────────────────────────────────────────
// Data: words with syllable breakdown for all three metres
// ─────────────────────────────────────────────────────────────
const DEMO_WORDS = [
  {
    word: "নদীতে",
    meaning: "in the river",
    syllables: [
      { text: "ন", roman: "no", type: "open" },
      { text: "দী", roman: "dī", type: "open" },
      { text: "তে", roman: "te", type: "open" },
    ],
  },
  {
    word: "আকাশ",
    meaning: "sky",
    syllables: [
      { text: "আ", roman: "ā", type: "open" },
      { text: "কাশ্", roman: "kāsh", type: "closed" },
    ],
  },
  {
    word: "সন্ধ্যায়",
    meaning: "in the evening",
    syllables: [
      { text: "সন্", roman: "shon", type: "closed" },
      { text: "ধ্যায়", roman: "dhyāy", type: "open" },
    ],
  },
  {
    word: "আনন্দে",
    meaning: "in joy",
    syllables: [
      { text: "আ", roman: "ā", type: "open" },
      { text: "নন্", roman: "non", type: "closed" },
      { text: "দে", roman: "de", type: "open" },
    ],
  },
  {
    word: "ঝর্ণায়",
    meaning: "at the waterfall",
    syllables: [
      { text: "ঝর্", roman: "jhor", type: "closed" },
      { text: "ণায়", roman: "nāy", type: "open" },
    ],
  },
];

const CHHONDOS = ["স্বরবৃত্ত", "মাত্রাবৃত্ত", "অক্ষরবৃত্ত"];

function getMatra(syl, chhondo, isWordFinal) {
  if (syl.type === "open") return 1;
  if (chhondo === "স্বরবৃত্ত") return 1;
  if (chhondo === "মাত্রাবৃত্ত") return 2;
  if (chhondo === "অক্ষরবৃত্ত") return isWordFinal ? 2 : 1;
  return 1;
}

// ─────────────────────────────────────────────────────────────
// Step definitions — what gets revealed in each step
// Steps: 0=word, 1=split, 2=classify, 3=assign, 4=total
// ─────────────────────────────────────────────────────────────

// Pipeline stage arrow component
function Arrow({ visible }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.35s ease",
        flexShrink: 0,
        marginTop: "0.2rem",
      }}
    >
      <div
        style={{
          width: "1px",
          flex: 1,
          background: C.border,
          minHeight: "24px",
        }}
      />
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: "5px solid transparent",
          borderRight: "5px solid transparent",
          borderTop: `6px solid ${C.accent}`,
          marginTop: "-1px",
        }}
      />
    </div>
  );
}

// Stage label
function StageLabel({ text, active }) {
  return (
    <div
      style={{
        fontFamily: MONO,
        fontSize: "0.58rem",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: active ? C.accentDark : C.muted,
        marginBottom: "0.5rem",
        transition: "color 0.3s ease",
      }}
    >
      {text}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Stage 0: raw word
// ─────────────────────────────────────────────────────────────
function StageWord({ wordData, visible }) {
  return (
    <div style={{ opacity: visible ? 1 : 0, transition: "opacity 0.4s ease" }}>
      <StageLabel text="1 · input word" active={visible} />
      <div
        style={{
          display: "inline-flex",
          alignItems: "baseline",
          gap: "0.75rem",
          padding: "0.75rem 1.25rem",
          border: `1.5px solid ${C.nodeBorder}`,
          borderRadius: "2px",
          background: C.nodeBg,
        }}
      >
        <span
          style={{
            fontFamily: SERIF,
            fontSize: "1.8rem",
            fontWeight: 600,
            color: C.dark,
            lineHeight: 1.1,
          }}
        >
          {wordData.word}
        </span>
        <span
          style={{
            fontFamily: SERIF,
            fontSize: "0.95rem",
            color: C.dim,
            fontStyle: "italic",
          }}
        >
          — {wordData.meaning}
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Stage 1: split into syllables
// ─────────────────────────────────────────────────────────────
function StageSplit({ syllables, visible }) {
  return (
    <div style={{ opacity: visible ? 1 : 0, transition: "opacity 0.4s ease" }}>
      <StageLabel text="2 · split into syllables" active={visible} />
      <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
        {syllables.map((syl, i) => (
          <div
            key={i}
            style={{
              padding: "0.5rem 0.75rem",
              border: `1px solid ${C.border}`,
              borderRadius: "2px",
              background: C.softBg,
              fontFamily: SERIF,
              fontSize: "1.25rem",
              color: C.text,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.15rem",
              opacity: visible ? 1 : 0,
              transform: visible ? "none" : "translateY(6px)",
              transition: `opacity 0.35s ease ${i * 0.1}s, transform 0.35s ease ${i * 0.1}s`,
            }}
          >
            {syl.text}
            <span
              style={{
                fontFamily: MONO,
                fontSize: "0.55rem",
                color: C.muted,
                letterSpacing: "0.04em",
              }}
            >
              {syl.roman}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Stage 2: classify open/closed
// ─────────────────────────────────────────────────────────────
function StageClassify({ syllables, visible }) {
  return (
    <div style={{ opacity: visible ? 1 : 0, transition: "opacity 0.4s ease" }}>
      <StageLabel text="3 · classify syllable type" active={visible} />
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        {syllables.map((syl, i) => {
          const isOpen = syl.type === "open";
          return (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.3rem",
                opacity: visible ? 1 : 0,
                transform: visible ? "none" : "translateY(6px)",
                transition: `opacity 0.35s ease ${i * 0.12}s, transform 0.35s ease ${i * 0.12}s`,
              }}
            >
              <div
                style={{
                  padding: "0.5rem 0.75rem",
                  border: `1.5px solid ${isOpen ? C.openBorder : C.closedBorder}`,
                  borderRadius: "2px",
                  background: isOpen ? C.openBg : C.closedBg,
                  fontFamily: SERIF,
                  fontSize: "1.25rem",
                  color: isOpen ? C.open : C.closed,
                  textAlign: "center",
                }}
              >
                {syl.text}
              </div>
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: "0.53rem",
                  color: isOpen ? C.open : C.closed,
                  letterSpacing: "0.03em",
                  whiteSpace: "nowrap",
                }}
              >
                {isOpen ? "মুক্তদল" : "রুদ্ধদল"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Stage 3: assign mātrā per syllable
// ─────────────────────────────────────────────────────────────
function StageAssign({ syllables, chhondo, visible }) {
  return (
    <div style={{ opacity: visible ? 1 : 0, transition: "opacity 0.4s ease" }}>
      <StageLabel text="4 · assign mātrā" active={visible} />
      <div
        style={{
          display: "flex",
          gap: "0.6rem",
          flexWrap: "wrap",
          alignItems: "flex-end",
        }}
      >
        {syllables.map((syl, i) => {
          const isOpen = syl.type === "open";
          const isWordFinal = i === syllables.length - 1;
          const matra = getMatra(syl, chhondo, isWordFinal);
          const isDouble = matra === 2;

          return (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.3rem",
                opacity: visible ? 1 : 0,
                transition: `opacity 0.4s ease ${i * 0.15}s`,
              }}
            >
              <div
                style={{
                  padding: "0.45rem 0.65rem",
                  border: `1.5px solid ${isOpen ? C.openBorder : C.closedBorder}`,
                  borderRadius: "2px",
                  background: isOpen ? C.openBg : C.closedBg,
                  fontFamily: SERIF,
                  fontSize: "1.1rem",
                  color: isOpen ? C.open : C.closed,
                  textAlign: "center",
                  minWidth: "40px",
                }}
              >
                {syl.text}
              </div>

              {/* Mātrā bar — 1 or 2 blocks */}
              <div style={{ display: "flex", gap: "2px" }}>
                {Array.from({ length: matra }).map((_, bi) => (
                  <div
                    key={bi}
                    style={{
                      width: "14px",
                      height: "14px",
                      borderRadius: "2px",
                      background: isDouble ? C.closedBg : C.nodeBg,
                      border: `1px solid ${isDouble ? C.closedBorder : C.nodeBorder}`,
                      opacity: visible ? 1 : 0,
                      transition: `opacity 0.35s ease ${i * 0.15 + bi * 0.08}s`,
                    }}
                  />
                ))}
              </div>

              {/* Numeral */}
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: "0.75rem",
                  fontWeight: isDouble ? "500" : "400",
                  color: isDouble ? C.closed : C.dim,
                }}
              >
                {matra}
              </span>
            </div>
          );
        })}

        {/* Sum */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.3rem",
            paddingLeft: "0.5rem",
            borderLeft: `1px solid ${C.border}`,
            marginLeft: "0.2rem",
            opacity: visible ? 1 : 0,
            transition: `opacity 0.5s ease ${syllables.length * 0.15 + 0.2}s`,
          }}
        >
          <span
            style={{ fontFamily: MONO, fontSize: "0.6rem", color: C.muted }}
          >
            sum
          </span>
          <span
            style={{
              fontFamily: MONO,
              fontSize: "1.4rem",
              fontWeight: "500",
              color: C.dark,
            }}
          >
            {syllables.reduce(
              (s, syl, i) =>
                s + getMatra(syl, chhondo, i === syllables.length - 1),
              0,
            )}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Stage 4: all-metres comparison table
// ─────────────────────────────────────────────────────────────
function StageTable({ wordData, visible }) {
  return (
    <div style={{ opacity: visible ? 1 : 0, transition: "opacity 0.4s ease" }}>
      <StageLabel text="5 · totalMatra across all metres" active={visible} />
      <div
        style={{
          border: `1px solid ${C.border}`,
          borderRadius: "2px",
          overflow: "hidden",
          display: "inline-block",
          minWidth: "280px",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr",
            background: C.nodeBg,
            borderBottom: `1px solid ${C.border}`,
          }}
        >
          {["syllable", "স্বরবৃত্ত", "মাত্রাবৃত্ত", "অক্ষরবৃত্ত"].map(
            (h, i) => (
              <div
                key={h}
                style={{
                  padding: "0.4rem 0.6rem",
                  fontFamily: MONO,
                  fontSize: "0.55rem",
                  letterSpacing: "0.06em",
                  color: C.dim,
                  borderRight: i < 3 ? `1px solid ${C.border}` : "none",
                  textAlign: i > 0 ? "center" : "left",
                }}
              >
                {h}
              </div>
            ),
          )}
        </div>

        {/* Rows */}
        {wordData.syllables.map((syl, i) => {
          const isWordFinal = i === wordData.syllables.length - 1;
          const matraVals = CHHONDOS.map((ch) =>
            getMatra(syl, ch, isWordFinal),
          );
          const isOpen = syl.type === "open";

          return (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr 1fr",
                borderBottom:
                  i < wordData.syllables.length - 1
                    ? `1px solid ${C.border}`
                    : "none",
                opacity: visible ? 1 : 0,
                transition: `opacity 0.35s ease ${i * 0.1 + 0.1}s`,
              }}
            >
              <div
                style={{
                  padding: "0.45rem 0.6rem",
                  fontFamily: SERIF,
                  fontSize: "1.05rem",
                  color: isOpen ? C.open : C.closed,
                  borderRight: `1px solid ${C.border}`,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem",
                }}
              >
                {syl.text}
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: "0.52rem",
                    color: C.muted,
                  }}
                >
                  {isOpen ? "○" : "●"}
                </span>
              </div>
              {matraVals.map((m, ci) => (
                <div
                  key={ci}
                  style={{
                    padding: "0.45rem 0.6rem",
                    fontFamily: MONO,
                    fontSize: "0.85rem",
                    fontWeight: m === 2 ? "500" : "400",
                    color: m === 2 ? C.closed : C.dim,
                    borderRight: ci < 2 ? `1px solid ${C.border}` : "none",
                    textAlign: "center",
                  }}
                >
                  {m}
                </div>
              ))}
            </div>
          );
        })}

        {/* Total row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr",
            background: "#f0e8d8",
            borderTop: `1px solid ${C.accent}`,
            opacity: visible ? 1 : 0,
            transition: `opacity 0.4s ease ${wordData.syllables.length * 0.1 + 0.3}s`,
          }}
        >
          <div
            style={{
              padding: "0.45rem 0.6rem",
              fontFamily: MONO,
              fontSize: "0.6rem",
              color: C.accentDark,
              letterSpacing: "0.06em",
              borderRight: `1px solid ${C.border}`,
            }}
          >
            total
          </div>
          {CHHONDOS.map((ch, ci) => {
            const total = wordData.syllables.reduce(
              (s, syl, i) =>
                s + getMatra(syl, ch, i === wordData.syllables.length - 1),
              0,
            );
            return (
              <div
                key={ci}
                style={{
                  padding: "0.45rem 0.6rem",
                  fontFamily: MONO,
                  fontSize: "0.9rem",
                  fontWeight: "500",
                  color: C.dark,
                  borderRight: ci < 2 ? `1px solid ${C.border}` : "none",
                  textAlign: "center",
                }}
              >
                {total}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main export — step-through pipeline animation
// ─────────────────────────────────────────────────────────────
const STEPS = 5; // 0..4

export function MatraAssignmentAnimation() {
  const [wordIdx, setWordIdx] = useState(0);
  const [chhondo, setChhondo] = useState("স্বরবৃত্ত");
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setEntered(true), 80);
    return () => clearTimeout(id);
  }, []);

  // auto-play
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setStep((s) => {
        if (s >= STEPS - 1) {
          setPlaying(false);
          return s;
        }
        return s + 1;
      });
    }, 950);
    return () => clearInterval(id);
  }, [playing]);

  const wordData = DEMO_WORDS[wordIdx];

  const handleWordChange = (i) => {
    setStep(0);
    setPlaying(false);
    setWordIdx(i);
  };

  const handlePlay = () => {
    if (step >= STEPS - 1) {
      setStep(0);
      setTimeout(() => setPlaying(true), 60);
    } else setPlaying((p) => !p);
  };

  const handleStep = (dir) => {
    setPlaying(false);
    setStep((s) => Math.max(0, Math.min(STEPS - 1, s + dir)));
  };

  return (
    <div
      style={{
        margin: "2.5rem 0",
        background: C.bg,
        border: `1px solid ${C.border}`,
        borderRadius: "2px",
        padding: "1.75rem 1.75rem 1.25rem",
        opacity: entered ? 1 : 0,
        transform: entered ? "none" : "translateY(6px)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
        userSelect: "none",
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          flexWrap: "wrap",
          marginBottom: "1.5rem",
        }}
      >
        {/* Word selector */}
        <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
          {DEMO_WORDS.map((w, i) => (
            <button
              key={w.word}
              onClick={() => handleWordChange(i)}
              style={{
                background: wordIdx === i ? C.nodeBg : "none",
                border: `1px solid ${wordIdx === i ? C.nodeBorder : C.border}`,
                borderRadius: "2px",
                cursor: "pointer",
                padding: "0.25rem 0.65rem",
                fontFamily: SERIF,
                fontSize: "1.0rem",
                color: wordIdx === i ? C.dark : C.dim,
                transition: "all 0.2s ease",
              }}
            >
              {w.word}
            </button>
          ))}
        </div>

        {/* Metre selector */}
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            gap: "0.35rem",
            flexWrap: "wrap",
          }}
        >
          {CHHONDOS.map((ch) => (
            <button
              key={ch}
              onClick={() => {
                setChhondo(ch);
              }}
              style={{
                background: chhondo === ch ? "#f0e8d8" : "none",
                border: `1px solid ${chhondo === ch ? C.accent : C.border}`,
                borderRadius: "2px",
                cursor: "pointer",
                padding: "0.25rem 0.6rem",
                fontFamily: MONO,
                fontSize: "0.6rem",
                letterSpacing: "0.04em",
                color: chhondo === ch ? C.accentDark : C.muted,
                transition: "all 0.2s ease",
              }}
            >
              {ch}
            </button>
          ))}
        </div>
      </div>

      {/* Pipeline stages — vertical stack with arrows */}
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        <StageWord wordData={wordData} visible={step >= 0} />
        <Arrow visible={step >= 1} />
        <StageSplit syllables={wordData.syllables} visible={step >= 1} />
        <Arrow visible={step >= 2} />
        <StageClassify syllables={wordData.syllables} visible={step >= 2} />
        <Arrow visible={step >= 3} />
        <StageAssign
          syllables={wordData.syllables}
          chhondo={chhondo}
          visible={step >= 3}
        />
        <Arrow visible={step >= 4} />
        <StageTable wordData={wordData} visible={step >= 4} />
      </div>

      {/* Controls */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.6rem",
          marginTop: "1.75rem",
          paddingTop: "1rem",
          borderTop: `1px solid ${C.border}`,
        }}
      >
        <button
          onClick={() => handleStep(-1)}
          disabled={step === 0}
          style={{
            background: "none",
            border: `1px solid ${C.nodeBorder}`,
            borderRadius: "2px",
            cursor: step === 0 ? "default" : "pointer",
            padding: "0.28rem 0.65rem",
            fontFamily: MONO,
            fontSize: "0.62rem",
            color: step === 0 ? C.muted : C.dim,
            opacity: step === 0 ? 0.4 : 1,
          }}
        >
          ← prev
        </button>

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
          {step >= STEPS - 1 ? "replay" : playing ? "pause" : "play"}
        </button>

        <button
          onClick={() => handleStep(1)}
          disabled={step >= STEPS - 1}
          style={{
            background: "none",
            border: `1px solid ${C.nodeBorder}`,
            borderRadius: "2px",
            cursor: step >= STEPS - 1 ? "default" : "pointer",
            padding: "0.28rem 0.65rem",
            fontFamily: MONO,
            fontSize: "0.62rem",
            color: step >= STEPS - 1 ? C.muted : C.dim,
            opacity: step >= STEPS - 1 ? 0.4 : 1,
          }}
        >
          next →
        </button>

        {/* Step indicators */}
        <div style={{ marginLeft: "auto", display: "flex", gap: "0.3rem" }}>
          {Array.from({ length: STEPS }).map((_, i) => (
            <div
              key={i}
              onClick={() => {
                setPlaying(false);
                setStep(i);
              }}
              style={{
                width: step === i ? "18px" : "6px",
                height: "6px",
                borderRadius: "3px",
                background: i <= step ? C.accentDark : C.border,
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
