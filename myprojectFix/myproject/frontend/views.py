import json
from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.contrib.admin.views.decorators import staff_member_required
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_http_methods
from .models import Book, ContactMessage, Cart, CartItem, Wishlist, WishlistItem
from django.core.serializers.json import DjangoJSONEncoder


def index(request):
    """Root page — redirect based on authentication status."""
    if request.user.is_authenticated:
        if request.user.is_staff:
            return redirect('frontend_admin')
        else:
            return redirect('home')
    else:
        return redirect('login')


def parse_body(request):
    """
    Parse request body based on content type.
    Supports:
    - application/json
    - application/x-www-form-urlencoded
    - multipart/form-data (form fields)
    
    Returns a dictionary of parsed data
    """
    content_type = request.META.get('CONTENT_TYPE', '')
    
    # Handle JSON content
    if content_type.startswith('application/json'):
        try:
            return json.loads(request.body.decode('utf-8') or '{}')
        except (json.JSONDecodeError, ValueError):
            return {}
    
    # Handle form-encoded or multipart data
    # Both are available in request.POST for these content types
    return request.POST


def require_api_auth(request):
    if not request.user.is_authenticated:
        return JsonResponse({'success': False, 'error': 'Authentication required'}, status=401)
    return None


# ── ROOT: redirect to login ──────────────────────────────────────────────────
@login_required
@ensure_csrf_cookie
def home(request):
    """Home page — only one definition, no duplicate."""
    return render(request, 'index.html')


def about(request):
    return render(request, 'About.html')


@ensure_csrf_cookie
def books(request):
    query = request.GET.get('q', '')
    books_qs = Book.objects.filter(status='Active').order_by('title')
    if query:
        books_qs = books_qs.filter(title__icontains=query) | books_qs.filter(author__icontains=query)
    return render(request, 'Books.html', {'books': books_qs, 'query': query})


@ensure_csrf_cookie
def book_details(request):
    title = request.GET.get('title', '')
    book = None
    if title:
        book = Book.objects.filter(title__iexact=title).first()
    book_json = json.dumps(serialize_book(book)) if book else 'null'
    return render(request, 'Book_Details.html', {'book': book, 'book_json': book_json})


@login_required
@ensure_csrf_cookie
def cart(request):
    return render(request, 'Cart.html')


@require_http_methods(["GET"])
def get_cart(request):
    auth_error = require_api_auth(request)
    if auth_error:
        return auth_error
    cart, created = Cart.objects.get_or_create(user=request.user)
    items = cart.cartitem_set.all().select_related('book')
    cart_data = {
        'items': [{
            'id': item.id,
            'book': serialize_book(item.book),
            'quantity': item.quantity,
            'total_price': float(item.get_total_price())
        } for item in items],
        'total_price': float(cart.get_total_price())
    }
    return JsonResponse(cart_data)


@require_http_methods(["POST"])
def add_to_cart(request):
    auth_error = require_api_auth(request)
    if auth_error:
        return auth_error
    try:
        data = parse_body(request)
        book_id = data.get('book_id')
        quantity = data.get('quantity', 1)
        
        try:
            book_id = int(book_id)
            quantity = int(quantity)
        except (ValueError, TypeError):
            return JsonResponse({'success': False, 'message': 'Invalid book_id or quantity'}, status=400)
        
        book = Book.objects.get(id=book_id)
        cart, created = Cart.objects.get_or_create(user=request.user)
        
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            book=book,
            defaults={'quantity': quantity}
        )
        
        if not created:
            cart_item.quantity += quantity
            cart_item.save()
        
        return JsonResponse({'success': True, 'message': 'Item added to cart'})
    except Book.DoesNotExist:
        return JsonResponse({'success': False, 'message': 'Book not found'}, status=404)
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=400)


@require_http_methods(["POST"])
def update_cart_item(request):
    auth_error = require_api_auth(request)
    if auth_error:
        return auth_error
    try:
        data = parse_body(request)
        item_id = data.get('item_id')
        quantity = data.get('quantity')
        
        try:
            item_id = int(item_id)
            quantity = int(quantity)
        except (ValueError, TypeError):
            return JsonResponse({'success': False, 'message': 'Invalid item_id or quantity'}, status=400)
        
        cart_item = CartItem.objects.get(id=item_id, cart__user=request.user)
        if quantity <= 0:
            cart_item.delete()
        else:
            cart_item.quantity = quantity
            cart_item.save()
        
        return JsonResponse({'success': True})
    except CartItem.DoesNotExist:
        return JsonResponse({'success': False, 'message': 'Item not found'}, status=404)
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=400)


@require_http_methods(["POST"])
def remove_from_cart(request):
    auth_error = require_api_auth(request)
    if auth_error:
        return auth_error
    try:
        data = parse_body(request)
        item_id = data.get('item_id')
        
        try:
            item_id = int(item_id)
        except (ValueError, TypeError):
            return JsonResponse({'success': False, 'message': 'Invalid item_id'}, status=400)
        
        cart_item = CartItem.objects.get(id=item_id, cart__user=request.user)
        cart_item.delete()
        
        return JsonResponse({'success': True})
    except CartItem.DoesNotExist:
        return JsonResponse({'success': False, 'message': 'Item not found'}, status=404)
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=400)


