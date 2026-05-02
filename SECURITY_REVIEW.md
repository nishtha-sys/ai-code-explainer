# 🔒 Security Review - AI Code Explainer Backend

## Executive Summary

Your Flask backend accepts user-submitted code and sends it to the Groq AI API. This document identifies security vulnerabilities and provides actionable fixes.

**Risk Level**: 🟡 MEDIUM (Several issues need attention)

---

## 🚨 Critical Vulnerabilities Found

### 1. **API Key Exposure** 
**Severity**: 🔴 HIGH  
**Location**: `app.py:25`

**Issue**:
```python
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "YOUR_GROQ_API_KEY_HERE")
```

**Risk**:
- Hardcoded fallback value could be committed to version control
- If `.env` is missing, app runs with invalid key (fails silently)
- API key could be exposed in error messages or logs

**Fix**:
```python
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY environment variable is required")
```

---

### 2. **Unrestricted CORS**
**Severity**: 🟡 MEDIUM  
**Location**: `app.py:15`

**Issue**:
```python
CORS(app)  # Allows ALL origins
```

**Risk**:
- Any website can make requests to your API
- Enables CSRF attacks
- Allows unauthorized access from malicious sites

**Fix**:
```python
# Development
CORS(app, origins=["http://localhost:3000"])

# Production
allowed_origins = os.environ.get("ALLOWED_ORIGINS", "").split(",")
CORS(app, origins=allowed_origins)
```

---

### 3. **No Input Validation**
**Severity**: 🟡 MEDIUM  
**Location**: `app.py:93-110`

**Issue**:
- No length limits on code input
- No validation of mode parameter
- No sanitization of language parameter

**Risk**:
- DoS attacks via extremely large payloads
- Memory exhaustion
- Excessive API costs

**Fix**:
```python
# Add validation
MAX_CODE_LENGTH = 10000  # 10KB limit

code = data["code"].strip()
if len(code) > MAX_CODE_LENGTH:
    return jsonify({"error": "Code too long (max 10KB)"}), 400

if len(code) < 10:
    return jsonify({"error": "Code too short"}), 400

# Validate mode
VALID_MODES = list(PROMPTS.keys())
if mode not in VALID_MODES:
    return jsonify({"error": f"Invalid mode. Use: {VALID_MODES}"}), 400
```

---

### 4. **No Rate Limiting**
**Severity**: 🟡 MEDIUM  
**Location**: All endpoints

**Issue**:
- No protection against abuse
- Single user can exhaust API quota
- No throttling mechanism

**Risk**:
- DoS attacks
- API cost explosion
- Service degradation for legitimate users

**Fix**:
```python
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["100 per hour", "20 per minute"]
)

@app.route("/api/explain", methods=["POST"])
@limiter.limit("10 per minute")  # Stricter for expensive endpoint
def explain():
    # ...
```

**Install**: `pip install Flask-Limiter`

---

### 5. **Sensitive Data in Error Messages**
**Severity**: 🟡 MEDIUM  
**Location**: `app.py:121-126`

**Issue**:
```python
except Exception as e:
    return jsonify({"error": f"Unexpected error: {str(e)}"}), 500
```

**Risk**:
- Stack traces expose internal structure
- API keys could leak in error messages
- Helps attackers understand system

**Fix**:
```python
import logging
logger = logging.getLogger(__name__)

except Exception as e:
    logger.error(f"Unexpected error: {str(e)}", exc_info=True)
    return jsonify({"error": "An internal error occurred"}), 500
```

---

### 6. **No Request Timeout Protection**
**Severity**: 🟢 LOW  
**Location**: `app.py:88`

**Issue**:
```python
response = requests.post(GROQ_API_URL, json=payload, headers=headers, timeout=30)
```

**Risk**:
- 30 seconds is quite long
- Could tie up resources
- User experience degradation

**Fix**:
```python
# Reduce timeout
timeout = int(os.environ.get("API_TIMEOUT", "15"))
response = requests.post(..., timeout=timeout)
```

---

### 7. **Missing Security Headers**
**Severity**: 🟡 MEDIUM  
**Location**: Response headers

**Issue**:
- No Content-Security-Policy
- No X-Content-Type-Options
- No X-Frame-Options

**Risk**:
- XSS attacks
- Clickjacking
- MIME-type sniffing

**Fix**:
```python
@app.after_request
def add_security_headers(response):
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    return response
```

---

### 8. **No Input Sanitization**
**Severity**: 🟢 LOW  
**Location**: `app.py:105-107`

**Issue**:
- User input passed directly to AI
- No filtering of malicious patterns

**Risk**:
- Prompt injection attacks
- AI jailbreaking attempts
- Inappropriate content generation

**Fix**:
```python
import re

def sanitize_code(code):
    """Basic sanitization of code input."""
    # Remove null bytes
    code = code.replace('\x00', '')
    
    # Limit consecutive newlines
    code = re.sub(r'\n{10,}', '\n\n\n', code)
    
    # Remove control characters except newlines and tabs
    code = ''.join(char for char in code 
                   if char.isprintable() or char in '\n\t')
    
    return code.strip()

code = sanitize_code(data["code"])
```

---

### 9. **Debug Mode in Production**
**Severity**: 🔴 HIGH  
**Location**: `app.py:158`

**Issue**:
```python
app.run(debug=False, host="0.0.0.0", port=port)
```

**Risk**:
- Even though `debug=False`, using `app.run()` is not production-ready
- Should use WSGI server (Gunicorn)

