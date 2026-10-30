let candidatos = [];


const parametros =
    new URLSearchParams(
        window.location.search
    );


const idA =
    parametros.get("a");


const idB =
    parametros.get("b");


fetch("./dados/candidatos_completos.json")

    .then(function (resposta) {

        if (!resposta.ok) {

            throw new Error(
                "Não foi possível carregar candidatos.json"
            );

        }


        return resposta.json();

    })


    .then(function (dados) {

        candidatos = dados;


        const candidatoA =
            candidatos.find(
                function (candidato) {

                    return (
                        String(candidato.id)
                        ===
                        String(idA)
                    );

                }
            );


        const candidatoB =
            candidatos.find(
                function (candidato) {

                    return (
                        String(candidato.id)
                        ===
                        String(idB)
                    );

                }
            );


        if (
            !candidatoA
            ||
            !candidatoB
        ) {

            mostrarErroComparacao();

            return;

        }


        preencherCandidato(
            candidatoA,
            "a"
        );


        preencherCandidato(
            candidatoB,
            "b"
        );


        atualizarTopo(
            candidatoA,
            candidatoB
        );


        document
            .getElementById(
                "ver-perfil-a"
            )
            .href =
                "candidato.html?id="
                +
                encodeURIComponent(
                    candidatoA.id
                );


        document
            .getElementById(
                "ver-perfil-b"
            )
            .href =
                "candidato.html?id="
                +
                encodeURIComponent(
                    candidatoB.id
                );

    })


    .catch(function (erro) {

        console.error(
            "Erro:",
            erro
        );


        mostrarErroComparacao();

    });



function preencherCandidato(
    candidato,
    lado
) {

    const nomeExibido =
        candidato.nomeUrna
        ||
        candidato.nome
        ||
        "Nome não encontrado";


    preencher(
        "avatar-" + lado,
        criarIniciais(
            nomeExibido
        )
    );


    preencher(
        "nome-" + lado,
        nomeExibido
    );


    preencher(
        "partido-" + lado,
        candidato.nomePartido
        ||
        candidato.partido
    );


    preencher(
        "cargo-" + lado,
        candidato.cargo
    );


    preencher(
        "nome-completo-" + lado,
        candidato.nome
    );


    preencher(
        "numero-" + lado,
        candidato.numero
    );


    preencher(
        "partido-completo-" + lado,
        candidato.nomePartido
        ||
        candidato.partido
    );


    preencher(
        "cargo-dado-" + lado,
        candidato.cargo
    );


    preencher(
        "uf-" + lado,
        candidato.uf
    );


    preencher(
        "situacao-" + lado,
        candidato.situacao
    );


    preencher(
        "ocupacao-" + lado,
        candidato.ocupacao
    );


    preencher(
        "instrucao-" + lado,
        candidato.instrucao
    );


    preencher(
        "nascimento-" + lado,
        candidato.nascimento
    );

}



function atualizarTopo(
    candidatoA,
    candidatoB
) {

    const nomeA =
        candidatoA.nomeUrna
        ||
        candidatoA.nome;


    const nomeB =
        candidatoB.nomeUrna
        ||
        candidatoB.nome;


    document
        .getElementById(
            "chip-candidato-a"
        )
        .textContent =
            nomeA;


    document
        .getElementById(
            "chip-candidato-b"
        )
        .textContent =
            nomeB;

}



function preencher(
    id,
    valor
) {

    const elemento =
        document.getElementById(id);


    if (!elemento) {
        return;
    }


    if (
        valor === undefined
        ||
        valor === null
        ||
        String(valor).trim() === ""
    ) {

        elemento.textContent =
            "Informação não encontrada";

        return;

    }


    elemento.textContent =
        valor;

}



function criarIniciais(nome) {

    const partes =
        String(nome)
            .trim()
            .split(/\s+/);


    if (
        partes.length === 1
    ) {

        return partes[0]
            .substring(0, 2)
            .toUpperCase();

    }


    return (
        partes[0][0]
        +
        partes[
            partes.length - 1
        ][0]
    ).toUpperCase();

}



function mostrarErroComparacao() {

    const area =
        document.getElementById(
            "comparacao-candidatos"
        );


    area.innerHTML = `

        <div class="erro-comparacao">

            <i class="fa-solid fa-circle-exclamation"></i>

            <h2>
                Não foi possível carregar a comparação
            </h2>

            <p>
                Selecione novamente os candidatos pela busca.
            </p>

            <a href="index.html">
                Voltar para o início
            </a>

        </div>

    `;

}