@require_http_methods(["GET"])
def get_wishlist(request):
    auth_error = require_api_auth(request)
    if auth_error:
        return auth_error
    wishlist, created = Wishlist.objects.get_or_create(user=request.user)
    items = wishlist.wishlistitem_set.all().select_related('book')
    wishlist_data = {
        'items': [{
            'id': item.id,
            'book': serialize_book(item.book),
            'added_at': item.added_at.strftime('%Y-%m-%d %H:%M:%S')
        } for item in items]
    }
    return JsonResponse(wishlist_data)


@require_http_methods(["POST"])
def add_to_wishlist(request):
    auth_error = require_api_auth(request)
    if auth_error:
        return auth_error
    try:
        data = parse_body(request)
        book_id = data.get('book_id')
        
        try:
            book_id = int(book_id)
        except (ValueError, TypeError):
            return JsonResponse({'success': False, 'message': 'Invalid book_id'}, status=400)
        
        book = Book.objects.get(id=book_id)
        wishlist, created = Wishlist.objects.get_or_create(user=request.user)
        
        wishlist_item, created = WishlistItem.objects.get_or_create(
            wishlist=wishlist,
            book=book
        )
        
        if created:
            return JsonResponse({'success': True, 'message': 'Book added to wishlist'})
        else:
            return JsonResponse({'success': False, 'message': 'Book already in wishlist'})
    except Book.DoesNotExist:
        return JsonResponse({'success': False, 'message': 'Book not found'}, status=404)
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=400)


@require_http_methods(["POST"])
def remove_from_wishlist(request):
    auth_error = require_api_auth(request)
    if auth_error:
        return auth_error
    try:
        data = parse_body(request)
        item_id = data.get('item_id')
        
        try:
            item_id = int(item_id)
        except (ValueError, TypeError):
            return JsonResponse({'success': False, 'message': 'Invalid item_id'}, status=400)
        
        wishlist_item = WishlistItem.objects.get(id=item_id, wishlist__user=request.user)
        wishlist_item.delete()
        
        return JsonResponse({'success': True})
    except WishlistItem.DoesNotExist:
        return JsonResponse({'success': False, 'message': 'Item not found'}, status=404)
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=400)


def contact(request):
    if request.method == 'POST':
        name    = request.POST.get('name')
        email   = request.POST.get('email')
        subject = request.POST.get('subject')
        message = request.POST.get('message')
        if name and email and message:
            ContactMessage.objects.create(name=name, email=email, subject=subject, message=message)
            return JsonResponse({'success': True, 'message': 'Message sent successfully!'})
        else:
            return JsonResponse({'success': False, 'message': 'Please fill all required fields.'})
    return render(request, 'Contact.html')


@ensure_csrf_cookie
def log_in(request):
    """
    Handle user login with proper authentication.
    
    POST request should contain:
    - username: User's username
    - password: User's password
    
    Returns JSON response with success status and redirect URL
    """
    if request.method == 'POST':
        data = parse_body(request)
        username = data.get('username', '').strip()
        password = data.get('password', '').strip()
        
        # Input validation
        if not username:
            return JsonResponse({'success': False, 'error': 'Username is required'}, status=400)
        if not password:
            return JsonResponse({'success': False, 'error': 'Password is required'}, status=400)
        
        # Authenticate user
        user = authenticate(request, username=username, password=password)
        if user is not None:
            # Authentication successful - log user in
            login(request, user)
            # Redirect staff users to admin page, regular users to home
            redirect_url = '/frontend-admin/' if user.is_staff else '/home/'
            return JsonResponse({
                'success': True, 
                'redirect': redirect_url,
                'message': 'Login successful'
            })
        else:
            # Authentication failed
            return JsonResponse({
                'success': False, 
                'error': 'Invalid username or password. Please try again.'
            }, status=401)
    
    # GET request - render login page
    return render(request, 'log_in.html')


