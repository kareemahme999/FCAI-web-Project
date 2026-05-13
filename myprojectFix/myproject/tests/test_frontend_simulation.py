import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

from django.test import Client
from django.contrib.auth.models import User
import json

client = Client()

print("=" * 70)
print("FRONTEND SIMULATION TEST - Mimicking JavaScript Fetch Requests")
print("=" * 70)

# Clean up
User.objects.filter(username__startswith='fronttest_').delete()

# First, get the login page to extract CSRF token like frontend does
print("\n[STEP 1] Get login page (to extract CSRF token from HTML)")
response = client.get('/login/')
content = response.content.decode()

# Try to extract CSRF token from the HTML (like JavaScript would)
import re
csrf_match = re.search(r'<input[^>]*name=["\']csrfmiddlewaretoken["\'][^>]*value=["\']([^"\']+)["\']', content)
csrf_from_html = csrf_match.group(1) if csrf_match else None
print(f"CSRF Token from HTML: {csrf_from_html[:20]}..." if csrf_from_html else "⚠ Could not extract CSRF from HTML")

# Also check the cookie
csrf_from_cookie = response.cookies.get('csrftoken')
print(f"CSRF Token from Cookie: {csrf_from_cookie.value[:20]}..." if csrf_from_cookie else "⚠ No CSRF in cookie")

# Test 2: Try login like JavaScript does
print("\n[STEP 2] Attempt login - Sending form-encoded data WITHOUT explicit CSRF header")
import urllib.parse
payload = urllib.parse.urlencode({
    'username': 'admin',
    'password': 'admin123'
})

# First attempt: NO CSRF token header (what might be failing)
print("Attempt 2A: Without X-CSRFToken header")
response = client.post(
    '/login/',
    data=payload,
    content_type='application/x-www-form-urlencoded'
)
print(f"Status: {response.status_code}")
data = json.loads(response.content)
success_msg = "✓ Success" if data.get('success') else f"✗ Failed: {data.get('error')}"
print(f"Result: {success_msg}")

# Second attempt: WITH CSRF token header
print("\nAttempt 2B: With X-CSRFToken header")
response = client.post(
    '/login/',
    data=payload,
    content_type='application/x-www-form-urlencoded',
    HTTP_X_CSRFTOKEN=csrf_from_cookie.value if csrf_from_cookie else '',
    HTTP_COOKIE=f'csrftoken={csrf_from_cookie.value}' if csrf_from_cookie else ''
)
print(f"Status: {response.status_code}")
data = json.loads(response.content)
success_msg = "✓ Success" if data.get('success') else f"✗ Failed: {data.get('error')}"
print(f"Result: {success_msg}")

# Test 3: Register attempt
print("\n[STEP 3] Attempt registration")
import time
unique_username = f"fronttest_{int(time.time())}"
payload = urllib.parse.urlencode({
    'username': unique_username,
    'email': f'{unique_username}@example.com',
    'password': 'TestPass123',
    'password_confirm': 'TestPass123'
})

response = client.post(
    '/register/',
    data=payload,
    content_type='application/x-www-form-urlencoded',
    HTTP_X_CSRFTOKEN=csrf_from_cookie.value if csrf_from_cookie else ''
)
print(f"Status: {response.status_code}")
data = json.loads(response.content)
success_msg = "✓ Success" if data.get('success') else f"✗ Failed: {data.get('error')}"
print(f"Result: {success_msg}")
if data.get('success'):
    user_exists = User.objects.filter(username=unique_username).exists()
    print(f"User created: {user_exists}")

print("\n" + "=" * 70)
