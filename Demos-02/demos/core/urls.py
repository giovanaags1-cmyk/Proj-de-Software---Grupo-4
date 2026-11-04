from django.urls import path

from .views import IndexView, SalvosView


urlpatterns = [
    path("", IndexView.as_view(), name="index"),
    path("salvos/", SalvosView.as_view(), name="salvos"),
]