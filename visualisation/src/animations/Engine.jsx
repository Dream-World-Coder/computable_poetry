import { useState, useEffect, useRef } from "react";

const MONO = "'IBM Plex Mono', monospace";
const SERIF = "'Crimson Pro', Georgia, serif";

const C = {
  bg: "#faf8f4",
  bgDeep: "#f5f0e8",
  border: "#e8e0d4",
  nodeBg: "#ede8df",
  nodeBorder: "#d4c8b8",
  nodeText: "#7a6a58",
  labelMuted: "#b0a090",
  pathNode: "#5a4e42",
  pathNodeBg: "#d4c8b8",
  pathEdge: "#8a7a68",
  winning: "#3d3530",
  winningBg: "#c8b89a",
  resolved: "#b8a88a",
  resolvedBg: "#f0e8d8",
  accent: "#9a8060",
  text: "#2a2018",
  muted: "#9a8a78",
  // semantic slot colors
  slotNature: "#e8f0e4",
  slotNatureBorder: "#8aac7a",
  slotNatureText: "#3a6030",
  slotLight: "#f0ead8",
  slotLightBorder: "#c8a85a",
  slotLightText: "#7a5a18",
  slotMotion: "#e4ecf4",
  slotMotionBorder: "#7a9abc",
  slotMotionText: "#2a5a7a",
  slotSound: "#ede4f0",
  slotSoundBorder: "#9a7aac",
  slotSoundText: "#5a2a7a",
  slotEmotion: "#f4e4e4",
  slotEmotionBorder: "#bc7a7a",
  slotEmotionText: "#7a2a2a",
  slotDesc: "#e4f0ec",
  slotDescBorder: "#7aac9a",
  slotDescText: "#2a6050",
  slotConn: "#f0ede4",
  slotConnBorder: "#ac9a7a",
  slotConnText: "#5a4a2a",
};

// ─── Data ────────────────────────────────────────────────────

const PATTERN = [4, 4, 4, 2];
const CHHONDO = "স্বরবৃত্ত";

const TRAJECTORY = ["NATURE", "MOTION", "SOUND", "EMOTION"];

const FAMILY_COLOR = {
  NATURE: {
    bg: C.slotNature,
    border: C.slotNatureBorder,
    text: C.slotNatureText,
  },
  LIGHT: { bg: C.slotLight, border: C.slotLightBorder, text: C.slotLightText },
  MOTION: {
    bg: C.slotMotion,
    border: C.slotMotionBorder,
    text: C.slotMotionText,
  },
  SOUND: { bg: C.slotSound, border: C.slotSoundBorder, text: C.slotSoundText },
  EMOTION: {
    bg: C.slotEmotion,
    border: C.slotEmotionBorder,
    text: C.slotEmotionText,
  },
  DESCRIPTOR: {
    bg: C.slotDesc,
    border: C.slotDescBorder,
    text: C.slotDescText,
  },
  CONNECTOR: { bg: C.slotConn, border: C.slotConnBorder, text: C.slotConnText },
};

const TAG_COLOR = {
  DESC_COLOR: FAMILY_COLOR.DESCRIPTOR,
  DESC_TEXTURE: FAMILY_COLOR.DESCRIPTOR,
  DESC_SIZE: FAMILY_COLOR.DESCRIPTOR,
  NATURE_SKY: FAMILY_COLOR.NATURE,
  NATURE_WATER: FAMILY_COLOR.NATURE,
  NATURE_FLORA: FAMILY_COLOR.NATURE,
  NATURE_FAUNA: FAMILY_COLOR.NATURE,
  NATURE_EARTH: FAMILY_COLOR.NATURE,
  LIGHT_BRIGHT: FAMILY_COLOR.LIGHT,
  LIGHT_SOFT: FAMILY_COLOR.LIGHT,
  TIME_DAWN: FAMILY_COLOR.LIGHT,
  TIME_DAY: FAMILY_COLOR.LIGHT,
  TIME_DUSK: FAMILY_COLOR.LIGHT,
  MOTION_GENTLE: FAMILY_COLOR.MOTION,
  MOTION_VIVID: FAMILY_COLOR.MOTION,
  SOUND_NATURE: FAMILY_COLOR.SOUND,
  SOUND_HUMAN: FAMILY_COLOR.SOUND,
  EMOTION_JOY: FAMILY_COLOR.EMOTION,
  EMOTION_PEACE: FAMILY_COLOR.EMOTION,
  EMOTION_WONDER: FAMILY_COLOR.EMOTION,
  ACTOR_HUMAN: FAMILY_COLOR.EMOTION,
  ACTOR_ABSTRACT: FAMILY_COLOR.EMOTION,
  CONN_BRIDGE: FAMILY_COLOR.CONNECTOR,
};

