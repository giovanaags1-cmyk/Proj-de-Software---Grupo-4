from django.db import models


class Candidato(models.Model):
    nome = models.CharField(max_length=200)
    partido = models.CharField(max_length=100)
    cargo = models.CharField(max_length=100)
    uf = models.CharField(max_length=2)

    def __str__(self):
        return self.nome