"""
URL configuration for myproject project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from frontend import views

urlpatterns = [
    path('admin/', admin.site.urls,name='admin'),
    path('', views.home, name='home'),
    path('about/', views.about, name='about'),
    path('books/', views.books, name='books'),
    path('book-details/', views.book_details, name='book_details'),
    path('cart/', views.cart, name='cart'),
    path('contact/', views.contact, name='contact'),
    path('login/', views.log_in, name='login'),
    path('my-list/', views.my_list, name='my_list'),
    path('user-profile/', views.user_profile, name='user_profile'),
    path('frontend-admin/', views.frontend_admin, name='frontend_admin'),
    path('api/books/', views.books_data, name='books_data'),
    path('api/book/', views.book_data, name='book_data'),
]
