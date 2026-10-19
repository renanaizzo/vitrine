/*
  app.js — A LÓGICA DO SITE
  -------------------------
  Lê CONFIG (config.js) e CARDAPIO (cardapio.js) e:
    1. desenha o cardápio na tela;
    2. controla o carrinho (a "comanda");
    3. monta a mensagem do pedido;
    4. abre o WhatsApp com a mensagem pronta.
*/

/* ============================================================
   BLOCO 1 — ESTADO
   "Estado" é a memória do site enquanto a página está aberta.
   O carrinho guarda só  id → quantidade.  Ex.: { "coxinha-frango": 2 }
   ============================================================ */
const carrinho = {};

// A comanda está aparecendo na tela? (atualizado pelo IntersectionObserver, no Bloco 9)
let comandaNaTela = false;

// Quantos itens havia na última atualização (para a sacola "pular" só quando aumenta)
let quantidadeAnterior = 0;

// Uma parte da página está ligada no config.js? (se a chave não existir, conta como ligada)
function secaoLigada(nome) {
  return !CONFIG.secoes || CONFIG.secoes[nome] !== false;
}

// O cardápio que vale nesta página: o do cardapio.js, menos os itens de seções desligadas.
// O resto do código usa SEMPRE esta lista, nunca o CARDAPIO direto.
const cardapioAtivo = CARDAPIO.filter((item) => !item.secao || secaoLigada(item.secao));

/* ============================================================
   BLOCO 2 — FUNÇÕES AUXILIARES
   ============================================================ */

// Transforma centavos em texto de dinheiro: 1800 → "R$ 18,00"
const formatador = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
function formatarPreco(centavos) {
  return formatador.format(centavos / 100);
}

// Atalho para pegar um elemento da página pelo id
function el(id) {
  return document.getElementById(id);
}

// Procura um item do cardápio pelo id
function buscarItem(id) {
  return cardapioAtivo.find((item) => item.id === id);
}

/* ============================================================
   BLOCO 3 — DESENHAR O CARDÁPIO
   O cardápio tem dois níveis: GRUPO (ex.: "Pastéis") e, dentro dele,
   CATEGORIA (ex.: "Pastéis especiais").
   A barra de cima tem um botão por grupo (mais o "Todos");
   a de baixo aparece ao escolher um grupo e mostra as categorias dele.
   ============================================================ */
const TODOS = "Todos";

// Qual grupo está aberto agora (para não redesenhar a barra de baixo à toa)
let grupoAtual = null;

// Tira os repetidos de uma lista, mantendo a ordem: ["a","b","a"] → ["a","b"]
function semRepetir(lista) {
  return [...new Set(lista)];
}

// Categorias de um grupo, na ordem em que aparecem no cardapio.js
function categoriasDoGrupo(grupo) {
  return semRepetir(cardapioAtivo.filter((item) => item.grupo === grupo).map((item) => item.categoria));
}

// O HTML de um cartão de produto.
// "posicao" (0, 1, 2...) atrasa um pouquinho a animação de entrada de cada cartão, em cascata.
function desenharItem(item, posicao) {
  // Foto, se houver; senão, o emoji
  const imagem = item.foto
    ? `<img src="${item.foto}" alt="${item.nome}" loading="lazy" width="72" height="72">`
    : `<span aria-hidden="true">${item.emoji}</span>`;

  // Contador "− 0 +", ou aviso de esgotado.
  // O "−" e o número só aparecem (pelo CSS) quando o item já está no carrinho.
  const acao = item.disponivel
    ? `<div class="contador">
        <button type="button" class="contador__botao contador__menos" data-diminuir="${item.id}" aria-label="Tirar um ${item.nome}">−</button>
        <span class="contador__qtd" aria-live="polite">0</span>
        <button type="button" class="contador__botao contador__mais" data-adicionar="${item.id}" aria-label="Adicionar ${item.nome}">+</button>
      </div>`
    : `<span class="item__esgotado">Esgotado</span>`;

  return `
    <li class="item ${item.disponivel ? "" : "item--indisponivel"}" data-item="${item.id}" style="--posicao: ${posicao}">
      <div class="item__foto">${imagem}</div>
      <div class="item__texto">
        ${item.congelado ? `<span class="etiqueta">❄️ Congelado</span>` : ""}
        <h5 class="item__nome">${item.nome}</h5>
        <p class="item__descricao">${item.descricao}</p>
      </div>
      <div class="item__acao">
        <span class="item__preco">${formatarPreco(item.preco)}</span>
        ${acao}
      </div>
    </li>`;
}

