let candidatos = [];

fetch("./dados/candidatos.json")
    .then(resposta => resposta.json())

    .then(dados => {

        candidatos = dados;

        console.log(
            "Candidatos carregados:",
            candidatos.length
        );

    })

    .catch(erro => {

        console.error(
            "Erro ao carregar candidatos:",
            erro
        );

    });