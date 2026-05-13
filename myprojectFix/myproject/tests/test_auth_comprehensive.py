import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

from django.test import Client
from django.contrib.auth.models import User
import json

client = Client()

print("=" * 70)
print("COMPREHENSIVE AUTHENTICATION SYSTEM TEST")
print("=" * 70)

# Clean up test users
User.objects.filter(username__startswith='testuser_').delete()
User.objects.filter(username__startswith='regtest_').delete()

# Test 1: Get CSRF Token
print("\n[TEST 1] Get CSRF Token from login page")
response = client.get('/login/')
print(f"Status: {response.status_code}")
csrf_token = response.cookies.get('csrftoken')
if csrf_token:
    print(f"✓ CSRF Token received: {csrf_token.value[:20]}...")
else:
    print(f"⚠ No CSRF token in cookies")
content_str = response.content.decode()
has_csrf = 'csrfmiddlewaretoken' in content_str
print(f"Response contains CSRF token field: {has_csrf}")

# Test 2: Login with form-encoded data
print("\n[TEST 2] Login with form-encoded data (existing user: admin)")
response = client.post('/login/', {
    'username': 'admin',
    'password': 'admin123'
}, HTTP_X_CSRFTOKEN=csrf_token.value if csrf_token else '')
print(f"Status: {response.status_code}")
print(f"Content-Type: {response.get('Content-Type')}")
try:
    data = json.loads(response.content)
    print(f"Response: {data}")
    if data.get('success'):
        print("✓ Login successful")
    else:
        print(f"✗ Login failed: {data.get('error')}")
except json.JSONDecodeError:
    print(f"✗ Response is not JSON: {response.content[:100]}")

# Test 3: Register new user
print("\n[TEST 3] Register new user")
import time
unique_username = f"regtest_{int(time.time())}"
response = client.post('/register/', {
    'username': unique_username,
    'email': f'{unique_username}@example.com',
    'password': 'TestPass123',
    'password_confirm': 'TestPass123'
}, HTTP_X_CSRFTOKEN=csrf_token.value if csrf_token else '')
print(f"Status: {response.status_code}")
try:
    data = json.loads(response.content)
    print(f"Response: {data}")
    if data.get('success'):
        print("✓ Registration successful")
        # Check if user was created
        if User.objects.filter(username=unique_username).exists():
            print("✓ User created in database")
        else:
            print("✗ User NOT created in database")
    else:
        print(f"✗ Registration failed: {data.get('error')}")
except json.JSONDecodeError:
    print(f"✗ Response is not JSON: {response.content[:100]}")

# Test 4: Login with newly registered user
print("\n[TEST 4] Login with newly registered user")
response = client.post('/login/', {
    'username': unique_username,
    'password': 'TestPass123'
}, HTTP_X_CSRFTOKEN=csrf_token.value if csrf_token else '')
print(f"Status: {response.status_code}")
try:
    data = json.loads(response.content)
    print(f"Response: {data}")
    if data.get('success'):
        print("✓ Login successful")
    else:
        print(f"✗ Login failed: {data.get('error')}")
except json.JSONDecodeError:
    print(f"✗ Response is not JSON: {response.content[:100]}")

# Test 5: Check session persistence
print("\n[TEST 5] Check session persistence after login")
response = client.post('/login/', {
    'username': 'admin',
    'password': 'admin123'
}, HTTP_X_CSRFTOKEN=csrf_token.value if csrf_token else '')
# Now try accessing a protected page
response = client.get('/home/')
print(f"Home page status (after login): {response.status_code}")
if response.status_code == 200:
    print("✓ Session persisted - user can access protected page")
elif response.status_code == 302:
    print("✗ Session not persisted - redirected to login")
else:
    print(f"? Unexpected status: {response.status_code}")

# Test 6: Logout
print("\n[TEST 6] Test logout")
response = client.get('/logout/')
print(f"Logout redirect status: {response.status_code}")
# Try accessing a protected page after logout
response = client.get('/home/')
print(f"Home page status (after logout): {response.status_code}")
if response.status_code == 302:
    print("✓ Logout successful - user redirected to login")
else:
    print(f"? Unexpected status: {response.status_code}")

print("\n" + "=" * 70)
print("TEST COMPLETE")
print("=" * 70)
