"""
Unit Tests for AI Code Explainer Flask API
IBM Bob Dev Day Hackathon | Team: SoloCoders

Tests for POST /api/explain endpoint
"""

import pytest
import json
from unittest.mock import patch, MagicMock
import sys
import os

# Add parent directory to path to import app
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import app, call_groq, PROMPTS


@pytest.fixture
def client():
    """Create a test client for the Flask app."""
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client


@pytest.fixture
def sample_code():
    """Sample code for testing."""
    return """
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)
"""


@pytest.fixture
def mock_groq_response():
    """Mock successful Groq API response."""
    return {
        "choices": [{
            "message": {
                "content": "This is a recursive Fibonacci function that calculates the nth number in the Fibonacci sequence."
            }
        }]
    }


class TestHealthEndpoint:
    """Tests for GET /api/health endpoint."""
    
    def test_health_check(self, client):
        """Test health check returns 200 and correct data."""
        response = client.get('/api/health')
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert data['status'] == 'ok'
        assert 'model' in data
        assert data['model'] == 'llama-3.3-70b-versatile'


class TestIndexEndpoint:
    """Tests for GET / endpoint."""
    
    def test_index(self, client):
        """Test index endpoint returns API information."""
        response = client.get('/')
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert data['app'] == 'AI Code Explainer'
        assert data['team'] == 'SoloCoders'
        assert data['hackathon'] == 'IBM Bob Dev Day'
        assert 'endpoints' in data


class TestExplainEndpoint:
    """Tests for POST /api/explain endpoint."""
    
    def test_missing_request_body(self, client):
        """Test that missing request body returns 400."""
        response = client.post('/api/explain',
                              content_type='application/json')
        assert response.status_code == 400
        
        data = json.loads(response.data)
        assert 'error' in data
        assert 'code' in data['error'].lower()
    
    def test_missing_code_field(self, client):
        """Test that missing 'code' field returns 400."""
        response = client.post('/api/explain',
                              data=json.dumps({'mode': 'explain'}),
                              content_type='application/json')
        assert response.status_code == 400
        
        data = json.loads(response.data)
        assert 'error' in data
        assert 'code' in data['error'].lower()
    
    def test_empty_code(self, client):
        """Test that empty code returns 400."""
        response = client.post('/api/explain',
                              data=json.dumps({'code': '   '}),
                              content_type='application/json')
        assert response.status_code == 400
        
        data = json.loads(response.data)
        assert 'error' in data
        assert 'empty' in data['error'].lower()
    
    def test_invalid_mode(self, client, sample_code):
        """Test that invalid mode returns 400."""
        response = client.post('/api/explain',
                              data=json.dumps({
                                  'code': sample_code,
                                  'mode': 'invalid_mode'
                              }),
                              content_type='application/json')
        assert response.status_code == 400
        
        data = json.loads(response.data)
        assert 'error' in data
        assert 'mode' in data['error'].lower()
    
    @patch('app.requests.post')
    def test_successful_explain_mode(self, mock_post, client, sample_code, mock_groq_response):
        """Test successful code explanation."""
        # Mock the Groq API response
        mock_response = MagicMock()
        mock_response.json.return_value = mock_groq_response
        mock_response.raise_for_status.return_value = None
        mock_post.return_value = mock_response
        
        response = client.post('/api/explain',
                              data=json.dumps({
                                  'code': sample_code,
                                  'mode': 'explain',
                                  'language': 'Python'
                              }),
                              content_type='application/json')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'result' in data
        assert 'mode' in data
        assert data['mode'] == 'explain'
        assert len(data['result']) > 0
    
    @patch('app.requests.post')
    def test_successful_comment_mode(self, mock_post, client, sample_code, mock_groq_response):
        """Test successful code commenting."""
        mock_response = MagicMock()
        mock_response.json.return_value = mock_groq_response
        mock_response.raise_for_status.return_value = None
        mock_post.return_value = mock_response
        
        response = client.post('/api/explain',
                              data=json.dumps({
                                  'code': sample_code,
                                  'mode': 'comment'
                              }),
                              content_type='application/json')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['mode'] == 'comment'
    
    @patch('app.requests.post')
    def test_successful_summary_mode(self, mock_post, client, sample_code, mock_groq_response):
        """Test successful code summarization."""
        mock_response = MagicMock()
        mock_response.json.return_value = mock_groq_response
        mock_response.raise_for_status.return_value = None
        mock_post.return_value = mock_response
        
        response = client.post('/api/explain',
                              data=json.dumps({
                                  'code': sample_code,
                                  'mode': 'summary'
                              }),
                              content_type='application/json')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['mode'] == 'summary'
    
    @patch('app.requests.post')
    def test_successful_optimize_mode(self, mock_post, client, sample_code, mock_groq_response):
        """Test successful code optimization."""
        mock_response = MagicMock()
        mock_response.json.return_value = mock_groq_response
        mock_response.raise_for_status.return_value = None
        mock_post.return_value = mock_response
        
        response = client.post('/api/explain',
                              data=json.dumps({
                                  'code': sample_code,
                                  'mode': 'optimize'
                              }),
                              content_type='application/json')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['mode'] == 'optimize'
    
    @patch('app.requests.post')
    def test_successful_debug_mode(self, mock_post, client, sample_code, mock_groq_response):
        """Test successful code debugging."""
        mock_response = MagicMock()
        mock_response.json.return_value = mock_groq_response
        mock_response.raise_for_status.return_value = None
        mock_post.return_value = mock_response
        
        response = client.post('/api/explain',
                              data=json.dumps({
                                  'code': sample_code,
                                  'mode': 'debug'
                              }),
                              content_type='application/json')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['mode'] == 'debug'
    
    @patch('app.requests.post')
    def test_default_mode_is_explain(self, mock_post, client, sample_code, mock_groq_response):
        """Test that default mode is 'explain' when not specified."""
        mock_response = MagicMock()
        mock_response.json.return_value = mock_groq_response
        mock_response.raise_for_status.return_value = None
        mock_post.return_value = mock_response
        
        response = client.post('/api/explain',
                              data=json.dumps({'code': sample_code}),
                              content_type='application/json')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['mode'] == 'explain'
    
    @patch('app.requests.post')
    def test_auto_detect_language(self, mock_post, client, sample_code, mock_groq_response):
        """Test that auto-detect language works."""
        mock_response = MagicMock()
        mock_response.json.return_value = mock_groq_response
        mock_response.raise_for_status.return_value = None
        mock_post.return_value = mock_response
        
        response = client.post('/api/explain',
                              data=json.dumps({
                                  'code': sample_code,
                                  'language': 'auto'
                              }),
                              content_type='application/json')
        
        assert response.status_code == 200
    
    @patch('app.requests.post')
    def test_groq_api_http_error(self, mock_post, client, sample_code):
        """Test handling of Groq API HTTP errors."""
        import requests
        mock_post.side_effect = requests.exceptions.HTTPError("API Error")
        
        response = client.post('/api/explain',
                              data=json.dumps({
                                  'code': sample_code,
                                  'mode': 'explain'
                              }),
                              content_type='application/json')
        
        assert response.status_code == 502
        data = json.loads(response.data)
        assert 'error' in data
    
    @patch('app.requests.post')
    def test_groq_api_timeout(self, mock_post, client, sample_code):
        """Test handling of Groq API timeout."""
        import requests
        mock_post.side_effect = requests.exceptions.Timeout()
        
        response = client.post('/api/explain',
                              data=json.dumps({
                                  'code': sample_code,
                                  'mode': 'explain'
                              }),
                              content_type='application/json')
        
        assert response.status_code == 504
        data = json.loads(response.data)
        assert 'error' in data
        assert 'timeout' in data['error'].lower()
    
    @patch('app.requests.post')
    def test_unexpected_error(self, mock_post, client, sample_code):
        """Test handling of unexpected errors."""
        mock_post.side_effect = Exception("Unexpected error")
        
        response = client.post('/api/explain',
                              data=json.dumps({
                                  'code': sample_code,
                                  'mode': 'explain'
                              }),
                              content_type='application/json')
        
        assert response.status_code == 500
        data = json.loads(response.data)
        assert 'error' in data


