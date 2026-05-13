import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

from django.contrib.auth.models import User

# Create a staff user for testing
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'AdminPass123!')
    print('Admin user created with password AdminPass123!')
else:
    # Update password if user exists
    admin = User.objects.get(username='admin')
    admin.set_password('AdminPass123!')
    admin.save()
    print('Admin user password updated to AdminPass123!')