// Catalog browse page — filter rail + dense result list + compare tray.
function FilterGroup({ title, options, selected, onToggle }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span className="eyebrow">{title}</span>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {options.map((o) => {
          const active = selected.has(o);
          return (
            <button
              key={o}
              onClick={() => onToggle(o)}
              style={{
                font: "inherit",
                textAlign: "left",
                background: "transparent",
                border: 0,
                padding: "4px 0",
                cursor: "pointer",
                fontFamily: "var(--font-sans)",
                fontSize: 13,
                color: active ? "var(--ink)" : "var(--muted)",
                fontWeight: active ? 600 : 400,
                display: "flex",
                gap: 8,
                alignItems: "center",
              }}
            >
              <span
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 2,
                  border: "1px solid var(--border)",
                  background: active ? "var(--primary)" : "transparent",
                  display: "inline-block",
                  flexShrink: 0,
                }}
              />
              {o}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ResultRow({ p, selected, toggleCompare, openProfile }) {
  return (
    <div
      style={{
        borderBottom: "1px solid var(--border)",
        padding: "14px 0",
        display: "grid",
        gridTemplateColumns: "20px 1fr 120px 130px 100px 100px 110px",
        gap: 16,
        alignItems: "center",
      }}
    >
      <input
        type="checkbox"
        checked={selected}
        onChange={() => toggleCompare(p.id)}
        style={{ accentColor: "var(--primary)", width: 16, height: 16 }}
      />
      <button
        onClick={() => openProfile(p.id)}
        style={{
          font: "inherit",
          background: "transparent",
          border: 0,
          textAlign: "left",
          cursor: "pointer",
          padding: 0,
          minWidth: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8, flexWrap: "wrap" }}>
          <strong style={{ fontFamily: "var(--font-sans)", fontSize: 15, flex: "1 1 auto", minWidth: 0 }}>{p.name}</strong>
          {p.verified && <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--success)", flex: "0 0 auto", whiteSpace: "nowrap" }}>✓</span>}
        </div>
        <div style={{ fontSize: 13, color: "var(--ink)", marginTop: 2 }}>{p.fit}</div>
      </button>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>{p.backend}</span>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>{p.hardware}</span>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--muted)" }}>{p.os}</span>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--muted)" }}>{p.updated}</span>
      <UI.Button onClick={() => openProfile(p.id)} style={{ padding: "6px 12px" }}>Import</UI.Button>
    </div>
  );
}

function CompareTray({ ids, openProfile, clear }) {
  if (ids.length === 0) return null;
  const items = ids.map((id) => PROFILES.find((p) => p.id === id)).filter(Boolean);
  return (
    <div
      style={{
        position: "sticky",
        bottom: 16,
        margin: "0 32px 16px",
        background: "rgba(243,241,234,.92)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        gap: 16,
        boxShadow: "var(--shadow-float)",
        zIndex: 5,
      }}
    >
      <span className="eyebrow">Compare · {ids.length}</span>
      <div style={{ display: "flex", gap: 8, flex: 1, minWidth: 0, overflow: "hidden" }}>
        {items.map((p) => (
          <span
            key={p.id}
            style={{
              border: "1px solid var(--border)",
              padding: "3px 8px",
              borderRadius: 4,
              background: "var(--paper)",
              fontFamily: "var(--font-sans)",
              fontSize: 13,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: 180,
            }}
          >
            {p.name}
          </span>
        ))}
      </div>
      <UI.Button variant="ghost" onClick={clear} style={{ color: "var(--muted)" }}>Clear</UI.Button>
      <UI.Button variant="dark">Compare →</UI.Button>
    </div>
  );
}

