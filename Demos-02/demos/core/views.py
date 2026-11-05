from django.views.generic import TemplateView, DetailView, FormView
from django.contrib.auth.views import LoginView
from django.contrib.auth.forms import UserCreationForm
from django.urls import reverse_lazy, reverse
from django.db.models import Q
from django.shortcuts import redirect
from .models import Candidato
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views import View
from .models import Candidato, Favorito
from django.contrib import messages

class SalvarCandidatoView(View):

    def post(self, request, pk):

        candidato = Candidato.objects.get(pk=pk)

        if not request.user.is_authenticated:

            request.session["candidato_para_salvar"] = candidato.id

            messages.info(
                request,
                "Faça login para salvar o candidato."
            )

            return redirect("login")


        Favorito.objects.get_or_create(
            usuario=request.user,
            candidato=candidato
        )

        messages.success(
            request,
            "Candidato salvo!"
        )

        return redirect("salvos")

class IndexView(TemplateView):
    template_name = "core/index.html"

    def get(self, request, *args, **kwargs):
        pesquisa = request.GET.get("q", "").strip()

        if pesquisa:

            candidato_exato = Candidato.objects.filter(
                Q(nome__iexact=pesquisa) |
                Q(apelido__iexact=pesquisa)
            ).first()

            if candidato_exato:
                return redirect(
                    "candidato",
                    pk=candidato_exato.id
                )

        return super().get(request, *args, **kwargs)


    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        pesquisa = self.request.GET.get("q", "").strip()

        if pesquisa:

            candidatos = Candidato.objects.filter(
                Q(nome__icontains=pesquisa) |
                Q(apelido__icontains=pesquisa) |
                Q(partido__icontains=pesquisa)
            )

        else:

            candidatos = Candidato.objects.none()

        context["pesquisa"] = pesquisa
        context["candidatos"] = candidatos

        return context


class SalvosView(LoginRequiredMixin, TemplateView):
    template_name = "core/salvos.html"
    login_url = "login"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        context["favoritos"] = Favorito.objects.filter(
            usuario=self.request.user
        )

        return context


class LoginUsuarioView(LoginView):
    template_name = "core/login.html"
    next_page = "/"

    def form_valid(self, form):

        resposta = super().form_valid(form)

        candidato_id = self.request.session.pop(
            "candidato_para_salvar",
            None
        )

        if candidato_id:

            candidato = Candidato.objects.get(
                id=candidato_id
            )

            Favorito.objects.get_or_create(
                usuario=self.request.user,
                candidato=candidato
            )

            messages.success(
                self.request,
                "Candidato salvo!"
            )

            return redirect(
                "candidato",
                pk=candidato.id
            )

        return resposta


class CadastroUsuarioView(FormView):
    template_name = "core/cadastro.html"
    form_class = UserCreationForm
    success_url = reverse_lazy("login")

    def form_valid(self, form):
        form.save()
        return super().form_valid(form)


class CandidatoView(DetailView):
    model = Candidato
    template_name = "core/candidato.html"
    context_object_name = "candidato"

class CompararView(TemplateView):
    template_name = "core/comparar.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        candidato1_id = self.request.GET.get("candidato1")
        pesquisa = self.request.GET.get("q", "")

        candidato1 = Candidato.objects.filter(
            id=candidato1_id
        ).first()

        candidatos2 = Candidato.objects.none()

        if pesquisa:
            candidatos2 = Candidato.objects.filter(
                Q(nome__icontains=pesquisa) |
                Q(apelido__icontains=pesquisa)
            )

            if candidato1:
                candidatos2 = candidatos2.exclude(
                    id=candidato1.id
                )

        context["candidato1"] = candidato1
        context["candidatos2"] = candidatos2
        context["pesquisa"] = pesquisa

        return context