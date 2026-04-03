import { useState, useEffect, useRef } from "react";
import "./App.css";

import { ChapterIntro } from "./chapters/Intro";
import { ChapterPoem } from "./chapters/Poem";
import { ChapterChhondo } from "./chapters/Chhondo";
import { ChapterProblem } from "./chapters/Problem";
import { ChapterPrerequisites } from "./chapters/Prerequisites";
import { ChapterArchitecture } from "./chapters/Architecture";
import { ChapterPipeline } from "./chapters/Pipeline";

import { Divider } from "./components/components";

const CHAPTERS = [
  { id: "intro", num: "00", title: "Computable Poetry" },
  { id: "poem", num: "01", title: "What is a Poem?" },
  { id: "chhondo", num: "02", title: "Bangla Prosody" },
  { id: "problem", num: "03", title: "The Problem" },
  { id: "prerequisites", num: "04", title: "Prerequisites" },
  { id: "architecture", num: "05", title: "The Architecture" },
  { id: "pipeline", num: "06", title: "The Pipeline" },
];

// hooks
// ─────────────────────────────────────────────

function useIsMobile(breakpoint = 680) {
  const [isMobile, setIsMobile] = useState(
    () => window.innerWidth < breakpoint,
  );
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [breakpoint]);
  return isMobile;
}

function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const observers = ids.map((id) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(id);
        },
        { rootMargin: "-30% 0px -60% 0px" },
      );
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach((o) => o && o.disconnect());
  }, [ids]);
  return active;
}

// mobile top bar + drawer nav
// ─────────────────────────────────────────────

function MobileNav({ chapters, active, onSelect }) {
  const [open, setOpen] = useState(false);
  const drawerRef = useRef(null);

  // Close drawer on outside tap
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [open]);

  const activeChapter = chapters.find((c) => c.id === active);

  const handleSelect = (id) => {
    setOpen(false);
    onSelect(id);
  };

  return (
    <>
      {/* Top bar */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "48px",
          background: "#fdf9f3",
          borderBottom: "1px solid #e8e0d4",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 1.25rem",
          zIndex: 200,
        }}
      >
        {/* Current chapter label */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "0.58rem",
              color: "#b0a090",
              letterSpacing: "0.08em",
            }}
          >
            {activeChapter?.num}
          </span>
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "0.62rem",
              color: "#5a4e42",
              letterSpacing: "0.04em",
            }}
          >
            {activeChapter?.title}
          </span>
        </div>

        {/* Hamburger */}
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle navigation"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "0.4rem",
            display: "flex",
            flexDirection: "column",
            gap: "5px",
          }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: open ? (i === 1 ? 0 : 20) : 20,
                height: "1px",
                background: "#8a7a68",
                transition: "all 0.2s ease",
                transformOrigin: "center",
                transform: open
                  ? i === 0
                    ? "translateY(6px) rotate(45deg)"
                    : i === 2
                      ? "translateY(-6px) rotate(-45deg)"
                      : "scaleX(0)"
                  : "none",
              }}
            />
          ))}
        </button>
      </div>

      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(30,24,16,0.18)",
          zIndex: 210,
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.2s ease",
        }}
      />

      {/* Drawer */}
      <nav
        ref={drawerRef}
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: "240px",
          height: "100vh",
          background: "#fdf9f3",
          borderLeft: "1px solid #e8e0d4",
          zIndex: 220,
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.25s ease",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "2rem 2rem",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "0.58rem",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#c4b8a8",
            marginBottom: "1.5rem",
          }}
        >
          Chapters
        </div>
        {chapters.map((c) => (
          <button
            key={c.id}
            onClick={() => handleSelect(c.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "0.55rem 0",
              textAlign: "left",
              width: "100%",
              borderBottom: "1px solid #f0ebe2",
            }}
          >
            <span
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: "0.58rem",
                color: active === c.id ? "#8a7a68" : "#c4b8a8",
                minWidth: "1.8rem",
                transition: "color 0.2s",
              }}
            >
              {c.num}
            </span>
            <span
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: "0.68rem",
                letterSpacing: "0.03em",
                color: active === c.id ? "#2a2018" : "#8a7a68",
                transition: "color 0.2s",
              }}
            >
              {c.title}
            </span>
            {active === c.id && (
              <div
                style={{
                  marginLeft: "auto",
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  background: "#c8b89a",
                  flexShrink: 0,
                }}
              />
            )}
          </button>
        ))}
      </nav>
    </>
  );
}

// Desktop sidebar nav
// ─────────────────────────────────────────────

function DesktopNav({ chapters, active, onSelect }) {
  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "200px",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "0 0 0 2rem",
        zIndex: 100,
        pointerEvents: "none",
      }}
    >
      <div style={{ pointerEvents: "auto" }}>
        {chapters.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "0.35rem 0",
              textAlign: "left",
              width: "100%",
            }}
          >
            <div
              style={{
                width: active === c.id ? 18 : 8,
                height: 1,
                background: active === c.id ? "#8a7a68" : "#d4c8b8",
                transition: "width 0.25s ease, background 0.25s ease",
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: "0.6rem",
                letterSpacing: "0.06em",
                color: active === c.id ? "#3d3530" : "#b0a090",
                transition: "color 0.25s ease",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "130px",
              }}
            >
              {c.title}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
}

export default function App() {
  const ids = CHAPTERS.map((c) => c.id);
  const active = useActiveSection(ids);
  const isMobile = useIsMobile();

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      {isMobile ? (
        <MobileNav chapters={CHAPTERS} active={active} onSelect={scrollTo} />
      ) : (
        <DesktopNav chapters={CHAPTERS} active={active} onSelect={scrollTo} />
      )}

      <main
        style={{
          marginLeft: isMobile ? 0 : "200px",
          maxWidth: isMobile ? "100%" : "768px",
          padding: isMobile ? "64px 1.25rem 3rem" : "0 3rem 0 2rem",
          minHeight: "100vh",
          boxSizing: "border-box",
        }}
      >
        <ChapterIntro />
        <Divider />
        <ChapterPoem />
        <Divider />
        <ChapterChhondo />
        <Divider />
        <ChapterProblem />
        <Divider />
        <ChapterPrerequisites />
        <Divider />
        <ChapterArchitecture />
        <Divider />
        <ChapterPipeline />
      </main>
    </>
  );
}
