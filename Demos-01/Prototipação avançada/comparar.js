let select1 = document.getElementById("candidato1");
let select2 = document.getElementById("candidato2");

let graficoVotos = null;
let graficoAreas = null;

// coloca os candidatos nos dois selects
for (let i = 0; i < candidatos.length; i++) {
  let opcao = "<option value='" + candidatos[i].id + "'>" + candidatos[i].nome + "</option>";
  select1.innerHTML += opcao;
  select2.innerHTML += opcao;
}

// se veio do perfil, ja deixa o candidato selecionado
let params = new URLSearchParams(window.location.search);
if (params.get("id") != null) {
  select1.value = params.get("id");
}

// segundo select começa em outro candidato
if (select1.value == candidatos[0].id) {
  select2.value = candidatos[1].id;
} else {
  select2.value = candidatos[0].id;
}

function linha(titulo, valor1, valor2) {
  return "<tr><td><b>" + titulo + "</b></td><td>" + valor1 + "</td><td>" + valor2 + "</td></tr>";
}

function comparar() {
  let c1 = buscarCandidato(select1.value);
  let c2 = buscarCandidato(select2.value);

  if (c1.id == c2.id) {
    alert("Escolha dois candidatos diferentes!");
    return;
  }

  // tabela
  document.getElementById("nome1").innerText = c1.nome;
  document.getElementById("nome2").innerText = c2.nome;

  let tabela = "";
  tabela += linha("Partido", c1.partido, c2.partido);
  tabela += linha("Número", c1.numero, c2.numero);
  tabela += linha("Cargo", c1.cargo + " - " + c1.estado, c2.cargo + " - " + c2.estado);
  tabela += linha("Idade", c1.idade, c2.idade);
  tabela += linha("Intenção de votos", c1.intencao + "%", c2.intencao + "%");
  tabela += linha("Projetos aprovados", c1.projetos, c2.projetos);
  document.getElementById("tabelaComparacao").innerHTML = tabela;

  // tem que destruir o grafico antigo senao da erro
  if (graficoVotos != null) {
    graficoVotos.destroy();
  }
  if (graficoAreas != null) {
    graficoAreas.destroy();
  }

  graficoVotos = new Chart(document.getElementById("graficoVotos"), {
    type: "bar",
    data: {
      labels: [c1.nome, c2.nome],
      datasets: [{
        label: "Intenção de votos",
        data: [c1.intencao, c2.intencao],
        backgroundColor: ["#3366cc", "#dc3912"]
      }]
    },
    options: {
      scales: {
        y: { beginAtZero: true, max: 100 }
      }
    }
  });

  graficoAreas = new Chart(document.getElementById("graficoAreas"), {
    type: "bar",
    data: {
      labels: ["Saúde", "Educação", "Segurança"],
      datasets: [
        {
          label: c1.nome,
          data: [c1.saude, c1.educacao, c1.seguranca],
          backgroundColor: "#3366cc"
        },
        {
          label: c2.nome,
          data: [c2.saude, c2.educacao, c2.seguranca],
          backgroundColor: "#dc3912"
        }
      ]
    },
    options: {
      scales: {
        y: { beginAtZero: true, max: 10 }
      }
    }
  });
}

comparar();
