const CHAVE_FAVORITOS = "demosFavoritos";

function lerFavoritos() {
    try {
        const salvo = localStorage.getItem(CHAVE_FAVORITOS);
        const lista = salvo ? JSON.parse(salvo) : [];
        return Array.isArray(lista) ? lista : [];
    } catch (erro) {
        return [];
    }
}

function salvarFavoritos(lista) {
    try {
        localStorage.setItem(CHAVE_FAVORITOS, JSON.stringify(lista));
        return true;
    } catch (erro) {
        return false;
    }
}

function ehFavorito(id) {
    return lerFavoritos().includes(id);
}


function alternarFavorito(id) {
    const lista = lerFavoritos();
    const posicao = lista.indexOf(id);

    if (posicao === -1) {
        lista.push(id);
    } else {
        lista.splice(posicao, 1);
    }

    if (!salvarFavoritos(lista)) {
        alert("Não foi possível salvar seus favoritos neste navegador.");
    }

    return ehFavorito(id);
}




function criarElemento(tag, classe, texto) {
    const elemento = document.createElement(tag);
    if (classe) {
        elemento.className = classe;
    }
    if (texto) {
        elemento.textContent = texto;
    }
    return elemento;
}

function atualizarBotaoFavorito(botao, id) {
    const favorito = ehFavorito(id);
    botao.textContent = favorito ? "Favoritado" : "Favoritar";
    botao.setAttribute("aria-pressed", favorito ? "true" : "false");
}


function criarCard(candidato, tipo, aoMudar) {
    const card = criarElemento("article", "card-candidato");

 
    const foto = criarElemento("div", "card-foto");
    const icone = criarElemento("i", "fa-regular fa-image");
    icone.setAttribute("aria-hidden", "true");
    foto.append(icone, criarElemento("span", "", "Foto Candidato"));


    const info = criarElemento("div", "card-info");
    info.append(
        criarElemento("h3", "card-nome", candidato.nome),
        criarElemento("p", "card-linha", candidato.partido + " • " + candidato.cargo),
        criarElemento("p", "card-linha", candidato.uf + " • Eleições " + candidato.ano)
    );

    const topo = criarElemento("div", "card-topo");
    topo.append(foto, info);


    const verPerfil = criarElemento("button", "botao-card", "Ver perfil");
    verPerfil.type = "button";
    verPerfil.disabled = true;
    verPerfil.title = "Página de perfil em desenvolvimento";

    const botaoAcao = criarElemento("button", "botao-card");
    botaoAcao.type = "button";

    if (tipo === "favoritos") {
        botaoAcao.textContent = "Remover";
        botaoAcao.setAttribute("aria-label", "Remover " + candidato.nome + " dos favoritos");
        botaoAcao.addEventListener("click", function () {
            alternarFavorito(candidato.id);
            if (aoMudar) {
                aoMudar();
            }
        });
    } else {
        atualizarBotaoFavorito(botaoAcao, candidato.id);
        botaoAcao.addEventListener("click", function () {
            alternarFavorito(candidato.id);
            atualizarBotaoFavorito(botaoAcao, candidato.id);
        });
    }

    const acoes = criarElemento("div", "card-acoes");
    acoes.append(verPerfil, botaoAcao);

    card.append(topo, acoes);
    return card;
}




function iniciarPaginaCandidatos(lista) {
    CANDIDATOS.forEach(function (candidato) {
        lista.append(criarCard(candidato, "lista"));
    });
}




function iniciarPaginaFavoritos(lista) {
    const contador = document.querySelector("#contador-favoritos");
    const estadoVazio = document.querySelector("#estado-vazio");

    function desenhar(moverFoco) {
        const ids = lerFavoritos();
        const favoritos = CANDIDATOS.filter(function (candidato) {
            return ids.includes(candidato.id);
        });

        lista.replaceChildren();
        favoritos.forEach(function (candidato) {
            lista.append(criarCard(candidato, "favoritos", function () {
                desenhar(true);
            }));
        });

        estadoVazio.hidden = favoritos.length > 0;

        if (favoritos.length === 0) {
            contador.textContent = "Nenhum candidato salvo";
        } else if (favoritos.length === 1) {
            contador.textContent = "1 candidato salvo";
        } else {
            contador.textContent = favoritos.length + " candidatos salvos";
        }

   
        if (moverFoco) {
            contador.focus();
        }
    }

    desenhar(false);


    window.addEventListener("storage", function () {
        desenhar(false);
    });
}




const listaCandidatos = document.querySelector("#lista-candidatos");
if (listaCandidatos) {
    iniciarPaginaCandidatos(listaCandidatos);
}

const listaFavoritos = document.querySelector("#lista-favoritos");
if (listaFavoritos) {
    iniciarPaginaFavoritos(listaFavoritos);
}
