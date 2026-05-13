import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

from django.test import Client
from django.contrib.auth.models import User
import json

client = Client()

print("=" * 60)
print("TESTING AUTHENTICATION ENFORCEMENT")
print("=" * 60)

# Create a test user
User.objects.filter(username='authtest').delete()
User.objects.create_user('authtest', 'authtest@example.com', 'pass123456')

# Test 1: Cart API without login
print("\n1. Cart API without authentication:")
response = client.get('/api/cart/')
print(f"   Status: {response.status_code}")
print(f"   ✓ Redirects to login" if response.status_code == 302 else f"   ⚠ No redirect (status {response.status_code})")

# Test 2: Cart API with login
print("\n2. Cart API with authentication:")
client.login(username='authtest', password='pass123456')
response = client.get('/api/cart/')
print(f"   Status: {response.status_code}")
if response.status_code == 200:
    try:
        data = json.loads(response.content)
        print(f"   ✓ Success: {data}")
    except:
        print(f"   ⚠ Response not JSON")
else:
    print(f"   ⚠ Unexpected status: {response.status_code}")

# Test 3: My List without login
print("\n3. My List page without authentication:")
client.logout()
response = client.get('/my-list/')
print(f"   Status: {response.status_code}")
print(f"   ✓ Redirects to login" if response.status_code == 302 else f"   ⚠ No redirect (status {response.status_code})")

# Test 4: My List with login
print("\n4. My List page with authentication:")
client.login(username='authtest', password='pass123456')
response = client.get('/my-list/')
print(f"   Status: {response.status_code}")
print(f"   ✓ Page loaded" if response.status_code == 200 else f"   ⚠ Unexpected status: {response.status_code}")

# Test 5: Add to cart
print("\n5. Add to cart API with authentication:")
response = client.post('/api/cart/add/', 
    json.dumps({'book_id': 3}),
    content_type='application/json'
)
print(f"   Status: {response.status_code}")
if response.status_code == 200:
    try:
        data = json.loads(response.content)
        print(f"   ✓ Success: {data}")
    except:
        print(f"   ⚠ Response not JSON")

print("\n" + "=" * 60)
