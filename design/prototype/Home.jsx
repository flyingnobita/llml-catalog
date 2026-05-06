// Marketing home with hero, proof strip, how-it-works, sample cards, why-different, contribution CTA.
function HeroArtifact() {
  // Compact realistic search+result composition.
  return (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: 12,
        background: "#fff",
        overflow: "hidden",
        boxShadow: "0 1px 0 rgba(17,19,24,.04), 0 24px 60px -32px rgba(17,19,24,.18)",
      }}
    >
      <div style={{ padding: 16, borderBottom: "1px solid var(--border)", display: "flex", gap: 8, alignItems: "center" }}>
        <input
          defaultValue="qwen3 14b coding"
          style={{
            font: "inherit",
            flex: 1,
            padding: "8px 12px",
            border: "1px solid var(--border)",
            borderRadius: 8,
            background: "var(--paper)",
          }}
        />
        <UI.Badge tone="info" mono={false}>backend: koboldcpp</UI.Badge>
        <UI.Badge tone="fill">24GB NVIDIA</UI.Badge>
      </div>
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        {[PROFILES[0], PROFILES[1]].map((p) => (
          <div
            key={p.id}
            style={{
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: "12px 14px",
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8, flexWrap: "wrap" }}>
                <strong style={{ fontFamily: "var(--font-sans)", fontSize: 15, flex: "1 1 auto", minWidth: 0 }}>{p.name}</strong>
                {p.verified && <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--success)", flex: "0 0 auto", whiteSpace: "nowrap" }}>✓ Verified</span>}
              </div>
              <div style={{ fontSize: 13, color: "var(--ink)", marginTop: 2 }}>{p.fit}</div>
              <div style={{ display: "flex", gap: 10, fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)", marginTop: 6 }}>
                <span>{p.backend}</span><span>·</span><span>{p.hardware}</span><span>·</span><span>{p.os}</span><span>·</span><span>{p.updated}</span>
              </div>
            </div>
            <UI.Button>Import</UI.Button>
          </div>
        ))}
      </div>
      <div style={{ padding: 16, borderTop: "1px solid var(--border)", background: "var(--paper)" }}>
        <UI.ImportBlock cmd="llml import qwen3-14b-coding.toml" />
      </div>
    </div>
  );
}

function Hero({ setRoute }) {
  return (
    <section style={{ padding: "64px 32px 48px" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 48, alignItems: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <span className="eyebrow">v2 · portable parameter profiles</span>
          <h1 style={{ fontSize: 64, lineHeight: 1.05, letterSpacing: "-0.02em", maxWidth: "16ch" }}>
            Find the profile that fits your <em style={{ fontStyle: "italic", color: "var(--secondary)" }}>model</em> and your <em style={{ fontStyle: "italic", color: "var(--secondary)" }}>machine</em>.
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.55, maxWidth: "52ch", color: "var(--ink)" }}>
            A registry of TOML parameter profiles for <code className="mono">llama.cpp</code>, <code className="mono">vLLM</code>,{" "}
            <code className="mono">Ollama</code>, and <code className="mono">KoboldCpp</code>. Filter by backend, hardware,
            and OS — then import into your local <code className="mono">llml</code> with one command.
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <UI.Button onClick={() => setRoute("browse")}>Browse profiles →</UI.Button>
            <UI.Button variant="secondary" onClick={() => setRoute("how")}>Learn how profiles work</UI.Button>
          </div>
        </div>
        <HeroArtifact />
      </div>
    </section>
  );
}

