let candidatosDisponiveis = [];
let candidatosSelecionados = [];
let modoComparacaoHome = false;

const popupBusca = document.getElementById("popup-busca-candidato");
const campoBusca = document.getElementById("campo-busca-candidato");
const resultados = document.getElementById("resultados-candidatos");
const areaSelecionados = document.getElementById("candidatos-selecionados");


window.abrirBusca = function (comparar = false) {

    modoComparacaoHome = comparar;

    if (!popupBusca) {
        return;
    }

    popupBusca.classList.add(
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

};


window.fecharBusca = function () {

    if (!popupBusca) {
        return;
    }

    popupBusca.classList.remove("aberto");
};


fetch("./dados/candidatos.json")

    .then(function (resposta) {

        if (!resposta.ok) {
            throw new Error("Não foi possível abrir candidatos.json");
        }

        return resposta.json();

    })

    .then(function (dados) {

        candidatosDisponiveis = dados;

        console.log(
            "Candidatos carregados:",
            candidatosDisponiveis.length
        );

        mostrarSugestoes();

    })

    .catch(function (erro) {

        console.error(
            "Erro ao carregar candidatos:",
            erro
        );

        if (resultados) {

            resultados.innerHTML = `
                <div class="mensagem-sem-resultado">
                    Não foi possível carregar os candidatos.
                </div>
            `;

        }

    });


if (campoBusca) {

    campoBusca.addEventListener(
        "input",
        function () {

            const texto = normalizarTexto(
                campoBusca.value
            );

            if (texto === "") {

                mostrarSugestoes();

                return;

            }

            pesquisarCandidatos(texto);

        }
    );


    campoBusca.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();

        }
    );

}


if (popupBusca) {

    popupBusca.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();

        }
    );

}


document.addEventListener(
    "click",
    function (event) {

        const areaBusca =
            document.querySelector(
                ".area-busca-candidatos"
            );

        if (
            areaBusca &&
            !areaBusca.contains(event.target)
        ) {

            fecharBusca();

        }

    }
);


function pesquisarCandidatos(texto) {

    const encontrados =
        candidatosDisponiveis
            .filter(function (candidato) {

                if (
                    candidatoJaSelecionado(
                        candidato
                    )
                ) {
                    return false;
                }

                const nome =
                    normalizarTexto(
                        candidato.nome
                    );

                const nomeUrna =
                    normalizarTexto(
                        candidato.nomeUrna
                    );

                const partido =
                    normalizarTexto(
                        candidato.partido
                    );

                const cargo =
                    normalizarTexto(
                        candidato.cargo
                    );

                const numero =
                    normalizarTexto(
                        candidato.numero
                    );

                return (
                    nome.includes(texto) ||
                    nomeUrna.includes(texto) ||
                    partido.includes(texto) ||
                    cargo.includes(texto) ||
                    numero.includes(texto)
                );

            })
            .slice(0, 10);


    mostrarResultados(
        encontrados,
        "Resultados"
    );

}


function mostrarSugestoes() {

    if (!resultados) {
        return;
    }


    if (
        candidatosDisponiveis.length === 0
    ) {

        resultados.innerHTML = `
            <div class="mensagem-sem-resultado">
                Carregando candidatos...
            </div>
        `;

        return;

    }


    const sugestoes =
        candidatosDisponiveis
            .filter(function (candidato) {

                return !candidatoJaSelecionado(
                    candidato
                );

            })
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

    if (!resultados) {
        return;
    }


    resultados.innerHTML = "";


    const tituloElemento =
        document.createElement("div");

    tituloElemento.className =
        "titulo-resultados";

    tituloElemento.textContent =
        titulo;


    resultados.appendChild(
        tituloElemento
    );


    if (lista.length === 0) {

        const mensagem =
            document.createElement("div");

        mensagem.className =
            "mensagem-sem-resultado";

        mensagem.textContent =
            "Nenhum candidato encontrado.";


        resultados.appendChild(
            mensagem
        );

        return;

    }


    lista.forEach(
        function (candidato) {

            const nome =
                candidato.nomeUrna ||
                candidato.nome ||
                "Nome não informado";


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
                            candidato.cargo ||
                            "Cargo não informado"
                        }

                        ${
                            candidato.partido
                                ? " · " + candidato.partido
                                : ""
                        }

                    </span>

                </div>

            `;


            item.addEventListener(
                "click",
                function () {

                    adicionarCandidato(
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


function adicionarCandidato(
    candidato
) {

    if (!modoComparacaoHome) {

        window.location.href =
            "candidato.html?id="
            +
            encodeURIComponent(
                candidato.id
            );

        return;

    }


    if (
        candidatosSelecionados.length >= 2
    ) {

        return;

    }


    if (
        candidatoJaSelecionado(
            candidato
        )
    ) {

        return;

    }


    candidatosSelecionados.push(
        candidato
    );


    atualizarBarra();


    if (
        candidatosSelecionados.length === 2
    ) {

        const primeiro =
            candidatosSelecionados[0];

        const segundo =
            candidatosSelecionados[1];


        window.location.href =
            "comparar.html?a="
            +
            encodeURIComponent(
                primeiro.id
            )
            +
            "&b="
            +
            encodeURIComponent(
                segundo.id
            );

        return;

    }


    fecharBusca();

}


function removerCandidato(
    id,
    event
) {

    if (event) {
        event.stopPropagation();
    }


    candidatosSelecionados =
        candidatosSelecionados.filter(
            function (candidato) {

                return (
                    String(candidato.id)
                    !==
                    String(id)
                );

            }
        );


    atualizarBarra();

}


function atualizarBarra() {

    if (!areaSelecionados) {
        return;
    }


    areaSelecionados.innerHTML = "";


    if (
        candidatosSelecionados.length === 0
    ) {

        const placeholder =
            document.createElement(
                "span"
            );

        placeholder.className =
            "placeholder-busca";

        placeholder.textContent =
            "Procure candidatos";


        areaSelecionados.appendChild(
            placeholder
        );

        return;

    }


    candidatosSelecionados.forEach(
        function (candidato) {

            const nome =
                candidato.nomeUrna ||
                candidato.nome;


            const chip =
                document.createElement(
                    "div"
                );

            chip.className =
                "candidato-chip";


            const nomeElemento =
                document.createElement(
                    "span"
                );

            nomeElemento.className =
                "chip-nome";

            nomeElemento.textContent =
                nome;


            const botaoRemover =
                document.createElement(
                    "button"
                );

            botaoRemover.type =
                "button";

            botaoRemover.className =
                "chip-remover";

            botaoRemover.textContent =
                "×";


            botaoRemover.addEventListener(
                "click",
                function (event) {

                    removerCandidato(
                        candidato.id,
                        event
                    );

                }
            );


            chip.appendChild(
                nomeElemento
            );

            chip.appendChild(
                botaoRemover
            );


            areaSelecionados.appendChild(
                chip
            );

        }
    );

}


function candidatoJaSelecionado(
    candidato
) {

    return candidatosSelecionados.some(
        function (selecionado) {

            return (
                String(selecionado.id)
                ===
                String(candidato.id)
            );

        }
    );

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
        partes[0][0] +
        partes[
            partes.length - 1
        ][0]
    ).toUpperCase();

}