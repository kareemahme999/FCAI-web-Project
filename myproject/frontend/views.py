import json
from django.http import JsonResponse
from django.shortcuts import render
from .models import Book, ContactMessage
from django.core.serializers.json import DjangoJSONEncoder


DEFAULT_BOOKS = [
    {
        'title': 'The Midnight Library',
        'author': 'Matt Haig',
        'genre': 'Fiction',
        'price': 18.99,
        'old_price': 24.00,
        'discount': 0,
        'stock': 142,
        'rating': 4.9,
        'reviews': 2341,
        'status': 'Active',
        'badge': 'Bestseller',
        'color': 'linear-gradient(145deg,#2d3142,#4f5d75)',
        'image_url': 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=520&fit=crop',
        'description': 'Between life and death there is a library, and within that library, the shelves go on forever.',
        'full_desc': 'Nora Seed finds herself in the Midnight Library. Faced with the possibility of changing her life for a new one, following a different career, undoing old breakups, realizing her dreams of becoming a glaciologist; she must search within herself as she travels through the Midnight Library to decide what is truly fulfilling in life, and what makes it worth living in the first place.',
        'pages': 320,
        'year': 2020,
        'language': 'EN',
    },
    {
        'title': 'Lessons in Chemistry',
        'author': 'Bonnie Garmus',
        'genre': 'Fiction',
        'price': 22.00,
        'old_price': None,
        'discount': 0,
        'stock': 87,
        'rating': 4.8,
        'reviews': 1890,
        'status': 'Active',
        'badge': 'New',
        'color': 'linear-gradient(145deg,#3d2a2a,#6b4a4a)',
        'image_url': 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&h=520&fit=crop',
        'description': 'A funny, smart, and sometimes shocking story about a female chemist in the 1960s who becomes a cooking show host.',
        'full_desc': 'Elizabeth Zott is not your average woman. In the early 1960s she is forced to take a job as a cooking show host to make ends meet. Her unique approach to cooking, treating it as the chemistry it is, grabs the nation’s attention.',
        'pages': 390,
        'year': 2022,
        'language': 'EN',
    },
    {
        'title': 'Atomic Habits',
        'author': 'James Clear',
        'genre': 'Self-Help',
        'price': 19.99,
        'old_price': 27.00,
        'discount': 0,
        'stock': 203,
        'rating': 4.9,
        'reviews': 5200,
        'status': 'Active',
        'badge': 'Bestseller',
        'color': 'linear-gradient(145deg,#3d5a3e,#5e8b61)',
        'image_url': 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=520&fit=crop',
        'description': 'A revolutionary system to get 1% better every day. No matter your goals, Atomic Habits offers a proven framework for improving every day.',
        'full_desc': 'If you’re having trouble changing your habits, the problem isn’t you. The problem is your system. This book gives you practical strategies for improving every day.',
        'pages': 320,
        'year': 2018,
        'language': 'EN',
    },
    {
        'title': 'Dune',
        'author': 'Frank Herbert',
        'genre': 'Sci-Fi',
        'price': 16.99,
        'old_price': None,
        'discount': 0,
        'stock': 56,
        'rating': 4.9,
        'reviews': 8750,
        'status': 'Active',
        'badge': 'New',
        'color': 'linear-gradient(145deg,#5c4a1e,#8b6914)',
        'image_url': 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=520&fit=crop',
        'description': 'Set on the desert planet Arrakis, Dune is the story of Paul Atreides, heir to a noble family tasked with ruling an inhospitable world.',
        'full_desc': 'A stunning blend of adventure and mysticism, environmentalism and politics. Dune is the grandest epic in science fiction, following noble houses, an emperor, and a spice that controls the universe.',
        'pages': 688,
        'year': 1965,
        'language': 'EN',
    },
    {
        'title': 'Foundation',
        'author': 'Isaac Asimov',
        'genre': 'Sci-Fi',
        'price': 14.99,
        'old_price': 20.00,
        'discount': 0,
        'stock': 34,
        'rating': 4.8,
        'reviews': 4300,
        'status': 'Active',
        'badge': 'Classic',
        'color': 'linear-gradient(145deg,#1a2a4a,#2a4a7a)',
        'image_url': 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&h=520&fit=crop',
        'description': 'The Foundation series is Isaac Asimov’s iconic masterpiece about the collapse of a Galactic Empire and the science of psychohistory.',
        'full_desc': 'Hari Seldon predicts the Empire will collapse in 300 years and creates the Foundation to shorten the coming dark age from 30,000 years to only 1,000 years.',
        'pages': 255,
        'year': 1951,
        'language': 'EN',
    },
    {
        'title': 'Sapiens',
        'author': 'Yuval Noah Harari',
        'genre': 'History',
        'price': 21.99,
        'old_price': None,
        'discount': 0,
        'stock': 8,
        'rating': 4.5,
        'reviews': 6100,
        'status': 'Active',
        'badge': 'Bestseller',
        'color': 'linear-gradient(145deg,#4a3020,#7a5035)',
        'image_url': 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=400&h=520&fit=crop',
        'description': 'A brief history of humankind — from the Stone Age to the present. How did Homo sapiens come to rule the world?',
        'full_desc': 'One hundred thousand years ago, at least six human species lived on earth. Today there is just one. How did Homo sapiens succeed and what made us different?',
        'pages': 443,
        'year': 2011,
        'language': 'EN',
    },
    {
        'title': 'The Alchemist',
        'author': 'Paulo Coelho',
        'genre': 'Fiction',
        'price': 13.99,
        'old_price': 18.00,
        'discount': 0,
        'stock': 178,
        'rating': 4.7,
        'reviews': 12400,
        'status': 'Active',
        'badge': 'Sale',
        'color': 'linear-gradient(145deg,#7a5a10,#b08820)',
        'image_url': 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=400&h=520&fit=crop',
        'description': 'A magical story about following your dreams. The Alchemist is a classic tale of Santiago, an Andalusian shepherd boy.',
        'full_desc': 'Every few decades a book is published that changes the lives of its readers forever. The Alchemist is such a book.',
        'pages': 208,
        'year': 1988,
        'language': 'EN',
    },
    {
        'title': 'Think Again',
        'author': 'Adam Grant',
        'genre': 'Psychology',
        'price': 17.99,
        'old_price': None,
        'discount': 0,
        'stock': 5,
        'rating': 4.4,
        'reviews': 2800,
        'status': 'Active',
        'badge': 'New',
        'color': 'linear-gradient(145deg,#2a3a5a,#3a5a8a)',
        'image_url': 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=520&fit=crop',
        'description': 'The power of knowing what you don’t know. Think Again is about how we can get better at embracing the unknown.',
        'full_desc': 'In a rapidly changing world, the ability to rethink and unlearn may matter more than intelligence. Adam Grant shows how to build a culture that prizes rethinking.',
        'pages': 307,
        'year': 2021,
        'language': 'EN',
    },
]


