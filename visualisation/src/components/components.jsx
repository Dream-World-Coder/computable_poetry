// Code, Placeholder, Divider, Tag, Pull, SectionLabel, P, H3, MatraBox

export function Code({ children, lang = "" }) {
  return (
    <div
      style={{
        margin: "2rem 0",
        borderLeft: "2px solid #c8b89a",
        paddingLeft: "1.5rem",
      }}
    >
      {lang && (
        <div
          style={{
            fontSize: "0.65rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#9a8a78",
            marginBottom: "0.6rem",
            fontFamily: "'IBM Plex Mono', monospace",
          }}
        >
          {lang}
        </div>
      )}
      <pre
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: "0.78rem",
          lineHeight: 1.75,
          color: "#3d3530",
          background: "#f5f0e8",
          padding: "1.25rem 1.5rem",
          borderRadius: "2px",
          overflowX: "auto",
          margin: 0,
          whiteSpace: "pre",
        }}
      >
        {children}
      </pre>
    </div>
  );
}

export function Placeholder({ label, height = 200 }) {
  return (
    <div
      style={{
        margin: "2.5rem 0",
        height,
        border: "1px dashed #c4b8a8",
        borderRadius: "2px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem",
        background: "#faf8f4",
        color: "#b0a090",
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          border: "1px dashed #c4b8a8",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.9rem",
          color: "#c4b8a8",
        }}
      >
        +
      </div>
      <div
        style={{
          fontSize: "0.68rem",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          fontFamily: "'IBM Plex Mono', monospace",
        }}
      >
        {label}
      </div>
    </div>
  );
}

export function Divider() {
  return (
    <div
      style={{
        margin: "3.5rem 0",
        borderTop: "1px solid #e8e0d4",
      }}
    />
  );
}

export function Tag({ children }) {
  return (
    <span
      style={{
        display: "inline-block",
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: "0.72rem",
        background: "#ede8df",
        color: "#7a6a58",
        padding: "0.15em 0.55em",
        borderRadius: "2px",
        margin: "0 0.15em",
        letterSpacing: "0.04em",
      }}
    >
      {children}
    </span>
  );
}

export function Pull({ children }) {
  return (
    <blockquote
      style={{
        margin: "2.5rem 0",
        padding: "0 0 0 2rem",
        borderLeft: "3px solid #c8b89a",
        fontFamily: "'Crimson Pro', Georgia, serif",
        fontSize: "1.22rem",
        fontStyle: "italic",
        lineHeight: 1.65,
        color: "#5a4e42",
      }}
    >
      {children}
    </blockquote>
  );
}

export function SectionLabel({ num, title }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: "1rem",
        marginBottom: "2.5rem",
      }}
    >
      <span
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: "0.68rem",
          color: "#b0a090",
          letterSpacing: "0.1em",
          minWidth: "2rem",
        }}
      >
        {num}
      </span>
      <h2
        style={{
          fontFamily: "'Crimson Pro', Georgia, serif",
          fontSize: "1.7rem",
          fontWeight: 600,
          color: "#2a2018",
          margin: 0,
          letterSpacing: "-0.01em",
        }}
      >
        {title}
      </h2>
    </div>
  );
}

export function P({ children, style = {} }) {
  return (
    <p
      style={{
        fontFamily: "'Crimson Pro', Georgia, serif",
        fontSize: "1.05rem",
        lineHeight: 1.85,
        color: "#3d3530",
        margin: "0 0 1.2rem 0",
        ...style,
      }}
    >
      {children}
    </p>
  );
}

export function H3({ children }) {
  return (
    <h3
      style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: "0.75rem",
        fontWeight: 500,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "#9a8a78",
        margin: "2.5rem 0 0.9rem 0",
      }}
    >
      {children}
    </h3>
  );
}

export function MatraBox({ pattern, label }) {
  return (
    <div style={{ margin: "1.5rem 0" }}>
      <div
        style={{
          fontSize: "0.65rem",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          fontFamily: "'IBM Plex Mono', monospace",
          color: "#9a8a78",
          marginBottom: "0.7rem",
        }}
      >
        {label}
      </div>
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        {pattern.map((m, i) => (
          <div
            key={i}
            style={{
              width: m * 22,
              height: 36,
              background: "#ede8df",
              border: "1px solid #d4c8b8",
              borderRadius: "2px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "0.78rem",
              color: "#7a6a58",
            }}
          >
            {m}
          </div>
        ))}
      </div>
    </div>
  );
}
