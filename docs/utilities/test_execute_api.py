"""
Test script to verify the execute-code API endpoint
"""
import requests
import json

# API endpoint
API_URL = "http://localhost:8000/api/execute-code/"

# Test data
test_data = {
    "language": "python",
    "code": "print('Hello, World!')",
    "stdin": ""
}

# Get token (you need to login first)
# For testing, we'll try without auth first to see the error
print("Testing execute-code API...")
print(f"URL: {API_URL}")
print(f"Data: {json.dumps(test_data, indent=2)}")
print("\n" + "="*50 + "\n")

# Test without authentication
print("Test 1: Without authentication")
try:
    response = requests.post(API_URL, json=test_data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
except Exception as e:
    print(f"Error: {e}")

print("\n" + "="*50 + "\n")

# Test with authentication (you need to provide a valid token)
print("Test 2: With authentication")
print("To test with auth, you need to:")
print("1. Login via the UI")
print("2. Open browser console")
print("3. Run: localStorage.getItem('access_token')")
print("4. Copy the token and paste it below")
print("\nOr use this Python script to login:")
print("""
import requests
login_response = requests.post(
    'http://localhost:8000/api/token/',
    json={'username': 'your_username', 'password': 'your_password'}
)
token = login_response.json()['access']
print(f'Token: {token}')
""")
