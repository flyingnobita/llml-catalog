// Profile detail page — fit verdict, import, facts grid, rationale, provenance, related.
function ProfileDetail({ id, openProfile, setRoute }) {
  const p = PROFILES.find((x) => x.id === id) || PROFILES[0];
  return (
    <div>
      <section style={{ borderBottom: "1px solid var(--border)", padding: "40px 32px 32px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 360px", gap: 48 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <button
              onClick={() => setRoute("browse")}
              style={{ font: "inherit", background: "transparent", border: 0, padding: 0, cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--muted)", letterSpacing: ".08em", textTransform: "uppercase", textAlign: "left", width: "fit-content" }}
            >
              ← browse
            </button>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
              <h1 style={{ fontSize: 48, letterSpacing: "-0.01em" }}>{p.name}</h1>
              {p.verified && <UI.Badge tone="success">✓ Verified maintainer</UI.Badge>}
            </div>
            <p style={{ fontSize: 18, lineHeight: 1.5, maxWidth: "60ch" }}>{p.fit}</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
              <UI.Badge tone="fill">{p.backend}</UI.Badge>
              <UI.Badge tone="fill">{p.hardware}</UI.Badge>
              <UI.Badge>{p.os}</UI.Badge>
              <UI.Badge>{p.useCase}</UI.Badge>
              <UI.Badge tone="info">Updated {p.updated}</UI.Badge>
            </div>
          </div>
          <aside style={{ display: "flex", flexDirection: "column", gap: 14, paddingTop: 32 }}>
            <span className="eyebrow">Import</span>
            <UI.ImportBlock cmd={p.importCmd} />
            <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>
              Runs <code className="mono">llml import</code> against the canonical TOML file. The profile attaches to your local model on next launch (press <code className="mono">p</code> in the TUI).
            </p>
          </aside>
        </div>
      </section>

      <section style={{ borderBottom: "1px solid var(--border)", padding: "32px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 16, padding: "0" }}>
            <UI.MetaCell label="Model" value={p.name.split(" — ")[0].split(" Profile")[0]} />
            <UI.MetaCell label="Backend" value={p.backend} />
            <UI.MetaCell label="Hardware" value={p.hardware} />
            <UI.MetaCell label="Use case" value={p.useCase} />
            <UI.MetaCell label="Maintainer" value={p.maintainer} />
            <UI.MetaCell label="Last updated" value={p.updated} />
          </div>
        </div>
      </section>

      <section style={{ padding: "48px 32px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 360px", gap: 64 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            <div>
              <h2 style={{ fontSize: 30, letterSpacing: "-0.01em", marginBottom: 12 }}>Why this profile exists</h2>
              <p style={{ fontSize: 16, lineHeight: 1.6, maxWidth: "60ch" }}>{p.rationale}</p>
            </div>
            <div>
              <h3 style={{ fontSize: 18, marginBottom: 12 }}>Launch configuration</h3>
              <div style={{ background: "var(--paper-2)", border: "1px solid var(--border)", borderRadius: 8, padding: 16, fontFamily: "var(--font-mono)", fontSize: 13 }}>
                <div style={{ color: "var(--muted)", marginBottom: 6 }}># args</div>
                {p.args.length > 0 ? p.args.map((a, i) => <div key={i}>{a}</div>) : <div style={{ color: "var(--muted)" }}>(none — backend defaults)</div>}
                {p.env.length > 0 && (
                  <>
                    <div style={{ color: "var(--muted)", margin: "12px 0 6px" }}># env</div>
                    {p.env.map((e, i) => (
                      <div key={i}>
                        {e.key}=<span style={{ color: "var(--primary)" }}>{e.value}</span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
            <div>
              <h3 style={{ fontSize: 18, marginBottom: 12 }}>Hardware assumptions</h3>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 15, lineHeight: 1.7 }}>
                <li>{p.hardware} — tested envelope</li>
                <li>{p.os} — backend installed and on PATH</li>
                <li>Backend: <code className="mono">{p.backend}</code> &gt;= current llml-supported version</li>
                <li>Profile assumes the model file is already on disk; <code className="mono">llml</code> supplies the path at launch</li>
              </ul>
            </div>
          </div>
          <aside style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 16, background: "#fff", display: "flex", flexDirection: "column", gap: 10 }}>
              <span className="eyebrow">Source provenance</span>
              <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", rowGap: 6, columnGap: 12, fontFamily: "var(--font-mono)", fontSize: 12 }}>
                <span style={{ color: "var(--muted)" }}>repo</span><span>flyingnobita/llml-profiles</span>
                <span style={{ color: "var(--muted)" }}>path</span><span>{p.repoPath}</span>
                <span style={{ color: "var(--muted)" }}>commit</span><span>{p.commit}</span>
                <span style={{ color: "var(--muted)" }}>maintainer</span><span>{p.maintainer}</span>
              </div>
              <a href="#" style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--primary)", borderBottom: "1px solid var(--primary)", width: "fit-content" }}>
                View on GitHub ↗
              </a>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <span className="eyebrow">Related profiles</span>
              {p.related.length === 0 && <span style={{ color: "var(--muted)", fontSize: 13 }}>No nearby alternatives yet.</span>}
              {p.related.map((rid) => {
                const r = PROFILES.find((x) => x.id === rid);
                if (!r) return null;
                return (
                  <button
                    key={rid}
                    onClick={() => openProfile(rid)}
                    style={{
                      font: "inherit", textAlign: "left", background: "transparent",
                      border: "1px solid var(--border)", borderRadius: 8, padding: 12, cursor: "pointer",
                      display: "flex", flexDirection: "column", gap: 4,
                    }}
                  >
                    <span style={{ fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 600 }}>{r.name}</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)" }}>
                      {r.backend} · {r.hardware}
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>
        </div>
      </section>
      <Footer />
    </div>
  );
}

window.ProfileDetail = ProfileDetail;
