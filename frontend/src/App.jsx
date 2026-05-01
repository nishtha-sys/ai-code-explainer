/**
 * AI Code Explainer — React Frontend
 * IBM Bob Dev Day Hackathon | Team: SoloCoders
 *
 * Run:
 *   npx create-react-app ai-code-explainer
 *   Replace src/App.jsx with this file
 *   npm start
 */

import { useState } from "react";

const MODES = [
  { id: "explain",  label: "Explain",       desc: "Beginner-friendly explanation" },
  { id: "comment",  label: "Add Comments",  desc: "Inline code comments"          },
  { id: "summary",  label: "Summarize",     desc: "Quick code summary"             },
  { id: "optimize", label: "Optimize",      desc: "Performance improvements"      },
  { id: "debug",    label: "Debug",         desc: "Find & fix bugs"               },
];

const LANGUAGES = [
  "Auto-detect", "Python", "JavaScript", "TypeScript",
  "Java", "C++", "C#", "Go", "Rust", "SQL", "PHP", "Ruby",
];

const API_BASE = "http://localhost:5000";  // Change in production

export default function App() {
  const [code, setCode]         = useState("");
  const [mode, setMode]         = useState("explain");
  const [language, setLanguage] = useState("Auto-detect");
  const [result, setResult]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);

  const handleRun = async () => {
    if (!code.trim()) { setError("Please paste some code first."); return; }
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`${API_BASE}/api/explain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim(),
          mode,
          language: language === "Auto-detect" ? "" : language,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "API error");
      }

      const data = await res.json();
      setResult(data.result);
    } catch (e) {
      setError(e.message || "Failed to connect to backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.root}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.logo}>
            <span style={styles.logoIcon}>✦</span>
            <span style={styles.logoText}>AI Code Explainer</span>
          </div>
          <div style={styles.headerRight}>
            <span style={styles.badge}>IBM Bob Dev Day</span>
            <span style={styles.team}>SoloCoders</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main style={styles.main}>
        {/* Mode selector */}
        <div style={styles.modeRow}>
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              style={{ ...styles.modeBtn, ...(mode === m.id ? styles.modeBtnActive : {}) }}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Editor + Output */}
        <div style={styles.grid}>
          {/* Input Panel */}
          <div style={styles.panel}>
            <div style={styles.panelHeader}>
              <span style={styles.panelTitle}>Code Input</span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                style={styles.select}
              >
                {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>
            <textarea
              style={styles.textarea}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={"// Paste your code here...\n// Example:\nfunction fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n-1) + fibonacci(n-2);\n}"}
              spellCheck={false}
            />
            <div style={styles.panelFooter}>
              <span style={styles.charCount}>{code.length} chars</span>
              <button
                onClick={handleRun}
                disabled={loading}
                style={{ ...styles.runBtn, opacity: loading ? 0.7 : 1 }}
              >
                {loading ? "Analyzing..." : "Run →"}
              </button>
            </div>
          </div>

          {/* Output Panel */}
          <div style={styles.panel}>
            <div style={styles.panelHeader}>
              <span style={styles.panelTitle}>AI Output</span>
              <span style={styles.modeBadge}>
                {MODES.find((m2) => m2.id === mode)?.label}
              </span>
            </div>
            <div style={styles.outputArea}>
              {loading && (
                <div style={styles.loadingBox}>
                  <div style={styles.spinner} />
                  <span style={styles.loadingText}>Analyzing your code...</span>
                </div>
              )}
              {error && <div style={styles.errorBox}>{error}</div>}
              {result && !loading && (
                <pre style={styles.resultPre}>{result}</pre>
              )}
              {!result && !loading && !error && (
                <div style={styles.placeholder}>
                  <span style={styles.placeholderIcon}>✦</span>
                  <span>Paste code and press Run</span>
                </div>
              )}
            </div>
            {result && (
              <div style={styles.panelFooter}>
                <button
                  onClick={() => navigator.clipboard.writeText(result)}
                  style={styles.copyBtn}
                >
                  Copy output
                </button>
                <button onClick={() => setResult(null)} style={styles.clearBtn}>
                  Clear
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

/* ─── Styles ──────────────────────────── */
const colors = {
  bg:       "#0f1117",
  surface:  "#181c27",
  border:   "#2a2f3e",
  teal:     "#1D9E75",
  tealDark: "#0F6E56",
  tealLight:"#E1F5EE",
  text:     "#e8eaf0",
  muted:    "#7a8099",
  error:    "#f09595",
};

const styles = {
  root:        { minHeight: "100vh", background: colors.bg, color: colors.text, fontFamily: "'Segoe UI', system-ui, sans-serif" },
  header:      { borderBottom: `1px solid ${colors.border}`, background: colors.surface },
  headerInner: { maxWidth: 1200, margin: "0 auto", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  logo:        { display: "flex", alignItems: "center", gap: 10 },
  logoIcon:    { color: colors.teal, fontSize: 20 },
  logoText:    { fontWeight: 600, fontSize: 18, letterSpacing: "-0.02em" },
  headerRight: { display: "flex", alignItems: "center", gap: 12 },
  badge:       { fontSize: 12, padding: "3px 10px", borderRadius: 99, background: "#0F6E5622", color: colors.teal, border: `1px solid ${colors.teal}44` },
  team:        { fontSize: 13, color: colors.muted },
  main:        { maxWidth: 1200, margin: "0 auto", padding: "24px" },
  modeRow:     { display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" },
  modeBtn:     { fontSize: 13, fontWeight: 500, padding: "7px 16px", borderRadius: 8, border: `1px solid ${colors.border}`, background: colors.surface, color: colors.muted, cursor: "pointer" },
  modeBtnActive: { background: "#0F6E5622", color: colors.teal, borderColor: colors.teal },
  grid:        { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, minHeight: 540 },
  panel:       { background: colors.surface, borderRadius: 12, border: `1px solid ${colors.border}`, display: "flex", flexDirection: "column", overflow: "hidden" },
  panelHeader: { padding: "12px 16px", borderBottom: `1px solid ${colors.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: colors.bg + "88" },
  panelTitle:  { fontSize: 13, fontWeight: 500, color: colors.text },
  select:      { fontSize: 12, background: colors.bg, color: colors.muted, border: `1px solid ${colors.border}`, borderRadius: 6, padding: "4px 8px", outline: "none" },
  textarea:    { flex: 1, background: "transparent", border: "none", outline: "none", resize: "none", fontFamily: "monospace", fontSize: 13, lineHeight: 1.7, padding: 16, color: colors.text, minHeight: 300 },
  panelFooter: { padding: "10px 14px", borderTop: `1px solid ${colors.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: colors.bg + "66" },
  charCount:   { fontSize: 12, color: colors.muted },
  runBtn:      { background: colors.teal, color: "#fff", border: "none", borderRadius: 8, padding: "8px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer" },
  modeBadge:   { fontSize: 12, padding: "3px 10px", borderRadius: 99, background: "#1D9E7522", color: colors.teal },
  outputArea:  { flex: 1, padding: 16, overflowY: "auto" },
  loadingBox:  { display: "flex", alignItems: "center", gap: 10, color: colors.muted, fontSize: 14 },
  spinner:     { width: 16, height: 16, border: `2px solid ${colors.border}`, borderTop: `2px solid ${colors.teal}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  loadingText: { color: colors.muted, fontSize: 13 },
  errorBox:    { color: colors.error, fontSize: 13, padding: "8px 12px", borderRadius: 8, background: "#f0959522", border: `1px solid ${colors.error}44` },
  resultPre:   { fontFamily: "monospace", fontSize: 12.5, lineHeight: 1.7, color: colors.text, whiteSpace: "pre-wrap", wordBreak: "break-word" },
  placeholder: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 8, color: colors.muted, fontSize: 13, textAlign: "center" },
  placeholderIcon: { fontSize: 24, color: colors.teal },
  copyBtn:     { fontSize: 12, padding: "5px 12px", borderRadius: 6, border: `1px solid ${colors.border}`, background: "transparent", color: colors.muted, cursor: "pointer" },
  clearBtn:    { fontSize: 12, padding: "5px 12px", borderRadius: 6, border: "none", background: "transparent", color: colors.muted, cursor: "pointer" },
};
