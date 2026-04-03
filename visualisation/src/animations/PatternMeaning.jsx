import { useState, useRef, useCallback, useEffect } from "react";

// ─────────────────────────────────────────────────────────────
// Design tokens — inherits site palette
// ─────────────────────────────────────────────────────────────
const MONO = "'IBM Plex Mono', monospace";
const SERIF = "'Crimson Pro', Georgia, serif";

const C = {
  bg: "#faf8f4",
  border: "#e8e0d4",
  muted: "#b0a090",
  mutedBg: "#ede8df",
  text: "#3d3530",
  dim: "#9a8a78",
  accent: "#c8b89a",
  accentDark: "#8a7a68",
  gold: "#b8a070",
  darkText: "#2a2018",
  softBg: "#f5f0e8",
};

// ─────────────────────────────────────────────────────────────
// Spectrum content — what appears at each position
// ─────────────────────────────────────────────────────────────

const ZONES = [
  {
    // pure noise / pattern with no meaning
    range: [0, 0.18],
    label: "noise",
    sublabel: "Pure Pattern",
    desc: "Syllables fill the metre. Nothing is said.",
    sample: [
      { text: "কা খা গা ঘা  |  কা খা গা ঘা", role: "line" },
      { text: "না না নানা  |  না না নানা  |  না না", role: "line" },
      { text: "টা টা টাটা  |  টা টা টাটা  |  টাটা", role: "line" },
    ],
    note: "mātrā ✓   meaning ✗",
    noteOk: true,
    noteKo: true,
  },
  {
    // grammatical but arbitrary
    range: [0.18, 0.36],
    label: "grammar",
    sublabel: "Grammar Added",
    desc: "Nouns, verbs, adjectives — grammatically correct but arbitrary.",
    sample: [
      { text: "নীল  আকাশ  ঘুমায়  জল", role: "line" },
      { text: "লাল  মাঠে  পাখি  কাঁদে  ধান  ফুল", role: "line" },
      { text: "সবুজ  চাঁদ  হাসে  নদী  মেঘ  তারা", role: "line" },
    ],
    note: "mātrā ✓   grammar ✓   field ✗",
    noteOk: true,
    noteKo: true,
  },
  {
    // bounded scenario — semantic but still mechanical
    range: [0.36, 0.52],
    label: "semantic",
    sublabel: "Scenario Bounded",
    desc: "Words belong to a declared field — nature, cheerful, dawn. The arc is still missing.",
    sample: [
      { text: "সোনালি  আলো  ভাসে  নদী", role: "line" },
      { text: "পাতা  দোলে  মাঠে  বন", role: "line" },
      { text: "পাখির  সুর  ওঠে  ফুল", role: "line" },
    ],
    note: "mātrā ✓   field ✓   arc ✗",
    noteOk: true,
    noteKo: true,
  },
  {
    // the sweet spot — poetry
    range: [0.52, 0.68],
    label: "poetry",
    sublabel: "Poetry",
    desc: "Pattern and meaning held in tension. An arc from image to resolution.",
    sample: [
      { text: "সোনালি আকাশ ভাসে জল", role: "line-a" },
      { text: "পাতা দোলে মাঠে বন", role: "line-b" },
      { text: "পাখির সুর ওঠে ফুল", role: "line-a" },
      { text: "আনন্দে মন ভরে মন", role: "line-b" },
    ],
    note: "mātrā ✓   field ✓   arc ✓   rhyme ✓",
    noteOk: true,
    noteKo: false,
  },
  {
    // meaning-heavy, pattern slipping
    range: [0.68, 0.84],
    label: "vers libre",
    sublabel: "Pattern Slipping",
    desc: "Meaning intact, but the metre gives way. The ear loses its anchor.",
    sample: [
      { text: "সোনালি আলোয় ভেসে যায় নদীর জল", role: "line" },
      { text: "পাতা নড়ে, মাঠ জুড়ে বনের গন্ধ", role: "line" },
      { text: "পাখির ডাক ভোরের হাওয়ায় মিলে যায়", role: "line" },
    ],
    note: "mātrā ~   field ✓   meaning ✓",
    noteOk: false,
    noteKo: true,
  },
  {
    // pure prose
    range: [0.84, 1.0],
    label: "prose",
    sublabel: "Pure Meaning",
    desc: "The pattern is gone. Everything is said, nothing is held.",
    sample: [
      {
        text: "নদীর ধারে একটি পাখি বসে ছিল। ভোরের আলো এসে পড়েছিল গাছের পাতায়। মাঠের ওপর দিয়ে হাওয়া বইছিল।",
        role: "prose",
      },
    ],
    note: "mātrā ✗   meaning ✓",
    noteOk: false,
    noteKo: true,
  },
];

function getZone(t) {
  return ZONES.find((z) => t >= z.range[0] && t <= z.range[1]) ?? ZONES[3];
}

