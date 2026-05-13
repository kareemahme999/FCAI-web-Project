import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

from django.test import Client
from django.contrib.auth.models import User
import json

print("=" * 80)
print("FRONTEND-TO-BACKEND INTEGRATION TEST - JavaScript Simulation")
print("=" * 80)

# Clean up test users
User.objects.filter(username__startswith='e2e_').delete()

client = Client()

# ========== TEST 1: LOGIN FLOW ==========
print("\n[TEST 1] COMPLETE LOGIN FLOW")
print("-" * 80)

# Step 1: Get login page and extract CSRF token
print("Step 1: Getting login page and CSRF token...")
response = client.get('/login/')
csrf_token = response.cookies.get('csrftoken').value if response.cookies.get('csrftoken') else None
print(f"✓ CSRF token obtained: {csrf_token[:20]}..." if csrf_token else "✗ No CSRF token")

# Step 2: Login with FormData (like JavaScript does)
print("\nStep 2: Attempting login with valid credentials...")
from django.test import RequestFactory
from io import BytesIO

# Create FormData-like payload (multipart form data)
boundary = '----WebKitFormBoundary'
body = (
    f'--{boundary}\r\n'
    f'Content-Disposition: form-data; name="username"\r\n\r\n'
    f'admin\r\n'
    f'--{boundary}\r\n'
    f'Content-Disposition: form-data; name="password"\r\n\r\n'
    f'admin123\r\n'
    f'--{boundary}--\r\n'
).encode()

response = client.post(
    '/login/',
    data=body,
    content_type=f'multipart/form-data; boundary={boundary}',
    HTTP_X_CSRFTOKEN=csrf_token if csrf_token else ''
)

print(f"Response status: {response.status_code}")
data = json.loads(response.content)
if data.get('success'):
    print(f"✓ Login successful")
    print(f"✓ Redirect URL: {data.get('redirect')}")
    print(f"✓ Message: {data.get('message')}")
else:
    print(f"✗ Login failed: {data.get('error')}")

# ========== TEST 2: REGISTER FLOW ==========
print("\n[TEST 2] COMPLETE REGISTER FLOW")
print("-" * 80)

# Step 1: Get fresh CSRF token
print("Step 1: Getting fresh CSRF token for new session...")
client2 = Client()
response = client2.get('/login/')
csrf_token2 = response.cookies.get('csrftoken').value if response.cookies.get('csrftoken') else None
print(f"✓ CSRF token obtained: {csrf_token2[:20]}..." if csrf_token2 else "✗ No CSRF token")

# Step 2: Register new user
print("\nStep 2: Attempting registration...")
import time
unique_username = f"e2e_user_{int(time.time())}"

body = (
    f'--{boundary}\r\n'
    f'Content-Disposition: form-data; name="username"\r\n\r\n'
    f'{unique_username}\r\n'
    f'--{boundary}\r\n'
    f'Content-Disposition: form-data; name="email"\r\n\r\n'
    f'{unique_username}@example.com\r\n'
    f'--{boundary}\r\n'
    f'Content-Disposition: form-data; name="password"\r\n\r\n'
    f'SecurePassword123\r\n'
    f'--{boundary}\r\n'
    f'Content-Disposition: form-data; name="password_confirm"\r\n\r\n'
    f'SecurePassword123\r\n'
    f'--{boundary}--\r\n'
).encode()

response = client2.post(
    '/register/',
    data=body,
    content_type=f'multipart/form-data; boundary={boundary}',
    HTTP_X_CSRFTOKEN=csrf_token2 if csrf_token2 else ''
)

print(f"Response status: {response.status_code}")
data = json.loads(response.content)
if data.get('success'):
    print(f"✓ Registration successful")
    print(f"✓ User created: {User.objects.filter(username=unique_username).exists()}")
    print(f"✓ Redirect URL: {data.get('redirect')}")
    print(f"✓ Message: {data.get('message')}")
else:
    print(f"✗ Registration failed: {data.get('error')}")

# ========== TEST 3: LOGIN WITH NEW USER ==========
print("\n[TEST 3] LOGIN WITH NEWLY REGISTERED USER")
print("-" * 80)

print("Step 1: Getting CSRF token...")
client3 = Client()
response = client3.get('/login/')
csrf_token3 = response.cookies.get('csrftoken').value if response.cookies.get('csrftoken') else None

print("\nStep 2: Logging in with newly registered credentials...")
body = (
    f'--{boundary}\r\n'
    f'Content-Disposition: form-data; name="username"\r\n\r\n'
    f'{unique_username}\r\n'
    f'--{boundary}\r\n'
    f'Content-Disposition: form-data; name="password"\r\n\r\n'
    f'SecurePassword123\r\n'
    f'--{boundary}--\r\n'
).encode()

response = client3.post(
    '/login/',
    data=body,
    content_type=f'multipart/form-data; boundary={boundary}',
    HTTP_X_CSRFTOKEN=csrf_token3 if csrf_token3 else ''
)

data = json.loads(response.content)
if data.get('success'):
    print(f"✓ Login successful for new user")
    print(f"✓ Redirect URL: {data.get('redirect')}")
else:
    print(f"✗ Login failed: {data.get('error')}")

# ========== TEST 4: ERROR CASES ==========
print("\n[TEST 4] ERROR HANDLING - INVALID CREDENTIALS")
print("-" * 80)

print("Step 1: Getting CSRF token...")
client4 = Client()
response = client4.get('/login/')
csrf_token4 = response.cookies.get('csrftoken').value if response.cookies.get('csrftoken') else None

print("\nStep 2: Attempting login with wrong password...")
body = (
    f'--{boundary}\r\n'
    f'Content-Disposition: form-data; name="username"\r\n\r\n'
    f'admin\r\n'
    f'--{boundary}\r\n'
    f'Content-Disposition: form-data; name="password"\r\n\r\n'
    f'wrongpassword\r\n'
    f'--{boundary}--\r\n'
).encode()

response = client4.post(
    '/login/',
    data=body,
    content_type=f'multipart/form-data; boundary={boundary}',
    HTTP_X_CSRFTOKEN=csrf_token4 if csrf_token4 else ''
)

data = json.loads(response.content)
if data.get('success'):
    print(f"✗ Should have failed but succeeded!")
else:
    print(f"✓ Correctly rejected invalid credentials")
    print(f"✓ Error message: {data.get('error')}")

print("\n" + "=" * 80)
print("ALL E2E TESTS COMPLETED")
print("=" * 80)
