# ✦ AI Code Explainer

> **IBM Bob Dev Day Hackathon** | Team: **SoloCoders**

An intelligent code analysis tool that helps developers understand, document, optimize, and debug code using AI. Powered by Groq's free LLM API.

![AI Code Explainer](https://img.shields.io/badge/Hackathon-IBM%20Bob%20Dev%20Day-blue)
![Python](https://img.shields.io/badge/Python-3.11-green)
![React](https://img.shields.io/badge/React-19.2-blue)
![Flask](https://img.shields.io/badge/Flask-3.1-black)

---

## 🎯 Features

- **🔍 Explain Code**: Get beginner-friendly explanations of any code snippet
- **💬 Add Comments**: Automatically generate meaningful inline comments
- **📝 Summarize**: Quick overview with complexity analysis
- **⚡ Optimize**: Performance improvements and best practices
- **🐛 Debug**: Find and fix potential bugs

### Supported Languages
Python, JavaScript, TypeScript, Java, C++, C#, Go, Rust, SQL, PHP, Ruby, and more!

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Free Groq API Key ([Get one here](https://console.groq.com))

### 1️⃣ Clone the Repository
```bash
git clone <your-repo-url>
cd ai-code-explainer
```

### 2️⃣ Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your GROQ_API_KEY

# Run the server
python app.py
```

Backend will run at: `http://localhost:5000`

### 3️⃣ Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

Frontend will run at: `http://localhost:3000`

---

## 🔑 Getting Your Free Groq API Key

1. Visit [console.groq.com](https://console.groq.com)
2. Sign up (free, no credit card required)
3. Navigate to API Keys section
4. Create a new API key
5. Copy and paste it into `backend/.env`

**Note**: Groq offers free, fast LLM inference with generous rate limits!

---

## 📁 Project Structure

```
ai-code-explainer/
├── backend/                 # Flask API
│   ├── app.py              # Main application
│   ├── requirements.txt    # Python dependencies
│   ├── .env.example        # Environment template
│   └── .env                # Your config (create this)
│
├── frontend/               # React UI
│   ├── src/
│   │   ├── App.jsx        # Main component
│   │   ├── App.css        # Styles
│   │   └── index.js       # Entry point
│   ├── public/            # Static assets
│   └── package.json       # Node dependencies
│
└── README.md              # This file
```

---

## 🔧 API Documentation

### Base URL
```
http://localhost:5000
```

### Endpoints

#### `POST /api/explain`
Analyze code with AI

**Request Body:**
```json
{
  "code": "def fibonacci(n):\n    if n <= 1: return n\n    return fibonacci(n-1) + fibonacci(n-2)",
  "mode": "explain",
  "language": "Python"
}
```

**Modes:**
- `explain` - Beginner-friendly explanation
- `comment` - Add inline comments
- `summary` - Quick overview
- `optimize` - Performance improvements
- `debug` - Find and fix bugs

**Response:**
```json
{
  "result": "This code implements the Fibonacci sequence...",
  "mode": "explain"
}
```

#### `GET /api/health`
Health check endpoint

**Response:**
```json
{
  "status": "ok",
  "model": "llama-3.3-70b-versatile"
}
```

---

## 🎨 Usage Examples

### Example 1: Explain Code
```javascript
// Paste this in the app:
function quickSort(arr) {
  if (arr.length <= 1) return arr;
  const pivot = arr[0];
  const left = arr.slice(1).filter(x => x < pivot);
  const right = arr.slice(1).filter(x => x >= pivot);
  return [...quickSort(left), pivot, ...quickSort(right)];
}
```

**Mode**: Explain  
**Result**: Step-by-step explanation of the QuickSort algorithm

### Example 2: Optimize Code
```python
# Paste this in the app:
def find_duplicates(lst):
    duplicates = []
    for i in range(len(lst)):
        for j in range(i+1, len(lst)):
            if lst[i] == lst[j] and lst[i] not in duplicates:
                duplicates.append(lst[i])
    return duplicates
```

**Mode**: Optimize  
**Result**: Optimized O(n) solution using sets

---

## 🛠️ Development

### Backend Development
```bash
cd backend
python app.py
```

### Frontend Development
```bash
cd frontend
npm start
```

### Running Tests
```bash
# Backend tests (coming soon)
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

---

## 🚢 Deployment

### Backend (Render/Railway)
1. Push code to GitHub
2. Connect repository to Render/Railway
3. Set environment variables (GROQ_API_KEY)
4. Deploy!

### Frontend (Vercel/Netlify)
1. Push code to GitHub
2. Connect repository to Vercel/Netlify
3. Set build command: `npm run build`
4. Set publish directory: `build`
5. Update API_BASE in `App.jsx` to your backend URL
6. Deploy!

---

## 🔒 Security Notes

- ✅ Never commit `.env` files
- ✅ Use environment variables for API keys
- ✅ Enable CORS only for trusted origins
- ✅ Implement rate limiting in production
- ✅ Use HTTPS in production

---

## 🐛 Troubleshooting

### Backend Issues

**Problem**: `ModuleNotFoundError: No module named 'flask'`  
**Solution**: Activate virtual environment and run `pip install -r requirements.txt`

**Problem**: `API error: 401 Unauthorized`  
**Solution**: Check your GROQ_API_KEY in `.env` file

**Problem**: `CORS error`  
**Solution**: Ensure backend is running and CORS is configured correctly

### Frontend Issues

**Problem**: `Cannot connect to backend`  
**Solution**: Verify backend is running at `http://localhost:5000`

**Problem**: `npm start fails`  
**Solution**: Delete `node_modules` and `package-lock.json`, then run `npm install`

---

## 📊 Tech Stack

### Backend
- **Framework**: Flask 3.1.3
- **AI API**: Groq (Llama 3.3 70B)
- **HTTP Client**: Requests
- **CORS**: Flask-CORS

### Frontend
- **Framework**: React 19.2
- **Language**: JavaScript (JSX)
- **Styling**: Inline CSS (custom design system)
- **HTTP Client**: Fetch API

---

## 🎯 Roadmap

- [x] Core functionality (explain, comment, summarize, optimize, debug)
- [x] Multi-language support
- [x] Clean, modern UI
- [ ] Syntax highlighting
- [ ] Code history/saved snippets
- [ ] Export results (PDF, Markdown)
- [ ] Share functionality
- [ ] User authentication
- [ ] Multi-file support
- [ ] Diff view for optimizations

---

## 👥 Team

**SoloCoders** - IBM Bob Dev Day Hackathon

---

## 📄 License

This project is created for the IBM Bob Dev Day Hackathon.

---

## 🙏 Acknowledgments

- **Groq** for providing free, fast LLM API
- **IBM** for hosting the Bob Dev Day Hackathon
- **Meta** for the Llama 3.3 model

---

## 📞 Support

For issues or questions:
1. Check the [Troubleshooting](#-troubleshooting) section
2. Review the [API Documentation](#-api-documentation)
3. Open an issue on GitHub

---

**Made with ❤️ for IBM Bob Dev Day Hackathon**
