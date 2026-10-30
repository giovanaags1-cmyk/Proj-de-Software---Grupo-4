/* Demos - Busca de candidato com autocomplete
   Lê o candidatos.json gerado pelo tse_candidatos.py.
   Se o arquivo não carregar (ex: abrindo direto pelo computador, sem servidor),
   usa uma lista de exemplo para a demonstração funcionar. */

const EXEMPLO = [
  { id: "1", nome_urna: "João Carlos", nome_completo: "João Carlos Da Silva", numero: "55", partido: "PSD", cargo: "Prefeito", municipio: "Rio De Janeiro", uf: "RJ", escolaridade: "SUPERIOR COMPLETO", ocupacao: "Advogado", total_bens: 1550000.5 },
  { id: "2", nome_urna: "Maria Fernanda", nome_completo: "Maria Fernanda Lima", numero: "22", partido: "PL", cargo: "Prefeito", municipio: "Rio De Janeiro", uf: "RJ", escolaridade: "SUPERIOR COMPLETO", ocupacao: "Empresário", total_bens: 80000 },
  { id: "3", nome_urna: "Ana Paula", nome_completo: "Ana Paula Souza", numero: "13123", partido: "PT", cargo: "Vereador", municipio: "Niterói", uf: "RJ", escolaridade: "ENSINO MÉDIO COMPLETO", ocupacao: "Professor", total_bens: 0 },
  { id: "4", nome_urna: "José Antônio", nome_completo: "José Antônio Pereira", numero: "45678", partido: "MDB", cargo: "Vereador", municipio: "Niterói", uf: "RJ", escolaridade: "SUPERIOR INCOMPLETO", ocupacao: "Comerciante", total_bens: 230000 },
  { id: "5", nome_urna: "Joana Martins", nome_completo: "Joana Martins Costa", numero: "50", partido: "PSOL", cargo: "Prefeito", municipio: "Niterói", uf: "RJ", escolaridade: "SUPERIOR COMPLETO", ocupacao: "Médico", total_bens: 410000 },
];

const MAX_SUGESTOES = 8;

const campo = document.getElementById("campo-busca");
const lista = document.getElementById("lista-sugestoes");
const status = document.getElementById("status");
const cartao = document.getElementById("selecionado");

let candidatos = [];
let resultados = [];
let indiceAtivo = -1;

