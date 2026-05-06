// Top navigation bar.
function Nav({ route, setRoute }) {
  const link = (key, label) => (
    <button
      onClick={() => setRoute(key)}
      style={{
        font: "inherit",
        fontFamily: "var(--font-sans)",
        fontSize: 14,
        fontWeight: 500,
        background: "transparent",
        border: 0,
        padding: "6px 2px",
        color: route === key ? "var(--ink)" : "var(--muted)",
        borderBottom: route === key ? "1px solid var(--ink)" : "1px solid transparent",
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );
  return (
    <header
      style={{
        borderBottom: "1px solid var(--border)",
        background: "var(--paper)",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "16px 32px",
          display: "flex",
          alignItems: "center",
          gap: 32,
        }}
      >
        <button
          onClick={() => setRoute("home")}
          style={{
            font: "inherit",
            background: "transparent",
            border: 0,
            cursor: "pointer",
            padding: 0,
            display: "flex",
            alignItems: "baseline",
            gap: 10,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontSize: 28,
              lineHeight: 1,
              letterSpacing: "-0.02em",
            }}
          >
            llml
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--muted)",
              letterSpacing: ".08em",
              textTransform: "uppercase",
            }}
          >
            profile catalog
          </span>
        </button>
        <nav style={{ display: "flex", gap: 24, marginLeft: 12 }}>
          {link("browse", "Browse Profiles")}
          {link("how", "How It Works")}
          {link("contribute", "Contribute")}
        </nav>
        <div style={{ marginLeft: "auto", display: "flex", gap: 12, alignItems: "center" }}>
          <a
            href="#"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              color: "var(--muted)",
              borderBottom: "1px solid transparent",
            }}
          >
            github.com/flyingnobita/llml ↗
          </a>
          <UI.Button variant="secondary" onClick={() => setRoute("browse")}>
            Browse
          </UI.Button>
        </div>
      </div>
    </header>
  );
}

window.Nav = Nav;
