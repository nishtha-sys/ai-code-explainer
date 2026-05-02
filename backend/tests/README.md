# 🧪 Testing Guide - AI Code Explainer Backend

## Overview

This directory contains unit tests for the Flask API endpoints. Tests use `pytest` and mock the Groq API to avoid making real API calls during testing.

---

## 📦 Installation

### Install Test Dependencies

```bash
cd backend
pip install pytest pytest-flask pytest-cov
```

Or add to `requirements.txt`:
```
pytest==8.0.0
pytest-flask==1.3.0
pytest-cov==4.1.0
```

---

## 🚀 Running Tests

### Run All Tests
```bash
# From backend directory
pytest

# With verbose output
pytest -v

# With coverage report
pytest --cov=app --cov-report=html
```

### Run Specific Test File
```bash
pytest tests/test_api.py
```

### Run Specific Test Class
```bash
pytest tests/test_api.py::TestExplainEndpoint
```

### Run Specific Test Function
```bash
pytest tests/test_api.py::TestExplainEndpoint::test_successful_explain_mode
```

### Run with Output
```bash
# Show print statements
pytest -s

# Show detailed output
pytest -vv
```

---

## 📊 Test Coverage

### Generate Coverage Report
```bash
# Terminal report
pytest --cov=app

# HTML report (opens in browser)
pytest --cov=app --cov-report=html
open htmlcov/index.html  # macOS
start htmlcov/index.html  # Windows
```

### Coverage Goals
- **Target**: 80%+ coverage
- **Critical paths**: 100% coverage for API endpoints
- **Current**: Run tests to see current coverage

---

## 🧪 Test Structure

### Test Files
```
tests/
├── __init__.py           # Package marker
├── test_api.py          # API endpoint tests
└── README.md            # This file
```

### Test Classes in `test_api.py`

1. **TestHealthEndpoint** - Health check endpoint tests
2. **TestIndexEndpoint** - Root endpoint tests
3. **TestExplainEndpoint** - Main API endpoint tests
   - Input validation
   - All modes (explain, comment, summary, optimize, debug)
   - Error handling
   - Edge cases
4. **TestCallGroqFunction** - Helper function tests
5. **TestPrompts** - Prompt configuration tests
6. **TestIntegration** - End-to-end flow tests

---

## 🎯 Test Examples

### Example 1: Testing Successful Request
```python
def test_successful_explain_mode(self, mock_post, client, sample_code):
    # Mock the API response
    mock_response = MagicMock()
    mock_response.json.return_value = {"choices": [{"message": {"content": "..."}}]}
    mock_post.return_value = mock_response
    
    # Make request
    response = client.post('/api/explain',
                          data=json.dumps({'code': sample_code, 'mode': 'explain'}),
                          content_type='application/json')
    
    # Assert
    assert response.status_code == 200
    assert 'result' in json.loads(response.data)
```

### Example 2: Testing Error Handling
```python
def test_missing_code_field(self, client):
    response = client.post('/api/explain',
                          data=json.dumps({'mode': 'explain'}),
                          content_type='application/json')
    
    assert response.status_code == 400
    assert 'error' in json.loads(response.data)
```

---

## 🔧 Fixtures

### Available Fixtures

- **`client`** - Flask test client
- **`sample_code`** - Sample Python code for testing
- **`mock_groq_response`** - Mocked Groq API response

### Using Fixtures
```python
def test_example(client, sample_code):
    # client and sample_code are automatically provided
    response = client.post('/api/explain', 
                          data=json.dumps({'code': sample_code}))
```

---

## 🐛 Debugging Tests

### Run Failed Tests Only
```bash
pytest --lf  # Last failed
pytest --ff  # Failed first
```

### Stop on First Failure
```bash
pytest -x
```

### Enter Debugger on Failure
```bash
pytest --pdb
```

### Show Local Variables
```bash
pytest -l
```

---

## 📝 Writing New Tests

### Test Naming Convention
- Test files: `test_*.py`
- Test classes: `Test*`
- Test functions: `test_*`

### Example Test Template
```python
class TestNewFeature:
    """Tests for new feature."""
    
    def test_feature_success(self, client):
        """Test successful feature execution."""
        response = client.post('/api/new-endpoint',
                              data=json.dumps({'param': 'value'}),
                              content_type='application/json')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'expected_key' in data
    
    def test_feature_validation(self, client):
        """Test feature input validation."""
        response = client.post('/api/new-endpoint',
                              data=json.dumps({}),
                              content_type='application/json')
        
        assert response.status_code == 400
```

---

## 🎨 Best Practices

### 1. Test Independence
- Each test should be independent
- Don't rely on test execution order
- Clean up after tests

### 2. Use Mocks
- Mock external API calls
- Don't make real API requests in tests
- Use `@patch` decorator

### 3. Test Edge Cases
- Empty inputs
- Invalid inputs
- Boundary conditions
- Error scenarios

### 4. Clear Assertions
```python
# Good
assert response.status_code == 200
assert 'result' in data

# Better
assert response.status_code == 200, "Expected successful response"
assert 'result' in data, "Response should contain 'result' key"
```

### 5. Descriptive Names
```python
# Good
def test_explain_mode(self):
    pass

# Better
def test_successful_explain_mode_returns_200_with_result(self):
    pass
```

---

## 🔍 Continuous Integration

### GitHub Actions Example
```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: |
          pip install -r requirements.txt
          pip install pytest pytest-cov
      - name: Run tests
        run: pytest --cov=app --cov-report=xml
      - name: Upload coverage
        uses: codecov/codecov-action@v2
```

---

## 📚 Resources

- [Pytest Documentation](https://docs.pytest.org/)
- [Flask Testing](https://flask.palletsprojects.com/en/2.3.x/testing/)
- [Python unittest.mock](https://docs.python.org/3/library/unittest.mock.html)

---

## 🎯 Test Checklist

Before committing:
- [ ] All tests pass
- [ ] Coverage > 80%
- [ ] No skipped tests
- [ ] Tests are independent
- [ ] Edge cases covered
- [ ] Error handling tested
- [ ] Documentation updated

---

**Happy Testing! 🧪**