"""
AI Code Explainer - Flask Backend
IBM Bob Dev Day Hackathon | Team: SoloCoders

Free AI API: Groq (https://console.groq.com) - No credits required
Signup -> Get API Key -> Paste below -> Done!
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os

app = Flask(__name__)
CORS(app)

# ─────────────────────────────────────────
# FREE API SETUP — GROQ (Recommended)
# 1. Go to https://console.groq.com
# 2. Sign up (free, no credit card)
# 3. Create an API key
# 4. Paste it below OR set as env variable:
#    export GROQ_API_KEY="your_key_here"
# ─────────────────────────────────────────
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "YOUR_GROQ_API_KEY_HERE")
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL   = "llama-3.3-70b-versatile"   # Free, fast, powerful

# ─────────────────────────────────────────
# MODE PROMPTS
# ─────────────────────────────────────────
PROMPTS = {
    "explain": """You are an expert code explainer for developers and students.
Given code, provide a clear beginner-friendly explanation with:
- What this code does (1-2 plain English sentences)
- How it works step by step (numbered list)
- Key programming concepts used (bullet list)
Be concise, clear, and educational.""",

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


def call_groq(system_prompt: str, user_message: str) -> str:
    """Call Groq API and return the response text."""
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
    """
    POST /api/explain
    Body: { "code": "...", "mode": "explain|comment|summary|optimize|debug", "language": "Python" }
    Returns: { "result": "..." }
    """
    data = request.get_json()

    if not data or "code" not in data:
        return jsonify({"error": "Missing 'code' in request body"}), 400

    code     = data["code"].strip()
    mode     = data.get("mode", "explain")
    language = data.get("language", "")

    if not code:
        return jsonify({"error": "Code cannot be empty"}), 400

    if mode not in PROMPTS:
        return jsonify({"error": f"Invalid mode. Choose from: {list(PROMPTS.keys())}"}), 400

    lang_hint = f" The code is written in {language}." if language and language != "auto" else ""
    user_message = f"Here is the code to analyze:{lang_hint}\n\n```\n{code}\n```"

    try:
        result = call_groq(PROMPTS[mode], user_message)
        return jsonify({"result": result, "mode": mode})
    except requests.exceptions.HTTPError as e:
        return jsonify({"error": f"AI API error: {str(e)}"}), 502
    except requests.exceptions.Timeout:
        return jsonify({"error": "AI API timed out. Try again."}), 504
    except Exception as e:
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "model": GROQ_MODEL})


@app.route("/", methods=["GET"])
def index():
    return jsonify({
        "app": "AI Code Explainer",
        "team": "SoloCoders",
        "hackathon": "IBM Bob Dev Day",
        "endpoints": {
            "POST /api/explain": "Explain, comment, summarize, optimize, or debug code",
            "GET /api/health":   "Health check"
        }
    })


if __name__ == "__main__":
    print("=" * 50)
    print(" AI Code Explainer — IBM Bob Dev Day Hackathon")
    print(" Team: SoloCoders")
    print("=" * 50)
    if GROQ_API_KEY == "YOUR_GROQ_API_KEY_HERE":
        print(" ⚠  Set your GROQ_API_KEY before running!")
        print("    Get one free at: https://console.groq.com")
    print(" Server running at: http://localhost:5000")
    print("=" * 50)
    port = int(os.environ.get("PORT", 5000))
app.run(debug=False, host="0.0.0.0", port=port)