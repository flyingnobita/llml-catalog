// Reusable atoms.
const { useState } = React;

function Badge({ children, tone = "neutral", mono = true, style = {} }) {
  const tones = {
    neutral: { bg: "var(--paper)", fg: "var(--ink)", bd: "var(--border)" },
    fill:    { bg: "var(--paper-2)", fg: "var(--ink)", bd: "var(--border)" },
    success: { bg: "rgba(30,188,115,.12)", fg: "#136b41", bd: "rgba(30,188,115,.4)" },
    warning: { bg: "rgba(201,133,18,.12)", fg: "#7a510b", bd: "rgba(201,133,18,.4)" },
    error:   { bg: "rgba(216,75,69,.12)", fg: "#8a2e2a", bd: "rgba(216,75,69,.4)" },
    info:    { bg: "rgba(47,107,255,.10)", fg: "#1d4cc2", bd: "rgba(47,107,255,.4)" },
  };
  const t = tones[tone];
  return (
    <span
      style={{
        fontFamily: mono ? "var(--font-mono)" : "var(--font-sans)",
        fontSize: 12,
        background: t.bg,
        color: t.fg,
        border: `1px solid ${t.bd}`,
        padding: "3px 9px",
        borderRadius: 4,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
    </span>
  );
}

function Button({ children, variant = "primary", onClick, style = {}, disabled }) {
  const v = {
    primary: { bg: "var(--primary)", fg: "#fff", bd: "var(--primary)" },
    secondary: { bg: "transparent", fg: "var(--ink)", bd: "var(--border)" },
    dark: { bg: "var(--secondary)", fg: "var(--paper)", bd: "var(--secondary)" },
    ghost: { bg: "transparent", fg: "var(--ink)", bd: "transparent" },
  }[variant];
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        font: "inherit",
        fontFamily: "var(--font-sans)",
        fontSize: 14,
        fontWeight: 500,
        background: v.bg,
        color: v.fg,
        border: `1px solid ${v.bd}`,
        padding: "8px 14px",
        borderRadius: 8,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "background var(--d-short) var(--ease-move), transform var(--d-micro)",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

function MetaCell({ label, value }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          color: "var(--muted)",
          letterSpacing: ".08em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
      <span style={{ fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 600 }}>
        {value}
      </span>
    </div>
  );
}

function ImportBlock({ cmd }) {
  const [copied, setCopied] = useState(false);
  return (
    <div
      style={{
        display: "flex",
        background: "var(--secondary)",
        color: "var(--paper)",
        borderRadius: 8,
        overflow: "hidden",
        alignItems: "stretch",
        fontFamily: "var(--font-mono)",
        fontSize: 13,
      }}
    >
      <div
        style={{
          padding: "14px 16px",
          flex: 1,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        $ {cmd}
      </div>
      <button
        onClick={() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        }}
        style={{
          background: copied ? "var(--success)" : "transparent",
          color: copied ? "#0d2b1c" : "var(--paper)",
          border: 0,
          borderLeft: copied ? 0 : "1px solid #2C323D",
          padding: "0 18px",
          fontFamily: "var(--font-sans)",
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
          minWidth: 90,
          transition: "background var(--d-short) var(--ease-enter)",
        }}
      >
        {copied ? "✓ Copied" : "Copy"}
      </button>
    </div>
  );
}

window.UI = { Badge, Button, MetaCell, ImportBlock };
