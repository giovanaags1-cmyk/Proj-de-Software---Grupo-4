from django.views.generic import TemplateView, DetailView, FormView, ListView
from django.contrib.auth.views import LoginView
from django.contrib.auth.forms import UserCreationForm
from django.urls import reverse_lazy, reverse
from django.db.models import Q, Count
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
    # Sprint 8 (Giovana): comparacao lado a lado, sem JavaScript.
    # Fluxo: escolhe o candidato 1 -> pesquisa o candidato 2 -> mostra os dois.
    template_name = "core/comparar.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        candidato1_id = self.request.GET.get("candidato1")
        candidato2_id = self.request.GET.get("candidato2")
        pesquisa = self.request.GET.get("q", "").strip()

        candidato1 = Candidato.objects.filter(id=candidato1_id).first() if candidato1_id else None
        candidato2 = Candidato.objects.filter(id=candidato2_id).first() if candidato2_id else None

        resultados = Candidato.objects.none()

        if pesquisa:
            resultados = Candidato.objects.filter(
                Q(nome__icontains=pesquisa) |
                Q(apelido__icontains=pesquisa) |
                Q(partido__icontains=pesquisa)
            ).order_by("nome")

            if candidato1:
                resultados = resultados.exclude(id=candidato1.id)

        context["candidato1"] = candidato1
        context["candidato2"] = candidato2
        context["candidatos2"] = resultados
        context["pesquisa"] = pesquisa

        return context


class CandidatosView(ListView):
    # Sprint 8 (Giovana): listagem de candidatos com filtros e ordenacao.
    # Os filtros funcionam por formulario GET, sem JavaScript.
    model = Candidato
    template_name = "core/candidatos.html"
    context_object_name = "candidatos"
    paginate_by = 12

    ORDENACOES = {
        "nome": "nome",
        "-nome": "-nome",
        "partido": "partido",
        "uf": "uf",
    }

    def get_queryset(self):
        candidatos = Candidato.objects.all()

        pesquisa = self.request.GET.get("q", "").strip()
        partido = self.request.GET.get("partido", "")
        cargo = self.request.GET.get("cargo", "")
        uf = self.request.GET.get("uf", "")
        ordem = self.request.GET.get("ordem", "nome")

        if pesquisa:
            candidatos = candidatos.filter(
                Q(nome__icontains=pesquisa) |
                Q(apelido__icontains=pesquisa)
            )

        if partido:
            candidatos = candidatos.filter(partido=partido)

        if cargo:
            candidatos = candidatos.filter(cargo=cargo)

        if uf:
            candidatos = candidatos.filter(uf=uf)

        return candidatos.order_by(self.ORDENACOES.get(ordem, "nome"))

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        filtros = {
            "q": self.request.GET.get("q", "").strip(),
            "partido": self.request.GET.get("partido", ""),
            "cargo": self.request.GET.get("cargo", ""),
            "uf": self.request.GET.get("uf", ""),
            "ordem": self.request.GET.get("ordem", "nome"),
        }

        # Opcoes dos selects vem do proprio banco de dados
        context["partidos"] = Candidato.objects.order_by("partido").values_list("partido", flat=True).distinct()
        context["cargos"] = Candidato.objects.order_by("cargo").values_list("cargo", flat=True).distinct()
        context["ufs"] = Candidato.objects.order_by("uf").values_list("uf", flat=True).distinct()

        context["filtros"] = filtros
        context["tem_filtro"] = any([filtros["q"], filtros["partido"], filtros["cargo"], filtros["uf"]])

        # Mantem os filtros ao trocar de pagina
        parametros = self.request.GET.copy()
        parametros.pop("page", None)
        context["parametros"] = parametros.urlencode()

        return context


class EstatisticasView(TemplateView):
    # Sprint 8 (Giovana): estatisticas do banco de dados.
    # As barras sao feitas so com CSS (largura em %), sem JavaScript.
    template_name = "core/estatisticas.html"

    def montar_barras(self, campo, limite=10):
        grupos = (
            Candidato.objects
            .values(campo)
            .annotate(total=Count("id"))
            .order_by("-total", campo)[:limite]
        )

        maior = grupos[0]["total"] if grupos else 1

        return [
            {
                "nome": grupo[campo] or "Não informado",
                "total": grupo["total"],
                "largura": round(grupo["total"] * 100 / maior),
            }
            for grupo in grupos
        ]

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        context["total_candidatos"] = Candidato.objects.count()
        context["total_partidos"] = Candidato.objects.values("partido").distinct().count()
        context["total_ufs"] = Candidato.objects.values("uf").distinct().count()
        context["total_salvos"] = Favorito.objects.count()

        context["por_partido"] = self.montar_barras("partido")
        context["por_cargo"] = self.montar_barras("cargo")
        context["por_uf"] = self.montar_barras("uf")

        context["mais_salvos"] = (
            Candidato.objects
            .annotate(total_salvos=Count("favorito"))
            .filter(total_salvos__gt=0)
            .order_by("-total_salvos", "nome")[:5]
        )

        return context
