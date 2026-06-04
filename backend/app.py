"""
AI Code Explainer - Flask Backend (UPGRADED v2.0)
IBM Bob Dev Day Hackathon | Team: SoloCoders

Upgrade: File chunking — now handles large real project files!
Free API: Groq (https://console.groq.com) - No credits required
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
import re

app = Flask(__name__)
CORS(app)

GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "YOUR_GROQ_API_KEY_HERE")
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL   = "llama-3.3-70b-versatile"

MAX_CHUNK_LINES = 60

PROMPTS = {
    "explain": """You are an expert code explainer for developers and students.
Given a code chunk, provide a clear beginner-friendly explanation with:
- What this code does (1-2 plain English sentences)
- How it works step by step (numbered list)
- Key programming concepts used (bullet list)
Be concise, clear, and educational. Label your response with the function/section name if visible.""",

    "comment": """You are an expert at writing clean, helpful inline code comments.
Given code, return the SAME code but with meaningful inline comments added.
Rules:
- Explain WHY, not just WHAT
- Use correct comment syntax for the language
- Don't over-comment obvious lines
- Return ONLY the commented code, no extra text.""",

    "summary": """You are a senior developer writing a code summary.
Given code, provide:
- Purpose (1 sentence)
- Input/Output
- Complexity (simple/moderate/complex or Big-O)
- Dependencies
- Notes (edge cases, warnings)
Keep it under 150 words.""",

    "optimize": """You are a performance-focused senior engineer.
Given code, provide:
- Issues found (inefficiencies, anti-patterns)
- Optimized version (full code)
- What changed and why
Focus on time complexity, memory, readability, and best practices.""",

    "debug": """You are an expert debugger.
Given code, analyze carefully and provide:
- Potential bugs found (with line references)
- Fixed version (full corrected code)
- Explanation of each bug and fix
If no bugs found, confirm the code looks correct."""
}


def split_into_chunks(code: str, language: str = "") -> list:
    """Splits large code into logical chunks by function/class boundaries."""
    lines = code.split("\n")

    if len(lines) <= MAX_CHUNK_LINES:
        return [code]

    patterns = {
        "python":     r"^(def |class |async def )",
        "javascript": r"^(function |class |const .+=|export )",
        "typescript": r"^(function |class |const .+=|export )",
        "java":       r"^.*(public|private|protected).*(void|int|String|boolean|class)",
        "c++":        r"^(\w[\w\s\*&]+)\s+\w+\s*\(",
        "go":         r"^func ",
        "rust":       r"^(pub )?(fn |struct |impl |enum )",
    }

    lang_key = language.lower().strip()
    pattern  = patterns.get(lang_key, r"^(def |class |function |func |pub fn )")

    split_points = [0]
    for i, line in enumerate(lines):
        if i > 0 and re.match(pattern, line.strip()):
            split_points.append(i)
    split_points.append(len(lines))

    raw_chunks = []
    for i in range(len(split_points) - 1):
        chunk = "\n".join(lines[split_points[i]:split_points[i+1]]).strip()
        if chunk:
            raw_chunks.append(chunk)

    # Merge small chunks
    merged, buffer = [], ""
    for chunk in raw_chunks:
        candidate = (buffer + "\n\n" + chunk).strip() if buffer else chunk
        if len(candidate.split("\n")) <= MAX_CHUNK_LINES:
            buffer = candidate
        else:
            if buffer:
                merged.append(buffer)
            buffer = chunk
    if buffer:
        merged.append(buffer)

    # Safety split for oversized chunks
    final = []
    for chunk in merged:
        chunk_lines = chunk.split("\n")
        if len(chunk_lines) > MAX_CHUNK_LINES * 2:
            for i in range(0, len(chunk_lines), MAX_CHUNK_LINES):
                part = "\n".join(chunk_lines[i:i+MAX_CHUNK_LINES]).strip()
                if part:
                    final.append(part)
        else:
            final.append(chunk)

    return final if final else [code]


def call_groq(system_prompt: str, user_message: str) -> str:
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": GROQ_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user",   "content": user_message}
        ],
        "temperature": 0.3,
        "max_tokens": 1024
    }
    response = requests.post(GROQ_API_URL, json=payload, headers=headers, timeout=30)
    response.raise_for_status()
    return response.json()["choices"][0]["message"]["content"]


@app.route("/api/explain", methods=["POST"])
def explain():
    data = request.get_json()
    if not data or "code" not in data:
        return jsonify({"error": "Missing 'code' in request body"}), 400

    code     = data["code"].strip()
    mode     = data.get("mode", "explain")
    language = data.get("language", "")

    if not code:
        return jsonify({"error": "Code cannot be empty"}), 400
    if mode not in PROMPTS:
        return jsonify({"error": f"Invalid mode."}), 400

    lang_hint = f" The code is written in {language}." if language and language.lower() != "auto" else ""
    chunks    = split_into_chunks(code, language)
    total     = len(chunks)

    try:
        if total == 1:
            user_message = f"Here is the code to analyze:{lang_hint}\n\n```\n{code}\n```"
            result = call_groq(PROMPTS[mode], user_message)
        else:
            results = []
            for idx, chunk in enumerate(chunks, 1):
                user_message = (
                    f"This is section {idx} of {total} from a larger file.{lang_hint}\n\n"
                    f"```\n{chunk}\n```"
                )
                chunk_result = call_groq(PROMPTS[mode], user_message)
                results.append(f"━━━ Section {idx} of {total} ━━━\n{chunk_result}")
            result = "\n\n".join(results)

        return jsonify({"result": result, "mode": mode, "chunks": total})

    except requests.exceptions.HTTPError as e:
        return jsonify({"error": f"AI API error: {str(e)}"}), 502
    except requests.exceptions.Timeout:
        return jsonify({"error": "Request timed out. Try again."}), 504
    except Exception as e:
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "model": GROQ_MODEL, "version": "2.0"})


@app.route("/", methods=["GET"])
def index():
    return jsonify({
        "app": "AI Code Explainer v2.0",
        "team": "SoloCoders",
        "hackathon": "IBM Bob Dev Day",
        "feature": "Large file chunking support"
    })


if __name__ == "__main__":
    print("=" * 55)
    print(" AI Code Explainer v2.0 — with File Chunking!")
    print(" Team: SoloCoders | IBM Bob Dev Day Hackathon")
    print("=" * 55)
    app.run(debug=True, port=5000)