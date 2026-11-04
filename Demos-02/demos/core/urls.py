from django.urls import path

from .views import (
    IndexView,
    SalvosView,
    LoginUsuarioView,
    CadastroUsuarioView,
)


urlpatterns = [
    path("", IndexView.as_view(), name="index"),
    path("salvos/", SalvosView.as_view(), name="salvos"),
    path("login/", LoginUsuarioView.as_view(), name="login"),
    path("cadastro/", CadastroUsuarioView.as_view(), name="cadastro"),
]