// "José" e "jose" devem achar a mesma pessoa
function normalizar(texto) {
  return (texto || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

function escaparHtml(texto) {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}

// Destaca o trecho digitado dentro do nome
function destacar(nome, termo) {
  const pos = normalizar(nome).indexOf(termo);
  if (pos === -1 || !termo) return escaparHtml(nome);
  return (
    escaparHtml(nome.slice(0, pos)) +
    "<mark>" + escaparHtml(nome.slice(pos, pos + termo.length)) + "</mark>" +
    escaparHtml(nome.slice(pos + termo.length))
  );
}

function buscar(termo) {
  const t = normalizar(termo);
  if (!t) return [];

  return candidatos
    .map(function (c) {
      const nome = normalizar(c.nome_urna);
      let pontos = 0;
      if (nome.startsWith(t)) pontos = 3;                        // começa com o termo
      else if (nome.split(" ").some(p => p.startsWith(t))) pontos = 2; // alguma palavra começa
      else if (normalizar(c.nome_completo).includes(t)) pontos = 1;
      if (c.numero === t) pontos = 4;                            // número exato
      if (normalizar(c.partido) === t) pontos = Math.max(pontos, 2);
      return { c, pontos };
    })
    .filter(r => r.pontos > 0)
    .sort((a, b) => b.pontos - a.pontos || a.c.nome_urna.localeCompare(b.c.nome_urna))
    .slice(0, MAX_SUGESTOES)
    .map(r => r.c);
}

function fecharLista() {
  lista.hidden = true;
  campo.setAttribute("aria-expanded", "false");
  campo.removeAttribute("aria-activedescendant");
  indiceAtivo = -1;
}

function mostrarSugestoes() {
  const termo = normalizar(campo.value);
  resultados = buscar(campo.value);
  indiceAtivo = -1;
  lista.innerHTML = "";

  if (!termo) {
    fecharLista();
    status.textContent = "";
    return;
  }

  if (resultados.length === 0) {
    lista.innerHTML = '<li class="vazio">Nenhum candidato encontrado</li>';
    status.textContent = "Nenhum resultado";
  } else {
    resultados.forEach(function (c, i) {
      const item = document.createElement("li");
      item.id = "sug-" + i;
      item.setAttribute("role", "option");
      item.setAttribute("aria-selected", "false");
      item.innerHTML =
        '<span class="sug-nome">' + destacar(c.nome_urna, termo) + "</span>" +
        '<span class="sug-info">' + escaparHtml(c.numero + " · " + c.partido + " · " + c.cargo) + "</span>";
      item.addEventListener("mousedown", function (e) {
        e.preventDefault(); // evita perder o foco antes do clique
        escolher(i);
      });
      lista.appendChild(item);
    });
    status.textContent = resultados.length + " resultado(s). Use as setas para navegar.";
  }

  lista.hidden = false;
  campo.setAttribute("aria-expanded", "true");
}

function marcarAtivo(novoIndice) {
  const itens = lista.querySelectorAll('[role="option"]');
  if (itens.length === 0) return;
  if (indiceAtivo >= 0) itens[indiceAtivo].setAttribute("aria-selected", "false");
  indiceAtivo = (novoIndice + itens.length) % itens.length; // dá a volta na lista
  itens[indiceAtivo].setAttribute("aria-selected", "true");
  itens[indiceAtivo].scrollIntoView({ block: "nearest" });
  campo.setAttribute("aria-activedescendant", itens[indiceAtivo].id);
}

function formatarReais(valor) {
  if (valor === undefined || valor === null) return "Não informado";
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function primeiraMaiuscula(texto) {
  if (!texto) return "Não informado";
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}

function escolher(i) {
  const c = resultados[i];
  if (!c) return;
  campo.value = c.nome_urna;
  fecharLista();
  status.textContent = c.nome_urna + " selecionado";

  cartao.innerHTML =
    "<h2>" + escaparHtml(c.nome_urna) + "</h2>" +
    '<span class="partido">' + escaparHtml(c.partido + " · " + c.numero) + "</span>" +
    "<dl>" +
    "<dt>Nome completo</dt><dd>" + escaparHtml(c.nome_completo || "Não informado") + "</dd>" +
    "<dt>Cargo</dt><dd>" + escaparHtml(c.cargo || "Não informado") + "</dd>" +
    "<dt>Local</dt><dd>" + escaparHtml((c.municipio || "") + " - " + (c.uf || "")) + "</dd>" +
    "<dt>Escolaridade</dt><dd>" + escaparHtml(primeiraMaiuscula(c.escolaridade)) + "</dd>" +
    "<dt>Ocupação</dt><dd>" + escaparHtml(c.ocupacao || "Não informado") + "</dd>" +
    "<dt>Bens declarados</dt><dd>" + escaparHtml(formatarReais(c.total_bens)) + "</dd>" +
    "</dl>";
  cartao.hidden = false;
}

campo.addEventListener("input", mostrarSugestoes);

campo.addEventListener("keydown", function (e) {
  if (lista.hidden) return;
  if (e.key === "ArrowDown") { e.preventDefault(); marcarAtivo(indiceAtivo + 1); }
  else if (e.key === "ArrowUp") { e.preventDefault(); marcarAtivo(indiceAtivo - 1); }
  else if (e.key === "Enter") { e.preventDefault(); escolher(indiceAtivo >= 0 ? indiceAtivo : 0); }
  else if (e.key === "Escape") { fecharLista(); }
});

campo.addEventListener("blur", fecharLista);

// Carrega os dados
fetch("candidatos.json")
  .then(r => { if (!r.ok) throw new Error(); return r.json(); })
  .then(dados => { candidatos = dados; })
  .catch(() => {
    candidatos = EXEMPLO;
    status.textContent = "Usando dados de exemplo (candidatos.json não encontrado).";
  });
