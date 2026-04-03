import { useState, useEffect, useRef } from "react";

// ─────────────────────────────────────────────────────────────
// Design tokens — matches the site palette exactly
// ─────────────────────────────────────────────────────────────
const MONO = "'IBM Plex Mono', monospace";
const SERIF = "'Crimson Pro', Georgia, serif";

const C = {
  bg: "#faf8f4",
  border: "#e8e0d4",
  nodeBg: "#ede8df",
  nodeBorder: "#d4c8b8",
  nodeText: "#7a6a58",
  edgeFaint: "#e8e0d4",
  edgeActive: "#c8b89a",
  pathEdge: "#8a7a68",
  pathNode: "#5a4e42",
  pathNodeBg: "#d4c8b8",
  resolved: "#b8a88a", // gold tint for RESOLVED nodes
  resolvedBg: "#f0e8d8",
  rejected: "#c4b8a8",
  labelMuted: "#b0a090",
  costText: "#9a8a78",
  winning: "#3d3530",
  winningBg: "#c8b89a",
};

// ─────────────────────────────────────────────────────────────
// Data — the layered graph for a 4-line poem from NATURE
// ─────────────────────────────────────────────────────────────

// Which nodes appear at each layer (layer = line index 0–3)
// We show a representative subset — not all 9 families at every layer,
// just the ones that appear in the paths we want to illustrate.
const LAYERS = [
  // layer 0 — always NATURE (start)
  ["NATURE"],
  // layer 1 — neighbours reachable from NATURE
  ["LIGHT", "MOTION", "CONNECTOR", "TIME"],
  // layer 2 — reachable from those
  ["SOUND", "EMOTION", "MOTION", "LIGHT", "NATURE"],
  // layer 3 — must end in RESOLVED (EMOTION or SOUND)
  ["EMOTION", "SOUND", "MOTION", "NATURE"],
];

const RESOLVED_SET = new Set(["EMOTION", "SOUND"]);

// Edges: [fromLayer, fromNode, toLayer, toNode, cost]
const EDGES = [
  // from NATURE (layer 0)
  [0, "NATURE", 1, "LIGHT", 2],
  [0, "NATURE", 1, "MOTION", 2],
  [0, "NATURE", 1, "CONNECTOR", 1],
  [0, "NATURE", 1, "TIME", 2],

  // from LIGHT (layer 1)
  [1, "LIGHT", 2, "EMOTION", 2],
  [1, "LIGHT", 2, "SOUND", 3],
  [1, "LIGHT", 2, "NATURE", 2],

  // from MOTION (layer 1)
  [1, "MOTION", 2, "SOUND", 2],
  [1, "MOTION", 2, "NATURE", 2],
  [1, "MOTION", 2, "LIGHT", 3],

  // from CONNECTOR (layer 1)
  [1, "CONNECTOR", 2, "MOTION", 1],
  [1, "CONNECTOR", 2, "SOUND", 1],

  // from TIME (layer 1)
  [1, "TIME", 2, "NATURE", 2],
  [1, "TIME", 2, "LIGHT", 2],

  // from SOUND (layer 2)
  [2, "SOUND", 3, "EMOTION", 2],
  [2, "SOUND", 3, "SOUND", 3],
  [2, "SOUND", 3, "MOTION", 2],

  // from EMOTION (layer 2)
  [2, "EMOTION", 3, "SOUND", 2],
  [2, "EMOTION", 3, "EMOTION", 2],

  // from MOTION (layer 2)
  [2, "MOTION", 3, "SOUND", 2],
  [2, "MOTION", 3, "EMOTION", 4],
  [2, "MOTION", 3, "NATURE", 2],

  // from LIGHT (layer 2)
  [2, "LIGHT", 3, "EMOTION", 2],
  [2, "LIGHT", 3, "SOUND", 3],

  // from NATURE (layer 2)
  [2, "NATURE", 3, "EMOTION", 4],
  [2, "NATURE", 3, "SOUND", 2],
];