// lerp a hex color — simple enough for two endpoints
function lerpColor(a, b, t) {
  const ah = parseInt(a.slice(1), 16);
  const bh = parseInt(b.slice(1), 16);
  const ar = (ah >> 16) & 0xff,
    ag = (ah >> 8) & 0xff,
    ab = ah & 0xff;
  const br = (bh >> 16) & 0xff,
    bg = (bh >> 8) & 0xff,
    bb = bh & 0xff;
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl2 = Math.round(ab + (bb - ab) * t);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${bl2.toString(16).padStart(2, "0")}`;
}

// Track position (0..1) → accent color: dim at edges, warm gold at center
function trackColor(t) {
  const center = 0.6; // poetry sweet spot
  const dist = Math.abs(t - center);
  const warmth = Math.max(0, 1 - dist / 0.45);
  return lerpColor("#d4c8b8", "#b8a070", warmth);
}

// ─────────────────────────────────────────────────────────────
// Sample lines renderer
// ─────────────────────────────────────────────────────────────
function SampleLines({ zone, t }) {
  const isPoetry = zone.label === "poetry";

  return (
    <div
      style={{
        margin: "1.2rem 0 0.5rem",
        minHeight: "7rem",
        display: "flex",
        flexDirection: "column",
        gap: isPoetry ? "0.15rem" : "0.4rem",
        justifyContent: "center",
        transition: "opacity 0.3s ease",
      }}
    >
      {zone.sample.map((s, i) => {
        const isProse = s.role === "prose";
        const isLineA = s.role === "line-a";
        const isLineB = s.role === "line-b";

        return (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "0.75rem",
            }}
          >
            {isPoetry && (
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: "0.55rem",
                  color: isLineA ? C.accentDark : C.muted,
                  minWidth: "0.6rem",
                  letterSpacing: "0.04em",
                  opacity: 0.7,
                }}
              >
                {isLineA ? "A" : "B"}
              </span>
            )}
            <span
              style={{
                fontFamily: SERIF,
                fontSize: isProse ? "1.0rem" : "1.12rem",
                lineHeight: isProse ? 1.75 : 1.45,
                color: isPoetry
                  ? isLineA
                    ? C.darkText
                    : "#5a4e42"
                  : zone.label === "noise" || zone.label === "grammar"
                    ? C.dim
                    : C.text,
                letterSpacing: isProse ? "0" : "0.02em",
                fontStyle: isProse ? "normal" : "italic",
                transition: "color 0.3s ease",
              }}
            >
              {s.text}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Constraint badges
// ─────────────────────────────────────────────────────────────
const CONSTRAINTS = [
  {
    key: "mātrā",
    poetry: true,
    noise: true,
    grammar: true,
    semantic: true,
    "vers libre": "~",
    prose: false,
  },
  {
    key: "grammar",
    poetry: true,
    noise: false,
    grammar: true,
    semantic: true,
    "vers libre": true,
    prose: true,
  },
  {
    key: "field",
    poetry: true,
    noise: false,
    grammar: false,
    semantic: true,
    "vers libre": true,
    prose: true,
  },
  {
    key: "arc",
    poetry: true,
    noise: false,
    grammar: false,
    semantic: false,
    "vers libre": true,
    prose: true,
  },
  {
    key: "rhyme",
    poetry: true,
    noise: false,
    grammar: false,
    semantic: false,
    "vers libre": false,
    prose: false,
  },
];

function Badge({ label, state }) {
  // state: true = present, false = absent, "~" = partial
  const ok = state === true;
  const partial = state === "~";
  const ko = state === false;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.3rem",
        padding: "0.18rem 0.5rem",
        borderRadius: "2px",
        border: `1px solid ${ok ? C.accent : partial ? "#c8b89a88" : C.border}`,
        background: ok ? "#f0e8d8" : partial ? "#faf8f4" : C.bg,
        transition: "all 0.3s ease",
        opacity: ko ? 0.4 : 1,
      }}
    >
      <span
        style={{
          fontFamily: MONO,
          fontSize: "0.58rem",
          color: ok ? C.accentDark : partial ? C.dim : C.muted,
          letterSpacing: "0.04em",
        }}
      >
        {ok ? "✓" : partial ? "~" : "✗"}
      </span>
      <span
        style={{
          fontFamily: MONO,
          fontSize: "0.6rem",
          color: ok ? C.accentDark : C.muted,
          letterSpacing: "0.04em",
        }}
      >
        {label}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────
export function PatternMeaningSpectrum() {
  const [t, setT] = useState(0.6); // start at poetry sweet spot
  const trackRef = useRef(null);
  const dragging = useRef(false);
  const [entered, setEntered] = useState(false);

  // Fade-in on mount
  useEffect(() => {
    const id = setTimeout(() => setEntered(true), 80);
    return () => clearTimeout(id);
  }, []);

  const zone = getZone(t);

  const posFromEvent = useCallback((e) => {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const raw = (clientX - rect.left) / rect.width;
    setT(Math.max(0, Math.min(1, raw)));
  }, []);

  const onPointerDown = useCallback(
    (e) => {
      dragging.current = true;
      posFromEvent(e);
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [posFromEvent],
  );

  const onPointerMove = useCallback(
    (e) => {
      if (!dragging.current) return;
      posFromEvent(e);
    },
    [posFromEvent],
  );

  const onPointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  const thumbX = `${t * 100}%`;
  const isPoetry = zone.label === "poetry";

  // Constraint states for current zone
  const constraintStates = CONSTRAINTS.map((c) => ({
    key: c.key,
    state: c[zone.label] ?? false,
  }));

  return (
    <div
      style={{
        margin: "2.5rem 0",
        background: C.bg,
        border: `1px solid ${C.border}`,
        borderRadius: "2px",
        padding: "1.75rem 1.75rem 1.5rem",
        opacity: entered ? 1 : 0,
        transform: entered ? "none" : "translateY(6px)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
        userSelect: "none",
      }}
    >
      {/* Top labels */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "0.4rem",
        }}
      >
        {[
          { label: "noise", pos: "left" },
          { label: "poetry", pos: "center" },
          { label: "prose", pos: "right" },
        ].map(({ label, pos }) => (
          <span
            key={label}
            style={{
              fontFamily: MONO,
              fontSize: "0.58rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color:
                zone.label === label || (label === "poetry" && isPoetry)
                  ? C.accentDark
                  : C.muted,
              transition: "color 0.3s ease",
              textAlign:
                pos === "center"
                  ? "center"
                  : pos === "right"
                    ? "right"
                    : "left",
              flex: 1,
            }}
          >
            {label}
          </span>
        ))}
      </div>

      {/* Track */}
      <div
        ref={trackRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={{
          position: "relative",
          height: "32px",
          cursor: "ew-resize",
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* Track background */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            height: "2px",
            background: `linear-gradient(to right,
              ${C.border} 0%,
              ${C.border} 15%,
              ${C.accent} 52%,
              ${C.gold} 60%,
              ${C.accent} 68%,
              ${C.border} 85%,
              ${C.border} 100%
            )`,
            borderRadius: "1px",
          }}
        />

        {/* Poetry zone highlight */}
        <div
          style={{
            position: "absolute",
            left: "52%",
            width: "16%",
            height: "2px",
            background: C.gold,
            borderRadius: "1px",
            boxShadow: `0 0 6px ${C.gold}88`,
          }}
        />

        {/* Zone tick marks */}
        {ZONES.map((z, i) => {
          const x = ((z.range[0] + z.range[1]) / 2) * 100;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: `${x}%`,
                transform: "translateX(-50%)",
                width: "1px",
                height: "6px",
                background: C.border,
                top: "50%",
                marginTop: "-3px",
              }}
            />
          );
        })}

        {/* Thumb */}
        <div
          style={{
            position: "absolute",
            left: thumbX,
            transform: "translateX(-50%)",
            width: isPoetry ? "14px" : "10px",
            height: isPoetry ? "14px" : "10px",
            borderRadius: "50%",
            background: isPoetry ? C.gold : C.accentDark,
            border: `2px solid ${isPoetry ? "#2a2018" : C.accentDark}`,
            boxShadow: isPoetry
              ? `0 0 0 3px ${C.gold}44, 0 2px 8px ${C.gold}66`
              : "0 1px 4px rgba(0,0,0,0.15)",
            transition:
              "width 0.2s ease, height 0.2s ease, background 0.3s ease, box-shadow 0.3s ease",
            cursor: "ew-resize",
            zIndex: 2,
          }}
        />
      </div>

      {/* Zone label */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: "0.75rem",
          marginTop: "1.25rem",
          marginBottom: "0.4rem",
        }}
      >
        <span
          style={{
            fontFamily: MONO,
            fontSize: "0.65rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: isPoetry ? C.gold : C.dim,
            transition: "color 0.3s ease",
          }}
        >
          {zone.sublabel}
        </span>
        <span
          style={{
            fontFamily: SERIF,
            fontSize: "0.95rem",
            color: C.dim,
            fontStyle: "italic",
          }}
        >
          — {zone.desc}
        </span>
      </div>

      {/* Sample lines */}
      <SampleLines zone={zone} t={t} />

      {/* Constraint badges */}
      <div
        style={{
          display: "flex",
          gap: "0.4rem",
          flexWrap: "wrap",
          marginTop: "1.25rem",
          paddingTop: "1rem",
          borderTop: `1px solid ${C.border}`,
        }}
      >
        {constraintStates.map(({ key, state }) => (
          <Badge key={key} label={key} state={state} />
        ))}
      </div>

      {/* Footer hint */}
      <div
        style={{
          marginTop: "1rem",
          fontFamily: MONO,
          fontSize: "0.57rem",
          color: C.muted,
          letterSpacing: "0.06em",
          opacity: 0.7,
        }}
      >
        drag to explore the spectrum
      </div>
    </div>
  );
}
