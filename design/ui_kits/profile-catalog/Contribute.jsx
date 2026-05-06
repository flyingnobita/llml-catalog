// Contribution / docs page.
function Contribute() {
  const tomlSample = `schema_version = 2

[[profiles]]
name = "balanced-q4"
backend = "koboldcpp"
model_hint = "Qwen3-14B-GGUF"
args = [
  "--gpulayers 80",
  "--contextsize 16384",
  "--threads 8",
  "--flashattention",
]

use_case.primary = "completion"
use_case.tags    = ["interactive", "coding"]

hardware.class       = "gpu"
hardware.gpu_count   = 1
hardware.min_vram_gb = 24
hardware.max_vram_gb = 24
hardware.notes       = "Tested on RTX 3090, CUDA 12.4, Ubuntu 24.04."`;

  return (
    <div>
      <section style={{ borderBottom: "1px solid var(--border)", padding: "48px 32px" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <span className="eyebrow">contribute</span>
            <h1 style={{ fontSize: 48, letterSpacing: "-0.01em" }}>
              A profile is a <em style={{ fontStyle: "italic" }}>setup, not a model card</em>.
            </h1>
            <p style={{ fontSize: 17, lineHeight: 1.55, maxWidth: "55ch" }}>
              The catalog is built from TOML files in a public GitHub repo. If you've gotten a model running well on your machine,
              the args and env you used are exactly what someone with the same machine needs.
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              <UI.Button>Open a PR ↗</UI.Button>
              <UI.Button variant="secondary">Read the schema</UI.Button>
            </div>
          </div>
          <pre
            style={{
              background: "var(--secondary)",
              color: "var(--paper)",
              padding: 24,
              borderRadius: 12,
              fontSize: 12.5,
              lineHeight: 1.55,
              fontFamily: "var(--font-mono)",
              margin: 0,
              overflow: "auto",
              maxHeight: 380,
            }}
          >
            {tomlSample}
          </pre>
        </div>
      </section>

      <section style={{ padding: "56px 32px" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", display: "grid", gridTemplateColumns: "240px 1fr", gap: 48 }}>
          <aside>
            <span className="eyebrow">Contents</span>
            <ol style={{ margin: "12px 0 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6, fontFamily: "var(--font-sans)", fontSize: 14 }}>
              {[
                "What belongs in the catalog",
                "What a strong profile includes",
                "Validation expectations",
                "PR flow",
                "FAQ",
              ].map((t, i) => (
                <li key={t}>
                  <a href="#" style={{ color: i === 0 ? "var(--ink)" : "var(--muted)", borderBottom: i === 0 ? "1px solid var(--ink)" : "none" }}>
                    {String(i + 1).padStart(2, "0")} · {t}
                  </a>
                </li>
              ))}
            </ol>
          </aside>
          <article style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            <div>
              <h2 style={{ fontSize: 30, marginBottom: 12 }}>What belongs in the catalog</h2>
              <p style={{ fontSize: 16, lineHeight: 1.6, maxWidth: "62ch" }}>
                Profiles for <code className="mono">llama.cpp</code>, <code className="mono">vLLM</code>, <code className="mono">Ollama</code>, and{" "}
                <code className="mono">KoboldCpp</code>. One TOML file per profile, with a clear hardware target and a short
                rationale. Model-location parameters (<code className="mono">--model</code>, <code className="mono">HF_HOME</code>, etc.) are
                excluded — <code className="mono">llml</code> supplies them at launch.
              </p>
            </div>
            <div>
              <h2 style={{ fontSize: 30, marginBottom: 12 }}>What a strong profile includes</h2>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 16, lineHeight: 1.7, maxWidth: "62ch" }}>
                <li>A <strong>name</strong> that reads as a setup, not a brand: <code className="mono">balanced-q4</code> beats <code className="mono">my-best-config</code>.</li>
                <li>Explicit <code className="mono">backend</code>, <code className="mono">hardware.class</code>, and tested VRAM range.</li>
                <li>A short <code className="mono">hardware.notes</code> line with the actual machine you tested on.</li>
                <li>Args as panel-row strings: <code className="mono">"--ctx-size 4096"</code>, not pre-split tokens.</li>
              </ul>
            </div>
            <div>
              <h2 style={{ fontSize: 30, marginBottom: 12 }}>Validation</h2>
              <div style={{ border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden", fontFamily: "var(--font-mono)", fontSize: 13 }}>
                {[
                  ["schema_version == 2", "required"],
                  ["backend ∈ {llama, vllm, ollama, koboldcpp}", "required"],
                  ["use_case.primary ∈ canonical set", "warn"],
                  ["model-location params absent from args", "required"],
                  ["hardware.min_vram_gb ≤ hardware.max_vram_gb", "warn"],
                ].map(([rule, level], i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 100px", padding: "10px 14px", borderTop: i ? "1px solid var(--border)" : 0, alignItems: "center" }}>
                    <span>{rule}</span>
                    <UI.Badge tone={level === "required" ? "error" : "warning"}>{level}</UI.Badge>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h2 style={{ fontSize: 30, marginBottom: 12 }}>PR flow</h2>
              <ol style={{ margin: 0, paddingLeft: 18, fontSize: 16, lineHeight: 1.7, maxWidth: "62ch" }}>
                <li>Fork <code className="mono">flyingnobita/llml-profiles</code></li>
                <li>Add your TOML under <code className="mono">profiles/&lt;name&gt;.toml</code></li>
                <li>Run <code className="mono">npm run validate</code> locally</li>
                <li>Open a PR with one paragraph about your machine</li>
              </ol>
            </div>
          </article>
        </div>
      </section>
      <Footer />
    </div>
  );
}

window.Contribute = Contribute;