// Um botão da barra. "dados" vira atributos data-*, que o clique lê depois.
// aria-pressed diz ao leitor de tela se o botão está "apertado" (selecionado)
function botaoDaBarra(texto, dados) {
  const atributos = Object.entries(dados)
    .map(([chave, valor]) => `data-${chave}="${valor}"`)
    .join(" ");
  return `<button type="button" class="categorias__botao" ${atributos} aria-pressed="false">${texto}</button>`;
}

function desenharCardapio() {
  const grupos = semRepetir(cardapioAtivo.map((item) => item.grupo));

  el("linha-grupos").innerHTML = [TODOS, ...grupos]
    .map((grupo) => botaoDaBarra(grupo, { grupo }))
    .join("");

  let html = "";
  for (const grupo of grupos) {
    html += `<section class="cardapio__grupo" data-grupo="${grupo}">
      <h3 class="cardapio__grupo-titulo">${grupo}</h3>`;

    for (const categoria of categoriasDoGrupo(grupo)) {
      html += `<div class="cardapio__secao" data-categoria="${categoria}">
        <h4 class="cardapio__categoria">${categoria}</h4><ul class="cardapio__lista">`;
      cardapioAtivo.filter((i) => i.categoria === categoria).forEach((item, posicao) => {
        html += desenharItem(item, posicao);
      });
      html += `</ul></div>`;
    }
    html += `</section>`;
  }
  el("lista-cardapio").innerHTML = html;

  // Blocos de atalho acima do cardápio: um por grupo, com o emoji do primeiro item dele.
  // Têm data-grupo (abre a aba certa) e data-rolar (desce até o cardápio).
  el("grade-grupos").innerHTML = grupos
    .map((grupo) => {
      const itens = cardapioAtivo.filter((item) => item.grupo === grupo);
      return `
        <button type="button" class="grupo" data-grupo="${grupo}" data-rolar>
          <span class="grupo__emoji" aria-hidden="true">${itens[0].emoji}</span>
          <span class="grupo__nome">${grupo}</span>
          <span class="grupo__qtd">${itens.length} opções</span>
        </button>`;
    })
    .join("");
}

// Acende o botão escolhido numa linha da barra e apaga os outros.
// "chave" é qual data-* comparar: "grupo" na linha de cima, "categoria" na de baixo.
function acenderBotao(linha, chave, valor) {
  for (const botao of linha.querySelectorAll("button")) {
    const ativo = botao.dataset[chave] === valor;
    botao.classList.toggle("categorias__botao--ativo", ativo);
    botao.setAttribute("aria-pressed", ativo);
    // No celular a linha rola para o lado: se o botão ativo estiver fora da vista, traz ele de volta
    const foraDaVista =
      botao.offsetLeft < linha.scrollLeft ||
      botao.offsetLeft + botao.offsetWidth > linha.scrollLeft + linha.clientWidth;
    if (ativo && foraDaVista) linha.scrollLeft = botao.offsetLeft - 16;
  }
}

// Mostra só o grupo escolhido (ou todos) e, dentro dele, só a categoria escolhida (ou todas).
// O resto continua no HTML, apenas escondido com "hidden".
function mostrarCardapio(grupo, categoria = TODOS) {
  for (const secao of document.querySelectorAll(".cardapio__grupo")) {
    secao.hidden = grupo !== TODOS && secao.dataset.grupo !== grupo;
  }
  for (const secao of document.querySelectorAll(".cardapio__secao")) {
    secao.hidden = categoria !== TODOS && secao.dataset.categoria !== categoria;
  }

  // Barra de baixo: só redesenha quando o grupo muda.
  // Em "Todos", ou num grupo com uma categoria só, ela não faz sentido e some.
  const sub = el("linha-subcategorias");
  if (grupo !== grupoAtual) {
    const categorias = grupo === TODOS ? [] : categoriasDoGrupo(grupo);
    sub.hidden = categorias.length < 2;
    sub.innerHTML = [TODOS, ...categorias]
      .map((c) => botaoDaBarra(c, { grupo, categoria: c }))
      .join("");
    grupoAtual = grupo;
  }

  acenderBotao(el("linha-grupos"), "grupo", grupo);
  acenderBotao(sub, "categoria", categoria);

  // Se a barra já está grudada (página rolada para baixo), volta para o começo da lista,
  // senão a pessoa ficaria olhando um espaço vazio.
  // Ela gruda logo abaixo do topo fixo: a posição de "grudar" vem do "top" dela no CSS.
  const barra = el("barra-categorias");
  const pontoDeGrudar = parseFloat(getComputedStyle(barra).top) || 0;
  if (barra.getBoundingClientRect().top <= pontoDeGrudar + 1) el("titulo-cardapio").scrollIntoView();
}