const LINES = [
  {
    lineIdx: 0,
    family: "NATURE",
    isEven: false,
    production: [
      { tag: "DESC_COLOR", pos: "JJ", matra: 4 },
      { tag: "NATURE_SKY", pos: "NN", matra: 4 },
      { tag: "MOTION_GENTLE", pos: "VB", matra: 4 },
      { tag: "NATURE_WATER", pos: "NN", matra: 2 },
    ],
    words: ["সোনালি", "আকাশ", "ভাসে", "জল"],
    wordMatras: [4, 4, 4, 2],
    syllables: [["সো", "না", "লি"], ["আ", "কাশ্"], ["ভা", "সে"], ["জল্"]],
    rhymeSets: false,
    rhymeClass: "অ",
    rhymeWord: "জল",
  },
  {
    lineIdx: 1,
    family: "MOTION",
    isEven: true,
    production: [
      { tag: "NATURE_FLORA", pos: "NN", matra: 4 },
      { tag: "MOTION_GENTLE", pos: "VB", matra: 4 },
      { tag: "NATURE_WATER", pos: "NN", matra: 4 },
      { tag: "MOTION_VIVID", pos: "VB", matra: 2 },
    ],
    words: ["পাতারা", "দোলায়", "ঢেউয়ে", "বন"],
    wordMatras: [4, 4, 4, 2],
    syllables: [
      ["পা", "তা", "রা"],
      ["দো", "লা", "য়"],
      ["ঢেউ", "য়ে"],
      ["বন্"],
    ],
    rhymeSets: true,
    rhymeClass: "অ",
    rhymeWord: "বন",
    rhymeTarget: "অ",
  },
  {
    lineIdx: 2,
    family: "SOUND",
    isEven: false,
    production: [
      { tag: "NATURE_FAUNA", pos: "NN", matra: 4 },
      { tag: "SOUND_NATURE", pos: "NN", matra: 4 },
      { tag: "MOTION_GENTLE", pos: "VB", matra: 4 },
      { tag: "NATURE_FLORA", pos: "NN", matra: 2 },
    ],
    words: ["কোকিলের", "কূজন", "ভাসে", "বনে"],
    wordMatras: [4, 4, 4, 2],
    syllables: [
      ["কো", "কি", "লের্"],
      ["কূ", "জন্"],
      ["ভা", "সে"],
      ["ব", "নে"],
    ],
    rhymeSets: false,
    rhymeClass: "এ",
    rhymeWord: "বনে",
  },
  {
    lineIdx: 3,
    family: "EMOTION",
    isEven: true,
    production: [
      { tag: "EMOTION_JOY", pos: "NN", matra: 4 },
      { tag: "NATURE_FLORA", pos: "NN", matra: 4 },
      { tag: "MOTION_VIVID", pos: "VB", matra: 4 },
      { tag: "DESC_COLOR", pos: "JJ", matra: 2 },
    ],
    words: ["আনন্দে", "ফুল", "ফোটে", "সবুজে"],
    wordMatras: [4, 4, 4, 2],
    syllables: [["আ", "নন্", "দে"], ["ফুল্"], ["ফো", "টে"], ["স", "বু", "জে"]],
    rhymeSets: true,
    rhymeClass: "এ",
    rhymeWord: "সবুজে",
    rhymeTarget: "এ",
  },
];

