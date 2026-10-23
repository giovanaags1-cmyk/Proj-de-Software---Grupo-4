"""
Demos - Script de coleta de dados do TSE
-----------------------------------------
Lê o arquivo de candidatos do Portal de Dados Abertos do TSE e gera um
candidatos.json limpo para o site (busca, comparação e perfil).

Como usar:
1. Acesse https://dadosabertos.tse.jus.br -> "Candidatos" -> escolha o ano (ex: 2024)
2. Baixe o .zip "consulta_cand_<ANO>" e extraia
3. Coloque o CSV (ex: consulta_cand_2024_RJ.csv) na mesma pasta deste script
4. (Opcional) Baixe também "bem_candidato_<ANO>" para incluir o total de bens
5. Rode no terminal:
       python tse_candidatos.py consulta_cand_2024_RJ.csv
   ou com bens e filtro de cargo:
       python tse_candidatos.py consulta_cand_2024_RJ.csv --bens bem_candidato_2024_RJ.csv --cargo VEREADOR

Só usa bibliotecas que já vêm com o Python (csv, json, argparse).
"""

import argparse
import csv
import json

# Colunas do CSV do TSE -> nome do campo no nosso JSON
COLUNAS = {
    "SQ_CANDIDATO": "id",
    "NM_URNA_CANDIDATO": "nome_urna",
    "NM_CANDIDATO": "nome_completo",
    "NR_CANDIDATO": "numero",
    "SG_PARTIDO": "partido",
    "DS_CARGO": "cargo",
    "SG_UF": "uf",
    "NM_UE": "municipio",
    "ANO_ELEICAO": "ano",
    "DS_GENERO": "genero",
    "DS_GRAU_INSTRUCAO": "escolaridade",
    "DS_OCUPACAO": "ocupacao",
    "DS_SITUACAO_CANDIDATURA": "situacao_candidatura",
    "DS_SIT_TOT_TURNO": "resultado",
}

# O TSE usa estes valores quando o dado não existe
VALORES_VAZIOS = {"#NULO#", "#NULO", "#NE", "#NE#", "-1", "-3", ""}


def limpar(valor):
    """Tira espaços e troca os códigos de 'sem dado' do TSE por None."""
    valor = valor.strip()
    if valor in VALORES_VAZIOS:
        return None
    return valor


def ler_csv_tse(caminho):
    """Os CSVs do TSE usam ';' como separador e codificação latin-1."""
    with open(caminho, encoding="latin-1", newline="") as arquivo:
        return list(csv.DictReader(arquivo, delimiter=";"))


def somar_bens(caminho_bens):
    """Retorna um dicionário {id_candidato: total_de_bens_em_reais}."""
    totais = {}
    for linha in ler_csv_tse(caminho_bens):
        id_cand = linha["SQ_CANDIDATO"].strip()
        # O TSE costuma escrever "150000,50" (vírgula decimal), mas alguns anos usam ponto
        texto = linha["VR_BEM_CANDIDATO"].strip()
        if "," in texto:
            texto = texto.replace(".", "").replace(",", ".")
        try:
            valor = float(texto)
        except ValueError:
            continue
        totais[id_cand] = totais.get(id_cand, 0) + valor
    return totais


def montar_candidatos(linhas, cargo=None, municipio=None, bens=None):
    candidatos = []
    vistos = set()  # o mesmo candidato pode aparecer em 2 turnos

    for linha in linhas:
        if cargo and linha["DS_CARGO"].strip().upper() != cargo.upper():
            continue
        if municipio and linha["NM_UE"].strip().upper() != municipio.upper():
            continue

        candidato = {campo: limpar(linha.get(coluna, "")) for coluna, campo in COLUNAS.items()}

        if candidato["id"] in vistos:
            continue
        vistos.add(candidato["id"])

        # Deixa os nomes em formato bonito: "JOÃO DA SILVA" -> "João Da Silva"
        for campo in ("nome_urna", "nome_completo", "municipio", "cargo", "ocupacao"):
            if candidato[campo]:
                candidato[campo] = candidato[campo].title()

        if bens is not None:
            candidato["total_bens"] = round(bens.get(candidato["id"], 0), 2)

        candidatos.append(candidato)

    candidatos.sort(key=lambda c: c["nome_urna"] or "")
    return candidatos


def main():
    parser = argparse.ArgumentParser(description="Gera candidatos.json a partir dos dados do TSE")
    parser.add_argument("arquivo", help="CSV consulta_cand do TSE")
    parser.add_argument("--bens", help="CSV bem_candidato do TSE (opcional)")
    parser.add_argument("--cargo", help="Filtrar por cargo, ex: PREFEITO, VEREADOR")
    parser.add_argument("--municipio", help="Filtrar por município, ex: 'RIO DE JANEIRO'")
    parser.add_argument("--saida", default="candidatos.json", help="Nome do arquivo gerado")
    args = parser.parse_args()

    linhas = ler_csv_tse(args.arquivo)
    bens = somar_bens(args.bens) if args.bens else None
    candidatos = montar_candidatos(linhas, args.cargo, args.municipio, bens)

    with open(args.saida, "w", encoding="utf-8") as arquivo:
        json.dump(candidatos, arquivo, ensure_ascii=False, indent=2)

    print(f"{len(candidatos)} candidatos salvos em {args.saida}")


if __name__ == "__main__":
    main()