@ensure_csrf_cookie
def register(request):
    """
    Handle user registration with proper validation.
    
    POST request should contain:
    - username: New username (3+ chars, alphanumeric)
    - email: Valid email address
    - password: Password (6+ chars)
    - password_confirm: Password confirmation (must match)
    
    Returns JSON response with success status and redirect URL
    """
    if request.method == 'POST':
        data = parse_body(request)
        username = data.get('username', '').strip()
        email = data.get('email', '').strip()
        password = data.get('password', '').strip()
        password_confirm = data.get('password_confirm', '').strip()
        
        # Input validation
        if not username:
            return JsonResponse({'success': False, 'error': 'Username is required'}, status=400)
        if len(username) < 3:
            return JsonResponse({'success': False, 'error': 'Username must be at least 3 characters'}, status=400)
        # Allow alphanumeric and underscore
        if not all(c.isalnum() or c == '_' for c in username):
            return JsonResponse({'success': False, 'error': 'Username can only contain letters, numbers, and underscores'}, status=400)
        
        if not email:
            return JsonResponse({'success': False, 'error': 'Email is required'}, status=400)
        if '@' not in email or '.' not in email:
            return JsonResponse({'success': False, 'error': 'Invalid email address'}, status=400)
        
        if not password:
            return JsonResponse({'success': False, 'error': 'Password is required'}, status=400)
        if len(password) < 6:
            return JsonResponse({'success': False, 'error': 'Password must be at least 6 characters'}, status=400)
        
        if not password_confirm:
            return JsonResponse({'success': False, 'error': 'Password confirmation is required'}, status=400)
        if password != password_confirm:
            return JsonResponse({'success': False, 'error': 'Passwords do not match'}, status=400)
        
        # Check for existing username
        if User.objects.filter(username=username).exists():
            return JsonResponse({'success': False, 'error': 'Username already exists. Please choose a different one.'}, status=409)
        
        # Check for existing email
        if User.objects.filter(email=email).exists():
            return JsonResponse({'success': False, 'error': 'Email already registered. Please use a different email or log in.'}, status=409)
        
        # Create user with validated data
        try:
            user = User.objects.create_user(
                username=username, 
                email=email, 
                password=password
            )
            # Log the user in after registration
            login(request, user)
            # Redirect to home page (new users are not staff)
            return JsonResponse({
                'success': True, 
                'redirect': '/home/',
                'message': 'Registration successful! Welcome to FOLIO.'
            }, status=201)
        except Exception as e:
            # Catch any database errors
            return JsonResponse({
                'success': False, 
                'error': 'An error occurred during registration. Please try again.'
            }, status=500)
    
    # GET request - render login page (register form is on same page)
    return render(request, 'log_in.html')


def logout_view(request):
    """
    Handle user logout by clearing session and cookies.
    Redirects to login page after logout.
    """
    logout(request)
    return redirect('login')


@login_required
@ensure_csrf_cookie
def my_list(request):
    return render(request, 'my_list.html')


@login_required
@ensure_csrf_cookie
def user_profile(request):
    user = request.user
    profile_name = user.get_full_name() or user.username
    profile_email = user.email or ''
    profile_since = user.date_joined.strftime('%B %Y')
    return render(request, 'User_profile.html', {
        'profile_name': profile_name,
        'profile_email': profile_email,
        'profile_since': profile_since,
    })


@staff_member_required
@ensure_csrf_cookie
def frontend_admin(request):
    return render(request, 'admin.html')


def books_data(request):
    if request.method == 'GET':
        books_qs = Book.objects.filter(status='Active').order_by('title')
        return JsonResponse({'books': [serialize_book(b) for b in books_qs]})
    elif request.method == 'POST':
        if not request.user.is_staff:
            return JsonResponse({'error': 'Permission denied'}, status=403)
        
        try:
            data = json.loads(request.body)
            book = Book.objects.create(
                title=data['title'],
                author=data['author'],
                genre=data.get('genre', ''),
                price=data['price'],
                old_price=data.get('old_price'),
                discount=data.get('discount', 0),
                stock=data.get('stock', 0),
                rating=data.get('rating', 4.5),
                reviews=data.get('reviews', 0),
                status=data.get('status', 'Active'),
                badge=data.get('badge', 'New'),
                color=data.get('color', ''),
                image_url=data.get('image_url', ''),
                description=data.get('description', ''),
                full_desc=data.get('full_desc', ''),
                pages=data.get('pages'),
                year=data.get('year'),
                language=data.get('language', 'EN'),
            )
            return JsonResponse({'success': True, 'book': serialize_book(book)}, status=201)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)


def book_detail_api(request, book_id):
    try:
        book = Book.objects.get(id=book_id)
    except Book.DoesNotExist:
        return JsonResponse({'error': 'Book not found'}, status=404)
    
    if request.method == 'GET':
        return JsonResponse(serialize_book(book))
    elif request.method == 'PUT':
        if not request.user.is_staff:
            return JsonResponse({'error': 'Permission denied'}, status=403)
        
        try:
            data = json.loads(request.body)
            for field in ['title', 'author', 'genre', 'price', 'old_price', 'discount', 'stock', 'rating', 'reviews', 'status', 'badge', 'color', 'image_url', 'description', 'full_desc', 'pages', 'year', 'language']:
                if field in data:
                    setattr(book, field, data[field])
            book.save()
            return JsonResponse({'success': True, 'book': serialize_book(book)})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    elif request.method == 'DELETE':
        if not request.user.is_staff:
            return JsonResponse({'error': 'Permission denied'}, status=403)
        
        book.delete()
        return JsonResponse({'success': True})
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)


def book_data(request):
    title = request.GET.get('title', '')
    book  = Book.objects.filter(title__iexact=title).first()
    if not book:
        return JsonResponse({'error': 'Book not found'}, status=404)
    return JsonResponse(serialize_book(book))


def contact_messages(request):
    if request.method == 'GET':
        msgs = ContactMessage.objects.all().order_by('-created_at')
        return JsonResponse({'messages': [m.to_dict() for m in msgs]})
    return JsonResponse({'error': 'Invalid request method'}, status=400)


def serialize_book(book):
    if not book:
        return None
    return book.to_dict()
