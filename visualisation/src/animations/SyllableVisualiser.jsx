import { useState, useEffect, useRef } from "react";

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
  // open syllable — warm sage
  open: "#8a9a78",
  openBg: "#eef2e8",
  openBorder: "#c0ceb0",
  // closed syllable — warm terracotta
  closed: "#9a7860",
  closedBg: "#f2ece4",
  closedBorder: "#c8b0a0",
};

// ─────────────────────────────────────────────────────────────
// Word data — syllable breakdown with type annotation
// ─────────────────────────────────────────────────────────────
// type: "open" = মুক্তদল, "closed" = রুদ্ধদল
const WORDS = [
  {
    word: "আকাশ",
    roman: "ā-kāsh",
    meaning: "sky",
    syllables: [
      { text: "আ", type: "open", roman: "ā" },
      { text: "কাশ্", type: "closed", roman: "kāsh" },
    ],
  },
  {
    word: "নদী",
    roman: "no-dī",
    meaning: "river",
    syllables: [
      { text: "ন", type: "open", roman: "no" },
      { text: "দী", type: "open", roman: "dī" },
    ],
  },
  {
    word: "পাতা",
    roman: "pā-tā",
    meaning: "leaf",
    syllables: [
      { text: "পা", type: "open", roman: "pā" },
      { text: "তা", type: "open", roman: "tā" },
    ],
  },
  {
    word: "সন্ধ্যা",
    roman: "shon-dhyā",
    meaning: "dusk",
    syllables: [
      { text: "সন্", type: "closed", roman: "shon" },
      { text: "ধ্যা", type: "open", roman: "dhyā" },
    ],
  },
  {
    word: "নদীতে",
    roman: "no-dī-te",
    meaning: "in the river",
    syllables: [
      { text: "ন", type: "open", roman: "no" },
      { text: "দী", type: "open", roman: "dī" },
      { text: "তে", type: "open", roman: "te" },
    ],
  },
  {
    word: "আনন্দ",
    roman: "ā-non-do",
    meaning: "joy",
    syllables: [
      { text: "আ", type: "open", roman: "ā" },
      { text: "নন্", type: "closed", roman: "non" },
      { text: "দ", type: "open", roman: "do" },
    ],
  },
];

// mātrā table for the three metres
// open → always 1
// closed → 1 (স্বরবৃত্ত), 2 (মাত্রাবৃত্ত), 1 or 2 (অক্ষরবৃত্ত, 2 if word-final)
function getMatra(syllable, chhondo, isWordFinal) {
  if (syllable.type === "open") return 1;
  if (chhondo === "স্বরবৃত্ত") return 1;
  if (chhondo === "মাত্রাবৃত্ত") return 2;
  if (chhondo === "অক্ষরবৃত্ত") return isWordFinal ? 2 : 1;
  return 1;
}

function getTotalMatra(syllables, chhondo) {
  return syllables.reduce((sum, syl, i) => {
    const isWordFinal = i === syllables.length - 1;
    return sum + getMatra(syl, chhondo, isWordFinal);
  }, 0);
}