/* ============================================================
   BLOCO 4 — MEXER NO CARRINHO
   ============================================================ */
function alterarQuantidade(id, mudanca) {
  const atual = carrinho[id] || 0;
  const nova = atual + mudanca;

  if (nova <= 0) {
    delete carrinho[id]; // zerou: tira da comanda
  } else {
    carrinho[id] = nova;
  }
  atualizarComanda();
}

// Recebe-se "entrega" ou "retirada" do formulário
function tipoRecebimento() {
  return document.querySelector('input[name="recebimento"]:checked').value;
}

// Calcula subtotal, entrega e total (tudo em centavos)
function calcularTotais() {
  let subtotal = 0;
  let quantidade = 0;
  for (const id in carrinho) {
    subtotal += buscarItem(id).preco * carrinho[id];
    quantidade += carrinho[id];
  }
  const entrega = tipoRecebimento() === "entrega" && quantidade > 0 ? CONFIG.taxaEntrega : 0;
  return { subtotal, entrega, total: subtotal + entrega, quantidade };
}

/* ============================================================
   BLOCO 5 — ATUALIZAR A COMANDA NA TELA
   Chamada toda vez que algo muda. Redesenha a comanda inteira.
   ============================================================ */
function atualizarComanda() {
  const ids = Object.keys(carrinho);

  el("itens-comanda").innerHTML = ids
    .map((id) => {
      const item = buscarItem(id);
      const qtd = carrinho[id];
      return `
        <li class="comanda__item">
          <span class="comanda__qtd">${qtd}×</span>
          <span class="comanda__nome">${item.nome}</span>
          <span class="comanda__valor">${formatarPreco(item.preco * qtd)}</span>
          <span class="comanda__controles">
            <button type="button" data-diminuir="${id}" aria-label="Tirar um ${item.nome}">−</button>
            <button type="button" data-adicionar="${id}" aria-label="Mais um ${item.nome}">+</button>
          </span>
        </li>`;
    })
    .join("");

  const t = calcularTotais();
  el("comanda-vazia").hidden = ids.length > 0;
  el("subtotal").textContent = formatarPreco(t.subtotal);
  el("valor-entrega").textContent = formatarPreco(t.entrega);
  el("linha-entrega").hidden = tipoRecebimento() !== "entrega";
  el("total").textContent = formatarPreco(t.total);

  // Barra fixa do celular: só aparece se há itens E a comanda não está na tela
  el("barra-pedido").hidden = t.quantidade === 0 || comandaNaTela;
  el("barra-qtd").textContent = t.quantidade === 1 ? "1 item" : `${t.quantidade} itens`;
  el("barra-total").textContent = formatarPreco(t.total);

  // Contador "− n +" de cada cartão do cardápio
  for (const cartao of document.querySelectorAll(".item[data-item]")) {
    const qtd = carrinho[cartao.dataset.item] || 0;
    cartao.classList.toggle("item--no-carrinho", qtd > 0);
    const numero = cartao.querySelector(".contador__qtd");
    if (numero) numero.textContent = qtd;
  }

  // Número na sacola do topo. Se aumentou, a sacola dá um "pulo" (classe que o CSS anima).
  el("sacola-qtd").hidden = t.quantidade === 0;
  el("sacola-qtd").textContent = t.quantidade;
  if (t.quantidade > quantidadeAnterior) {
    const sacola = el("sacola");
    sacola.classList.remove("sacola--pulo");
    void sacola.offsetWidth; // truque: força o navegador a "esquecer" a animação, para ela rodar de novo
    sacola.classList.add("sacola--pulo");
  }
  quantidadeAnterior = t.quantidade;
}

/* ============================================================
   BLOCO 5B — SELO "ABERTO AGORA / FECHADO"
   Compara o dia e a hora do aparelho com CONFIG.funcionamento.
   ============================================================ */
function atualizarSelo() {
  const f = CONFIG.funcionamento;
  if (!f) return; // sem horário em números no config.js: fica o texto padrão

  const agora = new Date();
  const hora = agora.getHours() + agora.getMinutes() / 60; // 14h30 → 14.5
  const aberto = f.dias.includes(agora.getDay()) && hora >= f.abre && hora < f.fecha;

  el("selo-aberto").classList.toggle("selo--fechado", !aberto);
  el("selo-texto").textContent = aberto ? `Aberto agora · até ${f.fecha}h` : "Fechado agora · peça no próximo horário";
}

/* ============================================================
   BLOCO 6 — FORMULÁRIO: mostrar/esconder campos
   ============================================================ */