// The three paths to illustrate, in animation order
// Each step: { edges: [...edge key], nodes: [...[layer,node]], cost, label, status }
const PATHS = [
  {
    id: "path-a",
    edges: [
      [0, "NATURE", 1, "MOTION"],
      [1, "MOTION", 2, "SOUND"],
      [2, "SOUND", 3, "EMOTION"],
    ],
    cost: "2+2+2=6",
    label: "NATURE→MOTION→SOUND→EMOTION",
    status: "valid", // valid, ends in resolved
    costNum: 6,
  },
  {
    id: "path-b",
    edges: [
      [0, "NATURE", 1, "LIGHT"],
      [1, "LIGHT", 2, "EMOTION"],
      [2, "EMOTION", 3, "SOUND"],
    ],
    cost: "2+2+2=6",
    label: "NATURE→LIGHT→EMOTION→SOUND",
    status: "valid",
    costNum: 6,
  },
  {
    id: "path-c",
    edges: [
      [0, "NATURE", 1, "CONNECTOR"],
      [1, "CONNECTOR", 2, "MOTION"],
      [2, "MOTION", 3, "SOUND"], // ends in SOUND ✓ but cost=4, not 6
    ],
    cost: "1+1+2=4",
    label: "NATURE→CONNECTOR→MOTION→SOUND",
    status: "winner", // lowest cost among resolved-ending paths
    costNum: 4,
  },
];

// Animation steps
// step 0: idle — show all faint edges
// steps 1–3: draw path A edge by edge
// step 4: show path A complete, label "cost 6, valid"
// steps 5–7: draw path B
// step 8: path B complete
// steps 9–11: draw path C
// step 12: path C complete — winner highlight
const TOTAL_STEPS = 13;

function edgeKey(fl, fn, tl, tn) {
  return `${fl}:${fn}->${tl}:${tn}`;
}

// ─────────────────────────────────────────────────────────────
// Layout helpers — positions computed from layer/node index
// ─────────────────────────────────────────────────────────────

function getNodePos(layer, nodeIndex, totalInLayer, W, H) {
  const layerX = [0.08, 0.35, 0.62, 0.89]; // x fractions for layers 0–3
  const x = layerX[layer] * W;
  const spacing = H / (totalInLayer + 1);
  const y = spacing * (nodeIndex + 1);
  return { x, y };
}

function buildPositions(W, H) {
  const pos = {};
  LAYERS.forEach((nodes, li) => {
    nodes.forEach((n, ni) => {
      pos[`${li}:${n}`] = getNodePos(li, ni, nodes.length, W, H);
    });
  });
  return pos;
}

// ─────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────

