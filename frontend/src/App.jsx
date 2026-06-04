/**
 * AI Code Explainer v2.0 — React Frontend (UPGRADED)
 * IBM Bob Dev Day Hackathon | Team: SoloCoders
 *
 * New: File upload support — handles large real project files!
 */

import { useState, useRef } from "react";

const MODES = [
  { id: "explain",  label: "Explain"       },
  { id: "comment",  label: "Add Comments"  },
  { id: "summary",  label: "Summarize"     },
  { id: "optimize", label: "Optimize"      },
  { id: "debug",    label: "Debug"         },
];

const LANGUAGES = [
  "Auto-detect","Python","JavaScript","TypeScript",
  "Java","C++","C#","Go","Rust","SQL","PHP","Ruby",
];

const API_BASE = "https://ai-code-explainer-backend-c5jm.onrender.com";

export default function App() {
  const [code, setCode]           = useState("");
  const [mode, setMode]           = useState("explain");
  const [language, setLanguage]   = useState("Auto-detect");
  const [result, setResult]       = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);
  const [fileName, setFileName]   = useState(null);
  const [chunkCount, setChunkCount] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // ── File Upload Handler ──────────────────
  const handleFile = (file) => {
    if (!file) return;
    setFileName(file.name);

    // Auto-detect language from extension
    const ext = file.name.split(".").pop().toLowerCase();
    const extMap = {
      py: "Python", js: "JavaScript", jsx: "JavaScript",
      ts: "TypeScript", tsx: "TypeScript", java: "Java",
      cpp: "C++", cc: "C++", cs: "C#", go: "Go",
      rs: "Rust", sql: "SQL", php: "PHP", rb: "Ruby",
    };
    if (extMap[ext]) setLanguage(extMap[ext]);

    const reader = new FileReader();
    reader.onload = (e) => setCode(e.target.result);
    reader.readAsText(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);

  // ── Run Handler ──────────────────────────
  const handleRun = async () => {
    if (!code.trim()) { setError("Please paste code or upload a file first."); return; }
    setLoading(true);
    setError(null);
    setResult(null);
    setChunkCount(1);

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
      setChunkCount(data.chunks || 1);
    } catch (e) {
      setError(e.message || "Failed to connect to backend.");
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setCode(""); setResult(null); setError(null);
    setFileName(null); setChunkCount(1);
  };

  const lineCount = code.split("\n").length;

  return (
    <div style={S.root}>
      {/* Header */}
      <header style={S.header}>
        <div style={S.headerInner}>
          <div style={S.logo}>
            <span style={S.logoIcon}>✦</span>
            <span style={S.logoText}>AI Code Explainer</span>
            <span style={S.version}>v2.0</span>
          </div>
          <div style={S.headerRight}>
            <span style={S.badge}>IBM Bob Dev Day</span>
            <span style={S.team}>SoloCoders</span>
          </div>
        </div>
      </header>

      <main style={S.main}>
        {/* Mode Tabs */}
        <div style={S.modeRow}>
          {MODES.map((m) => (
            <button key={m.id} onClick={() => setMode(m.id)}
              style={{ ...S.modeBtn, ...(mode === m.id ? S.modeBtnActive : {}) }}>
              {m.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div style={S.grid}>

          {/* ── Left Panel — Input ── */}
          <div style={S.panel}>
            <div style={S.panelHeader}>
              <span style={S.panelTitle}>Code Input</span>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {fileName && (
                  <span style={S.fileTag}>📄 {fileName}</span>
                )}
                <select value={language} onChange={(e) => setLanguage(e.target.value)}
                  style={S.select}>
                  {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
                </select>
              </div>
            </div>

            {/* Drop Zone */}
            <div
              style={{ ...S.dropZone, ...(isDragging ? S.dropZoneActive : {}) }}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <textarea
                style={S.textarea}
                value={code}
                onChange={(e) => { setCode(e.target.value); setFileName(null); }}
                placeholder={"// Paste code here, or drag & drop a file...\n\n// Now supports large files — entire components,\n// modules, and real project code!"}
                spellCheck={false}
              />
              {isDragging && (
                <div style={S.dropOverlay}>
                  <span style={S.dropText}>Drop file here ↓</span>
                </div>
              )}
            </div>

            <div style={S.panelFooter}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {/* Upload button */}
                <button onClick={() => fileInputRef.current.click()} style={S.uploadBtn}>
                  ↑ Upload File
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".py,.js,.jsx,.ts,.tsx,.java,.cpp,.cc,.cs,.go,.rs,.sql,.php,.rb,.txt"
                  style={{ display: "none" }}
                  onChange={(e) => handleFile(e.target.files[0])}
                />
                <span style={S.lineCount}>{lineCount} lines · {code.length} chars</span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {code && (
                  <button onClick={clearAll} style={S.clearBtn}>Clear</button>
                )}
                <button onClick={handleRun} disabled={loading}
                  style={{ ...S.runBtn, opacity: loading ? 0.7 : 1 }}>
                  {loading ? "Analyzing..." : "Run →"}
                </button>
              </div>
            </div>
          </div>

          {/* ── Right Panel — Output ── */}
          <div style={S.panel}>
            <div style={S.panelHeader}>
              <span style={S.panelTitle}>AI Output</span>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {chunkCount > 1 && (
                  <span style={S.chunkBadge}>⚡ {chunkCount} sections analyzed</span>
                )}
                <span style={S.modeBadge}>
                  {MODES.find((m2) => m2.id === mode)?.label}
                </span>
              </div>
            </div>

            <div style={S.outputArea}>
              {loading && (
                <div style={S.loadingBox}>
                  <div style={S.spinnerWrap}>
                    <div style={S.spinner} />
                  </div>
                  <div>
                    <div style={S.loadingText}>Analyzing your code...</div>
                    {lineCount > 60 && (
                      <div style={S.loadingSubtext}>
                        Large file detected — processing in sections
                      </div>
                    )}
                  </div>
                </div>
              )}

              {error && <div style={S.errorBox}>{error}</div>}

              {result && !loading && (
                <pre style={S.resultPre}>{result}</pre>
              )}

              {!result && !loading && !error && (
                <div style={S.placeholder}>
                  <div style={S.placeholderIcon}>✦</div>
                  <span style={S.placeholderTitle}>Ready to explain any code</span>
                  <span style={S.placeholderSub}>Paste a snippet or upload an entire file</span>
                  <div style={S.featureList}>
                    <span style={S.featureItem}>✓ Small functions</span>
                    <span style={S.featureItem}>✓ Large project files</span>
                    <span style={S.featureItem}>✓ Any language</span>
                  </div>
                </div>
              )}
            </div>

            {result && (
              <div style={S.panelFooter}>
                <span style={S.lineCount}>
                  {chunkCount > 1 ? `${chunkCount} sections · ` : ""}
                  {result.length} chars output
                </span>
                <button onClick={() => navigator.clipboard.writeText(result)}
                  style={S.copyBtn}>
                  Copy output
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

/* ── Styles ─────────────────────────── */
const C = {
  bg: "#0D1117", surface: "#161B22", border: "#21262D",
  teal: "#1D9E75", tealDark: "#0F6E56", mint: "#5DCAA5",
  tealBg: "#0F6E5618", white: "#E6EDF3", muted: "#7D8590",
  error: "#f47067", errorBg: "#f4706718",
};

const S = {
  root:        { minHeight: "100vh", background: C.bg, color: C.white, fontFamily: "'Segoe UI', system-ui, sans-serif" },
  header:      { borderBottom: `1px solid ${C.border}`, background: C.surface },
  headerInner: { maxWidth: 1280, margin: "0 auto", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  logo:        { display: "flex", alignItems: "center", gap: 10 },
  logoIcon:    { color: C.teal, fontSize: 18 },
  logoText:    { fontWeight: 700, fontSize: 17, letterSpacing: "-0.02em" },
  version:     { fontSize: 11, padding: "2px 7px", borderRadius: 99, background: C.tealBg, color: C.mint, border: `1px solid ${C.teal}44`, fontWeight: 600 },
  headerRight: { display: "flex", alignItems: "center", gap: 12 },
  badge:       { fontSize: 12, padding: "3px 10px", borderRadius: 99, background: C.tealBg, color: C.teal, border: `1px solid ${C.teal}44` },
  team:        { fontSize: 13, color: C.muted },
  main:        { maxWidth: 1280, margin: "0 auto", padding: "20px 24px" },
  modeRow:     { display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" },
  modeBtn:     { fontSize: 13, fontWeight: 500, padding: "7px 16px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.surface, color: C.muted, cursor: "pointer", transition: "all 0.15s" },
  modeBtnActive: { background: C.tealBg, color: C.teal, borderColor: C.teal },
  grid:        { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, minHeight: 560 },
  panel:       { background: C.surface, borderRadius: 10, border: `1px solid ${C.border}`, display: "flex", flexDirection: "column", overflow: "hidden" },
  panelHeader: { padding: "10px 14px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: "#0D111788" },
  panelTitle:  { fontSize: 13, fontWeight: 600, color: C.white },
  select:      { fontSize: 12, background: C.bg, color: C.muted, border: `1px solid ${C.border}`, borderRadius: 6, padding: "3px 7px", outline: "none" },
  fileTag:     { fontSize: 11, padding: "2px 8px", borderRadius: 99, background: C.tealBg, color: C.mint, maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  dropZone:    { flex: 1, position: "relative", transition: "all 0.15s" },
  dropZoneActive: { outline: `2px dashed ${C.teal}`, outlineOffset: -4 },
  textarea:    { width: "100%", height: "100%", minHeight: 320, background: "transparent", border: "none", outline: "none", resize: "none", fontFamily: "Consolas, monospace", fontSize: 13, lineHeight: 1.7, padding: "14px 16px", color: C.white, boxSizing: "border-box" },
  dropOverlay: { position: "absolute", inset: 0, background: "#1D9E7522", display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" },
  dropText:    { fontSize: 18, color: C.teal, fontWeight: 700 },
  panelFooter: { padding: "10px 14px", borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: "#0D111766", gap: 8 },
  uploadBtn:   { fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 7, border: `1px solid ${C.teal}`, background: C.tealBg, color: C.teal, cursor: "pointer" },
  lineCount:   { fontSize: 11, color: C.muted },
  clearBtn:    { fontSize: 12, padding: "5px 10px", borderRadius: 7, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, cursor: "pointer" },
  runBtn:      { background: C.teal, color: "#fff", border: "none", borderRadius: 8, padding: "7px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer" },
  modeBadge:   { fontSize: 11, padding: "2px 10px", borderRadius: 99, background: C.tealBg, color: C.mint },
  chunkBadge:  { fontSize: 11, padding: "2px 10px", borderRadius: 99, background: "#f7c94822", color: "#f7c948", border: "1px solid #f7c94844" },
  outputArea:  { flex: 1, padding: 16, overflowY: "auto", minHeight: 320 },
  loadingBox:  { display: "flex", alignItems: "flex-start", gap: 12, padding: "8px 0" },
  spinnerWrap: { paddingTop: 2 },
  spinner:     { width: 16, height: 16, border: `2px solid ${C.border}`, borderTop: `2px solid ${C.teal}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  loadingText: { color: C.white, fontSize: 13, fontWeight: 500 },
  loadingSubtext: { color: C.muted, fontSize: 12, marginTop: 4 },
  errorBox:    { color: C.error, fontSize: 13, padding: "10px 14px", borderRadius: 8, background: C.errorBg, border: `1px solid ${C.error}44` },
  resultPre:   { fontFamily: "Consolas, monospace", fontSize: 12.5, lineHeight: 1.75, color: C.white, whiteSpace: "pre-wrap", wordBreak: "break-word", margin: 0 },
  placeholder: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 8, color: C.muted, textAlign: "center", padding: "2rem" },
  placeholderIcon: { fontSize: 28, color: C.teal, marginBottom: 4 },
  placeholderTitle: { fontSize: 14, fontWeight: 600, color: C.white },
  placeholderSub:  { fontSize: 13, color: C.muted },
  featureList: { display: "flex", gap: 12, marginTop: 8, flexWrap: "wrap", justifyContent: "center" },
  featureItem: { fontSize: 12, color: C.mint, padding: "3px 10px", borderRadius: 99, background: C.tealBg, border: `1px solid ${C.teal}33` },
  copyBtn:     { fontSize: 12, padding: "5px 12px", borderRadius: 7, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, cursor: "pointer" },
};