/*
    Listagem de candidatos com filtros e ordenação
    Sprint 7 — Giovana (2610790)

    - Carrega os dados reais do TSE (dados/candidatos.json)
    - Filtros: cargo, estado (UF) e partido
    - Ordenação: nome, partido, número e estado
    - Mostra os resultados aos poucos ("Mostrar mais"), porque são mais de 40 mil candidatos
    - Guarda os filtros na URL, para o link poder ser compartilhado

    Usa as funções de favoritos de js/favoritos.js (ehFavorito, alternarFavorito).
*/

const POR_PAGINA = 24;

const ORDENS = {
    "nome-az": { campo: "nomeExibicao", direcao: 1 },
    "nome-za": { campo: "nomeExibicao", direcao: -1 },
    "partido": { campo: "partido", direcao: 1 },
    "numero": { campo: "numero", direcao: 1 },
    "estado": { campo: "uf", direcao: 1 }
};

// Ordem "natural" dos cargos, do maior para o menor
const ORDEM_CARGOS = [
    "PRESIDENTE",
    "VICE-PRESIDENTE",
    "GOVERNADOR",
    "VICE-GOVERNADOR",
    "SENADOR",
    "1º SUPLENTE",
    "2º SUPLENTE",
    "DEPUTADO FEDERAL",
    "DEPUTADO ESTADUAL",
    "DEPUTADO DISTRITAL"
];

// ignorePunctuation: nomes de urna como ".ALAN" ou "#TO" não vão para o topo da lista
const comparador = new Intl.Collator("pt-BR", { sensitivity: "base", numeric: true, ignorePunctuation: true });

const elementos = {
    lista: document.getElementById("listagem-candidatos"),
    status: document.getElementById("status-listagem"),
    vazio: document.getElementById("listagem-vazia"),
    mais: document.getElementById("botao-mostrar-mais"),
    form: document.getElementById("form-filtros"),
    cargo: document.getElementById("filtro-cargo"),
    uf: document.getElementById("filtro-uf"),
    partido: document.getElementById("filtro-partido"),
    ordem: document.getElementById("filtro-ordem"),
    limpar: document.getElementById("botao-limpar-filtros"),
    limparVazio: document.getElementById("botao-limpar-vazio")
};

let todosCandidatos = [];
let resultadoAtual = [];
let quantidadeMostrada = 0;


/* ---------- Carregar dados ---------- */

function carregarCandidatos() {
    mostrarStatus("Carregando candidatos...");
    elementos.form.setAttribute("aria-busy", "true");

    fetch("./dados/candidatos.json")
        .then(function (resposta) {
            if (!resposta.ok) {
                throw new Error("Não foi possível abrir candidatos.json");
            }
            return resposta.json();
        })
        .then(function (dados) {
            // O candidatos.json traz cada candidato repetido (arquivo BRASIL + arquivos por estado).
            // Aqui fica só uma cópia de cada id.
            const vistos = new Set();
            todosCandidatos = [];
            dados.forEach(function (candidato) {
                if (vistos.has(candidato.id)) {
                    return;
                }
                vistos.add(candidato.id);
                candidato.nomeExibicao = candidato.nomeUrna || candidato.nome || "";
                todosCandidatos.push(candidato);
            });

            preencherOpcoes();
            lerFiltrosDaUrl();
            elementos.form.removeAttribute("aria-busy");
            aplicarFiltros(false);
        })
        .catch(function (erro) {
            console.error("Erro ao carregar candidatos:", erro);
            elementos.form.removeAttribute("aria-busy");
            mostrarStatus(
                "Não foi possível carregar os candidatos. Verifique sua conexão e recarregue a página."
            );
        });
}


/* ---------- Opções dos filtros ---------- */

function valoresUnicos(campo) {
    const conjunto = new Set();
    todosCandidatos.forEach(function (candidato) {
        if (candidato[campo]) {
            conjunto.add(candidato[campo]);
        }
    });
    return Array.from(conjunto);
}

function adicionarOpcoes(select, valores) {
    valores.forEach(function (valor) {
        const opcao = document.createElement("option");
        opcao.value = valor;
        opcao.textContent = formatarTexto(valor);
        select.append(opcao);
    });
}

