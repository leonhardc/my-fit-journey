from django.db import models
from django.contrib.auth.models import User


class Usuario(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, verbose_name="Usuário")
    idade = models.IntegerField(null=True, blank=True, verbose_name="Idade")
    altura = models.FloatField(null=True, blank=True, verbose_name="Altura")

    @property
    def imc(self):
        peso = Peso.objects.filter(usuario=self).order_by('-data').first()
        if self.altura and peso:
            return peso.valor / (self.altura ** 2)
        return None

    def __str__(self):
        return self.user.username

class Peso(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, verbose_name="Usuário")
    data = models.DateField(verbose_name="Data")
    valor = models.FloatField(verbose_name="Peso")

    def __str__(self):
        return f"{self.usuario.user.username} - {self.data} - {self.valor} kg"