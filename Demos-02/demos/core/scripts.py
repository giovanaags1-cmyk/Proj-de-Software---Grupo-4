from pathlib import Path

import pandas as pd

from core.models import Candidato


def carregar_candidatos_csv():

    pasta_dados = Path("dados")

    arquivos = list(
        pasta_dados.glob("consulta_cand_2026_*.csv")
    )

    for arquivo in arquivos:

        print(f"Lendo {arquivo.name}...")

        df = pd.read_csv(
            arquivo,
            sep=";",
            encoding="latin-1",
            usecols=[
                "SQ_CANDIDATO",
                "NM_CANDIDATO",
                "NM_URNA_CANDIDATO",
                "NR_CANDIDATO",
                "SG_PARTIDO",
                "DS_CARGO",
                "SG_UF",
            ],
        )

        for _, linha in df.iterrows():

            sq = str(linha["SQ_CANDIDATO"])

            nome = str(
                linha["NM_CANDIDATO"]
            )

            apelido = str(
                linha["NM_URNA_CANDIDATO"]
            )

            numero = str(
                linha["NR_CANDIDATO"]
            )

            partido = str(
                linha["SG_PARTIDO"]
            )

            cargo = str(
                linha["DS_CARGO"]
            )

            uf = str(
                linha["SG_UF"]
            )


            candidato_existente = Candidato.objects.filter(
                nome=nome,
                partido=partido,
                cargo=cargo,
                uf=uf,
                sq_candidato__isnull=True,
            ).first()


            if candidato_existente:

                candidato_existente.sq_candidato = sq
                candidato_existente.apelido = apelido
                candidato_existente.numero = numero

                candidato_existente.save()


            else:

                Candidato.objects.update_or_create(

                    sq_candidato=sq,

                    defaults={
                        "nome": nome,
                        "apelido": apelido,
                        "numero": numero,
                        "partido": partido,
                        "cargo": cargo,
                        "uf": uf,
                    },
                )


    print("Candidatos atualizados com sucesso.")