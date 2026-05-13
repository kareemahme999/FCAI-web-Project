from django.db import models
from django.utils.text import slugify
from django.contrib.auth.models import User


class ContactMessage(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField()
    subject = models.CharField(max_length=255, blank=True)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Message from {self.name} - {self.subject}"

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'subject': self.subject,
            'message': self.message,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S'),
        }


class Book(models.Model):
    title = models.CharField(max_length=255, unique=True)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    author = models.CharField(max_length=255)
    genre = models.CharField(max_length=100, blank=True)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    old_price = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    discount = models.PositiveIntegerField(default=0)
    stock = models.PositiveIntegerField(default=0)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=4.5)
    reviews = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=50, default='Active')
    badge = models.CharField(max_length=50, default='New')
    color = models.CharField(max_length=255, blank=True)
    image_url = models.URLField(max_length=500, blank=True)
    description = models.TextField(blank=True)
    full_desc = models.TextField(blank=True)
    pages = models.PositiveIntegerField(null=True, blank=True)
    year = models.PositiveIntegerField(null=True, blank=True)
    language = models.CharField(max_length=20, default='EN')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'slug': self.slug,
            'author': self.author,
            'genre': self.genre,
            'price': float(self.price),
            'oldPrice': float(self.old_price) if self.old_price is not None else None,
            'discount': self.discount,
            'stock': self.stock,
            'rating': float(self.rating),
            'reviews': self.reviews,
            'status': self.status,
            'badge': self.badge,
            'color': self.color,
            'imgUrl': self.image_url,
            'description': self.description,
            'full_desc': self.full_desc,
            'pages': self.pages,
            'year': self.year,
            'lang': self.language,
        }


class Cart(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Cart for {self.user.username}"

    def get_total_price(self):
        return sum(item.get_total_price() for item in self.cartitem_set.all())


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE)
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('cart', 'book')

    def __str__(self):
        return f"{self.quantity} x {self.book.title} in {self.cart}"

    def get_total_price(self):
        return self.quantity * self.book.price


class Wishlist(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Wishlist for {self.user.username}"


class WishlistItem(models.Model):
    wishlist = models.ForeignKey(Wishlist, on_delete=models.CASCADE)
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('wishlist', 'book')

    def __str__(self):
        return f"{self.book.title} in {self.wishlist}"
