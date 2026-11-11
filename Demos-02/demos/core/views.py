from django.views.generic import TemplateView, DetailView, FormView
from django.contrib.auth.views import LoginView
from django.contrib.auth.forms import UserCreationForm
from django.urls import reverse_lazy, reverse
from django.db.models import Q
from django.shortcuts import redirect
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views import View
from .models import Candidato, Favorito
from django.contrib import messages
from django.contrib.auth import logout
from .forms import ExcluirContaForm
class RemoverCandidatoView(LoginRequiredMixin, View):
    login_url = "login"

    def post(self, request, pk):

        Favorito.objects.filter(
            usuario=request.user,
            candidato_id=pk
        ).delete()

        messages.success(
            request,
            "Removido dos salvos."
        )

        voltar = request.POST.get("next")

        if voltar and voltar.startswith("/"):
            return redirect(voltar)

        return redirect(
            "candidato",
            pk=pk
        )
class SalvarCandidatoView(View):

    def post(self, request, pk):

        candidato = Candidato.objects.get(pk=pk)

        voltar = request.POST.get("next")

        if not request.user.is_authenticated:

            request.session["candidato_para_salvar"] = candidato.id

            if voltar:
                request.session["voltar_depois_login"] = voltar

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

        if voltar and voltar.startswith("/"):
            return redirect(voltar)

        return redirect(
            "candidato",
            pk=candidato.id
        )
class RemoverFavoritoView(LoginRequiredMixin, View):
    login_url = "login"

    def post(self, request, pk):

        favorito = Favorito.objects.filter(
            pk=pk,
            usuario=request.user
        ).first()

        if favorito:
            favorito.delete()

            messages.success(
                request,
                "Candidato removido dos salvos."
            )

        return redirect("salvos")

class IndexView(TemplateView):
    template_name = "core/index.html"

    def get(self, request, *args, **kwargs):
        pesquisa = request.GET.get("q", "").strip()

        if pesquisa:
            candidato_exato = Candidato.objects.filter(
                nome__iexact=pesquisa
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
                Q(partido__icontains=pesquisa) |
                Q(cargo__icontains=pesquisa) |
                Q(uf__icontains=pesquisa)
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

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        if self.request.user.is_authenticated:
            context["esta_salvo"] = Favorito.objects.filter(
                usuario=self.request.user,
                candidato=self.object
            ).exists()
        else:
            context["esta_salvo"] = False

        return context

class CompararView(TemplateView):
    template_name = "core/comparar.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        candidato1_id = self.request.GET.get("candidato1")
        candidato2_id = self.request.GET.get("candidato2")
        pesquisa = self.request.GET.get("q", "").strip()

        candidato1 = None
        candidato2 = None

        if candidato1_id:
            candidato1 = Candidato.objects.filter(
                id=candidato1_id
            ).first()

        if candidato2_id:
            candidato2 = Candidato.objects.filter(
                id=candidato2_id
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

        candidato1_salvo = False
        candidato2_salvo = False

        if self.request.user.is_authenticated:

            if candidato1:
                candidato1_salvo = Favorito.objects.filter(
                    usuario=self.request.user,
                    candidato=candidato1
                ).exists()

            if candidato2:
                candidato2_salvo = Favorito.objects.filter(
                    usuario=self.request.user,
                    candidato=candidato2
                ).exists()

        context["candidato1"] = candidato1
        context["candidato2"] = candidato2
        context["candidatos2"] = candidatos2
        context["pesquisa"] = pesquisa

        context["candidato1_salvo"] = candidato1_salvo
        context["candidato2_salvo"] = candidato2_salvo

        return context
class ExcluirContaView(LoginRequiredMixin, FormView):
    template_name = "core/excluir_conta.html"
    form_class = ExcluirContaForm
    success_url = reverse_lazy("login")   # o login mostra a mensagem de sucesso
    login_url = "login"

    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        kwargs["usuario"] = self.request.user
        return kwargs

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["total_salvos"] = Favorito.objects.filter(
            usuario=self.request.user
        ).count()
        return context

    def form_valid(self, form):
        usuario = self.request.user
        logout(self.request)      # encerra a sessão
        usuario.delete()          # apaga a conta e os favoritos (CASCADE)
        messages.success(self.request, "Sua conta foi excluída.")
        return super().form_valid(form)


# ---------------- Sprint 9 (Giovana) ----------------

class MinhaContaView(LoginRequiredMixin, TemplateView):
    template_name = "core/minha_conta.html"
    login_url = "login"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        favoritos = Favorito.objects.filter(
            usuario=self.request.user
        ).select_related("candidato")

        context["total_salvos"] = favoritos.count()
        context["ultimos_salvos"] = favoritos.order_by("-id")[:3]

        return context


class SobreView(TemplateView):
    template_name = "core/sobre.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["total_candidatos"] = Candidato.objects.count()
        return context


class TermosView(TemplateView):
    template_name = "core/termos.html"
