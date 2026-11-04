from django.views.generic import TemplateView


class IndexView(TemplateView):
    template_name = "core/index.html"

class SalvosView(TemplateView):
    template_name = "core/salvos.html"