// ─── Steps ───────────────────────────────────────────────────
// Each step describes what's visible/highlighted

function buildSteps() {
  const steps = [];

  // Step 0: Intro — show pattern + chhondo detection
  steps.push({
    type: "intro",
    label: "Parse input pattern",
    sub: `"4|4|4|2" → Chhondo: ${CHHONDO}`,
  });

  // Step 1: Dijkstra trajectory
  steps.push({
    type: "trajectory",
    label: "k-hop Dijkstra plans the field trajectory",
    sub: "NATURE → MOTION → SOUND → EMOTION  (globally optimal, cost=6)",
    revealUpTo: 0,
  });
  steps.push({
    type: "trajectory",
    label: "Trajectory locked",
    sub: "4 lines × semantic fields",
    revealUpTo: 3,
  });

  // For each line: CFG expand → slots → fill word by word
  for (let li = 0; li < LINES.length; li++) {
    const line = LINES[li];
    const fc = FAMILY_COLOR[line.family];

    steps.push({
      type: "cfg_expand",
      lineIdx: li,
      label: `CFG expands line ${li + 1}: ${line.family}`,
      sub: `Production chosen → ${PATTERN.length} slots for pattern ${PATTERN.join("|")}`,
    });

    for (let si = 0; si < line.production.length; si++) {
      const slot = line.production[si];
      const isRhyme = line.isEven && si === line.production.length - 1;
      steps.push({
        type: "slot_fill",
        lineIdx: li,
        slotIdx: si,
        isRhyme,
        label: `Pick word for slot ${si + 1}: tag=${slot.tag}, pos=${slot.pos}, mātrā=${slot.matra}`,
        sub: isRhyme
          ? `Rhyme constraint active: must end in "${line.rhymeTarget}" vowel sound`
          : `6-pass lookup: exact tag → sibling → cross-family (mātrā never relaxed)`,
      });
    }

    steps.push({
      type: "line_done",
      lineIdx: li,
      label: `Line ${li + 1} complete`,
      sub: line.isEven
        ? `Rhymes with line ${li} — ABAB scheme`
        : `Sets rhyme class "${line.rhymeClass}" for next line`,
    });
  }

  // Final step
  steps.push({
    type: "poem_done",
    label: "Poem generated",
    sub: "Metric ✓  Coherent arc ✓  ABAB rhyme ✓",
  });

  return steps;
}

const STEPS = buildSteps();
const TOTAL = STEPS.length;

// ─── Sub-components ──────────────────────────────────────────

function Tag({ children, color }) {
  const col = color || { bg: C.nodeBg, border: C.nodeBorder, text: C.nodeText };
  return (
    <span
      style={{
        display: "inline-block",
        padding: "0.05em 0.45em",
        background: col.bg,
        border: `1px solid ${col.border}`,
        borderRadius: "2px",
        fontFamily: MONO,
        fontSize: "0.68rem",
        color: col.text,
        letterSpacing: "0.02em",
        lineHeight: 1.4,
      }}
    >
      {children}
    </span>
  );
}

function MatraBar({ matra, max = 4 }) {
  return (
    <div style={{ display: "flex", gap: "2px", alignItems: "center" }}>
      {Array.from({ length: max }).map((_, i) => (
        <div
          key={i}
          style={{
            width: 6,
            height: 6,
            borderRadius: "1px",
            background: i < matra ? C.accent : C.border,
            flexShrink: 0,
          }}
        />
      ))}
    </div>
  );
}