function preencherOpcoes() {
    const cargos = valoresUnicos("cargo").sort(function (a, b) {
        const posA = ORDEM_CARGOS.indexOf(a);
        const posB = ORDEM_CARGOS.indexOf(b);
        return (posA === -1 ? 99 : posA) - (posB === -1 ? 99 : posB);
    });

    const ufs = valoresUnicos("uf").sort(comparador.compare);
    const partidos = valoresUnicos("partido").sort(comparador.compare);

    adicionarOpcoes(elementos.cargo, cargos);
    adicionarOpcoes(elementos.uf, ufs);
    adicionarOpcoes(elementos.partido, partidos);

    // Siglas de estado e de partido ficam em maiúsculas
    Array.from(elementos.uf.options).forEach(function (opcao) {
        if (opcao.value) {
            opcao.textContent = opcao.value === "BR" ? "Nacional (BR)" : opcao.value;
        }
    });
    Array.from(elementos.partido.options).forEach(function (opcao) {
        if (opcao.value) {
            opcao.textContent = opcao.value;
        }
    });
}


/* ---------- Filtrar e ordenar ---------- */

function filtrosAtuais() {
    return {
        cargo: elementos.cargo.value,
        uf: elementos.uf.value,
        partido: elementos.partido.value,
        ordem: ORDENS[elementos.ordem.value] ? elementos.ordem.value : "nome-az"
    };
}

function filtrar(lista, filtros) {
    return lista.filter(function (candidato) {
        return (
            (!filtros.cargo || candidato.cargo === filtros.cargo) &&
            (!filtros.uf || candidato.uf === filtros.uf) &&
            (!filtros.partido || candidato.partido === filtros.partido)
        );
    });
}

function ordenar(lista, chaveOrdem) {
    const regra = ORDENS[chaveOrdem];

    return lista.slice().sort(function (a, b) {
        let resultado;

        if (regra.campo === "numero") {
            resultado = (Number(a.numero) || 0) - (Number(b.numero) || 0);
        } else {
            resultado = comparador.compare(String(a[regra.campo] || ""), String(b[regra.campo] || ""));
        }

        // Desempate pelo nome, para a ordem ser sempre a mesma
        if (resultado === 0 && regra.campo !== "nomeExibicao") {
            resultado = comparador.compare(a.nomeExibicao, b.nomeExibicao);
        }

        return resultado * regra.direcao;
    });
}

function aplicarFiltros(atualizarUrl) {
    const filtros = filtrosAtuais();

    resultadoAtual = ordenar(filtrar(todosCandidatos, filtros), filtros.ordem);
    quantidadeMostrada = 0;
    elementos.lista.replaceChildren();

    if (atualizarUrl) {
        salvarFiltrosNaUrl(filtros);
    }

    const temFiltro = Boolean(filtros.cargo || filtros.uf || filtros.partido);
    elementos.limpar.hidden = !temFiltro;

    if (resultadoAtual.length === 0) {
        elementos.vazio.hidden = false;
        elementos.mais.hidden = true;
        mostrarStatus("Nenhum candidato encontrado com esses filtros.");
        return;
    }

    elementos.vazio.hidden = true;
    mostrarMais();
}

function mostrarMais() {
    const proximos = resultadoAtual.slice(quantidadeMostrada, quantidadeMostrada + POR_PAGINA);

    const fragmento = document.createDocumentFragment();
    proximos.forEach(function (candidato) {
        fragmento.append(criarCardListagem(candidato));
    });
    elementos.lista.append(fragmento);

    quantidadeMostrada += proximos.length;

    const total = resultadoAtual.length;
    elementos.mais.hidden = quantidadeMostrada >= total;

    mostrarStatus(
        formatarNumero(total) +
        (total === 1 ? " candidato encontrado" : " candidatos encontrados") +
        " — mostrando " + formatarNumero(quantidadeMostrada)
    );
}


/* ---------- Card ---------- */