export function LayeredGraphDiagram() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef(null);
  const containerRef = useRef(null);
  const [dims, setDims] = useState({ W: 560, H: 320 });

  // Responsive width
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      setDims({ W: w, H: Math.max(240, Math.round(w * 0.52)) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { W, H } = dims;
  const pos = buildPositions(W, H);

  // Auto-play
  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(() => {
        setStep((s) => {
          if (s >= TOTAL_STEPS - 1) {
            setPlaying(false);
            return s;
          }
          return s + 1;
        });
      }, 900);
    }
    return () => clearInterval(timerRef.current);
  }, [playing]);

  const handlePlay = () => {
    if (step >= TOTAL_STEPS - 1) {
      setStep(0);
      setTimeout(() => setPlaying(true), 50);
    } else {
      setPlaying((p) => !p);
    }
  };

  const handleStep = (dir) => {
    setPlaying(false);
    setStep((s) => Math.max(0, Math.min(TOTAL_STEPS - 1, s + dir)));
  };

  // Derive which path edges and nodes are active at this step
  // Steps 1–3: path A edges 0,1,2
  // Step 4: path A done
  // Steps 5–7: path B edges 0,1,2
  // Step 8: path B done
  // Steps 9–11: path C edges 0,1,2
  // Step 12: path C done (winner)

  function getPathState(pathIdx, edgeIdx) {
    // returns "active" | "done" | "winner" | "idle"
    const base = pathIdx * 4 + 1; // step where this path starts drawing
    if (step < base) return "idle";
    const edgeStep = base + edgeIdx;
    const doneStep = base + 3;
    if (step >= doneStep) {
      return PATHS[pathIdx].status === "winner" && step >= 12
        ? "winner"
        : "done";
    }
    if (step >= edgeStep) return "active";
    return "idle";
  }

  function edgeColor(fl, fn, tl, tn) {
    for (let pi = 0; pi < PATHS.length; pi++) {
      for (let ei = 0; ei < PATHS[pi].edges.length; ei++) {
        const [efl, efn, etl, etn] = PATHS[pi].edges[ei];
        if (efl === fl && efn === fn && etl === tl && etn === tn) {
          const s = getPathState(pi, ei);
          if (s === "winner") return C.winningBg;
          if (s === "active" || s === "done") return C.pathEdge;
          return C.edgeFaint;
        }
      }
    }
    return C.edgeFaint;
  }

  function edgeWidth(fl, fn, tl, tn) {
    for (let pi = 0; pi < PATHS.length; pi++) {
      for (let ei = 0; ei < PATHS[pi].edges.length; ei++) {
        const [efl, efn, etl, etn] = PATHS[pi].edges[ei];
        if (efl === fl && efn === fn && etl === tl && etn === tn) {
          const s = getPathState(pi, ei);
          if (s === "winner") return 2.5;
          if (s === "active" || s === "done") return 1.8;
          return 0.8;
        }
      }
    }
    return 0.8;
  }

  function nodeState(layer, name) {
    // check if this node is on an active/done path
    for (let pi = 0; pi < PATHS.length; pi++) {
      const base = pi * 4 + 1;
      if (step < base) continue;
      const nodesInPath = [
        [0, PATHS[pi].edges[0][1]],
        ...PATHS[pi].edges.map(([, , tl, tn]) => [tl, tn]),
      ];
      for (const [nl, nn] of nodesInPath) {
        if (nl === layer && nn === name) {
          const doneStep = base + 3;
          if (PATHS[pi].status === "winner" && step >= 12) return "winner";
          if (step >= doneStep) return "done";
          return "active";
        }
      }
    }
    return "idle";
  }

  // Which path label to show
  function getLabel() {
    if (step === 0) return { text: "Press play to trace the paths", sub: "" };
    if (step >= 1 && step <= 3)
      return {
        text: "Tracing path A…",
        sub: `NATURE → MOTION → SOUND → EMOTION`,
      };
    if (step === 4)
      return {
        text: "Path A complete",
        sub: `cost ${PATHS[0].cost} — valid (ends in EMOTION)`,
      };
    if (step >= 5 && step <= 7)
      return {
        text: "Tracing path B…",
        sub: `NATURE → LIGHT → EMOTION → SOUND`,
      };
    if (step === 8)
      return {
        text: "Path B complete",
        sub: `cost ${PATHS[1].cost} — valid (ends in SOUND)`,
      };
    if (step >= 9 && step <= 11)
      return {
        text: "Tracing path C…",
        sub: `NATURE → CONNECTOR → MOTION → SOUND`,
      };
    if (step === 12)
      return {
        text: "Path C wins",
        sub: `cost ${PATHS[2].cost} — lowest cost among resolved-ending paths`,
      };
    return { text: "", sub: "" };
  }

  const label = getLabel();
  const NODE_R = Math.max(18, Math.round(W * 0.036));
  const fontSize = Math.max(7, Math.round(W * 0.014));

  return (
    <div
      ref={containerRef}
      style={{
        margin: "2.5rem 0",
        background: C.bg,
        border: `1px solid ${C.border}`,
        borderRadius: "2px",
        padding: "1.5rem 1.5rem 1rem",
        userSelect: "none",
      }}
    >
      {/* Layer headers */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "0.5rem",
          paddingLeft: `${dims.W * 0.02}px`,
          paddingRight: `${dims.W * 0.04}px`,
        }}
      >
        {["Line 0\n(start)", "Line 1", "Line 2", "Line 3\n(end)"].map(
          (lbl, i) => (
            <div
              key={i}
              style={{
                fontFamily: MONO,
                fontSize: "0.58rem",
                color: C.labelMuted,
                letterSpacing: "0.06em",
                textAlign: "center",
                whiteSpace: "pre-line",
                lineHeight: 1.4,
                width: `${W * 0.22}px`,
                flexShrink: 0,
              }}
            >
              {lbl}
            </div>
          ),
        )}
      </div>

      {/* SVG diagram */}
      <svg
        width="100%"
        viewBox={`0 0 ${W} ${H}`}
        style={{ display: "block", overflow: "visible" }}
      >
        {/* Faint vertical layer lines */}
        {[0.08, 0.35, 0.62, 0.89].map((fx, i) => (
          <line
            key={i}
            x1={fx * W}
            y1={8}
            x2={fx * W}
            y2={H - 8}
            stroke={C.border}
            strokeWidth={0.5}
            strokeDasharray="3,4"
          />
        ))}

        {/* Edges */}
        {EDGES.map(([fl, fn, tl, tn, cost]) => {
          const from = pos[`${fl}:${fn}`];
          const to = pos[`${tl}:${tn}`];
          if (!from || !to) return null;
          const key = edgeKey(fl, fn, tl, tn);
          const col = edgeColor(fl, fn, tl, tn);
          const w = edgeWidth(fl, fn, tl, tn);

          // midpoint for cost label
          const mx = (from.x + to.x) / 2;
          const my = (from.y + to.y) / 2;
          const isHighlighted = w > 0.9;

          return (
            <g key={key}>
              <line
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke={col}
                strokeWidth={w}
                style={{
                  transition: "stroke 0.35s ease, stroke-width 0.35s ease",
                }}
              />
              {isHighlighted && (
                <text
                  x={mx}
                  y={my - 4}
                  textAnchor="middle"
                  style={{
                    fontFamily: MONO,
                    fontSize: `${fontSize}px`,
                    fill: col,
                    transition: "fill 0.35s ease",
                  }}
                >
                  {cost}
                </text>
              )}
            </g>
          );
        })}

        {/* Nodes */}
        {LAYERS.map((nodes, li) =>
          nodes.map((name) => {
            const p = pos[`${li}:${name}`];
            if (!p) return null;
            const ns = nodeState(li, name);
            const isResolved = RESOLVED_SET.has(name) && li === 3;
            const isWinner = ns === "winner";
            const isActive = ns === "active" || ns === "done";

            let bgFill = C.nodeBg;
            let borderCol = C.nodeBorder;
            let textCol = C.nodeText;

            if (isWinner) {
              bgFill = C.winningBg;
              borderCol = C.winning;
              textCol = C.winning;
            } else if (isActive) {
              bgFill = C.pathNodeBg;
              borderCol = C.pathEdge;
              textCol = C.pathNode;
            } else if (isResolved) {
              bgFill = C.resolvedBg;
              borderCol = C.resolved;
              textCol = C.resolved;
            }

            // Node is a rounded rect — compute label width
            const labelW = Math.max(
              NODE_R * 2.2,
              name.length * fontSize * 0.72 + 12,
            );

            return (
              <g key={`${li}:${name}`} style={{ transition: "all 0.35s ease" }}>
                <rect
                  x={p.x - labelW / 2}
                  y={p.y - NODE_R * 0.75}
                  width={labelW}
                  height={NODE_R * 1.5}
                  rx={2}
                  fill={bgFill}
                  stroke={borderCol}
                  strokeWidth={isWinner ? 1.5 : 1}
                  style={{ transition: "fill 0.35s ease, stroke 0.35s ease" }}
                />
                <text
                  x={p.x}
                  y={p.y + fontSize * 0.38}
                  textAnchor="middle"
                  style={{
                    fontFamily: MONO,
                    fontSize: `${fontSize}px`,
                    fill: textCol,
                    fontWeight: isWinner ? "500" : "400",
                    letterSpacing: "0.04em",
                    transition: "fill 0.35s ease",
                  }}
                >
                  {name}
                </text>
                {/* Small dot for resolved nodes */}
                {isResolved && !isWinner && (
                  <circle
                    cx={p.x + labelW / 2 - 5}
                    cy={p.y - NODE_R * 0.75 + 5}
                    r={2.5}
                    fill={C.resolved}
                  />
                )}
                {isWinner && (
                  <circle
                    cx={p.x + labelW / 2 - 5}
                    cy={p.y - NODE_R * 0.75 + 5}
                    r={2.5}
                    fill={C.winning}
                  />
                )}
              </g>
            );
          }),
        )}
      </svg>

      {/* Legend */}
      <div
        style={{
          display: "flex",
          gap: "1.5rem",
          flexWrap: "wrap",
          margin: "0.75rem 0 1rem",
        }}
      >
        {[
          { col: C.nodeBorder, bg: C.nodeBg, label: "field node" },
          { col: C.resolved, bg: C.resolvedBg, label: "resolved (valid end)" },
          { col: C.pathEdge, bg: C.pathNodeBg, label: "traced path" },
          { col: C.winning, bg: C.winningBg, label: "winning path" },
        ].map(({ col, bg, label: lbl }) => (
          <div
            key={lbl}
            style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
          >
            <div
              style={{
                width: 20,
                height: 10,
                background: bg,
                border: `1px solid ${col}`,
                borderRadius: "1px",
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontFamily: MONO,
                fontSize: "0.6rem",
                color: C.labelMuted,
                letterSpacing: "0.04em",
              }}
            >
              {lbl}
            </span>
          </div>
        ))}
      </div>

      {/* Status label */}
      <div
        style={{
          minHeight: "2.4rem",
          marginBottom: "1rem",
          borderTop: `1px solid ${C.border}`,
          paddingTop: "0.75rem",
        }}
      >
        <div
          style={{
            fontFamily: MONO,
            fontSize: "0.68rem",
            color: step === 12 ? C.winning : C.pathNode,
            letterSpacing: "0.04em",
            marginBottom: "0.2rem",
            fontWeight: step === 12 ? "500" : "400",
          }}
        >
          {label.text}
        </div>
        {label.sub && (
          <div
            style={{
              fontFamily: SERIF,
              fontSize: "0.88rem",
              color: C.costText,
              lineHeight: 1.5,
            }}
          >
            {label.sub}
          </div>
        )}
      </div>

      {/* Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        {/* Prev */}
        <button
          onClick={() => handleStep(-1)}
          disabled={step === 0}
          style={{
            background: "none",
            border: `1px solid ${C.nodeBorder}`,
            borderRadius: "2px",
            cursor: step === 0 ? "default" : "pointer",
            padding: "0.3rem 0.7rem",
            fontFamily: MONO,
            fontSize: "0.65rem",
            color: step === 0 ? C.labelMuted : C.nodeText,
            opacity: step === 0 ? 0.4 : 1,
          }}
        >
          ← prev
        </button>

        {/* Play/pause */}
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
          {step >= TOTAL_STEPS - 1 ? "replay" : playing ? "pause" : "play"}
        </button>

        {/* Next */}
        <button
          onClick={() => handleStep(1)}
          disabled={step >= TOTAL_STEPS - 1}
          style={{
            background: "none",
            border: `1px solid ${C.nodeBorder}`,
            borderRadius: "2px",
            cursor: step >= TOTAL_STEPS - 1 ? "default" : "pointer",
            padding: "0.3rem 0.7rem",
            fontFamily: MONO,
            fontSize: "0.65rem",
            color: step >= TOTAL_STEPS - 1 ? C.labelMuted : C.nodeText,
            opacity: step >= TOTAL_STEPS - 1 ? 0.4 : 1,
          }}
        >
          next →
        </button>

        {/* Step counter */}
        <span
          style={{
            fontFamily: MONO,
            fontSize: "0.58rem",
            color: C.labelMuted,
            marginLeft: "auto",
            letterSpacing: "0.06em",
          }}
        >
          {step + 1} / {TOTAL_STEPS}
        </span>
      </div>
    </div>
  );
}