function SlotCard({
  slot,
  word,
  syllables,
  isRhyme,
  filled,
  active,
  flash,
  matra,
}) {
  const tc = TAG_COLOR[slot.tag] || FAMILY_COLOR.NATURE;
  return (
    <div
      style={{
        border: `1px solid ${active ? tc.border : C.border}`,
        borderRadius: "2px",
        background: filled ? tc.bg : C.bg,
        padding: "0.6rem 0.75rem",
        flex: 1,
        minWidth: 0,
        transition: "all 0.3s ease",
        position: "relative",
        outline: flash ? `2px solid ${tc.border}` : "none",
        outlineOffset: "1px",
      }}
    >
      {isRhyme && (
        <div
          style={{
            position: "absolute",
            top: -1,
            right: -1,
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: C.resolved,
          }}
        />
      )}
      <div
        style={{
          fontFamily: MONO,
          fontSize: "0.56rem",
          color: active ? tc.text : C.labelMuted,
          marginBottom: "0.25rem",
          letterSpacing: "0.04em",
        }}
      >
        mātrā={slot.matra}
      </div>
      <Tag color={active ? tc : undefined}>{slot.tag}</Tag>
      <div
        style={{
          fontFamily: MONO,
          fontSize: "0.55rem",
          color: C.muted,
          marginTop: "0.2rem",
        }}
      >
        {slot.pos}
      </div>
      {filled && word && (
        <>
          <div
            style={{
              marginTop: "0.5rem",
              fontFamily: SERIF,
              fontSize: "1.05rem",
              color: tc.text,
              fontWeight: 600,
              letterSpacing: "0.02em",
            }}
          >
            {word}
          </div>
          <div
            style={{
              display: "flex",
              gap: "3px",
              marginTop: "0.25rem",
              flexWrap: "wrap",
            }}
          >
            {syllables &&
              syllables.map((syl, i) => (
                <span
                  key={i}
                  style={{
                    fontFamily: MONO,
                    fontSize: "0.55rem",
                    color: tc.border,
                    background: "#fff8",
                    padding: "0 3px",
                    borderRadius: "1px",
                  }}
                >
                  {syl}
                </span>
              ))}
          </div>
          <div style={{ marginTop: "0.3rem" }}>
            <MatraBar matra={slot.matra} max={4} />
          </div>
        </>
      )}
    </div>
  );
}

