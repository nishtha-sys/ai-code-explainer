/**
 * AI Code Explainer v3.0 — React Frontend
 * IBM Bob Dev Day Hackathon | Team: SoloCoders
 *
 * New in v3.0:
 * - Each mode has its own color identity
 * - Complexity cards (Time, Space, Pattern)
 * - LeetCode pattern detection
 * - Line-by-line explanation cards
 * - Smooth loading animations
 * - Interview tips section
 * - Color coded badges
 */

import { useState, useRef, useEffect } from "react";

const API_BASE = "https://ai-code-explainer-backend-c5jm.onrender.com";

// ── Mode Config ───────────────────────────────────────────
const MODES = [
  {
    id: "explain",
    label: "Explain",
    icon: "✦",
    color: "#1D9E75",
    colorLight: "#E1F5EE",
    colorDark: "#085041",
    colorMid: "#0F6E56",
  },
  {
    id: "comment",
    label: "Add Comments",
    icon: "//",
    color: "#185FA5",
    colorLight: "#E6F1FB",
    colorDark: "#042C53",
    colorMid: "#0C447C",
  },
  {
    id: "summary",
    label: "Summarize",
    icon: "≡",
    color: "#534AB7",
    colorLight: "#EEEDFE",
    colorDark: "#26215C",
    colorMid: "#3C3489",
  },
  {
    id: "optimize",
    label: "Optimize",
    icon: "⚡",
    color: "#BA7517",
    colorLight: "#FAEEDA",
    colorDark: "#412402",
    colorMid: "#854F0B",
  },
  {
    id: "debug",
    label: "Debug",
    icon: "⚠",
    color: "#A32D2D",
    colorLight: "#FCEBEB",
    colorDark: "#501313",
    colorMid: "#791F1F",
  },
];

const LANGUAGES = [
  "Auto-detect","Python","JavaScript","TypeScript",
  "Java","C++","C#","Go","Rust","SQL","PHP","Ruby",
];

