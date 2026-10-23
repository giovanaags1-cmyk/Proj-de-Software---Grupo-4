// dados de teste enquanto o banco nao fica pronto
var candidatos = [
  {
    id: 1,
    nome: "Candidato 1",
    partido: "PAL",
    numero: 10,
    cargo: "Governador",
    estado: "RJ",
    idade: 52,
    intencao: 31,
    projetos: 18,
    saude: 8,
    educacao: 9,
    seguranca: 6,
    propostas: ["Ensino integral nas escolas estaduais", "Fundo de apoio a pequenas empresas", "Marcar consulta pela internet"]
  },
  {
    id: 2,
    nome: "Candidato 2",
    partido: "PBE",
    numero: 20,
    cargo: "Governador",
    estado: "RJ",
    idade: 61,
    intencao: 27,
    projetos: 25,
    saude: 7,
    educacao: 6,
    seguranca: 9,
    propostas: ["Central estadual de cameras de seguranca", "Reduzir imposto sobre combustivel", "Terminar obras paradas"]
  },
  {
    id: 3,
    nome: "Candidato 3",
    partido: "MGA",
    numero: 30,
    cargo: "Governador",
    estado: "RJ",
    idade: 39,
    intencao: 18,
    projetos: 0,
    saude: 7,
    educacao: 8,
    seguranca: 5,
    propostas: ["Saneamento basico para todos", "Onibus eletricos", "Reflorestamento de encostas"]
  },
  {
    id: 4,
    nome: "Candidato 4",
    partido: "PBE",
    numero: 200,
    cargo: "Senador",
    estado: "RJ",
    idade: 66,
    intencao: 24,
    projetos: 32,
    saude: 6,
    educacao: 9,
    seguranca: 7,
    propostas: ["Mais repasses para os municipios", "Bolsa para universitarios de baixa renda"]
  },
  {
    id: 5,
    nome: "Candidato 5",
    partido: "MGA",
    numero: 300,
    cargo: "Senador",
    estado: "RJ",
    idade: 44,
    intencao: 21,
    projetos: 7,
    saude: 7,
    educacao: 7,
    seguranca: 6,
    propostas: ["Incentivo a energia solar", "Protecao de dados nos servicos publicos"]
  },
  {
    id: 6,
    nome: "Candidato 6",
    partido: "PDL",
    numero: 400,
    cargo: "Senador",
    estado: "RJ",
    idade: 53,
    intencao: 26,
    projetos: 0,
    saude: 6,
    educacao: 6,
    seguranca: 7,
    propostas: ["Duplicar rodovias", "Internet nas areas rurais"]
  }
];

function buscarCandidato(id) {
  for (let i = 0; i < candidatos.length; i++) {
    if (candidatos[i].id == id) {
      return candidatos[i];
    }
  }
  return null;
}
