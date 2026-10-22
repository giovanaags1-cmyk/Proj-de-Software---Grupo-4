from pathlib import Path
import pandas as pd

pasta_dados = Path("../dados")

arquivos = list(
    pasta_dados.rglob("consulta_cand*.csv")
)

print("Arquivos encontrados:", len(arquivos))

tabelas = []

for arquivo in arquivos:

    print("Lendo:", arquivo)

    df = pd.read_csv(
        arquivo,
        sep=";",
        encoding="latin1",
        low_memory=False
    )

    tabelas.append(df)


candidatos = pd.concat(
    tabelas,
    ignore_index=True
)

print("\nTotal de registros:", len(candidatos))

print("\nCOLUNAS DISPONÍVEIS:")
print(candidatos.columns.tolist())

print("\nPRIMEIROS REGISTROS:")
print(candidatos.head())

colunas = [
    "SQ_CANDIDATO",
    "NM_CANDIDATO",
    "NM_URNA_CANDIDATO",
    "NR_CANDIDATO",
    "SG_PARTIDO",
    "NM_PARTIDO",
    "DS_CARGO",
    "SG_UF"
]

candidatos_filtrados = candidatos[colunas].copy()


candidatos_filtrados = candidatos_filtrados.rename(
    columns={
        "SQ_CANDIDATO": "id",
        "NM_CANDIDATO": "nome",
        "NM_URNA_CANDIDATO": "nomeUrna",
        "NR_CANDIDATO": "numero",
        "SG_PARTIDO": "partido",
        "NM_PARTIDO": "nomePartido",
        "DS_CARGO": "cargo",
        "SG_UF": "uf"
    }
)


candidatos_filtrados.to_json(
    "../dados/candidatos.json",
    orient="records",
    force_ascii=False,
    indent=2
)

print("\ncandidatos.json criado com sucesso!")