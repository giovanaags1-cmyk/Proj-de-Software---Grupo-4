from django.views.generic import TemplateView
from .models import Candidato

from django.views.generic import TemplateView
from .models import Candidato


class IndexView(TemplateView):
    template_name = "core/index.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        nome = self.request.GET.get("nome")

        if nome:
            context["candidatos"] = Candidato.objects.filter(
                nome__icontains=nome
            )
        else:
            context["candidatos"] = Candidato.objects.none()

        return context


class SalvosView(TemplateView):
    template_name = "core/salvos.html"