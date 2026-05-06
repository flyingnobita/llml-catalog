// Compare screen — side-by-side profile comparison.
function Compare({ ids, openProfile, setRoute }) {
  const items = ids.map((id) => PROFILES.find((p) => p.id === id)).filter(Boolean);

  if (items.length === 0) {
    return (
      <section style={{ padding: "80px 32px", maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
        <span className="eyebrow">compare</span>
        <h1 style={{ fontSize: 40, letterSpacing: "-0.01em", marginTop: 8 }}>Nothing to compare yet</h1>
        <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.6, marginTop: 8 }}>
          Pick two or more profiles in <strong>Browse</strong> to see them side-by-side.
        </p>
        <div style={{ marginTop: 20 }}>
          <UI.Button onClick={() => setRoute("browse")}>Open browse →</UI.Button>
        </div>
      </section>
    );
  }

  // Build comparison rows. Each row is a tuple (label, value-fn) — value-fn(p) returns a string or JSX.
  const rows = [
    { label: "Backend", get: (p) => p.backend, mono: true },
    { label: "Hardware", get: (p) => p.hardware, mono: true },
    { label: "Operating system", get: (p) => p.os, mono: true },
    { label: "Use case", get: (p) => p.useCase, mono: false },
    { label: "Source", get: (p) => p.verified ? <span style={{ color: "var(--success)" }}>✓ Verified</span> : "Community", mono: true },
    { label: "Maintainer", get: (p) => p.maintainer, mono: true },
    { label: "Last updated", get: (p) => p.updated, mono: true },
    { label: "Args", get: (p) => p.args.length ? (
      <div style={{ display: "flex", flexDirection: "column", gap: 2, fontFamily: "var(--font-mono)", fontSize: 12 }}>
        {p.args.map((a, i) => <span key={i}>{a}</span>)}
      </div>
    ) : <span style={{ color: "var(--muted)" }}>—</span>, mono: false },
    { label: "Env", get: (p) => p.env.length ? (
      <div style={{ display: "flex", flexDirection: "column", gap: 2, fontFamily: "var(--font-mono)", fontSize: 12 }}>
        {p.env.map((e, i) => <span key={i}>{e.key}=<span style={{ color: "var(--primary)" }}>{e.value}</span></span>)}
      </div>
    ) : <span style={{ color: "var(--muted)" }}>—</span>, mono: false },
    { label: "Import command", get: (p) => (
      <code className="mono" style={{ fontSize: 12, color: "var(--ink)", wordBreak: "break-all" }}>{p.importCmd}</code>
    ), mono: false },
  ];

  // Highlight rows where values differ across all profiles.
  const isDifferent = (row) => {
    if (items.length < 2) return false;
    const seen = new Set();
    for (const p of items) {
      const v = row.get(p);
      // For JSX / lists, fall back to JSON-ish key.
      const key = typeof v === "string" ? v : JSON.stringify(p[row.label.toLowerCase()] || (row.label === "Source" ? p.verified : ""));
      seen.add(key);
      if (seen.size > 1) return true;
    }
    return false;
  };

  return (
    <div>
      <section style={{ borderBottom: "1px solid var(--border)", padding: "32px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", flexDirection: "column", gap: 12 }}>
          <button
            onClick={() => setRoute("browse")}
            style={{ font: "inherit", background: "transparent", border: 0, padding: 0, cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--muted)", letterSpacing: ".08em", textTransform: "uppercase", textAlign: "left", width: "fit-content" }}
          >
            ← back to browse
          </button>
          <span className="eyebrow">compare · {items.length} profile{items.length === 1 ? "" : "s"}</span>
          <h1 style={{ fontSize: 40, letterSpacing: "-0.01em" }}>Side-by-side</h1>
          <p style={{ color: "var(--muted)", fontSize: 15, maxWidth: "60ch" }}>
            Differences are highlighted. Pick the profile that fits best, then run its import command.
          </p>
        </div>
      </section>

      <section style={{ padding: "32px", maxWidth: 1280, margin: "0 auto" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: `180px repeat(${items.length}, minmax(0, 1fr))`,
          border: "1px solid var(--border)",
          borderRadius: 8,
          overflow: "hidden",
          background: "#fff",
        }}>
          {/* Header row — profile names */}
          <div style={{ background: "var(--paper-2)", borderBottom: "1px solid var(--border)", padding: "16px" }}></div>
          {items.map((p) => (
            <div key={p.id} style={{ background: "var(--paper-2)", borderBottom: "1px solid var(--border)", borderLeft: "1px solid var(--border)", padding: "16px", display: "flex", flexDirection: "column", gap: 6 }}>
              <button
                onClick={() => openProfile(p.id)}
                style={{ font: "inherit", background: "transparent", border: 0, padding: 0, textAlign: "left", cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 16, fontWeight: 600, color: "var(--ink)", lineHeight: 1.3 }}
              >
                {p.name}
              </button>
              <span style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--muted)", lineHeight: 1.4 }}>{p.fit}</span>
            </div>
          ))}

          {rows.map((row, ri) => {
            const diff = isDifferent(row);
            return (
              <React.Fragment key={row.label}>
                <div style={{
                  borderBottom: ri === rows.length - 1 ? 0 : "1px solid var(--border)",
                  padding: "14px 16px",
                  background: diff ? "rgba(47,107,255,.04)" : "transparent",
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "var(--muted)",
                  letterSpacing: ".08em",
                  textTransform: "uppercase",
                  display: "flex",
                  alignItems: "flex-start",
                  paddingTop: 16,
                }}>
                  {row.label}
                </div>
                {items.map((p) => (
                  <div key={p.id + row.label} style={{
                    borderBottom: ri === rows.length - 1 ? 0 : "1px solid var(--border)",
                    borderLeft: "1px solid var(--border)",
                    padding: "14px 16px",
                    background: diff ? "rgba(47,107,255,.04)" : "transparent",
                    fontFamily: row.mono ? "var(--font-mono)" : "var(--font-sans)",
                    fontSize: row.mono ? 13 : 14,
                    color: "var(--ink)",
                    lineHeight: 1.5,
                    minWidth: 0,
                    overflow: "hidden",
                  }}>
                    {row.get(p)}
                  </div>
                ))}
              </React.Fragment>
            );
          })}
        </div>

        <div style={{ marginTop: 24, display: "flex", gap: 12, justifyContent: "flex-end" }}>
          {items.map((p) => (
            <UI.Button key={p.id} onClick={() => openProfile(p.id)} variant="secondary">
              Open {p.name.split(" — ")[0]} →
            </UI.Button>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}

window.Compare = Compare;
