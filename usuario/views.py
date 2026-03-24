from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login

def entrar(request):
    if request.method == 'GET':
        return render(request, 'usuario/login.html')
    if request.method == 'POST':
        usuario = request.POST.get('usuario')
        senha = request.POST.get('senha')
        user = authenticate(request, username=usuario, password=senha)
        if user is not None:
            login(request, user)
            return redirect('usuario:dashboard')
        else:
            return render(request, 'usuario/login.html', {'error': 'Usuário ou senha inválidos'})

def cadastro(request):
    if request.method == 'GET':
        return render(request, 'usuario/cadastro.html')
    if request.method == 'POST':
        pass

def index(request):
    return render(request, 'usuario/index.html')

def dashboard(request):
    if not request.user.is_authenticated:
        return redirect('usuario:login')
    return render(request, 'usuario/dashboard.html')
