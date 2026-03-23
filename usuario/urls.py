from django.urls import path
from usuario import views

app_name = 'usuario'

urlpatterns = [
    path('dashboard/', views.dashboard, name='dashboard'),
]