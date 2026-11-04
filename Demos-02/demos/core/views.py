from django.views.generic import TemplateView
from .models import Candidato
from django.contrib.auth.views import LoginView
from django.contrib.auth.forms import UserCreationForm
from django.urls import reverse_lazy
from django.views.generic import FormView
from django.db.models import Q

class IndexView(TemplateView):
    template_name = "core/index.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        pesquisa = self.request.GET.get("q", "")

        if pesquisa:
            candidatos = Candidato.objects.filter(
                Q(nome__icontains=pesquisa) |
                Q(apelido__icontains=pesquisa) |
                Q(partido__icontains=pesquisa)
            )
        else:
            candidatos = Candidato.objects.none()

        context["candidatos"] = candidatos
        context["pesquisa"] = pesquisa

        return context


class SalvosView(TemplateView):
    template_name = "core/salvos.html"

class LoginUsuarioView(LoginView):
    template_name = "core/login.html"
    next_page = "/"

class CadastroUsuarioView(FormView):
    template_name = "core/cadastro.html"
    form_class = UserCreationForm
    success_url = reverse_lazy("login")

    def form_valid(self, form):
        form.save()
        return super().form_valid(form)