// ── LeetCode Pattern Detection ────────────────────────────
const LEETCODE_PATTERNS = [
  { pattern: /two.?pointer|left.*right|i.*j.*pointer/i, label: "Two Pointers", color: "#1D9E75", bg: "#E1F5EE" },
  { pattern: /sliding.?window|window.?size|max.*window/i, label: "Sliding Window", color: "#185FA5", bg: "#E6F1FB" },
  { pattern: /binary.?search|lo.*hi.*mid|left.*right.*mid/i, label: "Binary Search", color: "#534AB7", bg: "#EEEDFE" },
  { pattern: /dp\[|memo\[|cache\[|dynamic.?program|memoiz/i, label: "Dynamic Programming", color: "#BA7517", bg: "#FAEEDA" },
  { pattern: /def.*\(.*\).*:\s*.*return.*\(|function.*{.*return.*\(.*\)/i, label: "Recursion", color: "#534AB7", bg: "#EEEDFE" },
  { pattern: /\.append\(|stack\.|push\(|pop\(\)|stack = \[\]/i, label: "Stack", color: "#A32D2D", bg: "#FCEBEB" },
  { pattern: /queue\.|deque\.|\.popleft\(|from collections import deque/i, label: "Queue / BFS", color: "#185FA5", bg: "#E6F1FB" },
  { pattern: /heapq\.|heappush|heappop|priority.?queue/i, label: "Heap / Priority Queue", color: "#BA7517", bg: "#FAEEDA" },
  { pattern: /hash|dict\(\)|defaultdict|Counter\(|{}/i, label: "Hash Map", color: "#1D9E75", bg: "#E1F5EE" },
  { pattern: /dfs|bfs|visited|graph\[|adjacen/i, label: "Graph Traversal", color: "#185FA5", bg: "#E6F1FB" },
  { pattern: /backtrack|permut|subset|combina/i, label: "Backtracking", color: "#A32D2D", bg: "#FCEBEB" },
  { pattern: /\.sort\(|sorted\(|merge.*sort|quick.*sort/i, label: "Sorting", color: "#534AB7", bg: "#EEEDFE" },
  { pattern: /node\.next|ListNode|linked.?list|head\.next/i, label: "Linked List", color: "#1D9E75", bg: "#E1F5EE" },
  { pattern: /root\.left|root\.right|TreeNode|inorder|preorder|postorder/i, label: "Tree Traversal", color: "#BA7517", bg: "#FAEEDA" },
  { pattern: /greedy|max.*profit|min.*cost|interval/i, label: "Greedy", color: "#1D9E75", bg: "#E1F5EE" },
];

function detectPatterns(code) {
  return LEETCODE_PATTERNS.filter(p => p.pattern.test(code));
}

// ── Complexity Parser ─────────────────────────────────────
function parseComplexity(text) {
  const timeMatch = text.match(/[Tt]ime\s*[Cc]omplexity[:\s]+([O|Θ|Ω]\([^)]+\))/);
  const spaceMatch = text.match(/[Ss]pace\s*[Cc]omplexity[:\s]+([O|Θ|Ω]\([^)]+\))/);
  const generalO = text.match(/([O|Θ|Ω]\([^)]+\))/g);

  return {
    time: timeMatch ? timeMatch[1] : (generalO ? generalO[0] : null),
    space: spaceMatch ? spaceMatch[1] : (generalO && generalO[1] ? generalO[1] : null),
  };
}

// ── Main App ──────────────────────────────────────────────
export default function App() {
  const [code, setCode]               = useState("");
  const [mode, setMode]               = useState("explain");
  const [language, setLanguage]       = useState("Auto-detect");
  const [result, setResult]           = useState(null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);
  const [fileName, setFileName]       = useState(null);
  const [chunkCount, setChunkCount]   = useState(1);
  const [isDragging, setIsDragging]   = useState(false);
  const [patterns, setPatterns]       = useState([]);
  const [complexity, setComplexity]   = useState({ time: null, space: null });
  const [dots, setDots]               = useState("");
  const fileInputRef                  = useRef(null);
  const currentMode                   = MODES.find(m => m.id === mode);

  // Loading animation
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setDots(d => d.length >= 3 ? "" : d + ".");
    }, 400);
    return () => clearInterval(interval);
  }, [loading]);

  // Detect patterns when code changes
  useEffect(() => {
    if (code.trim().length > 20) {
      setPatterns(detectPatterns(code));
    } else {
      setPatterns([]);
    }
  }, [code]);

  // File handler
  const handleFile = (file) => {
    if (!file) return;
    setFileName(file.name);
    const ext = file.name.split(".").pop().toLowerCase();
    const extMap = {
      py:"Python", js:"JavaScript", jsx:"JavaScript",
      ts:"TypeScript", tsx:"TypeScript", java:"Java",
      cpp:"C++", cc:"C++", cs:"C#", go:"Go",
      rs:"Rust", sql:"SQL", php:"PHP", rb:"Ruby",
    };
    if (extMap[ext]) setLanguage(extMap[ext]);
    const reader = new FileReader();
    reader.onload = (e) => setCode(e.target.result);
    reader.readAsText(file);
  };

  const handleDrop = (e) => {
    e.preventDefault(); setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  // Run handler
  const handleRun = async () => {
    if (!code.trim()) { setError("Please paste some code or upload a file first."); return; }
    setLoading(true); setError(null); setResult(null);
    setChunkCount(1); setComplexity({ time: null, space: null });

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
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || "API error"); }
      const data = await res.json();
      setResult(data.result);
      setChunkCount(data.chunks || 1);
      if (mode === "explain" || mode === "summary") {
        setComplexity(parseComplexity(data.result));
      }
    } catch (e) {
      setError(e.message || "Failed to connect to backend.");
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setCode(""); setResult(null); setError(null);
    setFileName(null); setChunkCount(1);
    setPatterns([]); setComplexity({ time: null, space: null });
  };

  const lineCount = code.split("\n").length;

  return (
    <div style={S.root}>
      {/* ── Header ── */}
      <header style={S.header}>
        <div style={S.headerInner}>
          <div style={S.logo}>
            <div style={{ ...S.logoIcon, background: currentMode.colorLight, color: currentMode.color }}>
              {currentMode.icon}
            </div>
            <span style={S.logoText}>AI Code Explainer</span>
            <span style={{ ...S.vBadge, background: currentMode.colorLight, color: currentMode.color, border: `1px solid ${currentMode.color}44` }}>v3.0</span>
          </div>
          <div style={S.headerRight}>
            <span style={S.badge}>IBM Bob Dev Day</span>
            <span style={S.team}>SoloCoders</span>
          </div>
        </div>
      </header>

      <main style={S.main}>

        {/* ── Mode Tabs ── */}
        <div style={S.modeRow}>
          {MODES.map((m) => (
            <button key={m.id} onClick={() => setMode(m.id)} style={{
              ...S.modeBtn,
              background: mode === m.id ? m.colorLight : "transparent",
              color: mode === m.id ? m.colorDark : C.muted,
              borderColor: mode === m.id ? m.color : C.border,
              borderWidth: mode === m.id ? "1.5px" : "0.5px",
            }}>
              <span style={{ fontFamily: "monospace", marginRight: 5, opacity: 0.7 }}>{m.icon}</span>
              {m.label}
            </button>
          ))}
        </div>

        {/* ── Pattern Badges ── */}
        {patterns.length > 0 && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
            <span style={{ fontSize: 11, color: C.muted, alignSelf: "center" }}>Detected:</span>
            {patterns.map((p, i) => (
              <span key={i} style={{
                fontSize: 11, fontWeight: 600, padding: "3px 10px",
                borderRadius: 99, background: p.bg, color: p.color,
                border: `1px solid ${p.color}44`
              }}>
                {p.label}
              </span>
            ))}
          </div>
        )}

        {/* ── Grid ── */}
        <div style={S.grid}>

          {/* ── Left Panel ── */}
          <div style={{ ...S.panel, borderColor: loading ? currentMode.color : C.border, transition: "border-color 0.3s" }}>
            <div style={S.panelHeader}>
              <span style={S.panelTitle}>Code Input</span>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {fileName && (
                  <span style={{ ...S.fileTag, background: currentMode.colorLight, color: currentMode.colorDark }}>
                    📄 {fileName}
                  </span>
                )}
                <select value={language} onChange={(e) => setLanguage(e.target.value)} style={S.select}>
                  {LANGUAGES.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
            </div>

            <div
              style={{ ...S.dropZone, background: isDragging ? `${currentMode.color}08` : "transparent" }}
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
            >
              {isDragging && (
                <div style={S.dropOverlay}>
                  <span style={{ color: currentMode.color, fontSize: 16, fontWeight: 700 }}>Drop file here ↓</span>
                </div>
              )}
              <textarea
                style={S.textarea}
                value={code}
                onChange={(e) => { setCode(e.target.value); setFileName(null); }}
                placeholder={"// Paste code here, or drag & drop any file...\n\n// Works on everything:\n// • Small functions\n// • Large project files\n// • Any language"}
                spellCheck={false}
              />
            </div>

            <div style={S.panelFooter}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button onClick={() => fileInputRef.current.click()} style={{ ...S.uploadBtn, borderColor: currentMode.color, color: currentMode.color, background: currentMode.colorLight }}>
                  ↑ Upload File
                </button>
                <input ref={fileInputRef} type="file"
                  accept=".py,.js,.jsx,.ts,.tsx,.java,.cpp,.cc,.cs,.go,.rs,.sql,.php,.rb,.txt"
                  style={{ display: "none" }}
                  onChange={(e) => handleFile(e.target.files[0])}
                />
                <span style={S.lineCount}>{lineCount} lines · {code.length} chars</span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {code && <button onClick={clearAll} style={S.clearBtn}>Clear</button>}
                <button onClick={handleRun} disabled={loading} style={{
                  ...S.runBtn,
                  background: loading ? currentMode.colorMid : currentMode.color,
                  opacity: loading ? 0.85 : 1,
                }}>
                  {loading ? `Analyzing${dots}` : "Run →"}
                </button>
              </div>
            </div>
          </div>

          {/* ── Right Panel ── */}
          <div style={S.panel}>
            <div style={S.panelHeader}>
              <span style={S.panelTitle}>AI Output</span>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {chunkCount > 1 && (
                  <span style={{ fontSize: 11, padding: "2px 10px", borderRadius: 99, background: "#FAEEDA", color: "#854F0B", fontWeight: 600 }}>
                    ⚡ {chunkCount} sections
                  </span>
                )}
                <span style={{
                  fontSize: 11, padding: "2px 10px", borderRadius: 99, fontWeight: 600,
                  background: currentMode.colorLight, color: currentMode.colorDark
                }}>
                  {currentMode.icon} {currentMode.label}
                </span>
              </div>
            </div>

            <div style={S.outputArea}>

              {/* Loading state */}
              {loading && (
                <div style={{ padding: "1.5rem 0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: "50%",
                      border: `2.5px solid ${currentMode.colorLight}`,
                      borderTop: `2.5px solid ${currentMode.color}`,
                      animation: "spin 0.7s linear infinite"
                    }} />
                    <span style={{ fontSize: 13, color: C.white, fontWeight: 500 }}>
                      Analyzing your code{dots}
                    </span>
                  </div>
                  {lineCount > 60 && (
                    <div style={{ fontSize: 12, color: C.muted, paddingLeft: 30 }}>
                      Large file detected — processing in sections
                    </div>
                  )}
                  {/* Skeleton lines */}
                  {[90, 75, 85, 60, 70].map((w, i) => (
                    <div key={i} style={{
                      height: 12, borderRadius: 6, marginBottom: 10,
                      background: `${currentMode.color}18`,
                      width: `${w}%`,
                      animation: `pulse 1.5s ease-in-out ${i * 0.1}s infinite`
                    }} />
                  ))}
                </div>
              )}

              {/* Error state */}
              {error && (
                <div style={{
                  color: "#E24B4A", fontSize: 13, padding: "12px 14px",
                  borderRadius: 8, background: "#FCEBEB", border: "1px solid #E24B4A44"
                }}>
                  {error}
                </div>
              )}

              {/* Result */}
              {result && !loading && (
                <div>
                  {/* Complexity Cards — show for explain + summarize */}
                  {(mode === "explain" || mode === "summary") && (complexity.time || complexity.space || patterns.length > 0) && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
                      {complexity.time && (
                        <div style={{ background: "#FAEEDA", border: "0.5px solid #EF9F27", borderRadius: 10, padding: "10px 12px" }}>
                          <div style={{ fontSize: 10, fontWeight: 600, color: "#854F0B", textTransform: "uppercase", letterSpacing: "0.06em" }}>Time</div>
                          <div style={{ fontSize: 18, fontWeight: 500, color: "#412402", margin: "2px 0" }}>{complexity.time}</div>
                        </div>
                      )}
                      {complexity.space && (
                        <div style={{ background: "#E1F5EE", border: "0.5px solid #1D9E75", borderRadius: 10, padding: "10px 12px" }}>
                          <div style={{ fontSize: 10, fontWeight: 600, color: "#0F6E56", textTransform: "uppercase", letterSpacing: "0.06em" }}>Space</div>
                          <div style={{ fontSize: 18, fontWeight: 500, color: "#085041", margin: "2px 0" }}>{complexity.space}</div>
                        </div>
                      )}
                      {patterns.length > 0 && (
                        <div style={{ background: "#EEEDFE", border: "0.5px solid #7F77DD", borderRadius: 10, padding: "10px 12px" }}>
                          <div style={{ fontSize: 10, fontWeight: 600, color: "#534AB7", textTransform: "uppercase", letterSpacing: "0.06em" }}>Pattern</div>
                          <div style={{ fontSize: 13, fontWeight: 500, color: "#26215C", margin: "2px 0" }}>{patterns[0].label}</div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Main output */}
                  <pre style={{
                    fontFamily: "Consolas, monospace", fontSize: 12.5,
                    lineHeight: 1.8, color: C.white, whiteSpace: "pre-wrap",
                    wordBreak: "break-word", margin: 0
                  }}>
                    {result}
                  </pre>
                </div>
              )}

              {/* Placeholder */}
              {!result && !loading && !error && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 10, textAlign: "center", padding: "2rem" }}>
                  <div style={{ fontSize: 32, color: currentMode.color }}>{currentMode.icon}</div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: C.white }}>Ready to {currentMode.label.toLowerCase()}</span>
                  <span style={{ fontSize: 12, color: C.muted }}>Paste code or upload a file</span>
                  <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap", justifyContent: "center" }}>
                    {["Small functions", "Large project files", "Any language"].map(f => (
                      <span key={f} style={{
                        fontSize: 11, padding: "3px 10px", borderRadius: 99,
                        background: currentMode.colorLight, color: currentMode.colorDark,
                        border: `1px solid ${currentMode.color}33`
                      }}>✓ {f}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {result && (
              <div style={S.panelFooter}>
                <span style={S.lineCount}>{result.length} chars output</span>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => navigator.clipboard.writeText(result)} style={S.clearBtn}>
                    Copy output
                  </button>
                  <button onClick={() => setResult(null)} style={S.clearBtn}>
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity: 0.4; } 50% { opacity: 0.8; } }
      `}</style>
    </div>
  );
}

/* ── Design Tokens ─────────────────────────── */
const C = {
  bg:      "#0D1117",
  surface: "#161B22",
  border:  "#21262D",
  white:   "#E6EDF3",
  muted:   "#7D8590",
};

const S = {
  root:        { minHeight: "100vh", background: C.bg, color: C.white, fontFamily: "'Segoe UI', system-ui, sans-serif" },
  header:      { borderBottom: `1px solid ${C.border}`, background: C.surface, position: "sticky", top: 0, zIndex: 10 },
  headerInner: { maxWidth: 1300, margin: "0 auto", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  logo:        { display: "flex", alignItems: "center", gap: 10 },
  logoIcon:    { width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, fontFamily: "monospace", transition: "all 0.3s" },
  logoText:    { fontWeight: 700, fontSize: 17, letterSpacing: "-0.02em" },
  vBadge:      { fontSize: 11, padding: "2px 8px", borderRadius: 99, fontWeight: 700, transition: "all 0.3s" },
  headerRight: { display: "flex", alignItems: "center", gap: 12 },
  badge:       { fontSize: 12, padding: "3px 10px", borderRadius: 99, background: "#1D9E7518", color: "#1D9E75", border: "1px solid #1D9E7544" },
  team:        { fontSize: 13, color: C.muted },
  main:        { maxWidth: 1300, margin: "0 auto", padding: "20px 24px" },
  modeRow:     { display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" },
  modeBtn:     { fontSize: 13, fontWeight: 500, padding: "7px 16px", borderRadius: 8, border: "0.5px solid", cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center" },
  grid:        { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, minHeight: 580 },
  panel:       { background: C.surface, borderRadius: 10, border: `0.5px solid ${C.border}`, display: "flex", flexDirection: "column", overflow: "hidden", transition: "border-color 0.3s" },
  panelHeader: { padding: "10px 14px", borderBottom: `0.5px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" },
  panelTitle:  { fontSize: 13, fontWeight: 600, color: C.white },
  select:      { fontSize: 12, background: C.bg, color: C.muted, border: `0.5px solid ${C.border}`, borderRadius: 6, padding: "3px 7px", outline: "none" },
  fileTag:     { fontSize: 11, padding: "2px 8px", borderRadius: 99, fontWeight: 500, maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  dropZone:    { flex: 1, position: "relative", transition: "background 0.2s" },
  dropOverlay: { position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.4)", zIndex: 2, borderRadius: 4 },
  textarea:    { width: "100%", height: "100%", minHeight: 360, background: "transparent", border: "none", outline: "none", resize: "none", fontFamily: "Consolas, monospace", fontSize: 13, lineHeight: 1.7, padding: "14px 16px", color: C.white, boxSizing: "border-box" },
  panelFooter: { padding: "10px 14px", borderTop: `0.5px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 },
  uploadBtn:   { fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 7, border: "1px solid", cursor: "pointer", transition: "all 0.2s" },
  lineCount:   { fontSize: 11, color: C.muted },
  clearBtn:    { fontSize: 12, padding: "5px 10px", borderRadius: 7, border: `0.5px solid ${C.border}`, background: "transparent", color: C.muted, cursor: "pointer" },
  runBtn:      { color: "#fff", border: "none", borderRadius: 8, padding: "7px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.2s", minWidth: 100 },
  outputArea:  { flex: 1, padding: 16, overflowY: "auto", minHeight: 360 },
};