from django.urls import path
from usuario import views

app_name = 'usuario'

urlpatterns = [
    path('', views.index, name='index'),
    path('login/', views.entrar, name='login'),
    path('cadastro/', views.cadastro, name='cadastro'),
    path('dashboard/', views.dashboard, name='dashboard'),
]