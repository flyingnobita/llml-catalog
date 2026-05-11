// Catalog browse page — filter rail + dense result list + compare tray. Wired with search, sort, and keyboard nav.
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

function ResultRow({ p, selected, toggleCompare, openProfile, importProfile, focused, rowRef }) {
  return (
    <div
      ref={rowRef}
      style={{
        borderBottom: "1px solid var(--border)",
        padding: "14px 8px",
        display: "grid",
        gridTemplateColumns: "20px 1fr 120px 130px 100px 100px 110px",
        gap: 16,
        alignItems: "center",
        background: focused ? "rgba(47,107,255,.06)" : "transparent",
        borderLeft: focused ? "2px solid var(--primary)" : "2px solid transparent",
        marginLeft: -10,
        paddingLeft: 8,
        transition: "background var(--d-micro) var(--ease-move)",
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
      <UI.Button onClick={() => importProfile(p.id)} style={{ padding: "6px 12px" }}>Import</UI.Button>
    </div>
  );
}

function CompareTray({ ids, clear, openCompare }) {
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
      <UI.Button variant="dark" onClick={openCompare} disabled={ids.length < 2}>
        Compare →
      </UI.Button>
    </div>
  );
}

function Browse({
  openProfile,
  importProfile,
  openCompare,
  filters,
  setFilters,
  search,
  setSearch,
  sort,
  setSort,
  compareIds,
  setCompareIds,
  loading,
  error,
}) {
  const searchRef = React.useRef(null);
  const [focusIdx, setFocusIdx] = useState(-1);
  const rowRefs = React.useRef([]);

  // Expose search-focus via global so the keyboard handler can reach it.
  React.useEffect(() => {
    window.__focusSearch = () => searchRef.current?.focus();
    return () => { delete window.__focusSearch; };
  }, []);

  const toggle = (group) => (val) => {
    setFilters((s) => {
      const next = { ...s, [group]: new Set(s[group]) };
      next[group].has(val) ? next[group].delete(val) : next[group].add(val);
      return next;
    });
  };
  const toggleCompare = (id) =>
    setCompareIds((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));

  // Filtering + search
  const q = search.trim().toLowerCase();
  let filtered = PROFILES.filter((p) => {
    if (filters.backend.size && !filters.backend.has(p.backend)) return false;
    if (filters.hardware.size && !filters.hardware.has(p.hardware)) return false;
    if (filters.os.size && !filters.os.has(p.os)) return false;
    if (filters.useCase.size && !filters.useCase.has(p.useCase)) return false;
    if (filters.tags && filters.tags.size && !(p.tags || []).some((t) => filters.tags.has(t))) return false;
    if (filters.source.size) {
      const tag = p.verified ? "Verified" : "Community";
      if (!filters.source.has(tag)) return false;
    }
    if (q) {
      const blob = `${p.name} ${p.fit} ${p.backend} ${p.hardware} ${p.os} ${p.useCase} ${(p.tags||[]).join(" ")} ${p.maintainer}`.toLowerCase();
      if (!blob.includes(q)) return false;
    }
    return true;
  });

  // Sorting
  if (sort === "Name") {
    filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
  } else if (sort === "Fit") {
    // Verified first, then by name.
    filtered = [...filtered].sort((a, b) => (Number(b.verified) - Number(a.verified)) || a.name.localeCompare(b.name));
  }
  // "Updated" leaves source order (data is pre-sorted by recency).

  // Keyboard: j/k to move focus, Enter to open, x to toggle compare. Only when search isn't focused.
  React.useEffect(() => {
    const onKey = (e) => {
      if (document.activeElement === searchRef.current) return;
      if (e.target.tagName === "INPUT" || e.target.tagName === "SELECT" || e.target.tagName === "TEXTAREA") return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "j") {
        e.preventDefault();
        setFocusIdx((i) => Math.min(filtered.length - 1, i + 1));
      } else if (e.key === "k") {
        e.preventDefault();
        setFocusIdx((i) => Math.max(0, i - 1));
      } else if (e.key === "Enter" && focusIdx >= 0 && filtered[focusIdx]) {
        e.preventDefault();
        openProfile(filtered[focusIdx].id);
      } else if (e.key === "x" && focusIdx >= 0 && filtered[focusIdx]) {
        e.preventDefault();
        toggleCompare(filtered[focusIdx].id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [filtered, focusIdx]);

  // Scroll focused row into view.
  React.useEffect(() => {
    if (focusIdx >= 0 && rowRefs.current[focusIdx]) {
      const r = rowRefs.current[focusIdx].getBoundingClientRect();
      if (r.top < 80 || r.bottom > window.innerHeight - 80) {
        rowRefs.current[focusIdx].scrollIntoView({ block: "center", behavior: "smooth" });
      }
    }
  }, [focusIdx]);

  // Skeleton row for loading state.
  const Skeleton = () => (
    <div style={{
      borderBottom: "1px solid var(--border)",
      padding: "14px 0",
      display: "grid",
      gridTemplateColumns: "20px 1fr 120px 130px 100px 100px 110px",
      gap: 16,
      alignItems: "center",
    }}>
      <div style={{ width: 16, height: 16, borderRadius: 2, background: "var(--paper-2)" }} />
      <div>
        <div style={{ width: "55%", height: 14, background: "var(--paper-2)", borderRadius: 4 }} />
        <div style={{ width: "78%", height: 12, background: "var(--paper-2)", borderRadius: 4, marginTop: 8 }} />
      </div>
      <div style={{ width: 70, height: 12, background: "var(--paper-2)", borderRadius: 4 }} />
      <div style={{ width: 90, height: 12, background: "var(--paper-2)", borderRadius: 4 }} />
      <div style={{ width: 60, height: 12, background: "var(--paper-2)", borderRadius: 4 }} />
      <div style={{ width: 70, height: 12, background: "var(--paper-2)", borderRadius: 4 }} />
      <div style={{ width: 76, height: 28, background: "var(--paper-2)", borderRadius: 6 }} />
    </div>
  );

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
          <div style={{ position: "relative" }}>
            <input
              ref={searchRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Escape") { setSearch(""); searchRef.current?.blur(); } }}
              placeholder="Search profiles…"
              style={{
                font: "inherit",
                padding: "8px 12px",
                paddingRight: 36,
                border: "1px solid var(--border)",
                borderRadius: 8,
                background: "#fff",
                width: "100%",
                boxSizing: "border-box",
              }}
            />
            <kbd style={{
              position: "absolute",
              right: 8,
              top: "50%",
              transform: "translateY(-50%)",
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              padding: "2px 6px",
              border: "1px solid var(--border)",
              borderBottomWidth: 2,
              borderRadius: 4,
              background: "var(--paper)",
              color: "var(--muted)",
              pointerEvents: "none",
            }}>/</kbd>
          </div>
          <FilterGroup title="Backend" options={FILTERS.backend} selected={filters.backend} onToggle={toggle("backend")} />
          <FilterGroup title="Hardware class" options={FILTERS.hardware} selected={filters.hardware} onToggle={toggle("hardware")} />
          <FilterGroup title="Operating system" options={FILTERS.os} selected={filters.os} onToggle={toggle("os")} />
          <FilterGroup title="Use case" options={FILTERS.useCase} selected={filters.useCase} onToggle={toggle("useCase")} />
          <FilterGroup title="Capabilities" options={FILTERS.tags} selected={filters.tags} onToggle={toggle("tags")} />
          <FilterGroup title="Source" options={FILTERS.source} selected={filters.source} onToggle={toggle("source")} />
        </aside>
        <main>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 12, borderBottom: "1px solid var(--ink)" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>
              <strong>{loading ? "—" : filtered.length}</strong> <span style={{ color: "var(--muted)" }}>of {PROFILES.length} profiles</span>
              {q && !loading && <span style={{ color: "var(--muted)", marginLeft: 8 }}>· matching "{q}"</span>}
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

          {error ? (
            <div style={{ padding: 48, textAlign: "center", display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--error)", letterSpacing: ".08em", textTransform: "uppercase" }}>error</div>
              <div style={{ fontFamily: "var(--font-sans)", fontSize: 16, fontWeight: 600 }}>Couldn't reach the catalog index</div>
              <div style={{ fontSize: 13, color: "var(--muted)", maxWidth: 420, lineHeight: 1.5 }}>
                The catalog couldn't fetch <code className="mono">profiles/index.json</code> from the registry. Check your connection or try again.
              </div>
              <UI.Button variant="secondary" style={{ marginTop: 8 }}>Retry</UI.Button>
            </div>
          ) : loading ? (
            <>
              {[0, 1, 2, 3].map((i) => <Skeleton key={i} />)}
            </>
          ) : (
            <>
              {filtered.map((p, i) => (
                <ResultRow
                  key={p.id}
                  p={p}
                  selected={compareIds.includes(p.id)}
                  toggleCompare={toggleCompare}
                  openProfile={openProfile}
                  importProfile={importProfile}
                  focused={focusIdx === i}
                  rowRef={(el) => (rowRefs.current[i] = el)}
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
            </>
          )}
        </main>
      </div>
      <CompareTray ids={compareIds} clear={() => setCompareIds([])} openCompare={openCompare} />
    </div>
  );
}

window.Browse = Browse;