function criarCardListagem(candidato) {
    const card = document.createElement("article");
    card.className = "card-candidato";

    const foto = document.createElement("div");
    foto.className = "card-foto card-iniciais";
    foto.setAttribute("aria-hidden", "true");
    foto.textContent = criarIniciaisListagem(candidato.nomeExibicao);

    const info = document.createElement("div");
    info.className = "card-info";

    const nome = document.createElement("h3");
    nome.className = "card-nome";
    nome.textContent = formatarTexto(candidato.nomeExibicao);

    const linhaPartido = document.createElement("p");
    linhaPartido.className = "card-linha";
    linhaPartido.textContent =
        (candidato.partido || "Sem partido") + " • " + formatarTexto(candidato.cargo || "");

    const linhaLocal = document.createElement("p");
    linhaLocal.className = "card-linha";
    linhaLocal.textContent =
        (candidato.uf === "BR" ? "Nacional" : candidato.uf) +
        (candidato.numero ? " • Nº " + candidato.numero : "");

    info.append(nome, linhaPartido, linhaLocal);

    const topo = document.createElement("div");
    topo.className = "card-topo";
    topo.append(foto, info);

    const verPerfil = document.createElement("a");
    verPerfil.className = "botao-card";
    verPerfil.href = "candidato.html?id=" + encodeURIComponent(candidato.id);
    verPerfil.textContent = "Ver perfil";
    verPerfil.setAttribute("aria-label", "Ver perfil de " + formatarTexto(candidato.nomeExibicao));

    const favoritar = document.createElement("button");
    favoritar.type = "button";
    favoritar.className = "botao-card";
    atualizarFavorito(favoritar, candidato.id);
    favoritar.addEventListener("click", function () {
        alternarFavorito(candidato.id);
        atualizarFavorito(favoritar, candidato.id);
    });

    const acoes = document.createElement("div");
    acoes.className = "card-acoes";
    acoes.append(verPerfil, favoritar);

    card.append(topo, acoes);
    return card;
}

function atualizarFavorito(botao, id) {
    const favorito = typeof ehFavorito === "function" && ehFavorito(id);
    botao.textContent = favorito ? "Favoritado" : "Favoritar";
    botao.setAttribute("aria-pressed", favorito ? "true" : "false");
}


/* ---------- URL ---------- */

function lerFiltrosDaUrl() {
    const parametros = new URLSearchParams(window.location.search);

    definirSeExistir(elementos.cargo, parametros.get("cargo"));
    definirSeExistir(elementos.uf, parametros.get("uf"));
    definirSeExistir(elementos.partido, parametros.get("partido"));
    definirSeExistir(elementos.ordem, parametros.get("ordem"));
}

function definirSeExistir(select, valor) {
    if (!valor) {
        return;
    }
    const existe = Array.from(select.options).some(function (opcao) {
        return opcao.value === valor;
    });
    if (existe) {
        select.value = valor;
    }
}

function salvarFiltrosNaUrl(filtros) {
    const parametros = new URLSearchParams();
    if (filtros.cargo) parametros.set("cargo", filtros.cargo);
    if (filtros.uf) parametros.set("uf", filtros.uf);
    if (filtros.partido) parametros.set("partido", filtros.partido);
    if (filtros.ordem !== "nome-az") parametros.set("ordem", filtros.ordem);

    const texto = parametros.toString();
    const novaUrl = window.location.pathname + (texto ? "?" + texto : "");

    try {
        window.history.replaceState(null, "", novaUrl);
    } catch (erro) {
        // Alguns navegadores bloqueiam isso ao abrir o arquivo direto do computador
    }
}


/* ---------- Utilidades ---------- */

function mostrarStatus(texto) {
    elementos.status.textContent = texto;
}

function formatarNumero(numero) {
    return numero.toLocaleString("pt-BR");
}

// "DEPUTADO FEDERAL" -> "Deputado Federal"
function formatarTexto(texto) {
    const minusculas = ["de", "da", "do", "das", "dos", "e"];
    return String(texto || "")
        .toLowerCase()
        .split(" ")
        .map(function (palavra, indice) {
            if (indice > 0 && minusculas.includes(palavra)) {
                return palavra;
            }
            return palavra.charAt(0).toUpperCase() + palavra.slice(1);
        })
        .join(" ");
}

function criarIniciaisListagem(nome) {
    const partes = String(nome || "?").trim().split(/\s+/);
    if (partes.length === 1) {
        return partes[0].substring(0, 2).toUpperCase();
    }
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

function limparFiltros() {
    elementos.cargo.value = "";
    elementos.uf.value = "";
    elementos.partido.value = "";
    aplicarFiltros(true);
    elementos.cargo.focus();
}


/* ---------- Eventos ---------- */

if (elementos.lista) {
    [elementos.cargo, elementos.uf, elementos.partido, elementos.ordem].forEach(function (select) {
        select.addEventListener("change", function () {
            aplicarFiltros(true);
        });
    });

    elementos.form.addEventListener("submit", function (evento) {
        evento.preventDefault();
        aplicarFiltros(true);
    });

    elementos.limpar.addEventListener("click", limparFiltros);
    elementos.limparVazio.addEventListener("click", limparFiltros);
    elementos.mais.addEventListener("click", mostrarMais);

    carregarCandidatos();
}