function LineRow({ line, step, currentLineIdx, completedLines }) {
  const isDone = completedLines.includes(line.lineIdx);
  const isActive = currentLineIdx === line.lineIdx;
  const fc = FAMILY_COLOR[line.family];

  const getSlotState = (si) => {
    if (!isActive && !isDone)
      return { filled: false, active: false, flash: false };
    if (isDone) return { filled: true, active: false, flash: false };
    if (step.type === "slot_fill" && step.lineIdx === line.lineIdx) {
      if (si < step.slotIdx)
        return { filled: true, active: false, flash: false };
      if (si === step.slotIdx)
        return { filled: false, active: true, flash: true };
      return { filled: false, active: false, flash: false };
    }
    if (step.type === "line_done" && step.lineIdx === line.lineIdx) {
      return { filled: true, active: false, flash: false };
    }
    if (step.type === "cfg_expand" && step.lineIdx === line.lineIdx) {
      return { filled: false, active: true, flash: false };
    }
    return { filled: false, active: false, flash: false };
  };

  if (!isActive && !isDone && step.type !== "poem_done") {
    return (
      <div
        style={{
          padding: "0.75rem 1rem",
          border: `1px solid ${C.border}`,
          borderRadius: "2px",
          background: C.bg,
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          opacity: 0.4,
        }}
      >
        <div
          style={{ fontFamily: MONO, fontSize: "0.6rem", color: C.labelMuted }}
        >
          Line {line.lineIdx + 1}
        </div>
        <div
          style={{
            padding: "0.1em 0.5em",
            background: fc.bg,
            border: `1px solid ${fc.border}`,
            borderRadius: "2px",
            fontFamily: MONO,
            fontSize: "0.6rem",
            color: fc.text,
          }}
        >
          {line.family}
        </div>
        <div
          style={{ fontFamily: MONO, fontSize: "0.6rem", color: C.labelMuted }}
        >
          waiting…
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        border: `1px solid ${isActive ? fc.border : isDone ? C.nodeBorder : C.border}`,
        borderRadius: "2px",
        background: isActive ? "#fff" : isDone ? C.bgDeep : C.bg,
        padding: "0.75rem",
        transition: "all 0.3s ease",
      }}
    >
      {/* Line header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.6rem",
          marginBottom: "0.6rem",
        }}
      >
        <div
          style={{ fontFamily: MONO, fontSize: "0.6rem", color: C.labelMuted }}
        >
          Line {line.lineIdx + 1}
        </div>
        <div
          style={{
            padding: "0.1em 0.5em",
            background: fc.bg,
            border: `1px solid ${fc.border}`,
            borderRadius: "2px",
            fontFamily: MONO,
            fontSize: "0.6rem",
            color: fc.text,
          }}
        >
          {line.family}
        </div>
        {line.isEven && (
          <div
            style={{
              fontFamily: MONO,
              fontSize: "0.55rem",
              color: C.resolved,
              marginLeft: "auto",
            }}
          >
            ◉ rhyme slot active
          </div>
        )}
        {isDone && !line.isEven && (
          <div
            style={{
              fontFamily: MONO,
              fontSize: "0.55rem",
              color: C.muted,
              marginLeft: "auto",
            }}
          >
            sets rhyme "{line.rhymeClass}"
          </div>
        )}
        {isDone && line.isEven && (
          <div
            style={{
              fontFamily: MONO,
              fontSize: "0.55rem",
              color: C.resolved,
              marginLeft: "auto",
            }}
          >
            ✓ rhymes "{line.rhymeTarget}"
          </div>
        )}
      </div>

      {/* Slots */}
      <div style={{ display: "flex", gap: "0.4rem" }}>
        {line.production.map((slot, si) => {
          const { filled, active, flash } = getSlotState(si);
          const isRhyme = line.isEven && si === line.production.length - 1;
          return (
            <SlotCard
              key={si}
              slot={slot}
              word={line.words[si]}
              syllables={line.syllables[si]}
              isRhyme={isRhyme}
              filled={filled}
              active={active}
              flash={flash}
              matra={slot.matra}
            />
          );
        })}
      </div>

      {/* Completed line text */}
      {isDone && (
        <div
          style={{
            marginTop: "0.6rem",
            padding: "0.5rem 0.75rem",
            background: C.nodeBg,
            borderRadius: "2px",
            display: "flex",
            alignItems: "baseline",
            gap: "0.75rem",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontFamily: SERIF,
              fontSize: "1.1rem",
              color: C.text,
              letterSpacing: "0.03em",
            }}
          >
            {line.words.join(" ")}
          </span>
          <span
            style={{ fontFamily: MONO, fontSize: "0.58rem", color: C.muted }}
          >
            mātrā: {line.wordMatras.join(" | ")}
          </span>
          {line.isEven && line.rhymeTarget && (
            <span
              style={{
                fontFamily: MONO,
                fontSize: "0.58rem",
                color: C.resolved,
              }}
            >
              ↑ rhymes ← "{line.rhymeWord}" ends in "{line.rhymeTarget}"
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function TrajectoryBar({ revealUpTo }) {
  return (
    <div
      style={{
        padding: "0.75rem 1rem",
        background: C.bgDeep,
        border: `1px solid ${C.border}`,
        borderRadius: "2px",
        marginBottom: "1rem",
      }}
    >
      <div
        style={{
          fontFamily: MONO,
          fontSize: "0.58rem",
          color: C.labelMuted,
          marginBottom: "0.5rem",
          letterSpacing: "0.08em",
        }}
      >
        FIELD TRAJECTORY — k-hop Dijkstra
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
          flexWrap: "wrap",
        }}
      >
        {TRAJECTORY.map((family, i) => {
          const fc = FAMILY_COLOR[family];
          const visible = revealUpTo >= i;
          return (
            <div
              key={family}
              style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
            >
              <div
                style={{
                  padding: "0.2em 0.6em",
                  background: visible ? fc.bg : C.nodeBg,
                  border: `1px solid ${visible ? fc.border : C.nodeBorder}`,
                  borderRadius: "2px",
                  fontFamily: MONO,
                  fontSize: "0.65rem",
                  color: visible ? fc.text : C.labelMuted,
                  transition: "all 0.4s ease",
                  opacity: visible ? 1 : 0.35,
                }}
              >
                {family}
              </div>
              {i < TRAJECTORY.length - 1 && (
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: "0.65rem",
                    color: visible ? C.accent : C.border,
                    transition: "color 0.4s ease",
                  }}
                >
                  →
                </div>
              )}
            </div>
          );
        })}
        <div
          style={{
            marginLeft: "auto",
            fontFamily: MONO,
            fontSize: "0.58rem",
            color: C.muted,
          }}
        >
          cost=6 ✓
        </div>
      </div>
    </div>
  );
}

function PatternBar() {
  return (
    <div
      style={{
        padding: "0.65rem 1rem",
        background: C.bgDeep,
        border: `1px solid ${C.border}`,
        borderRadius: "2px",
        marginBottom: "0.75rem",
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        flexWrap: "wrap",
      }}
    >
      <div>
        <div
          style={{
            fontFamily: MONO,
            fontSize: "0.55rem",
            color: C.labelMuted,
            marginBottom: "0.2rem",
          }}
        >
          PATTERN
        </div>
        <div style={{ fontFamily: MONO, fontSize: "0.75rem", color: C.text }}>
          4 | 4 | 4 | 2
        </div>
      </div>
      <div>
        <div
          style={{
            fontFamily: MONO,
            fontSize: "0.55rem",
            color: C.labelMuted,
            marginBottom: "0.2rem",
          }}
        >
          CHHONDO
        </div>
        <div style={{ fontFamily: SERIF, fontSize: "0.9rem", color: C.text }}>
          {CHHONDO}
        </div>
      </div>
      <div>
        <div
          style={{
            fontFamily: MONO,
            fontSize: "0.55rem",
            color: C.labelMuted,
            marginBottom: "0.2rem",
          }}
        >
          LINES
        </div>
        <div style={{ fontFamily: MONO, fontSize: "0.75rem", color: C.text }}>
          4
        </div>
      </div>
      <div>
        <div
          style={{
            fontFamily: MONO,
            fontSize: "0.55rem",
            color: C.labelMuted,
            marginBottom: "0.2rem",
          }}
        >
          RHYME
        </div>
        <div style={{ fontFamily: MONO, fontSize: "0.75rem", color: C.text }}>
          ABAB
        </div>
      </div>
    </div>
  );
}

function StatusBox({ step }) {
  const passLabels = [
    "Exact tag + POS + rhyme",
    "Exact tag + POS",
    "Exact tag (POS relaxed)",
    "Sibling tag + POS",
    "Sibling tag (POS relaxed)",
    "Cross-family fallback",
  ];

  if (step.type === "slot_fill") {
    return (
      <div
        style={{
          padding: "0.75rem 1rem",
          background: "#fff",
          border: `1px solid ${C.nodeBorder}`,
          borderRadius: "2px",
          marginTop: "0.75rem",
        }}
      >
        <div
          style={{
            fontFamily: MONO,
            fontSize: "0.58rem",
            color: C.labelMuted,
            marginBottom: "0.4rem",
            letterSpacing: "0.08em",
          }}
        >
          WORD PICKER — 6-PASS CONSTRAINT LOOKUP
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
          {passLabels.map((label, i) => (
            <div
              key={i}
              style={{
                padding: "0.15em 0.5em",
                background: i === 0 ? C.resolvedBg : C.nodeBg,
                border: `1px solid ${i === 0 ? C.resolved : C.nodeBorder}`,
                borderRadius: "2px",
                fontFamily: MONO,
                fontSize: "0.58rem",
                color: i === 0 ? C.resolved : C.muted,
              }}
            >
              {i + 1}. {label}
            </div>
          ))}
        </div>
        <div
          style={{
            marginTop: "0.5rem",
            fontFamily: MONO,
            fontSize: "0.6rem",
            color: C.accent,
          }}
        >
          mātrā constraint never relaxed at any pass
        </div>
      </div>
    );
  }

  return null;
}

function FinalPoem({ visible }) {
  if (!visible) return null;
  return (
    <div
      style={{
        marginTop: "1rem",
        padding: "1.25rem 1.5rem",
        background: C.bgDeep,
        border: `1px solid ${C.nodeBorder}`,
        borderRadius: "2px",
      }}
    >
      <div
        style={{
          fontFamily: MONO,
          fontSize: "0.58rem",
          color: C.labelMuted,
          marginBottom: "1rem",
          letterSpacing: "0.1em",
        }}
      >
        GENERATED POEM
      </div>
      {LINES.map((line, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: "1rem",
            marginBottom: "0.5rem",
          }}
        >
          <span
            style={{
              fontFamily: SERIF,
              fontSize: "1.15rem",
              color: C.text,
              letterSpacing: "0.04em",
            }}
          >
            {line.words.join(" ")}
          </span>
          <span
            style={{ fontFamily: MONO, fontSize: "0.58rem", color: C.muted }}
          >
            {line.wordMatras.join("+")}=
            {line.wordMatras.reduce((a, b) => a + b, 0)}
          </span>
          {line.isEven && (
            <span
              style={{
                fontFamily: MONO,
                fontSize: "0.58rem",
                color: C.resolved,
              }}
            >
              ← rhymes ✓
            </span>
          )}
        </div>
      ))}
      <div
        style={{
          marginTop: "1rem",
          paddingTop: "0.75rem",
          borderTop: `1px solid ${C.border}`,
          display: "flex",
          gap: "1.5rem",
          flexWrap: "wrap",
        }}
      >
        {["Metric ✓", "Coherent arc ✓", "ABAB rhyme ✓", "No ML ✓"].map((g) => (
          <div
            key={g}
            style={{ fontFamily: MONO, fontSize: "0.62rem", color: C.accent }}
          >
            {g}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────

export function PoemEngineAnimation() {
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef(null);

  const step = STEPS[stepIdx];

  // Derived state
  const showPattern = stepIdx >= 0;
  const trajectoryReveal =
    step.type === "trajectory"
      ? step.revealUpTo
      : stepIdx >=
          STEPS.findIndex((s) => s.type === "trajectory" && s.revealUpTo === 3)
        ? 3
        : -1;
  const showTrajectory = stepIdx >= 1;

  const currentLineIdx = step.lineIdx !== undefined ? step.lineIdx : null;

  const completedLines = LINES.filter((line) => {
    const doneStep = STEPS.findIndex(
      (s) => s.type === "line_done" && s.lineIdx === line.lineIdx,
    );
    return doneStep >= 0 && stepIdx > doneStep;
  }).map((l) => l.lineIdx);

  const showPoem = step.type === "poem_done";

  useEffect(() => {
    if (playing) {
      const delay =
        step.type === "line_done" || step.type === "poem_done" ? 1400 : 900;
      timerRef.current = setTimeout(() => {
        setStepIdx((s) => {
          if (s >= TOTAL - 1) {
            setPlaying(false);
            return s;
          }
          return s + 1;
        });
      }, delay);
    }
    return () => clearTimeout(timerRef.current);
  }, [playing, stepIdx]);

  const handlePlay = () => {
    if (stepIdx >= TOTAL - 1) {
      setStepIdx(0);
      setPlaying(true);
      return;
    }
    setPlaying((p) => !p);
  };

  const handleStep = (dir) => {
    setPlaying(false);
    setStepIdx((s) => Math.max(0, Math.min(TOTAL - 1, s + dir)));
  };

  return (
    <div
      style={{
        margin: "2.5rem 0",
        background: C.bg,
        border: `1px solid ${C.border}`,
        borderRadius: "2px",
        fontFamily: MONO,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "0.75rem 1rem",
          borderBottom: `1px solid ${C.border}`,
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          background: C.bgDeep,
        }}
      >
        <div
          style={{
            fontFamily: MONO,
            fontSize: "0.58rem",
            color: C.labelMuted,
            letterSpacing: "0.1em",
          }}
        >
          POEM ENGINE
        </div>
        <div
          style={{
            marginLeft: "auto",
            fontFamily: MONO,
            fontSize: "0.58rem",
            color: C.muted,
          }}
        >
          step {stepIdx + 1} / {TOTAL}
        </div>
      </div>

      <div style={{ padding: "1rem" }}>
        {/* Pattern row */}
        {showPattern && <PatternBar />}

        {/* Trajectory */}
        {showTrajectory && <TrajectoryBar revealUpTo={trajectoryReveal} />}

        {/* Lines */}
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        >
          {LINES.map((line) => (
            <LineRow
              key={line.lineIdx}
              line={line}
              step={step}
              currentLineIdx={currentLineIdx}
              completedLines={completedLines}
            />
          ))}
        </div>

        {/* Word picker detail */}
        <StatusBox step={step} />

        {/* Final poem */}
        <FinalPoem visible={showPoem} />

        {/* Step label */}
        <div
          style={{
            marginTop: "1rem",
            paddingTop: "0.75rem",
            borderTop: `1px solid ${C.border}`,
            minHeight: "3rem",
          }}
        >
          <div
            style={{
              fontFamily: MONO,
              fontSize: "0.7rem",
              color: showPoem ? C.winning : C.pathNode,
              fontWeight: showPoem ? "500" : "400",
              marginBottom: "0.2rem",
            }}
          >
            {step.label}
          </div>
          <div
            style={{
              fontFamily: SERIF,
              fontSize: "0.9rem",
              color: C.muted,
              lineHeight: 1.5,
            }}
          >
            {step.sub}
          </div>
        </div>

        {/* Controls */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            marginTop: "0.75rem",
          }}
        >
          <button
            onClick={() => handleStep(-1)}
            disabled={stepIdx === 0}
            style={{
              background: "none",
              border: `1px solid ${C.nodeBorder}`,
              borderRadius: "2px",
              cursor: stepIdx === 0 ? "default" : "pointer",
              padding: "0.3rem 0.7rem",
              fontFamily: MONO,
              fontSize: "0.65rem",
              color: stepIdx === 0 ? C.labelMuted : C.nodeText,
              opacity: stepIdx === 0 ? 0.4 : 1,
            }}
          >
            ← prev
          </button>

          <button
            onClick={handlePlay}
            style={{
              background: playing ? C.pathNodeBg : C.nodeBg,
              border: `1px solid ${playing ? C.pathEdge : C.nodeBorder}`,
              borderRadius: "2px",
              cursor: "pointer",
              padding: "0.3rem 1rem",
              fontFamily: MONO,
              fontSize: "0.65rem",
              color: playing ? C.pathNode : C.nodeText,
              minWidth: "4.5rem",
              textAlign: "center",
            }}
          >
            {stepIdx >= TOTAL - 1 ? "replay" : playing ? "pause" : "play"}
          </button>

          <button
            onClick={() => handleStep(1)}
            disabled={stepIdx >= TOTAL - 1}
            style={{
              background: "none",
              border: `1px solid ${C.nodeBorder}`,
              borderRadius: "2px",
              cursor: stepIdx >= TOTAL - 1 ? "default" : "pointer",
              padding: "0.3rem 0.7rem",
              fontFamily: MONO,
              fontSize: "0.65rem",
              color: stepIdx >= TOTAL - 1 ? C.labelMuted : C.nodeText,
              opacity: stepIdx >= TOTAL - 1 ? 0.4 : 1,
            }}
          >
            next →
          </button>

          {/* Progress pip track */}
          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              gap: "2px",
              alignItems: "center",
            }}
          >
            {Array.from({ length: TOTAL }).map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setPlaying(false);
                  setStepIdx(i);
                }}
                style={{
                  width: i === stepIdx ? 14 : 5,
                  height: 5,
                  borderRadius: "2px",
                  background: i <= stepIdx ? C.accent : C.border,
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  transition: "all 0.2s ease",
                  flexShrink: 0,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