function Browse({ openProfile }) {
  const [selected, setSelected] = useState({
    backend: new Set(["koboldcpp", "llama.cpp"]),
    hardware: new Set(),
    os: new Set(),
    useCase: new Set(),
    source: new Set(),
  });
  const [compareIds, setCompareIds] = useState([]);
  const [sort, setSort] = useState("Updated");

  const toggle = (group) => (val) => {
    setSelected((s) => {
      const next = { ...s, [group]: new Set(s[group]) };
      next[group].has(val) ? next[group].delete(val) : next[group].add(val);
      return next;
    });
  };
  const toggleCompare = (id) =>
    setCompareIds((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));

  const filtered = PROFILES.filter((p) => {
    if (selected.backend.size && !selected.backend.has(p.backend)) return false;
    if (selected.hardware.size && !selected.hardware.has(p.hardware)) return false;
    if (selected.os.size && !selected.os.has(p.os)) return false;
    if (selected.useCase.size && !selected.useCase.has(p.useCase)) return false;
    if (selected.source.size) {
      const tag = p.verified ? "Verified" : "Community";
      if (!selected.source.has(tag)) return false;
    }
    return true;
  });

  return (
    <div>
      <section style={{ borderBottom: "1px solid var(--border)", padding: "32px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", flexDirection: "column", gap: 12 }}>
          <span className="eyebrow">browse</span>
          <h1 style={{ fontSize: 40, letterSpacing: "-0.01em" }}>Profiles for local LLMs</h1>
          <p style={{ color: "var(--muted)", fontSize: 15 }}>
            Filter by backend, hardware class, OS, and use case. Every profile is a portable TOML file
            from a public GitHub repo.
          </p>
        </div>
      </section>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "24px 32px", display: "grid", gridTemplateColumns: "220px 1fr", gap: 32 }}>
        <aside style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <input
            placeholder="Search profiles…"
            style={{
              font: "inherit",
              padding: "8px 12px",
              border: "1px solid var(--border)",
              borderRadius: 8,
              background: "#fff",
            }}
          />
          <FilterGroup title="Backend" options={FILTERS.backend} selected={selected.backend} onToggle={toggle("backend")} />
          <FilterGroup title="Hardware class" options={FILTERS.hardware} selected={selected.hardware} onToggle={toggle("hardware")} />
          <FilterGroup title="Operating system" options={FILTERS.os} selected={selected.os} onToggle={toggle("os")} />
          <FilterGroup title="Use case" options={FILTERS.useCase} selected={selected.useCase} onToggle={toggle("useCase")} />
          <FilterGroup title="Source" options={FILTERS.source} selected={selected.source} onToggle={toggle("source")} />
        </aside>
        <main>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 12, borderBottom: "1px solid var(--ink)" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>
              <strong>{filtered.length}</strong> <span style={{ color: "var(--muted)" }}>of {PROFILES.length} profiles</span>
            </span>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span className="eyebrow">sort</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                style={{ font: "inherit", padding: "6px 10px", border: "1px solid var(--border)", borderRadius: 8, background: "#fff" }}
              >
                <option>Updated</option>
                <option>Fit</option>
                <option>Name</option>
              </select>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "20px 1fr 120px 130px 100px 100px 110px", gap: 16, padding: "10px 0", borderBottom: "1px solid var(--border)", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)", letterSpacing: ".08em", textTransform: "uppercase" }}>
            <span></span><span>Profile</span><span>Backend</span><span>Hardware</span><span>OS</span><span>Updated</span><span></span>
          </div>
          {filtered.map((p) => (
            <ResultRow
              key={p.id}
              p={p}
              selected={compareIds.includes(p.id)}
              toggleCompare={toggleCompare}
              openProfile={openProfile}
            />
          ))}
          {filtered.length === 0 && (
            <div style={{ padding: 48, textAlign: "center", color: "var(--muted)", fontFamily: "var(--font-sans)", fontSize: 14 }}>
              No profiles match these filters.{" "}
              <button style={{ color: "var(--primary)", background: "transparent", border: 0, font: "inherit", textDecoration: "underline", cursor: "pointer" }}>
                Open a PR for this combo →
              </button>
            </div>
          )}
        </main>
      </div>
      <CompareTray ids={compareIds} openProfile={openProfile} clear={() => setCompareIds([])} />
    </div>
  );
}

window.Browse = Browse;
