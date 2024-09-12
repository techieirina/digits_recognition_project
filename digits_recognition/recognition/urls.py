from django.urls import path
from . import views

urlpatterns = [
    path('', views.recognize_digit, name='recognize_digit'),
]