function mostrarCandidatos() {
  let busca = document.getElementById("busca").value.toLowerCase();
  let cargo = document.getElementById("cargo").value;
  let lista = document.getElementById("lista");

  lista.innerHTML = "";

  for (let i = 0; i < candidatos.length; i++) {
    let c = candidatos[i];

    // filtro de nome
    if (c.nome.toLowerCase().indexOf(busca) == -1) {
      continue;
    }

    // filtro de cargo
    if (cargo != "" && c.cargo != cargo) {
      continue;
    }

    lista.innerHTML += "<tr>" +
      "<td>" + c.nome + "</td>" +
      "<td>" + c.partido + "</td>" +
      "<td>" + c.numero + "</td>" +
      "<td>" + c.cargo + "</td>" +
      "<td>" + c.estado + "</td>" +
      "<td><a href='perfil.html?id=" + c.id + "'>Ver perfil</a></td>" +
      "</tr>";
  }

  if (lista.innerHTML == "") {
    lista.innerHTML = "<tr><td colspan='6'>Nenhum candidato encontrado.</td></tr>";
  }
}

document.getElementById("busca").addEventListener("keyup", mostrarCandidatos);
document.getElementById("cargo").addEventListener("change", mostrarCandidatos);

mostrarCandidatos();