function ProofStrip() {
  const items = [
    { k: "BACKENDS", v: "llama.cpp · vLLM · Ollama · KoboldCpp" },
    { k: "MATCH ON", v: "GPU class · VRAM · OS · use case" },
    { k: "SOURCE", v: "Every profile linked to a GitHub commit" },
  ];
  return (
    <section style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", background: "var(--paper-2)" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "24px 32px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32 }}>
        {items.map((it) => (
          <div key={it.k} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span className="eyebrow">{it.k}</span>
            <span style={{ fontFamily: "var(--font-sans)", fontSize: 16, fontWeight: 500 }}>{it.v}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: "01", t: "Find a profile", d: "Filter by backend, hardware class, and OS. The fit summary tells you in one line whether it's worth your time." },
    { n: "02", t: "Check machine fit", d: "Every profile declares VRAM, GPU count, and tested context. Compatibility shows up as a verdict, not a guess." },
    { n: "03", t: "Import into llml", d: "Copy the import command. Profiles attach to your local model and appear under p in the TUI on next launch." },
  ];
  return (
    <section style={{ padding: "72px 32px" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 32 }}>
          <h2 style={{ fontSize: 40, letterSpacing: "-0.01em" }}>How it works</h2>
          <span className="eyebrow">three steps</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
          {steps.map((s) => (
            <div key={s.n} style={{ borderTop: "1px solid var(--ink)", paddingTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--muted)" }}>{s.n}</span>
              <h3 style={{ fontSize: 22 }}>{s.t}</h3>
              <p style={{ color: "var(--ink)", fontSize: 15, lineHeight: 1.55 }}>{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BrowsePreview({ setRoute, openProfile }) {
  return (
    <section style={{ padding: "32px 32px 72px", background: "var(--paper-2)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", margin: "32px 0 20px" }}>
          <h2 style={{ fontSize: 40, letterSpacing: "-0.01em" }}>Recently updated</h2>
          <button onClick={() => setRoute("browse")} style={{ font: "inherit", background: "transparent", border: 0, fontFamily: "var(--font-sans)", fontSize: 14, cursor: "pointer", borderBottom: "1px solid var(--ink)" }}>
            Browse all 247 profiles →
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {PROFILES.slice(0, 6).map((p) => (
            <button
              key={p.id}
              onClick={() => openProfile(p.id)}
              style={{
                font: "inherit",
                textAlign: "left",
                background: "var(--paper)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: 16,
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)", letterSpacing: ".06em", textTransform: "uppercase" }}>{p.backend}</span>
                {p.verified ? (
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--success)" }}>✓ verified</span>
                ) : (
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)" }}>community</span>
                )}
              </div>
              <h4 style={{ fontSize: 16, fontWeight: 600 }}>{p.name}</h4>
              <p style={{ fontSize: 13, color: "var(--ink)", lineHeight: 1.5, margin: 0 }}>{p.fit}</p>
              <div style={{ display: "flex", gap: 6, marginTop: "auto", paddingTop: 10, flexWrap: "wrap" }}>
                <UI.Badge tone="fill">{p.hardware}</UI.Badge>
                <UI.Badge>{p.os}</UI.Badge>
                <UI.Badge>{p.useCase}</UI.Badge>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhyDifferent() {
  const cols = [
    { t: "Fit over popularity", d: "Result rows lead with hardware match and update recency, not stars or downloads. The first question is whether the profile will run, not whether it trended." },
    { t: "Portable, not platform-locked", d: "Profiles are TOML files with a documented schema. They live in GitHub, not a service. The catalog is a thin index over real source files." },
    { t: "Reproducible imports", d: "An import is one shell command. The same TOML produces the same args and env on every machine — no hidden web of preferences." },
  ];
  return (
    <section style={{ padding: "72px 32px" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <h2 style={{ fontSize: 40, letterSpacing: "-0.01em", marginBottom: 32, maxWidth: "20ch" }}>
          Why this <em style={{ fontStyle: "italic" }}>isn't</em> another model gallery
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32 }}>
          {cols.map((c) => (
            <div key={c.t} style={{ display: "flex", flexDirection: "column", gap: 8, paddingRight: 16 }}>
              <h3 style={{ fontSize: 20 }}>{c.t}</h3>
              <p style={{ fontSize: 15, lineHeight: 1.55 }}>{c.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContributeCTA({ setRoute }) {
  return (
    <section style={{ padding: "48px 32px", borderTop: "1px solid var(--border)", background: "var(--secondary)", color: "var(--paper)" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 32, flexWrap: "wrap" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <h2 style={{ fontSize: 32, color: "var(--paper)" }}>Got a profile that just works?</h2>
          <p style={{ color: "#B6B0A3", fontSize: 16 }}>Share the args your machine and model converged on. PR-only. No accounts.</p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <UI.Button onClick={() => setRoute("contribute")} style={{ background: "var(--paper)", color: "var(--ink)", borderColor: "var(--paper)" }}>
            Read the format
          </UI.Button>
          <UI.Button variant="secondary" style={{ borderColor: "#2C323D", color: "var(--paper)" }} onClick={() => setRoute("contribute")}>
            Open a PR ↗
          </UI.Button>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ padding: "32px", borderTop: "1px solid var(--border)" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", display: "flex", justifyContent: "space-between", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--muted)" }}>
        <span>llml profile catalog · MIT</span>
        <span>github.com/flyingnobita/llml</span>
      </div>
    </footer>
  );
}

function Home({ setRoute, openProfile }) {
  return (
    <>
      <Hero setRoute={setRoute} />
      <ProofStrip />
      <HowItWorks />
      <BrowsePreview setRoute={setRoute} openProfile={openProfile} />
      <WhyDifferent />
      <ContributeCTA setRoute={setRoute} />
      <Footer />
    </>
  );
}

window.Home = Home;
window.Footer = Footer;
