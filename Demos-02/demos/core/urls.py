from django.urls import path

from .views import (
    IndexView,
    SalvosView,
    LoginUsuarioView,
    CadastroUsuarioView,
    CandidatoView,
    CompararView,
    SalvarCandidatoView,
)


urlpatterns = [
    path(
    "candidato/<int:pk>/salvar/",
    SalvarCandidatoView.as_view(),
    name="salvar_candidato"
),
    path(
        "",
        IndexView.as_view(),
        name="index"
    ),

    path(
        "salvos/",
        SalvosView.as_view(),
        name="salvos"
    ),

    path(
        "login/",
        LoginUsuarioView.as_view(),
        name="login"
    ),

    path(
        "cadastro/",
        CadastroUsuarioView.as_view(),
        name="cadastro"
    ),

    path(
        "candidato/<int:pk>/",
        CandidatoView.as_view(),
        name="candidato"
    ),
    path(
    "comparar/",
    CompararView.as_view(),
    name="comparar"
    ),
]