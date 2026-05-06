// Keyboard shortcut help overlay (press ?).
function ShortcutsOverlay({ open, onClose }) {
  if (!open) return null;
  const groups = [
    {
      title: "Navigation",
      items: [
        ["g h", "Go to home"],
        ["g b", "Go to browse"],
        ["g c", "Go to compare"],
        ["g d", "Go to docs / contribute"],
        ["←", "Browser back"],
      ],
    },
    {
      title: "On the catalog",
      items: [
        ["/", "Focus search"],
        ["j / k", "Next / prev result"],
        ["Enter", "Open highlighted profile"],
        ["x", "Toggle compare on highlighted row"],
        ["c", "Open compare view"],
      ],
    },
    {
      title: "Always",
      items: [
        ["?", "Show this overlay"],
        ["Esc", "Close modals"],
      ],
    },
  ];
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(17,19,24,.55)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        zIndex: 110,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--paper)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          width: "min(560px, 100%)",
          padding: 28,
          boxShadow: "0 24px 60px -16px rgba(17,19,24,.32)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span className="eyebrow">keyboard shortcuts</span>
          <button onClick={onClose} aria-label="Close" style={{ font: "inherit", background: "transparent", border: 0, cursor: "pointer", fontSize: 22, color: "var(--muted)", lineHeight: 1 }}>×</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {groups.map((g) => (
            <div key={g.title}>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{g.title}</h3>
              <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", rowGap: 6, columnGap: 16 }}>
                {g.items.map(([keys, desc]) => (
                  <React.Fragment key={keys}>
                    <span style={{ display: "flex", gap: 4 }}>
                      {keys.split(" ").map((k, i) => (
                        <kbd key={i} style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 11,
                          padding: "2px 6px",
                          border: "1px solid var(--border)",
                          borderBottomWidth: 2,
                          borderRadius: 4,
                          background: "#fff",
                          color: "var(--ink)",
                          minWidth: 16,
                          textAlign: "center",
                        }}>{k}</kbd>
                      ))}
                    </span>
                    <span style={{ fontSize: 13, color: "var(--ink)" }}>{desc}</span>
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 20, lineHeight: 1.5 }}>
          Inspired by the TUI itself: a CLI registry deserves CLI ergonomics.
        </p>
      </div>
    </div>
  );
}

window.ShortcutsOverlay = ShortcutsOverlay;