class TestCallGroqFunction:
    """Tests for the call_groq helper function."""
    
    @patch('app.requests.post')
    def test_call_groq_success(self, mock_post, mock_groq_response):
        """Test successful Groq API call."""
        mock_response = MagicMock()
        mock_response.json.return_value = mock_groq_response
        mock_response.raise_for_status.return_value = None
        mock_post.return_value = mock_response
        
        result = call_groq("System prompt", "User message")
        
        assert result == mock_groq_response["choices"][0]["message"]["content"]
        assert mock_post.called
    
    @patch('app.requests.post')
    def test_call_groq_with_correct_headers(self, mock_post, mock_groq_response):
        """Test that Groq API is called with correct headers."""
        mock_response = MagicMock()
        mock_response.json.return_value = mock_groq_response
        mock_response.raise_for_status.return_value = None
        mock_post.return_value = mock_response
        
        call_groq("System prompt", "User message")
        
        # Check that post was called with correct headers
        call_args = mock_post.call_args
        headers = call_args[1]['headers']
        assert 'Authorization' in headers
        assert headers['Authorization'].startswith('Bearer ')
        assert headers['Content-Type'] == 'application/json'


class TestPrompts:
    """Tests for prompt configurations."""
    
    def test_all_modes_have_prompts(self):
        """Test that all required modes have prompts defined."""
        required_modes = ['explain', 'comment', 'summary', 'optimize', 'debug']
        for mode in required_modes:
            assert mode in PROMPTS
            assert len(PROMPTS[mode]) > 0
    
    def test_prompts_are_strings(self):
        """Test that all prompts are non-empty strings."""
        for mode, prompt in PROMPTS.items():
            assert isinstance(prompt, str)
            assert len(prompt.strip()) > 0


class TestIntegration:
    """Integration tests for the complete flow."""
    
    @patch('app.requests.post')
    def test_complete_explain_flow(self, mock_post, client, mock_groq_response):
        """Test complete flow from request to response."""
        mock_response = MagicMock()
        mock_response.json.return_value = mock_groq_response
        mock_response.raise_for_status.return_value = None
        mock_post.return_value = mock_response
        
        # Send request
        code = "print('Hello, World!')"
        response = client.post('/api/explain',
                              data=json.dumps({
                                  'code': code,
                                  'mode': 'explain',
                                  'language': 'Python'
                              }),
                              content_type='application/json')
        
        # Verify response
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'result' in data
        assert 'mode' in data
        
        # Verify Groq API was called correctly
        assert mock_post.called
        call_args = mock_post.call_args
        payload = call_args[1]['json']
        assert payload['model'] == 'llama-3.3-70b-versatile'
        assert len(payload['messages']) == 2
        assert payload['messages'][0]['role'] == 'system'
        assert payload['messages'][1]['role'] == 'user'
        assert code in payload['messages'][1]['content']


if __name__ == '__main__':
    pytest.main([__file__, '-v'])

# Made with Bob
