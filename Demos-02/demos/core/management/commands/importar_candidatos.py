"""
Importa os candidatos das eleicoes (CSVs do TSE na pasta dados/ ou JSON)
para o banco de dados do Demos-02.

Como usar (de dentro da pasta Demos-02/demos):

    python manage.py importar_candidatos
    python manage.py importar_candidatos --limpar
    python manage.py importar_candidatos --arquivo dados/consulta_cand_2026_BRASIL.csv
    python manage.py importar_candidatos --todos-estados
"""

import json
from pathlib import Path
import pandas as pd

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from core.models import Candidato

PALAVRAS_MINUSCULAS = {"da", "de", "do", "das", "dos", "e"}


def arrumar_nome(texto):
    """
    Formata nomes em Title Case respeitando preposições minúsculas:
    'KAMILA DE ARAUJO LOPES' -> 'Kamila de Araujo Lopes'
    """
    if not texto:
        return ""
    palavras = []
    for palavra in str(texto).strip().split():
        p_low = palavra.lower()
        if p_low in PALAVRAS_MINUSCULAS:
            palavras.append(p_low)
        else:
            palavras.append(palavra.capitalize())
    return " ".join(palavras)


class Command(BaseCommand):
    help = "Importa candidatos do TSE (CSV/JSON) para o banco do Demos-02"

    def add_arguments(self, parser):
        parser.add_argument(
            "--arquivo",
            default=None,
            help="Caminho de um arquivo CSV ou JSON especifico para importar",
        )
        parser.add_argument(
            "--pasta",
            default=None,
            help="Caminho da pasta contendo os arquivos CSV (padrao: dados/)",
        )
        parser.add_argument(
            "--limpar",
            action="store_true",
            help="Apaga todos os candidatos antes de importar",
        )
        parser.add_argument(
            "--todos-estados",
            dest="todos_estados",
            action="store_true",
            help="Le todos os arquivos estaduais consulta_cand_2026_*.csv em vez do BRASIL.csv consolidado",
        )

    def handle(self, *args, **opcoes):
        pasta_dados = self.resolver_pasta_dados(opcoes.get("pasta"))

        if opcoes.get("limpar"):
            total_removidos = Candidato.objects.count()
            Candidato.objects.all().delete()
            self.stdout.write(self.style.WARNING(f"Banco limpo: {total_removidos} candidatos antigos apagados."))

        arquivo_especifico = opcoes.get("arquivo")

        if arquivo_especifico:
            caminho = Path(arquivo_especifico)
            if not caminho.is_absolute() and not caminho.exists():
                caminho = settings.BASE_DIR / arquivo_especifico
            if not caminho.exists():
                raise CommandError(f"Arquivo nao encontrado: {arquivo_especifico}")

            if caminho.suffix.lower() == ".json":
                self.importar_json(caminho)
            else:
                self.importar_csvs([caminho])
            return

        if opcoes.get("todos_estados"):
            arquivos = [
                f for f in sorted(pasta_dados.glob("consulta_cand_2026_*.csv"))
                if not f.name.endswith("_BRASIL.csv")
            ]
            if not arquivos:
                raise CommandError(f"Nenhum arquivo estadual encontrado em {pasta_dados}")
            self.stdout.write(f"Modo todos os estados: {len(arquivos)} arquivos encontrados.")
            self.importar_csvs(arquivos)
            return

        # Modo padrao: usa o arquivo consolidado BRASIL.csv
        arquivo_brasil = pasta_dados / "consulta_cand_2026_BRASIL.csv"
        if arquivo_brasil.exists():
            self.stdout.write(f"Usando arquivo consolidado nacional: {arquivo_brasil.name}")
            self.importar_csvs([arquivo_brasil])
        else:
            arquivos = sorted(pasta_dados.glob("consulta_cand_2026_*.csv"))
            if not arquivos:
                raise CommandError(f"Nenhum CSV de candidatos encontrado em {pasta_dados}")
            self.stdout.write(f"Arquivo BRASIL.csv nao encontrado. Lendo {len(arquivos)} arquivos CSV...")
            self.importar_csvs(arquivos)

    def resolver_pasta_dados(self, pasta_arg):
        if pasta_arg:
            p = Path(pasta_arg)
            if p.exists():
                return p

        # Tentativas de localizacao da pasta dados
        candidatos_pasta = [
            settings.BASE_DIR / "dados",
            Path("dados"),
            settings.BASE_DIR.parent / "demos" / "dados",
        ]
        for p in candidatos_pasta:
            if p.exists():
                return p

        return settings.BASE_DIR / "dados"

    def importar_csvs(self, arquivos):
        colunas_necessarias = [
            "SQ_CANDIDATO",
            "NM_CANDIDATO",
            "NM_URNA_CANDIDATO",
            "NR_CANDIDATO",
            "SG_PARTIDO",
            "DS_CARGO",
            "SG_UF",
        ]

        # Evita duplicar se ja existirem candidatos no banco
        sq_existentes = set(
            Candidato.objects.exclude(sq_candidato__isnull=True)
            .exclude(sq_candidato="")
            .values_list("sq_candidato", flat=True)
        )
        sq_vistos = set(sq_existentes)

        novos_candidatos = []
        total_lidos = 0

        for arquivo in arquivos:
            self.stdout.write(f"Processando {arquivo.name}...")

            df = pd.read_csv(
                arquivo,
                sep=";",
                encoding="latin-1",
                dtype=str,
                keep_default_na=False,
                usecols=colunas_necessarias,
            )

            total_lidos += len(df)

            for row in df.itertuples(index=False):
                sq = str(row.SQ_CANDIDATO).strip()

                if not sq or sq in sq_vistos:
                    continue

                sq_vistos.add(sq)

                nome = arrumar_nome(row.NM_CANDIDATO)
                apelido = arrumar_nome(row.NM_URNA_CANDIDATO)
                if apelido.lower() == nome.lower():
                    apelido = ""

                cargo = arrumar_nome(row.DS_CARGO)
                numero = str(row.NR_CANDIDATO).strip()
                partido = str(row.SG_PARTIDO).strip()
                uf = str(row.SG_UF).strip().upper()

                novos_candidatos.append(
                    Candidato(
                        sq_candidato=sq,
                        nome=nome,
                        apelido=apelido,
                        numero=numero,
                        partido=partido,
                        cargo=cargo,
                        uf=uf,
                    )
                )

        self.stdout.write(f"Total lidos dos CSVs: {total_lidos} | Novos a inserir: {len(novos_candidatos)}")

        if novos_candidatos:
            with transaction.atomic():
                Candidato.objects.bulk_create(
                    novos_candidatos,
                    batch_size=2000,
                    ignore_conflicts=True,
                )

        total_banco = Candidato.objects.count()
        self.stdout.write(
            self.style.SUCCESS(
                f"{len(novos_candidatos)} candidatos inseridos com sucesso! "
                f"Total atual no banco de dados: {total_banco}"
            )
        )

    def importar_json(self, caminho):
        with open(caminho, encoding="utf-8") as arquivo:
            dados = json.load(arquivo)

        self.stdout.write(f"{len(dados)} candidatos no arquivo JSON")

        ja_existem = set(Candidato.objects.values_list("nome", "cargo", "uf"))
        novos = []

        for item in dados:
            nome = arrumar_nome(item.get("nome", ""))
            cargo = arrumar_nome(item.get("cargo", ""))
            uf = item.get("uf", "").strip().upper()

            if (nome, cargo, uf) in ja_existem:
                continue
            ja_existem.add((nome, cargo, uf))

            apelido = arrumar_nome(item.get("nomeUrna", ""))
            if apelido.lower() == nome.lower():
                apelido = ""

            numero = str(item.get("numero", "")).strip()
            partido = str(item.get("partido", "")).strip()

            novos.append(
                Candidato(
                    nome=nome,
                    apelido=apelido,
                    numero=numero,
                    partido=partido,
                    cargo=cargo,
                    uf=uf,
                )
            )

        if novos:
            with transaction.atomic():
                Candidato.objects.bulk_create(novos, batch_size=1000, ignore_conflicts=True)

        total_banco = Candidato.objects.count()
        self.stdout.write(
            self.style.SUCCESS(
                f"{len(novos)} candidatos importados do JSON. Total no banco: {total_banco}"
            )
        )