function preencherPagamentos() {
  el("pagamento").innerHTML = CONFIG.formasPagamento
    .map((forma) => `<option value="${forma}">${forma}</option>`)
    .join("");
}

function atualizarCamposDoFormulario() {
  el("bloco-endereco").hidden = tipoRecebimento() !== "entrega";
  el("bloco-troco").hidden = el("pagamento").value !== "Dinheiro";
  atualizarComanda(); // a taxa de entrega pode ter mudado
}

/* ============================================================
   BLOCO 7 — VALIDAR E MONTAR A MENSAGEM
   ============================================================ */
function validar() {
  if (Object.keys(carrinho).length === 0) return "Adicione pelo menos um item ao pedido.";
  if (el("nome").value.trim() === "") return "Escreva seu nome.";
  if (tipoRecebimento() === "entrega" && el("endereco").value.trim() === "") {
    return "Escreva o endereço de entrega, ou escolha retirar no balcão.";
  }
  return ""; // vazio = tudo certo
}

function montarMensagem() {
  const t = calcularTotais();
  const linhas = [];

  // No WhatsApp, *texto* fica em negrito
  linhas.push(`*Pedido – ${CONFIG.nomeLoja}*`);
  linhas.push("");
  for (const id in carrinho) {
    const item = buscarItem(id);
    linhas.push(`${carrinho[id]}x ${item.nome} – ${formatarPreco(item.preco * carrinho[id])}`);
  }
  linhas.push("");
  linhas.push(`Subtotal: ${formatarPreco(t.subtotal)}`);
  if (tipoRecebimento() === "entrega") linhas.push(`Entrega: ${formatarPreco(t.entrega)}`);
  linhas.push(`*Total: ${formatarPreco(t.total)}*`);
  linhas.push("");
  linhas.push(`Nome: ${el("nome").value.trim()}`);

  if (tipoRecebimento() === "entrega") {
    linhas.push(`Entrega em: ${el("endereco").value.trim()}`);
  } else {
    linhas.push("Vou retirar no balcão");
  }

  let pagamento = el("pagamento").value;
  const troco = el("troco").value.trim();
  if (pagamento === "Dinheiro" && troco !== "") pagamento += ` (troco para R$ ${troco})`;
  linhas.push(`Pagamento: ${pagamento}`);

  const obs = el("observacao").value.trim();
  if (obs !== "") linhas.push(`Obs.: ${obs}`);

  // "\n" é a quebra de linha
  return linhas.join("\n");
}

/* ============================================================
   BLOCO 8 — ENVIAR: revisar e montar o link do WhatsApp
   encodeURIComponent troca espaços, acentos e quebras de linha
   por códigos que podem viajar dentro de um link (ex.: espaço → %20).
   ============================================================ */
function abrirRevisao(evento) {
  evento.preventDefault(); // impede o formulário de recarregar a página

  const erro = validar();
  el("erro-form").textContent = erro;
  if (erro) return;

  mostrarRevisao(montarMensagem());
}

// Mensagem pronta para pedir orçamento de festa (a pessoa completa os dados no WhatsApp)
function pedirOrcamento() {
  mostrarRevisao(
    [
      `*Orçamento para festa – ${CONFIG.nomeLoja}*`,
      "",
      "Olá! Quero um orçamento:",
      "• Data e horário:",
      "• Número de convidados:",
      "• Salgados e doces que eu gostaria:",
      "• Pronto ou congelado:",
      "• Entrega ou retirada:",
    ].join("\n")
  );
}

