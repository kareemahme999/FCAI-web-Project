import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

from django.test import Client
import json

client = Client()

print("=" * 60)
print("TESTING API ENDPOINTS")
print("=" * 60)

# Test 1: Books API
print("\n1. Testing Books API (GET /api/books/)")
response = client.get('/api/books/')
print(f"Status: {response.status_code}")
if response.status_code == 200:
    try:
        data = json.loads(response.content)
        if 'books' in data and len(data['books']) > 0:
            print(f"✓ Success: {len(data['books'])} books returned")
            print(f"  Sample: {data['books'][0]['title']}")
        else:
            print("⚠ Warning: No books in response")
    except Exception as e:
        print(f"✗ Error parsing JSON: {e}")
else:
    print(f"✗ Error: Unexpected status code")

# Test 2: Login API
print("\n2. Testing Login API (POST /login/)")
response = client.post('/login/', {'username': 'admin', 'password': 'admin123'})
print(f"Status: {response.status_code}")
if response.status_code == 200:
    try:
        data = json.loads(response.content)
        if data.get('success'):
            print(f"✓ Success: Login works")
            print(f"  Redirect: {data.get('redirect', 'N/A')}")
        else:
            print(f"⚠ Warning: {data.get('error', 'Unknown error')}")
    except Exception as e:
        print(f"✗ Error parsing JSON: {e}")
        print(f"Response: {response.content[:200]}")
else:
    print(f"✗ Error: Unexpected status code")

# Test 3: Register API
print("\n3. Testing Register API (POST /register/)")
import time
unique_username = f'newuser_{int(time.time())}'
response = client.post('/register/', {
    'username': unique_username,
    'email': f'{unique_username}@example.com',
    'password': 'pass123456',
    'password_confirm': 'pass123456'
})
print(f"Status: {response.status_code}")
if response.status_code == 200:
    try:
        data = json.loads(response.content)
        if data.get('success'):
            print(f"✓ Success: Registration works")
            print(f"  Redirect: {data.get('redirect', 'N/A')}")
        else:
            print(f"⚠ Warning: {data.get('error', 'Unknown error')}")
    except Exception as e:
        print(f"✗ Error parsing JSON: {e}")
        print(f"Response: {response.content[:200]}")
else:
    print(f"✗ Error: Unexpected status code")

# Test 4: Unauthenticated Cart API
print("\n4. Testing Cart API without auth (GET /api/cart/)")
unauth_client = Client()
response = unauth_client.get('/api/cart/')
print(f"Status: {response.status_code}")
if response.status_code == 401:
    print(f"✓ Success: Correctly returns 401 Unauthorized")
else:
    print(f"⚠ Warning: Expected 401, got {response.status_code}")

# Test 5: Contact API
print("\n5. Testing Contact API (POST /contact/)")
response = client.post('/contact/', {
    'name': 'Test User',
    'email': 'test@example.com',
    'subject': 'Test Subject',
    'message': 'Test message'
})
print(f"Status: {response.status_code}")
if response.status_code == 200:
    try:
        data = json.loads(response.content)
        if data.get('success'):
            print(f"✓ Success: Contact message submitted")
        else:
            print(f"⚠ Warning: {data.get('message', 'Unknown error')}")
    except Exception as e:
        print(f"✗ Error parsing JSON: {e}")
else:
    print(f"✗ Error: Unexpected status code")

print("\n" + "=" * 60)
print("TESTING COMPLETE")
print("=" * 60)
