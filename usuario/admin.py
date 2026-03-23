from django.contrib import admin
from usuario.models import Usuario, Peso

class UsuarioAdmin(admin.ModelAdmin):
    list_display = ('user', 'idade', 'altura', 'imc')
    search_fields = ('user__username',)

class PesoAdmin(admin.ModelAdmin):
    list_display = ('usuario', 'valor', 'data')
    search_fields = ('usuario__user__username',)

admin.site.register(Usuario, UsuarioAdmin)
admin.site.register(Peso, PesoAdmin)
