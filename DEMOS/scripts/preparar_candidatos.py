
from pathlib import Path
import pandas as pd

pasta_projeto = Path(__file__).resolve().parent.parent
pasta_dados = pasta_projeto / "dados"
pasta_tse = pasta_dados / "tse"


arquivos = sorted(pasta_tse.glob("consulta_cand_2022_*.csv"))


arquivos = [
    arq for arq in arquivos
    if arq.stem not in {
        "consulta_cand_2022_BRASIL",
        "consulta_cand_2022_BR"
    }
]

colunas = {
    "SQ_CANDIDATO": "id",
    "NM_CANDIDATO": "nome",
    "NM_URNA_CANDIDATO": "nomeUrna",
    "NR_CANDIDATO": "numero",
    "SG_PARTIDO": "partido",
    "NM_PARTIDO": "nomePartido",
    "DS_CARGO": "cargo",
    "SG_UF": "uf",
    "DT_NASCIMENTO": "nascimento",
    "DS_GRAU_INSTRUCAO": "instrucao",
    "DS_OCUPACAO": "ocupacao",
    "DS_ESTADO_CIVIL": "estadoCivil",
    "DS_GENERO": "genero",
    "DS_COR_RACA": "racaCor",
    "DS_SITUACAO_CANDIDATURA": "situacao",
    "DS_SIT_TOT_TURNO": "resultadoEleitoral",
    "NM_FEDERACAO": "federacao",
    "NM_COLIGACAO": "coligacao",
    "ANO_ELEICAO": "anoEleicao"
}

tabelas = []

for arquivo in arquivos:
    print("Lendo:", arquivo.name)

    df = pd.read_csv(
        arquivo,
        sep=";",
        encoding="latin1",
        dtype=str,
        low_memory=False,
        usecols=lambda c: c in colunas
    )

    df = df.rename(columns=colunas)

    tabelas.append(df)

if not tabelas:
    raise FileNotFoundError("Nenhum CSV de 2022 encontrado.")

candidatos = pd.concat(tabelas, ignore_index=True)


candidatos = candidatos.drop_duplicates(
    subset=["id"]
)


candidatos = candidatos.replace({
    "#NULO#": None,
    "#NE#": None,
    "": None
})


arquivos_bens = sorted(
    pasta_tse.glob("bem_candidato_2022_*.csv")
)


arquivos_bens = [
    arq for arq in arquivos_bens
    if arq.stem not in {
        "bem_candidato_2022_BR",
        "bem_candidato_2022_BRASIL"
    }
]

tabelas_bens = []

for arquivo in arquivos_bens:
    print("Lendo bens:", arquivo.name)

    df = pd.read_csv(
        arquivo,
        sep=";",
        encoding="latin1",
        dtype=str,
        low_memory=False,
        usecols=["SQ_CANDIDATO", "VR_BEM_CANDIDATO"]
    )

    tabelas_bens.append(df)

if tabelas_bens:
    bens = pd.concat(tabelas_bens, ignore_index=True)

    bens["valor"] = pd.to_numeric(
        bens["VR_BEM_CANDIDATO"]
            .str.replace(".", "", regex=False)
            .str.replace(",", ".", regex=False),
        errors="coerce"
    )

    patrimonio = (
        bens.groupby("SQ_CANDIDATO")["valor"]
        .sum(min_count=1)
    )

    candidatos["patrimonio"] = (
        candidatos["id"].map(patrimonio)
    )

print("Patrimônio acrescentado.")

saida = pasta_dados / "candidatos_2022_enriquecidos.json"

candidatos.to_json(
    saida,
    orient="records",
    force_ascii=False,
    indent=2
)

print("\nCandidatos encontrados:", len(candidatos))
print("Arquivo criado:", saida)
print("Colunas:", candidatos.columns.tolist())
