
const areaNoticias = document.getElementById("noticias-grid");

fetch("./dados/noticias.json")
    .then(resposta => {
        if (!resposta.ok) {
            throw new Error("Não foi possível carregar as notícias");
        }
        return resposta.json();
    })
    .then(noticias => {
        areaNoticias.innerHTML = "";

        if (noticias.length === 0) {
            areaNoticias.textContent = "Nenhuma notícia disponível.";
            return;
        }

        noticias.forEach(noticia => {
            if (!noticia.titulo || !noticia.link) return;

            const card = document.createElement("article");
            card.className = "noticia-card";

            if (noticia.imagem) {
                const imagem = document.createElement("img");
                imagem.src = noticia.imagem;
                imagem.alt = "";
                imagem.loading = "lazy";
                card.appendChild(imagem);
            }

            const conteudo = document.createElement("div");
            conteudo.className = "noticia-conteudo";

            const fonte = document.createElement("p");
            fonte.className = "noticia-fonte";
            fonte.textContent = noticia.fonte || "Fonte não informada";

            const titulo = document.createElement("h3");
            titulo.textContent = noticia.titulo;

            const link = document.createElement("a");
            link.href = noticia.link;
            link.textContent = "Ler notícia completa";
            link.target = "_blank";
            link.rel = "noopener noreferrer";

            conteudo.append(fonte, titulo, link);
            card.appendChild(conteudo);
            areaNoticias.appendChild(card);
        });
    })
    .catch(erro => {
        console.error(erro);
        areaNoticias.textContent = "Não foi possível carregar as notícias.";
    });
