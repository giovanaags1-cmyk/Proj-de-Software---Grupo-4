from django.urls import path
from django.contrib.auth.views import LogoutView
from django.contrib.auth import views as auth_views
from django.urls import reverse_lazy
from django.contrib import admin
from .views import (
    IndexView,
    SalvosView,
    LoginUsuarioView,
    CadastroUsuarioView,
    CandidatoView,
    CompararView,
    SalvarCandidatoView,
    ExcluirContaView,
    RemoverFavoritoView,
    RemoverCandidatoView,
    CompararView,
)


urlpatterns = [
    path(
    "comparar/",
    CompararView.as_view(),
    name="comparar"
),
    path(
    "candidato/<int:pk>/remover/",
    RemoverCandidatoView.as_view(),
    name="remover_candidato"
),
    path(
    "salvos/remover/<int:pk>/",
    RemoverFavoritoView.as_view(),
    name="remover_favorito"
),
    path(
    "logout/",
    LogoutView.as_view(next_page="/"),
    name="logout"
),
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
    
    path(
        "conta/excluir/",
        ExcluirContaView.as_view(),
        name="excluir_conta"
    ),

     path(
        "conta/senha/",
        auth_views.PasswordChangeView.as_view(
            template_name="core/alterar_senha.html",
            success_url=reverse_lazy("alterar_senha_concluida"),
        ),
        name="alterar_senha"
    ),
    path(
        "conta/senha/concluida/",
        auth_views.PasswordChangeDoneView.as_view(
            template_name="core/alterar_senha_concluida.html",
        ),
        name="alterar_senha_concluida"
    ),
#Usar para povoar o banco de dados, depois deletar 
    path("admin/", admin.site.urls),
]
