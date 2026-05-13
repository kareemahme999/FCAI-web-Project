import os
import django
from django.test import Client

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

# Create test client
client = Client()

# Test books API
print("Testing Books API...")
response = client.get('/api/books/')
print('Books API status:', response.status_code)
if response.status_code == 200:
    payload = response.json()
    books = payload.get('books', [])
    print('Books count:', len(books))
    print('First book title:', books[0]['title'] if books else 'None')

# Test login API
print("\nTesting Login API...")
response = client.post('/login/',
                      {'username': 'testuser', 'password': 'testpass123'})
print('Login API status:', response.status_code)
if response.status_code == 200:
    data = response.json()
    print('Login success:', data.get('success'))
    if data.get('success'):
        print('Redirect:', data.get('redirect'))

# Test cart API (should require login)
print("\nTesting Cart API (unauthenticated)...")
unauth_client = Client()
response = unauth_client.get('/api/cart/')
print('Cart API status (unauthenticated):', response.status_code)
print('Cart API content:', response.content[:200])

print("\nTesting completed!")