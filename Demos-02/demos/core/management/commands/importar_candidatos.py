"""
Passa os candidatos do Demos-01 (arquivo json com os dados do TSE)
para o banco de dados do Demos-02.

Como usar (de dentro da pasta Demos-02/demos):

    python manage.py importar_candidatos
    python manage.py importar_candidatos --limpar      (apaga os candidatos antes)
    python manage.py importar_candidatos --arquivo outro_arquivo.json
"""

import json
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

from core.models import Candidato

# settings.BASE_DIR e a pasta Demos-02/demos, entao subimos duas pastas
ARQUIVO_PADRAO = settings.BASE_DIR.parent.parent / "Demos-01" / "DEMOS" / "dados" / "candidatos.json"

PALAVRAS_MINUSCULAS = ["da", "de", "do", "das", "dos", "e"]


def arrumar_nome(texto):
    # "KAMILA DE ARAUJO LOPES" -> "Kamila de Araujo Lopes"
    palavras = []
    for palavra in texto.lower().split():
        if palavra in PALAVRAS_MINUSCULAS:
            palavras.append(palavra)
        else:
            palavras.append(palavra.capitalize())
    return " ".join(palavras)


def primeira_maiuscula(texto):
    # "SUPERIOR COMPLETO" -> "Superior completo"
    texto = texto.lower()
    return texto[:1].upper() + texto[1:]


def montar_descricao(item):
    # o modelo do Demos-02 nao tem campo pra numero, ocupacao etc,
    # entao essas informacoes vao no texto da descricao
    partes = []

    if item.get("numero"):
        partes.append("Número na urna: " + item["numero"] + ".")
    if item.get("nomePartido"):
        partes.append("Partido: " + arrumar_nome(item["nomePartido"]) + " (" + item["partido"] + ").")
    if item.get("ocupacao"):
        partes.append("Ocupação: " + primeira_maiuscula(item["ocupacao"]) + ".")
    if item.get("instrucao"):
        partes.append("Escolaridade: " + primeira_maiuscula(item["instrucao"]) + ".")
    if item.get("nascimento"):
        partes.append("Data de nascimento: " + item["nascimento"] + ".")
    if item.get("anoEleicao"):
        partes.append("Candidatura de " + item["anoEleicao"] + ". Fonte: TSE.")

    return " ".join(partes)


class Command(BaseCommand):
    help = "Importa os candidatos do json do Demos-01 para o banco do Demos-02"

    def add_arguments(self, parser):
        parser.add_argument("--arquivo", default=str(ARQUIVO_PADRAO), help="caminho do arquivo json")
        parser.add_argument("--limpar", action="store_true", help="apaga todos os candidatos antes de importar")

    def handle(self, *args, **opcoes):
        caminho = Path(opcoes["arquivo"])
        if not caminho.exists():
            raise CommandError("Arquivo não encontrado: " + str(caminho))

        with open(caminho, encoding="utf-8") as arquivo:
            dados = json.load(arquivo)
        self.stdout.write(str(len(dados)) + " candidatos no arquivo")

        if opcoes["limpar"]:
            # cuidado: isso tambem apaga os favoritos que apontam pra esses candidatos
            Candidato.objects.all().delete()
            self.stdout.write("Candidatos antigos apagados")

        # pra nao duplicar se rodar o comando duas vezes
        ja_existem = set(Candidato.objects.values_list("nome", "cargo", "uf"))

        novos = []
        for item in dados:
            nome = arrumar_nome(item["nome"])
            cargo = arrumar_nome(item["cargo"])
            uf = item["uf"]

            if (nome, cargo, uf) in ja_existem:
                continue
            ja_existem.add((nome, cargo, uf))

            apelido = arrumar_nome(item.get("nomeUrna", ""))
            if apelido == nome:
                apelido = ""

            novos.append(Candidato(
                nome=nome,
                apelido=apelido,
                partido=item["partido"],
                cargo=cargo,
                uf=uf,
                descricao=montar_descricao(item),
            ))

        # salva de 1000 em 1000 (bem mais rapido que um por um)
        Candidato.objects.bulk_create(novos, batch_size=1000)

        self.stdout.write(self.style.SUCCESS(
            str(len(novos)) + " candidatos importados. Total no banco: " + str(Candidato.objects.count())
        ))
