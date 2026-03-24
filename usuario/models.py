from django.db import models
from django.contrib.auth.models import User


class Usuario(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, verbose_name="Usuário")
    altura = models.FloatField(null=True, blank=True, verbose_name="Altura")
    telefone = models.CharField(max_length=20, null=True, blank=True, verbose_name="Telefone")
    objetivo = models.CharField(max_length=255, null=True, blank=True, verbose_name="Objetivo")
    data_nascimento = models.DateField(null=True, blank=True, verbose_name="Data de Nascimento")

    @property
    def imc(self):
        peso = Peso.objects.filter(usuario=self).order_by('-data').first()
        if self.altura and peso:
            return peso.valor / (self.altura ** 2)
        return None
    
    @property
    def idade(self):
        if self.data_nascimento:
            from datetime import date
            today = date.today()
            return today.year - self.data_nascimento.year - ((today.month, today.day) < (self.data_nascimento.month, self.data_nascimento.day))
        return None

    def __str__(self):
        return self.user.username

class Peso(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, verbose_name="Usuário")
    data = models.DateField(verbose_name="Data")
    valor = models.FloatField(verbose_name="Peso")

    def __str__(self):
        return f"{self.usuario.user.username} - {self.data} - {self.valor} kg"