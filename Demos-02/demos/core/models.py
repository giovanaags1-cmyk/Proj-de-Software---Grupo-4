from django.db import models


class Candidato(models.Model):
    nome = models.CharField(max_length=200)
    apelido = models.CharField(max_length=200, blank=True)
    partido = models.CharField(max_length=100)
    cargo = models.CharField(max_length=100)
    uf = models.CharField(max_length=2)
    descricao = models.TextField(blank=True)

    def __str__(self):
        return self.nome