"""
Quick test script to verify registration works
"""
import requests
import json

# Test registration
url = "http://localhost:8000/api/register/"

# Test student registration
student_data = {
    "username": "teststudent",
    "email": "test@student.com",
    "password": "testpass123",
    "first_name": "Test",
    "last_name": "Student",
    "role": "student",
    "branch": "CSE",
    "batch": "2024"
}

print("Testing student registration...")
response = requests.post(url, json=student_data)
print(f"Status Code: {response.status_code}")
print(f"Response: {response.text}")

if response.status_code == 201:
    print("✅ Student registration successful!")
else:
    print("❌ Student registration failed!")

print("\n" + "="*50 + "\n")

# Test teacher registration
teacher_data = {
    "username": "testteacher",
    "email": "test@teacher.com",
    "password": "testpass123",
    "first_name": "Test",
    "last_name": "Teacher",
    "role": "teacher",
    "teacher_code": "TEACHER2024",
    "branch": "CSE",
    "batch": "2024"
}

print("Testing teacher registration...")
response = requests.post(url, json=teacher_data)
print(f"Status Code: {response.status_code}")
print(f"Response: {response.text}")

if response.status_code == 201:
    print("✅ Teacher registration successful!")
else:
    print("❌ Teacher registration failed!")