**Fix**:
```bash
# Use Gunicorn in production
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

---

### 10. **No Logging/Monitoring**
**Severity**: 🟡 MEDIUM  
**Location**: Entire application

**Issue**:
- No request logging
- No error tracking
- No audit trail

**Risk**:
- Can't detect attacks
- Can't debug issues
- No compliance trail

**Fix**:
```python
import logging
from logging.handlers import RotatingFileHandler

# Configure logging
handler = RotatingFileHandler('app.log', maxBytes=10000000, backupCount=3)
handler.setFormatter(logging.Formatter(
    '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
))
app.logger.addHandler(handler)
app.logger.setLevel(logging.INFO)

@app.before_request
def log_request():
    app.logger.info(f"{request.method} {request.path} from {request.remote_addr}")
```

---

## 🛡️ Additional Security Recommendations

### 11. **Environment Variable Validation**
```python
# Validate all required env vars on startup
REQUIRED_ENV_VARS = ['GROQ_API_KEY']
missing = [var for var in REQUIRED_ENV_VARS if not os.environ.get(var)]
if missing:
    raise ValueError(f"Missing required environment variables: {missing}")
```

### 12. **API Key Rotation Strategy**
- Store API keys in secure vault (AWS Secrets Manager, HashiCorp Vault)
- Implement key rotation every 90 days
- Use different keys for dev/staging/production

### 13. **Request Validation Schema**
```python
from jsonschema import validate, ValidationError

REQUEST_SCHEMA = {
    "type": "object",
    "properties": {
        "code": {"type": "string", "minLength": 10, "maxLength": 10000},
        "mode": {"type": "string", "enum": list(PROMPTS.keys())},
        "language": {"type": "string", "maxLength": 50}
    },
    "required": ["code"]
}

try:
    validate(instance=data, schema=REQUEST_SCHEMA)
except ValidationError as e:
    return jsonify({"error": str(e.message)}), 400
```

### 14. **Content-Type Validation**
```python
@app.before_request
def validate_content_type():
    if request.method == 'POST':
        if not request.is_json:
            return jsonify({"error": "Content-Type must be application/json"}), 415
```

### 15. **IP Whitelisting (Optional)**
```python
ALLOWED_IPS = os.environ.get("ALLOWED_IPS", "").split(",")

@app.before_request
def check_ip():
    if ALLOWED_IPS and request.remote_addr not in ALLOWED_IPS:
        return jsonify({"error": "Unauthorized IP"}), 403
```

---

## 📋 Security Checklist

### Immediate Actions (Do Now)
- [x] Fix requirements.txt encoding
- [ ] Remove hardcoded API key fallback
- [ ] Add input length validation
- [ ] Configure CORS properly
- [ ] Add rate limiting
- [ ] Sanitize error messages
- [ ] Add security headers

### Short-term (This Week)
- [ ] Implement request logging
- [ ] Add input sanitization
- [ ] Set up proper environment validation
- [ ] Configure Gunicorn for production
- [ ] Add health check monitoring

### Long-term (Next Sprint)
- [ ] Implement API key rotation
- [ ] Add request schema validation
- [ ] Set up error tracking (Sentry)
- [ ] Implement audit logging
- [ ] Add automated security scanning

---

## 🔧 Secure Configuration Example

### `.env` file (NEVER commit this)
```bash
# API Configuration
GROQ_API_KEY=gsk_your_actual_key_here

# Flask Configuration
FLASK_ENV=production
FLASK_DEBUG=False
SECRET_KEY=your-secret-key-here

# CORS
ALLOWED_ORIGINS=https://your-frontend.com,https://www.your-frontend.com

# Rate Limiting
RATE_LIMIT_PER_MINUTE=10
RATE_LIMIT_PER_HOUR=100

# API Limits
MAX_CODE_LENGTH=10000
API_TIMEOUT=15
MAX_TOKENS=1024

# Logging
LOG_LEVEL=INFO
LOG_FILE=app.log
```

---

## 🚀 Production Deployment Checklist

- [ ] Use HTTPS only (TLS 1.2+)
- [ ] Set `FLASK_ENV=production`
- [ ] Use Gunicorn/uWSGI (not `app.run()`)
- [ ] Enable rate limiting
- [ ] Configure proper CORS
- [ ] Set up monitoring (Datadog, New Relic)
- [ ] Enable error tracking (Sentry)
- [ ] Use environment variables for all secrets
- [ ] Implement request logging
- [ ] Set up automated backups
- [ ] Configure firewall rules
- [ ] Use reverse proxy (Nginx)
- [ ] Enable DDoS protection (Cloudflare)

---

## 📚 Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Flask Security Best Practices](https://flask.palletsprojects.com/en/2.3.x/security/)
- [Python Security Guide](https://python.readthedocs.io/en/stable/library/security_warnings.html)
- [API Security Checklist](https://github.com/shieldfy/API-Security-Checklist)

---

## 🎯 Priority Matrix

| Issue | Severity | Effort | Priority |
|-------|----------|--------|----------|
| API Key Exposure | HIGH | Low | 🔴 Critical |
| Debug Mode | HIGH | Low | 🔴 Critical |
| CORS Configuration | MEDIUM | Low | 🟡 High |
| Input Validation | MEDIUM | Medium | 🟡 High |
| Rate Limiting | MEDIUM | Medium | 🟡 High |
| Error Messages | MEDIUM | Low | 🟡 High |
| Security Headers | MEDIUM | Low | 🟡 High |
| Logging | MEDIUM | Medium | 🟢 Medium |
| Input Sanitization | LOW | Low | 🟢 Medium |
| Timeout | LOW | Low | 🟢 Low |

---

**Last Updated**: 2026-05-02  
**Reviewed By**: Bob (AI Security Analyst)  
**Next Review**: Before production deployment