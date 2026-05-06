// Import modal — fired from any "Import" button. Shows the command, a manifest preview, and what happens next.
function ImportModal({ profile, onClose }) {
  const [step, setStep] = useState(0); // 0 = command, 1 = installing, 2 = done
  const [copied, setCopied] = useState(false);

  // Demo "install" cycle — the modal walks through phases when the user clicks Run.
  const run = () => {
    setStep(1);
    setTimeout(() => setStep(2), 1400);
  };

  if (!profile) return null;

  const manifestLines = [
    `name = "${profile.id}"`,
    `backend = "${profile.backend}"`,
    `model_hint = "${profile.name.split(" — ")[0].split(" Profile")[0]}"`,
    "",
    `[hardware]`,
    `class = "${profile.hardware.toLowerCase().includes("cpu") ? "cpu" : "gpu"}"`,
    `notes = "${profile.hardware} · ${profile.os}"`,
    "",
    `[args]`,
    ...profile.args.map((a) => `  ${a}`),
    ...(profile.env.length ? ["", "[env]", ...profile.env.map((e) => `  ${e.key} = "${e.value}"`)] : []),
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
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        animation: "modalFade .18s var(--ease-enter) both",
      }}
    >
      <style>{`
        @keyframes modalFade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalSlide { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--paper)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          width: "min(640px, 100%)",
          maxHeight: "calc(100vh - 48px)",
          overflow: "auto",
          boxShadow: "0 24px 60px -16px rgba(17,19,24,.32)",
          animation: "modalSlide .22s var(--ease-enter) both",
        }}
      >
        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
            <span className="eyebrow">import</span>
            <h2 style={{ fontSize: 20, fontWeight: 600, lineHeight: 1.3 }}>{profile.name}</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{ font: "inherit", background: "transparent", border: 0, cursor: "pointer", fontSize: 22, color: "var(--muted)", lineHeight: 1, padding: 4, marginTop: -2 }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Command block */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span className="eyebrow">{step === 0 ? "1 · Run this in your terminal" : step === 1 ? "Importing…" : "✓ Done"}</span>
            <div style={{
              background: "var(--secondary)",
              color: "var(--paper)",
              borderRadius: 8,
              padding: "14px 16px",
              fontFamily: "var(--font-mono)",
              fontSize: 13,
              lineHeight: 1.6,
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: "#7CB342" }}>$</span>
                <span style={{ flex: 1 }}>{profile.importCmd}</span>
                <button
                  onClick={() => { navigator.clipboard?.writeText(profile.importCmd); setCopied(true); setTimeout(() => setCopied(false), 1200); }}
                  style={{ font: "inherit", fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 500, background: copied ? "var(--success)" : "transparent", color: copied ? "#0d2b1c" : "var(--paper)", border: copied ? 0 : "1px solid #2C323D", padding: "4px 10px", borderRadius: 4, cursor: "pointer" }}
                >
                  {copied ? "✓ Copied" : "Copy"}
                </button>
              </div>
              {step >= 1 && (
                <div style={{ color: "#9aa1ad", marginTop: 8, paddingLeft: 16, display: "flex", flexDirection: "column", gap: 2 }}>
                  <span>→ resolving {profile.repoPath}</span>
                  <span>→ verifying schema_version = 2</span>
                  <span>→ writing to ~/.config/llml/profiles/{profile.id}.toml</span>
                  {step === 2 && <span style={{ color: "#7CB342" }}>✓ attached to {profile.name.split(" — ")[0]}</span>}
                </div>
              )}
            </div>
          </div>

          {/* Manifest preview */}
          <details open style={{ border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
            <summary style={{
              padding: "10px 14px",
              cursor: "pointer",
              background: "var(--paper-2)",
              fontFamily: "var(--font-sans)",
              fontSize: 13,
              fontWeight: 500,
              userSelect: "none",
              listStyle: "none",
            }}>
              Profile manifest <span style={{ color: "var(--muted)", fontFamily: "var(--font-mono)", fontSize: 11, marginLeft: 8 }}>{profile.repoPath} · {profile.commit}</span>
            </summary>
            <pre style={{
              margin: 0,
              padding: "14px 16px",
              background: "#fff",
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              lineHeight: 1.6,
              color: "var(--ink)",
              overflow: "auto",
              maxHeight: 240,
            }}>
              {manifestLines.join("\n")}
            </pre>
          </details>

          {/* What happens next */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span className="eyebrow">what happens next</span>
            <ol style={{ margin: 0, paddingLeft: 20, fontSize: 14, lineHeight: 1.7, color: "var(--ink)" }}>
              <li>Profile lands in <code className="mono">~/.config/llml/profiles/</code></li>
              <li>On next <code className="mono">llml</code> launch, it shows up under <strong>p</strong> in the TUI</li>
              <li>Pick it before starting the model — args + env apply at backend launch</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 24px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--paper-2)" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)" }}>
            {profile.verified ? "✓ verified maintainer" : "community profile"} · MIT
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <UI.Button variant="ghost" onClick={onClose}>Close</UI.Button>
            {step === 0 && <UI.Button onClick={run}>Run import (demo)</UI.Button>}
            {step === 2 && <UI.Button onClick={onClose}>Done</UI.Button>}
          </div>
        </div>
      </div>
    </div>
  );
}

window.ImportModal = ImportModal;
