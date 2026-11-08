from django.db import models
from django.contrib.auth.models import User



class Candidato(models.Model):

    sq_candidato = models.CharField(
        max_length=30,
        unique=True,
        null=True,
        blank=True
    )

    nome = models.CharField(max_length=200)

    apelido = models.CharField(
        max_length=200,
        blank=True,
        default=""
    )

    numero = models.CharField(
        max_length=10,
        blank=True,
        default=""
    )

    partido = models.CharField(max_length=100)
    cargo = models.CharField(max_length=100)
    uf = models.CharField(max_length=2)

    def __str__(self):
        return self.nome
class Favorito(models.Model):
    usuario = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )

    candidato = models.ForeignKey(
        Candidato,
        on_delete=models.CASCADE
    )

    def __str__(self):
        return f"{self.usuario.username} - {self.candidato.nome}"

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["usuario", "candidato"],
                name="favorito_unico"
            )
        ]