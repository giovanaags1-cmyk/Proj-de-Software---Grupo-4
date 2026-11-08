from django.contrib import admin

from .models import Candidato


@admin.register(Candidato)
class CandidatoAdmin(admin.ModelAdmin):
    list_display = (
        "nome",
        "partido",
        "cargo",
        "uf",
    )

    search_fields = (
        "nome",
        "partido",
    )