def init_default_books():
    if Book.objects.exists():
        return

    for data in DEFAULT_BOOKS:
        book = Book(
            title=data['title'],
            author=data['author'],
            genre=data['genre'],
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
        book.save()


def serialize_book(book):
    return book.to_dict()


def home(request):
    return render(request, 'index.html')


def about(request):
    return render(request, 'About.html')


def books(request):
    init_default_books()
    query = request.GET.get('q', '')
    books_qs = Book.objects.filter(status='Active').order_by('title')
    if query:
        books_qs = books_qs.filter(title__icontains=query) | books_qs.filter(author__icontains=query)
    return render(request, 'Books.html', {'books': books_qs, 'query': query})


def book_details(request):
    init_default_books()
    title = request.GET.get('title', '')
    book = None
    if title:
        book = Book.objects.filter(title__iexact=title).first()
    book_json = json.dumps(serialize_book(book)) if book else 'null'
    return render(request, 'Book_Details.html', {'book': book, 'book_json': book_json})


def cart(request):
    return render(request, 'Cart.html')


def contact(request):
    if request.method == 'POST':
        name = request.POST.get('name')
        email = request.POST.get('email')
        subject = request.POST.get('subject')
        message = request.POST.get('message')
        if name and email and message:
            ContactMessage.objects.create(name=name, email=email, subject=subject, message=message)
            return JsonResponse({'success': True, 'message': 'Message sent successfully!'})
        else:
            return JsonResponse({'success': False, 'message': 'Please fill all required fields.'})
    return render(request, 'Contact.html')


def log_in(request):
    return render(request, 'log_in.html')


def my_list(request):
    return render(request, 'my_list.html')


def user_profile(request):
    return render(request, 'User_profile.html')


def frontend_admin(request):
    return render(request, 'admin.html')


def books_data(request):
    init_default_books()
    books_qs = Book.objects.filter(status='Active').order_by('title')
    return JsonResponse({'books': [serialize_book(book) for book in books_qs]})


def book_data(request):
    init_default_books()
    title = request.GET.get('title', '')
    book = Book.objects.filter(title__iexact=title).first()
    if not book:
        return JsonResponse({'error': 'Book not found'}, status=404)
    return JsonResponse(serialize_book(book))
