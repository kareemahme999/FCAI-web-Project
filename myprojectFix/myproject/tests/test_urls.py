import os
import django
from django.test import Client

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

client = Client()

# Test basic pages
pages = ['/', '/login/', '/register/', '/home/', '/about/', '/books/', '/cart/', '/contact/']
for page in pages:
    try:
        response = client.get(page)
        print(f'{page}: {response.status_code}')
    except Exception as e:
        print(f'{page}: ERROR - {e}')

# Test API endpoints
api_endpoints = ['/api/books/', '/api/messages/']
for endpoint in api_endpoints:
    try:
        response = client.get(endpoint)
        print(f'{endpoint}: {response.status_code}')
    except Exception as e:
        print(f'{endpoint}: ERROR - {e}')

print('URL testing completed!')