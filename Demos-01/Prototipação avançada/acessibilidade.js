/* Demos - Modo acessibilidade
   Cria uma barra com: A- (diminuir fonte), A+ (aumentar fonte), alto contraste.
   A escolha fica salva no navegador da pessoa.
   Uso: <link rel="stylesheet" href="acessibilidade.css">
        <script src="acessibilidade.js" defer></script> */

(function () {
  const ESCALA_MIN = 0.9;
  const ESCALA_MAX = 1.6;
  const PASSO = 0.1;
  const raiz = document.documentElement;

  // localStorage pode falhar (aba anônima, por exemplo), então usamos try/catch
  function ler(chave, padrao) {
    try {
      const valor = localStorage.getItem(chave);
      return valor === null ? padrao : valor;
    } catch (e) {
      return padrao;
    }
  }

  function salvar(chave, valor) {
    try { localStorage.setItem(chave, valor); } catch (e) { /* ignora */ }
  }

  let escala = parseFloat(ler("demos-escala", "1")) || 1;
  let contraste = ler("demos-contraste", "nao") === "sim";

  function aplicar() {
    raiz.style.setProperty("--a11y-escala", escala.toFixed(1));
    raiz.classList.toggle("alto-contraste", contraste);
    if (botaoContraste) botaoContraste.setAttribute("aria-pressed", String(contraste));
    if (botaoMenos) botaoMenos.disabled = escala <= ESCALA_MIN + 0.01;
    if (botaoMais) botaoMais.disabled = escala >= ESCALA_MAX - 0.01;
    salvar("demos-escala", escala.toFixed(1));
    salvar("demos-contraste", contraste ? "sim" : "nao");
  }

  function criarBotao(texto, rotulo, acao) {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.textContent = texto;
    botao.setAttribute("aria-label", rotulo);
    botao.title = rotulo;
    botao.addEventListener("click", acao);
    return botao;
  }

  const barra = document.createElement("div");
  barra.className = "a11y-barra";
  barra.setAttribute("role", "toolbar");
  barra.setAttribute("aria-label", "Opções de acessibilidade");

  const botaoMenos = criarBotao("A-", "Diminuir tamanho da fonte", function () {
    escala = Math.max(ESCALA_MIN, escala - PASSO);
    aplicar();
  });

  const botaoMais = criarBotao("A+", "Aumentar tamanho da fonte", function () {
    escala = Math.min(ESCALA_MAX, escala + PASSO);
    aplicar();
  });

  const botaoContraste = criarBotao("Contraste","Alternar alto contraste", function () {
    contraste = !contraste;
    aplicar();
  });

  barra.append(botaoMenos, botaoMais, botaoContraste);
  document.body.appendChild(barra);
  aplicar();
})();
