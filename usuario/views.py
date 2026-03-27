from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from datetime import datetime
from django.utils import timezone
from usuario.models import Usuario, Peso

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
        nome = request.POST.get('nome')
        sobrenome = request.POST.get('sobrenome')
        email = request.POST.get('email')
        telefone = request.POST.get('telefone')
        data_nascimento = request.POST.get('data_nascimento')
        objetivo = request.POST.get('objetivo')
        senha = request.POST.get('senha')
        confirmar_senha = request.POST.get('confirmar_senha')
        if senha != confirmar_senha:
            return render(request, 'usuario/cadastro.html', {'error': 'As senhas não coincidem'})
        # Aqui você pode adicionar a lógica para criar o usuário no banco de dados
        usuario = User.objects.create_user(
            username=email, 
            email=email, 
            password=senha, 
            first_name=nome, 
            last_name=sobrenome
        )
        usuario.save()
        Usuario.objects.create(
            user=usuario, 
            telefone=telefone, 
            data_nascimento=data_nascimento, 
            objetivo=objetivo
        )
        return redirect('usuario:login')

def index(request):
    return render(request, 'usuario/index.html')

def dashboard(request):
    if not request.user.is_authenticated:
        return redirect('usuario:login')
    usuario = Usuario.objects.get(user=request.user)
    hoje = timezone.now().date()
    peso_inicial = usuario.peso_inicial
    peso_atual = Peso.objects.filter(usuario=usuario).order_by('-data').first() # Ultimo peso registrado
    peso_perdido = peso_inicial - peso_atual.valor if peso_inicial and peso_atual else 0
    bmi_percentage = (usuario.imc / 40) * 100 if usuario.imc else 0 # Supondo que 40 seja o IMC máximo para a escala
    historico_peso = Peso.objects.filter(usuario=usuario).order_by('data')
    datas = [p.data.strftime("%d/%m") for p in historico_peso]
    pesos = [p.valor for p in historico_peso]

    meta_peso = usuario.meta_peso  # exemplo fixo (pode vir do banco)

    # cria uma lista com o mesmo tamanho do histórico
    linha_meta = [meta_peso] * len(pesos)
    contexto = {
        'usuario': usuario,
        'hoje': hoje,
        'peso_inicial': peso_inicial,
        'peso_atual': peso_atual,
        'peso_perdido': peso_perdido,
        'bmi_percentage': bmi_percentage,
        'historico': historico_peso,
        'datas': datas,
        'pesos': pesos,
        'linha_meta': linha_meta,
        'falta_meta': meta_peso - peso_atual.valor if meta_peso and peso_atual else 0
    }
    return render(request, 'usuario/dashboard.html', contexto)
