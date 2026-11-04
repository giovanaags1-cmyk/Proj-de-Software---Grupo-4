from django.contrib import admin
from .models import Candidato


@admin.register(Candidato)
class CandidatoAdmin(admin.ModelAdmin):
    list_display = (
        "nome",
        "apelido",
        "partido",
        "cargo",
        "uf",
    )

    search_fields = (
        "nome",
        "apelido",
        "partido",
    )

    list_filter = (
        "partido",
        "cargo",
        "uf",
    )