"""
URL configuration for myproject project.
"""
from django.contrib import admin
from django.urls import path
from frontend import views

urlpatterns = [
    path('admin/', admin.site.urls, name='admin'),

    # ── Root → smart redirect based on auth status ──
    path('', views.index, name='index'),
    path('home/', views.home, name='home'),

    path('index/', views.index, name='index'),
    path('about/', views.about, name='about'),
    path('books/',views.books,name='books'),
    path('book-details/',views.book_details,name='book_details'),
    path('cart/',views.cart,name='cart'),
    path('contact/',views.contact,name='contact'),
    path('login/',views.log_in,name='login'),
    path('register/',views.register,name='register'),
    path('logout/',views.logout_view,name='logout'),
    path('my-list/',views.my_list,name='my_list'),
    path('user-profile/',views.user_profile,name='user_profile'),
    path('frontend-admin/',views.frontend_admin,name='frontend_admin'),
    
    # API endpoints
    path('api/books/',views.books_data,name='books_data'),
    path('api/books/<int:book_id>/',views.book_detail_api,name='book_detail_api'),
    path('api/book/',views.book_data,name='book_data'),
    path('api/messages/',views.contact_messages,name='contact_messages'),
    
    # Cart APIs
    path('api/cart/',views.get_cart,name='get_cart'),
    path('api/cart/add/',views.add_to_cart,name='add_to_cart'),
    path('api/cart/update/',views.update_cart_item,name='update_cart_item'),
    path('api/cart/remove/',views.remove_from_cart,name='remove_from_cart'),
    
    # Wishlist APIs
    path('api/wishlist/',views.get_wishlist,name='get_wishlist'),
    path('api/wishlist/add/',views.add_to_wishlist,name='add_to_wishlist'),
    path('api/wishlist/remove/',views.remove_from_wishlist,name='remove_from_wishlist'),
]
