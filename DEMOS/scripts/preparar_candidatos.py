
from pathlib import Path
import pandas as pd

# Localiza a pasta DEMOS independentemente
# do terminal em que o script for executado.
pasta_projeto = Path(__file__).resolve().parent.parent
pasta_dados = pasta_projeto / "dados"

arquivos = sorted(pasta_dados.rglob("consulta_cand*.csv"))

print("Arquivos encontrados:", len(arquivos))

if not arquivos:
    raise FileNotFoundError("Nenhum CSV de candidaturas encontrado.")

# Campo do site -> coluna original do TSE
campos = {
    "id": "SQ_CANDIDATO",
    "nome": "NM_CANDIDATO",
    "nomeUrna": "NM_URNA_CANDIDATO",
    "numero": "NR_CANDIDATO",
    "partido": "SG_PARTIDO",
    "nomePartido": "NM_PARTIDO",
    "cargo": "DS_CARGO",
    "uf": "SG_UF",
    "nascimento": "DT_NASCIMENTO",
    "ocupacao": "DS_OCUPACAO",
    "instrucao": "DS_GRAU_INSTRUCAO",
    "genero": "DS_GENERO",
    "racaCor": "DS_COR_RACA",
    "anoEleicao": "ANO_ELEICAO",
    "situacao": "DS_SITUACAO_CANDIDATURA"
}

obrigatorios = [
    "SQ_CANDIDATO",
    "NM_CANDIDATO",
    "NM_URNA_CANDIDATO",
    "NR_CANDIDATO",
    "SG_PARTIDO",
    "NM_PARTIDO",
    "DS_CARGO",
    "SG_UF"
]

tabelas = []

for arquivo in arquivos:
    print("Lendo:", arquivo.name)

    df = pd.read_csv(
        arquivo,
        sep=";",
        encoding="latin1",
        dtype=str,
        low_memory=False
    )

    ausentes = [
        coluna for coluna in obrigatorios
        if coluna not in df.columns
    ]

    if ausentes:
        print("Ignorado. Faltam:", ausentes)
        continue

    # Garante campos opcionais ausentes
    for coluna in campos.values():
        if coluna not in df.columns:
            df[coluna] = None

    df = df[list(campos.values())].copy()

    df = df.rename(
        columns={
            original: novo
            for novo, original in campos.items()
        }
    )

    tabelas.append(df)

if not tabelas:
    raise ValueError("Nenhum arquivo válido encontrado.")

candidatos = pd.concat(tabelas, ignore_index=True)

# Evita duplicar a mesma candidatura
candidatos = candidatos.drop_duplicates(
    subset=["id", "anoEleicao"]
)

# Converte valores ausentes para null no JSON
candidatos = candidatos.replace({
    "": None,
    "#NULO#": None,
    "#NE#": None,
    "NÃO DIVULGÁVEL": None
})

caminho_saida = pasta_dados / "candidatos.json"

candidatos.to_json(
    caminho_saida,
    orient="records",
    force_ascii=False,
    indent=2
)

print("Candidatos exportados:", len(candidatos))
print("Campos:", candidatos.columns.tolist())
print("Arquivo criado:", caminho_saida)