// ─────────────────────────────────────────────────────────────
// Syllable pill
// ─────────────────────────────────────────────────────────────
function SyllablePill({ syl, chhondo, index, total, visible, delay }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!visible) {
      setShow(false);
      return;
    }
    const id = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(id);
  }, [visible, delay]);

  const isOpen = syl.type === "open";
  const isWordFinal = index === total - 1;
  const matra = getMatra(syl, chhondo, isWordFinal);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.4rem",
        opacity: show ? 1 : 0,
        transform: show ? "none" : "translateY(8px)",
        transition: "opacity 0.35s ease, transform 0.35s ease",
      }}
    >
      {/* Syllable box */}
      <div
        style={{
          position: "relative",
          minWidth: "48px",
          padding: "0.5rem 0.7rem",
          border: `1.5px solid ${isOpen ? C.openBorder : C.closedBorder}`,
          borderRadius: "2px",
          background: isOpen ? C.openBg : C.closedBg,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.25rem",
        }}
      >
        {/* Type badge — top-right corner */}
        <div
          style={{
            position: "absolute",
            top: "-1px",
            right: "-1px",
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: isOpen ? C.open : C.closed,
          }}
        />

        {/* Bengali glyph */}
        <span
          style={{
            fontFamily: SERIF,
            fontSize: "1.25rem",
            lineHeight: 1.2,
            color: isOpen ? C.open : C.closed,
            fontWeight: 600,
          }}
        >
          {syl.text}
        </span>

        {/* Roman */}
        <span
          style={{
            fontFamily: MONO,
            fontSize: "0.58rem",
            color: isOpen ? C.open : C.closed,
            opacity: 0.75,
            letterSpacing: "0.04em",
          }}
        >
          {syl.roman}
        </span>
      </div>

      {/* Mātrā bubble */}
      <div
        style={{
          width: "22px",
          height: "22px",
          borderRadius: "50%",
          background: matra === 2 ? C.closedBg : C.nodeBg,
          border: `1px solid ${matra === 2 ? C.closedBorder : C.nodeBorder}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: MONO,
          fontSize: "0.65rem",
          color: matra === 2 ? C.closed : C.dim,
          fontWeight: matra === 2 ? "500" : "400",
        }}
      >
        {matra}
      </div>

      {/* Type label */}
      <span
        style={{
          fontFamily: MONO,
          fontSize: "0.52rem",
          letterSpacing: "0.05em",
          color: isOpen ? C.open : C.closed,
          opacity: 0.85,
          whiteSpace: "nowrap",
        }}
      >
        {isOpen ? "মুক্তদল" : "রুদ্ধদল"}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Single word card
// ─────────────────────────────────────────────────────────────
function WordCard({ wordData, chhondo, active }) {
  const [pillsVisible, setPillsVisible] = useState(false);
  const [totalVisible, setTotalVisible] = useState(false);

  useEffect(() => {
    if (!active) {
      setPillsVisible(false);
      setTotalVisible(false);
      return;
    }
    const t1 = setTimeout(() => setPillsVisible(true), 120);
    const t2 = setTimeout(
      () => setTotalVisible(true),
      120 + wordData.syllables.length * 200 + 200,
    );
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [active, wordData.syllables.length]);

  const total = getTotalMatra(wordData.syllables, chhondo);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1.25rem",
      }}
    >
      {/* Word header */}
      <div style={{ display: "flex", alignItems: "baseline", gap: "0.9rem" }}>
        <span
          style={{
            fontFamily: SERIF,
            fontSize: "1.9rem",
            fontWeight: 600,
            color: C.dark,
            lineHeight: 1.1,
          }}
        >
          {wordData.word}
        </span>
        <span
          style={{
            fontFamily: MONO,
            fontSize: "0.65rem",
            color: C.muted,
            letterSpacing: "0.06em",
          }}
        >
          {wordData.roman}
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

      {/* Arrow + syllables */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        {/* Word bubble */}
        <div
          style={{
            padding: "0.4rem 0.9rem",
            border: `1px solid ${C.nodeBorder}`,
            borderRadius: "2px",
            background: C.nodeBg,
            fontFamily: SERIF,
            fontSize: "1.1rem",
            color: C.text,
          }}
        >
          {wordData.word}
        </div>

        {/* Arrow */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.2rem",
            opacity: pillsVisible ? 1 : 0,
            transition: "opacity 0.3s ease",
          }}
        >
          <div style={{ width: "20px", height: "1px", background: C.accent }} />
          <div
            style={{
              width: 0,
              height: 0,
              borderTop: "4px solid transparent",
              borderBottom: "4px solid transparent",
              borderLeft: `5px solid ${C.accent}`,
            }}
          />
        </div>

        {/* Syllable pills */}
        <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
          {wordData.syllables.map((syl, i) => (
            <SyllablePill
              key={i}
              syl={syl}
              chhondo={chhondo}
              index={i}
              total={wordData.syllables.length}
              visible={pillsVisible}
              delay={i * 180}
            />
          ))}
        </div>

        {/* Total mātrā */}
        {totalVisible && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.4rem 0.9rem",
              border: `1px solid ${C.accent}`,
              borderRadius: "2px",
              background: "#f0e8d8",
              opacity: totalVisible ? 1 : 0,
              transition: "opacity 0.4s ease",
            }}
          >
            <span
              style={{
                fontFamily: MONO,
                fontSize: "0.6rem",
                color: C.accentDark,
              }}
            >
              total
            </span>
            <span
              style={{
                fontFamily: MONO,
                fontSize: "1.0rem",
                fontWeight: "500",
                color: C.dark,
              }}
            >
              {total}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Metre selector tabs
// ─────────────────────────────────────────────────────────────
const CHHONDOS = [
  { key: "স্বরবৃত্ত", roman: "Swarabritto", rule: "All syllables = 1" },
  { key: "মাত্রাবৃত্ত", roman: "Matrabritto", rule: "Closed = 2, Open = 1" },
  {
    key: "অক্ষরবৃত্ত",
    roman: "Okkhorbritto",
    rule: "Closed at end = 2, else 1",
  },
];

function MetreTab({ ch, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? "#f0e8d8" : "none",
        border: `1px solid ${active ? C.accent : C.border}`,
        borderRadius: "2px",
        cursor: "pointer",
        padding: "0.4rem 0.9rem",
        textAlign: "left",
      }}
    >
      <div
        style={{
          fontFamily: SERIF,
          fontSize: "0.95rem",
          fontWeight: active ? 600 : 400,
          color: active ? C.dark : C.dim,
          marginBottom: "0.1rem",
          transition: "color 0.2s ease",
        }}
      >
        {ch.key}
      </div>
      <div
        style={{
          fontFamily: MONO,
          fontSize: "0.55rem",
          color: active ? C.accentDark : C.muted,
          letterSpacing: "0.06em",
          transition: "color 0.2s ease",
        }}
      >
        {ch.rule}
      </div>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// Legend
// ─────────────────────────────────────────────────────────────
function Legend() {
  return (
    <div
      style={{
        display: "flex",
        gap: "1.5rem",
        flexWrap: "wrap",
        padding: "0.75rem 0",
        borderTop: `1px solid ${C.border}`,
        marginTop: "0.5rem",
      }}
    >
      {[
        {
          color: C.open,
          bg: C.openBg,
          border: C.openBorder,
          label: "মুক্তদল — open syllable (vowel-ending)",
        },
        {
          color: C.closed,
          bg: C.closedBg,
          border: C.closedBorder,
          label: "রুদ্ধদল — closed syllable (consonant-ending)",
        },
      ].map(({ color, bg, border, label }) => (
        <div
          key={label}
          style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
        >
          <div
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "2px",
              background: bg,
              border: `1.5px solid ${border}`,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontFamily: MONO,
              fontSize: "0.6rem",
              color: C.dim,
              letterSpacing: "0.03em",
            }}
          >
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────────────────────
export function SyllableVisualizer() {
  const [wordIdx, setWordIdx] = useState(0);
  const [chhondo, setChhondo] = useState("স্বরবৃত্ত");
  const [active, setActive] = useState(false);
  const [entered, setEntered] = useState(false);

  // mount fade-in
  useEffect(() => {
    const id = setTimeout(() => {
      setEntered(true);
      setActive(true);
    }, 100);
    return () => clearTimeout(id);
  }, []);

  // reset animation when word or metre changes
  const handleWordChange = (i) => {
    setActive(false);
    setWordIdx(i);
    setTimeout(() => setActive(true), 80);
  };

  const handleChhondoChange = (key) => {
    setActive(false);
    setChhondo(key);
    setTimeout(() => setActive(true), 80);
  };

  const wordData = WORDS[wordIdx];

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
      }}
    >
      {/* Metre tabs */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          flexWrap: "wrap",
          marginBottom: "1.5rem",
        }}
      >
        {CHHONDOS.map((ch) => (
          <MetreTab
            key={ch.key}
            ch={ch}
            active={chhondo === ch.key}
            onClick={() => handleChhondoChange(ch.key)}
          />
        ))}
      </div>

      {/* Word picker */}
      <div
        style={{
          display: "flex",
          gap: "0.4rem",
          flexWrap: "wrap",
          marginBottom: "1.75rem",
        }}
      >
        {WORDS.map((w, i) => (
          <button
            key={w.word}
            onClick={() => handleWordChange(i)}
            style={{
              background: wordIdx === i ? C.nodeBg : "none",
              border: `1px solid ${wordIdx === i ? C.nodeBorder : C.border}`,
              borderRadius: "2px",
              cursor: "pointer",
              padding: "0.3rem 0.75rem",
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

      {/* Divider */}
      <div
        style={{ height: "1px", background: C.border, marginBottom: "1.5rem" }}
      />

      {/* Word card */}
      <WordCard wordData={wordData} chhondo={chhondo} active={active} />

      {/* Legend */}
      <Legend />

      {/* Mātrā rule reminder */}
      <div
        style={{
          marginTop: "0.75rem",
          fontFamily: MONO,
          fontSize: "0.6rem",
          color: C.muted,
          letterSpacing: "0.06em",
          opacity: 0.8,
        }}
      >
        {chhondo === "স্বরবৃত্ত" &&
          "স্বরবৃত্ত — every syllable = 1, open or closed"}
        {chhondo === "মাত্রাবৃত্ত" && "মাত্রাবৃত্ত — open = 1, closed = 2"}
        {chhondo === "অক্ষরবৃত্ত" &&
          "অক্ষরবৃত্ত — closed at word-end = 2, elsewhere = 1, open = 1"}
      </div>
    </div>
  );
}