// Abre a janela de revisão com qualquer mensagem e prepara o link do WhatsApp
function mostrarRevisao(mensagem) {
  const link = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(mensagem)}`;

  el("previa-mensagem").textContent = mensagem;
  el("link-whatsapp").href = link;
  el("link-whatsapp").hidden = CONFIG.modoDemo;
  el("nota-demo").hidden = !CONFIG.modoDemo;

  // Útil para você testar: aperte F12 → Console e veja o link gerado
  console.log("Link do WhatsApp:", link);

  el("revisao").showModal();
}

/* ============================================================
   BLOCO 9 — LIGAR TUDO (eventos)
   Um "evento" é algo que o usuário faz: clicar, digitar, escolher.
   ============================================================ */

// Um único "ouvinte" para todos os botões + e − e os de categoria (técnica chamada delegação de eventos)
document.addEventListener("click", (evento) => {
  const botao = evento.target.closest("button");
  if (!botao) return;
  if (botao.dataset.adicionar) alterarQuantidade(botao.dataset.adicionar, +1);
  if (botao.dataset.diminuir) alterarQuantidade(botao.dataset.diminuir, -1);
  // Botões da barra: os de grupo só têm data-grupo; os de categoria têm os dois
  if (botao.dataset.grupo) mostrarCardapio(botao.dataset.grupo, botao.dataset.categoria || TODOS);
  // Blocos de atalho do topo: depois de abrir a aba, desce até o cardápio
  if (botao.dataset.rolar !== undefined) el("titulo-cardapio").scrollIntoView();
  if (botao.dataset.orcamento !== undefined) pedirOrcamento();
});

el("form-pedido").addEventListener("change", atualizarCamposDoFormulario);
el("form-pedido").addEventListener("submit", abrirRevisao);
el("botao-voltar").addEventListener("click", () => el("revisao").close());

// Esconde a barra fixa quando a comanda já está visível, para ela não cobrir o botão de enviar.
// O IntersectionObserver avisa sempre que a comanda entra ou sai da tela.
new IntersectionObserver((entradas) => {
  comandaNaTela = entradas[0].isIntersecting;
  atualizarComanda();
}).observe(el("comanda"));

// Início: desenha tudo uma vez
/* ============================================================
   BLOCO 10 — INFORMAÇÕES DA LOJA E LIGA/DESLIGA DAS SEÇÕES
   ============================================================ */

// Esconde tudo que tem data-secao="x" quando CONFIG.secoes.x está false
function aplicarSecoes() {
  for (const parte of document.querySelectorAll("[data-secao]")) {
    parte.hidden = !secaoLigada(parte.dataset.secao);
  }
}

// Preenche os textos que vêm do config.js. No HTML, um elemento com
// data-config="endereco" recebe CONFIG.endereco, e assim por diante.
// Assim, mudar o horário ou o endereço no config.js muda a página inteira.
function preencherInformacoes() {
  const textos = {
    ...CONFIG,
    taxaEntrega: formatarPreco(CONFIG.taxaEntrega),
    formasPagamento: CONFIG.formasPagamento.join(", "),
    ano: new Date().getFullYear(),
    totalItens: cardapioAtivo.length,
  };
  for (const elemento of document.querySelectorAll("[data-config]")) {
    const valor = textos[elemento.dataset.config];
    if (valor !== undefined) elemento.textContent = valor;
  }
}

// CALCULADORA DE FESTA: 12 salgados por convidado
const SALGADOS_POR_CONVIDADO = 12;
const MIN_CONVIDADOS = 1;
const MAX_CONVIDADOS = 999;

// Lê o campo e devolve um número válido entre 1 e 999 (vazio ou 0 contam como 1)
function lerConvidados() {
  const numero = parseInt(el("convidados").value, 10) || MIN_CONVIDADOS;
  return Math.min(MAX_CONVIDADOS, Math.max(MIN_CONVIDADOS, numero));
}

function calcularFesta() {
  const convidados = lerConvidados();
  el("calc-salgados").textContent = convidados * SALGADOS_POR_CONVIDADO;
  // "−" desativado no mínimo e "+" no máximo: não dá para passar dos limites
  el("menos-convidados").disabled = convidados <= MIN_CONVIDADOS;
  el("mais-convidados").disabled = convidados >= MAX_CONVIDADOS;
}

// Enquanto digita: tira tudo que não for algarismo (sinal de menos, vírgula, letras).
// \D = "qualquer caractere que NÃO é dígito"; o "g" troca todos, não só o primeiro.
el("convidados").addEventListener("input", () => {
  el("convidados").value = el("convidados").value.replace(/\D/g, "");
  calcularFesta();
});

// Ao sair do campo: se ficou vazio ou 0, volta para um número válido (1)
el("convidados").addEventListener("change", () => {
  el("convidados").value = lerConvidados();
  calcularFesta();
});

// Botões − e + da calculadora: somam ou tiram 10 convidados, sem passar dos limites
document.addEventListener("click", (evento) => {
  const botao = evento.target.closest("[data-convidados]");
  if (!botao) return;
  const novo = lerConvidados() + Number(botao.dataset.convidados);
  el("convidados").value = Math.min(MAX_CONVIDADOS, Math.max(MIN_CONVIDADOS, novo));
  calcularFesta();
});

aplicarSecoes();
preencherInformacoes();
calcularFesta();
el("horario").textContent = CONFIG.horario;
atualizarSelo();
setInterval(atualizarSelo, 60 * 1000); // confere de novo a cada minuto (60 mil milissegundos)
desenharCardapio();
mostrarCardapio(cardapioAtivo[0].grupo); // abre no primeiro grupo (Salgados)
preencherPagamentos();
atualizarCamposDoFormulario();
