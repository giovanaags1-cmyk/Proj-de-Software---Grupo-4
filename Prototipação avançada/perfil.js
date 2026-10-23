// pega o id que veio na url (perfil.html?id=1)
let params = new URLSearchParams(window.location.search);
let id = params.get("id");

let candidato = buscarCandidato(id);

if (candidato == null) {
  document.getElementById("perfil").innerHTML = "<p>Candidato não encontrado.</p><a href='candidatos.html'>Voltar para a lista</a>";
} else {
  document.title = candidato.nome;

  document.getElementById("nome").innerText = candidato.nome;
  document.getElementById("numero").innerText = candidato.numero;
  document.getElementById("partido").innerText = candidato.partido;
  document.getElementById("cargo").innerText = candidato.cargo;
  document.getElementById("estado").innerText = candidato.estado;
  document.getElementById("idade").innerText = candidato.idade + " anos";
  document.getElementById("intencao").innerText = candidato.intencao + "%";
  document.getElementById("projetos").innerText = candidato.projetos;

  document.getElementById("saude").innerText = candidato.saude;
  document.getElementById("educacao").innerText = candidato.educacao;
  document.getElementById("seguranca").innerText = candidato.seguranca;

  let lista = document.getElementById("propostas");
  for (let i = 0; i < candidato.propostas.length; i++) {
    lista.innerHTML += "<li>" + candidato.propostas[i] + "</li>";
  }

  document.getElementById("link-comparar").href = "comparar.html?id=" + candidato.id;
}
