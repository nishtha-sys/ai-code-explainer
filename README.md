# ✦ AI Code Explainer

> **Built solo in 48 hours** · IBM Bob Dev Day Hackathon 2026 · Team: SoloCoders

A purpose-built AI tool that instantly explains, documents, optimizes, and debugs code — no prompting skills required. Paste any code, pick a mode, get results.

**🔴 [Live Demo → ai-code-explainer-ruddy.vercel.app](https://ai-code-explainer-ruddy.vercel.app)**

![Hackathon](https://img.shields.io/badge/Hackathon-IBM%20Bob%20Dev%20Day%202026-blue)
![Python](https://img.shields.io/badge/Python-3.11-green)
![React](https://img.shields.io/badge/React-19.2-blue)
![Flask](https://img.shields.io/badge/Flask-3.1-black)
![Groq](https://img.shields.io/badge/Groq-Llama%203.3%2070B-orange)
![Status](https://img.shields.io/badge/Status-Live-brightgreen)

---

## Why This Tool Exists

ChatGPT and Claude can explain code — if you know how to prompt them well.

**AI Code Explainer is different:**

| Feature | AI Code Explainer | ChatGPT / Claude |
|---|---|---|
| Purpose-built for code | ✅ | ❌ General purpose |
| No prompting needed | ✅ One click | ❌ Manual prompting |
| No account / login | ✅ Open access | ❌ Account required |
| Large file chunking | ✅ Built-in | ❌ Context limits hit |
| 5 dedicated modes | ✅ | ❌ One chat window |
| Free, no limits | ✅ Groq API | ❌ Free tier capped |

---

## 5 Modes — Each Purpose-Built

| Mode | What it does |
|---|---|
| 🔍 **Explain** | Beginner-friendly breakdown with step-by-step walkthrough |
| 💬 **Add Comments** | Inserts meaningful inline comments — explains WHY, not just WHAT |
| 📝 **Summarize** | Purpose, I/O, complexity (Big-O), dependencies in under 150 words |
| ⚡ **Optimize** | Finds inefficiencies, rewrites with better time/space complexity |
| 🐛 **Debug** | Finds bugs with line references, returns fully corrected code |

---

## The Technical Part — What Makes This More Than an API Wrapper

### Language-Aware Chunking Algorithm
Most hackathon projects pass raw code directly to an LLM — which fails on large files due to context window limits.

This project includes a custom **regex-based code splitter** that:
- Detects function and class boundaries per language (`def`, `class`, `func`, `fn`, etc.)
- Splits large files at logical boundaries — not arbitrary line counts
- Merges small chunks to avoid fragmentation
- Processes each chunk with section labels (`Section 2 of 5`) for coherent output
- Supports Python, JavaScript, TypeScript, Java, C++, Go, Rust and more

```python
# Example: Python boundary detection
pattern = r"^(def |class |async def )"

# Each chunk gets its own context
user_message = f"This is section {idx} of {total} from a larger file.\n\n```\n{chunk}\n```"
```

### Structured Prompt Engineering
Each mode uses a hand-crafted system prompt that enforces a specific output format — not just "explain this code." The model is given a persona, output structure, and rules per mode.

### Production-Grade Error Handling
- `408 Timeout` → clean user message, not a crash
- `401 Unauthorized` → Groq API key error caught explicitly
- `400 Bad Request` → empty input and invalid mode validation
- `502 Bad Gateway` → upstream API failure handled gracefully

---

## Supported Languages

Python · JavaScript · TypeScript · Java · C++ · C# · Go · Rust · SQL · PHP · Ruby · and more via auto-detection

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19.2, JSX, Fetch API |
| Backend | Python, Flask 3.1, Flask-CORS |
| AI Model | Llama 3.3 70B via Groq API |
| Deployment | Vercel (frontend) + Render (backend) |

---

## Quick Start (Local)

### Prerequisites
- Python 3.11+
- Node.js 18+
- Free Groq API Key → [console.groq.com](https://console.groq.com) (no credit card needed)

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/nishtha-sys/ai-code-explainer.git
cd ai-code-explainer
```

### 2️⃣ Backend Setup
```powershell
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
$env:GROQ_API_KEY="your_key_here"
python app.py
# Runs at http://localhost:5000
```

### 3️⃣ Frontend Setup
```powershell
cd frontend
npm install
npm start
# Runs at http://localhost:3000
```

---

## API Reference

### `POST /api/explain`
```json
{
  "code": "def fibonacci(n):\n    if n <= 1: return n\n    return fibonacci(n-1) + fibonacci(n-2)",
  "mode": "explain",
  "language": "Python"
}
```
**Response:**
```json
{
  "result": "This function implements the Fibonacci sequence...",
  "mode": "explain",
  "chunks": 1
}
```

**Modes:** `explain` · `comment` · `summary` · `optimize` · `debug`

### `GET /api/health`
```json
{ "status": "ok", "model": "llama-3.3-70b-versatile", "version": "2.0" }
```

---

## Project Structure

```
ai-code-explainer/
├── backend/
│   ├── app.py              # Flask API + chunking algorithm + prompt engineering
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── App.jsx         # React UI — 5 modes, file upload, auto-detect
│       └── App.css
├── .gitignore
└── README.md
```

---

## Roadmap — v2 Planned Improvements

- [ ] **Rate limiting** — `flask-limiter` to prevent API key abuse
- [ ] **GitHub URL analysis** — paste a repo URL, analyze entire codebase
- [ ] **Complexity visualizer** — cyclomatic complexity, LOC, nesting depth as visual chart
- [ ] Syntax highlighting in input/output
- [ ] Streaming responses (no more waiting for full output)
- [ ] Export results as PDF or Markdown

---

## Built By

**Nishtha Sahani** — B.Tech CS (AI), BBDU Lucknow · Graduating 2027

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Nishtha%20Sahani-blue)](https://linkedin.com/in/nishtha-sahani)
[![GitHub](https://img.shields.io/badge/GitHub-nishtha--sys-black)](https://github.com/nishtha-sys)
[![Portfolio](https://img.shields.io/badge/Portfolio-Live-green)](https://portfolio-nishthasahani.vercel.app)

---

## Acknowledgments

- **Groq** — free, fast LLM inference API
- **IBM** — IBM Bob Dev Day Hackathon 2026
- **Meta** — Llama 3.3 70B model

---

*Shipped solo · 48 hours · Live on day one*
