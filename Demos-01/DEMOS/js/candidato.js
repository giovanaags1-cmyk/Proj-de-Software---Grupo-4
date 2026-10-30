let candidatos = [];

let candidatoAtual = null;

let modoComparacao = false;


const parametros =
    new URLSearchParams(
        window.location.search
    );


const candidatoId =
    parametros.get("id");


const popup =
    document.getElementById(
        "popup-busca-candidato"
    );


const campoBusca =
    document.getElementById(
        "campo-busca-candidato"
    );


const resultados =
    document.getElementById(
        "resultados-candidatos"
    );


const barra =
    document.getElementById(
        "barra-pesquisa-candidato"
    );


const botaoComparar =
    document.getElementById(
        "botao-comparar"
    );


const fecharBusca =
    document.getElementById(
        "fechar-busca"
    );


fetch("./dados/candidatos_completos.json")

    .then(resposta => resposta.json())

    .then(dados => {

        candidatos = dados;


        candidatoAtual =
            candidatos.find(
                candidato =>
                    String(candidato.id)
                    ===
                    String(candidatoId)
            );


        if (!candidatoAtual) {

            document
                .getElementById(
                    "nome-candidato"
                )
                .textContent =
                    "Candidato não encontrado";

            return;

        }


        mostrarCandidato(
            candidatoAtual
        );

        mostrarSugestoes();

    })

    .catch(erro => {

        console.error(
            "Erro ao carregar candidatos:",
            erro
        );

    });



barra.addEventListener(
    "click",
    function () {

        modoComparacao = false;

        abrirBusca();

    }
);



botaoComparar.addEventListener(
    "click",
    function (event) {

        event.stopPropagation();

        modoComparacao = true;

        abrirBusca();

    }
);



fecharBusca.addEventListener(
    "click",
    function (event) {

        event.stopPropagation();

        popup.classList.remove(
            "aberto"
        );

    }
);



campoBusca.addEventListener(
    "input",
    function () {

        const texto =
            normalizarTexto(
                campoBusca.value
            );


        if (!texto) {

            mostrarSugestoes();

            return;

        }


        const encontrados =
            candidatos
                .filter(
                    candidato => {

                        if (
                            String(candidato.id)
                            ===
                            String(candidatoAtual.id)
                        ) {

                            return false;

                        }


                        return (

                            normalizarTexto(
                                candidato.nome
                            ).includes(texto)

                            ||

                            normalizarTexto(
                                candidato.nomeUrna
                            ).includes(texto)

                            ||

                            normalizarTexto(
                                candidato.partido
                            ).includes(texto)

                            ||

                            normalizarTexto(
                                candidato.cargo
                            ).includes(texto)

                        );

                    }
                )

                .slice(0, 10);


        mostrarResultados(
            encontrados,
            "Resultados"
        );

    }
);



document.addEventListener(
    "click",
    function (event) {

        const area =
            document.querySelector(
                ".area-busca-candidatos"
            );


        if (
            area &&
            !area.contains(event.target)
        ) {

            popup.classList.remove(
                "aberto"
            );

        }

    }
);



function abrirBusca() {

    popup.classList.add(
        "aberto"
    );


    campoBusca.value = "";


    mostrarSugestoes();


    setTimeout(
        function () {

            campoBusca.focus();

        },
        50
    );

}



function mostrarSugestoes() {

    const sugestoes =
        candidatos

            .filter(
                candidato =>
                    String(candidato.id)
                    !==
                    String(candidatoAtual?.id)
            )

            .slice(0, 5);


    mostrarResultados(
        sugestoes,
        "Sugestões"
    );

}



function mostrarResultados(
    lista,
    titulo
) {

    resultados.innerHTML = `

        <div class="titulo-resultados">
            ${titulo}
        </div>

    `;


    if (lista.length === 0) {

        resultados.innerHTML += `

            <div class="mensagem-sem-resultado">
                Nenhum candidato encontrado.
            </div>

        `;

        return;

    }


    lista.forEach(
        candidato => {

            const nome =
                candidato.nomeUrna
                ||
                candidato.nome;


            const item =
                document.createElement(
                    "button"
                );


            item.type = "button";

            item.className =
                "resultado-candidato-popup";


            item.innerHTML = `

                <div class="avatar-resultado">

                    ${criarIniciais(nome)}

                </div>


                <div class="resultado-candidato-info">

                    <strong>
                        ${nome}
                    </strong>

                    <span>

                        ${
                            candidato.cargo
                            ||
                            "Cargo não informado"
                        }

                        ${
                            candidato.partido
                                ? " · " +
                                  candidato.partido
                                : ""
                        }

                    </span>

                </div>

            `;


            item.addEventListener(
                "click",
                function () {

                    selecionarCandidato(
                        candidato
                    );

                }
            );


            resultados.appendChild(
                item
            );

        }
    );

}



function selecionarCandidato(
    candidato
) {

    if (modoComparacao) {

        window.location.href =
            "comparar.html?a="
            +
            encodeURIComponent(
                candidatoAtual.id
            )
            +
            "&b="
            +
            encodeURIComponent(
                candidato.id
            );

    }

    else {

        window.location.href =
            "candidato.html?id="
            +
            encodeURIComponent(
                candidato.id
            );

    }

}



function mostrarCandidato(
    candidato
) {

    const nome =
        candidato.nomeUrna
        ||
        candidato.nome;


    document
        .getElementById(
            "avatar-candidato"
        )
        .textContent =
            criarIniciais(nome);


    document
        .getElementById(
            "nome-candidato"
        )
        .textContent =
            nome;


    document
        .getElementById(
            "partido-candidato"
        )
        .textContent =
            candidato.nomePartido
            ||
            candidato.partido
            ||
            "Partido não informado";


    document
        .getElementById(
            "cargo-candidato"
        )
        .textContent =
            candidato.cargo
            ||
            "Cargo não informado";


    document
        .getElementById(
            "uf-candidato"
        )
        .textContent =
            candidato.uf
                ? "UF: " +
                  candidato.uf
                : "";


    preencher(
        "nome-completo-candidato",
        candidato.nome
    );


    preencher(
        "numero-candidato",
        candidato.numero
    );


    preencher(
        "partido-completo-candidato",
        candidato.nomePartido
        ||
        candidato.partido
    );


    preencher(
    "situacao-candidato",
    ["#NE", "#NULO#", ""].includes(candidato.situacao)
        ? null
        : candidato.situacao
    );


    preencher(
        "ocupacao-candidato",
        candidato.ocupacao
    );


    preencher(
        "instrucao-candidato",
        candidato.instrucao
    );
    preencher("ano-candidato", candidato.anoEleicao);
    preencher("nascimento-candidato", candidato.nascimento);
    preencher("resultado-candidato", candidato.resultadoEleitoral);

    const patrimonio = candidato.patrimonio;

    preencher(
        "patrimonio-candidato",
        patrimonio == null
            ? null
            : Number(patrimonio).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })
);

}



function preencher(
    id,
    valor
) {

    document
        .getElementById(id)
        .textContent =
            valor
            ||
            "Informação não encontrada";

}



function criarIniciais(nome) {

    const partes =
        String(nome)
            .trim()
            .split(/\s+/);


    if (partes.length === 1) {

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



function normalizarTexto(texto) {

    return String(texto || "")
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .toLowerCase()
        .trim();

}