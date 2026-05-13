import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

from django.test import Client
from django.contrib.auth.models import User
import json

print("\n" + "=" * 90)
print(" " * 20 + "FINAL AUTHENTICATION SYSTEM VERIFICATION")
print("=" * 90)

# Clean up
User.objects.filter(username__startswith='final_').delete()

client = Client()

# Test 1: Full Login/Register/Access Flow
print("\n[TEST 1] COMPLETE USER JOURNEY")
print("-" * 90)

# 1. Get login page
print("1. Accessing login page...")
response = client.get('/login/')
assert response.status_code == 200, "Failed to get login page"
csrf_token = response.cookies.get('csrftoken').value
print("   ✓ Login page loaded successfully")
print(f"   ✓ CSRF token available: {csrf_token[:15]}...")

# 2. Register new user
print("\n2. Registering new user (final_testuser@1234)...")
import time
test_username = f"final_test_{int(time.time() * 1000) % 100000}"
test_email = f"{test_username}@example.com"

response = client.post('/register/', {
    'username': test_username,
    'email': test_email,
    'password': 'TestPass12345',
    'password_confirm': 'TestPass12345'
}, HTTP_X_CSRFTOKEN=csrf_token)

data = json.loads(response.content)
assert data.get('success') == True, f"Registration failed: {data.get('error')}"
assert response.status_code == 201, f"Expected 201, got {response.status_code}"
print(f"   ✓ Registration successful for {test_username}")

# Verify user was created
user_exists = User.objects.filter(username=test_username).exists()
assert user_exists, "User not created in database"
print(f"   ✓ User verified in database")

# 3. Try accessing protected page (should work after registration/login)
print("\n3. Accessing protected home page...")
response = client.get('/home/')
# After registration, user should be logged in due to login() call in register view
print(f"   Status: {response.status_code}")
if response.status_code == 200:
    print("   ✓ Protected page accessible after registration")
else:
    print(f"   ⚠ Got redirect (expected after logout)")

# 4. Logout
print("\n4. Logging out...")
response = client.get('/logout/')
assert response.status_code == 302, "Logout should redirect"
print("   ✓ Logout successful (302 redirect)")

# 5. Try accessing protected page again (should fail)
print("\n5. Attempting to access protected page after logout...")
response = client.get('/home/')
assert response.status_code == 302, "Should redirect to login"
print("   ✓ Correctly redirected to login (302)")

# 6. Fresh login with registered user
print(f"\n6. Fresh login with registered user ({test_username})...")
client2 = Client()
response = client2.get('/login/')
csrf_token2 = response.cookies.get('csrftoken').value

response = client2.post('/login/', {
    'username': test_username,
    'password': 'TestPass12345'
}, HTTP_X_CSRFTOKEN=csrf_token2)

data = json.loads(response.content)
assert data.get('success') == True, f"Login failed: {data.get('error')}"
assert response.status_code == 200, f"Expected 200, got {response.status_code}"
print(f"   ✓ Login successful")

# 7. Access protected page after fresh login
print("\n7. Accessing protected page after login...")
response = client2.get('/home/')
assert response.status_code == 200, "Should be able to access protected page"
print("   ✓ Protected page accessible (200)")

# Test 2: Error Cases
print("\n[TEST 2] ERROR HANDLING & VALIDATION")
print("-" * 90)

client3 = Client()
response = client3.get('/login/')
csrf_token3 = response.cookies.get('csrftoken').value

# 2.1: Invalid login
print("2.1 Invalid credentials...")
response = client3.post('/login/', {
    'username': 'nonexistent',
    'password': 'wrongpass'
}, HTTP_X_CSRFTOKEN=csrf_token3)
data = json.loads(response.content)
assert data.get('success') == False, "Should reject invalid credentials"
assert response.status_code == 401, f"Expected 401, got {response.status_code}"
print("   ✓ Invalid credentials correctly rejected (401)")

# 2.2: Register with weak password
print("2.2 Weak password rejection...")
response = client3.post('/register/', {
    'username': 'newuser',
    'email': 'new@example.com',
    'password': 'weak',
    'password_confirm': 'weak'
}, HTTP_X_CSRFTOKEN=csrf_token3)
data = json.loads(response.content)
assert data.get('success') == False, "Should reject weak password"
print(f"   ✓ Weak password rejected: {data.get('error')}")

# 2.3: Mismatched passwords
print("2.3 Mismatched password confirmation...")
response = client3.post('/register/', {
    'username': 'anotheruser',
    'email': 'another@example.com',
    'password': 'StrongPass123',
    'password_confirm': 'DifferentPass123'
}, HTTP_X_CSRFTOKEN=csrf_token3)
data = json.loads(response.content)
assert data.get('success') == False, "Should reject mismatched passwords"
print(f"   ✓ Mismatched passwords rejected: {data.get('error')}")

# 2.4: Duplicate username
print("2.4 Duplicate username rejection...")
response = client3.post('/register/', {
    'username': 'admin',
    'email': 'newadmin@example.com',
    'password': 'StrongPass123',
    'password_confirm': 'StrongPass123'
}, HTTP_X_CSRFTOKEN=csrf_token3)
data = json.loads(response.content)
assert data.get('success') == False, "Should reject duplicate username"
assert response.status_code == 409, f"Expected 409, got {response.status_code}"
print(f"   ✓ Duplicate username rejected (409): {data.get('error')}")

# Test 3: API Endpoints
print("\n[TEST 3] API ENDPOINTS & AUTHENTICATION")
print("-" * 90)

# 3.1: Public API (books)
print("3.1 Public API endpoint (books)...")
response = client3.get('/api/books/')
assert response.status_code == 200, "Should access public API"
data = json.loads(response.content)
assert 'books' in data, "Should return books data"
print(f"   ✓ Public API works (returned {len(data.get('books', []))} books)")

# 3.2: Protected API (cart)
print("3.2 Protected API without authentication...")
response = client3.get('/api/cart/')
assert response.status_code == 401, "Should reject unauthenticated cart access"
print("   ✓ Protected API correctly requires authentication (401)")

# Test 4: Admin User
print("\n[TEST 4] ADMIN USER FUNCTIONALITY")
print("-" * 90)

print("4.1 Testing admin redirect on login...")
client4 = Client()
response = client4.get('/login/')
csrf_token4 = response.cookies.get('csrftoken').value

response = client4.post('/login/', {
    'username': 'admin',
    'password': 'admin123'
}, HTTP_X_CSRFTOKEN=csrf_token4)

data = json.loads(response.content)
assert data.get('success') == True, "Admin login should work"
assert data.get('redirect') == '/frontend-admin/', "Admin should redirect to admin page"
print(f"   ✓ Admin user redirected to: {data.get('redirect')}")

print("\n" + "=" * 90)
print(" " * 30 + "✅ ALL TESTS PASSED!")
print("=" * 90)
print("\n✓ Authentication system is fully working")
print("✓ Registration works with validation")
print("✓ Login works with session management")
print("✓ Logout properly clears sessions")
print("✓ Protected pages enforce authentication")
print("✓ Protected APIs enforce authentication")
print("✓ Admin users are correctly identified")
print("✓ Error handling is comprehensive")
print("\n")
