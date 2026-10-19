/*
  app.js — A LÓGICA DO SITE (versão com OPÇÕES)
  ---------------------------------------------
  Lê CONFIG (config.js) e CARDAPIO (cardapio.js) e:
    1. desenha o cardápio na tela;
    2. abre a janela "Monte seu pedido" nos itens com opções (ponto, adicionais, combo...);
    3. controla a sacola;
    4. monta a mensagem e abre o WhatsApp.

  Diferença para a demo da lanchonete: aqui o MESMO produto pode entrar na sacola
  várias vezes com escolhas diferentes (um Clássico ao ponto e outro bem passado com bacon).
  Por isso a sacola é uma LISTA DE LINHAS, e não só "id → quantidade".

  Este arquivo é igual nas demos hamburgueria e açaí: o que muda entre elas são os DADOS.
*/

/* ============================================================
   BLOCO 1 — ESTADO
   ============================================================ */

// A sacola. Cada linha: { chave, item, escolhas, obs, qtd, preco }
//   escolhas → { idDoGrupo: [idDaOpcao, ...] }   ex.: { ponto: ["ao-ponto"], adicionais: ["bacon"] }
//   preco    → preço de UMA unidade, já com as opções
const sacola = [];

// O item que está sendo montado na janela de opções (null = janela fechada)
let montando = null;

// A comanda está aparecendo na tela? (atualizado pelo IntersectionObserver, no fim do arquivo)
let comandaNaTela = false;

// Quantos itens havia na última atualização (para a sacola "pular" só quando aumenta)
let quantidadeAnterior = 0;

// Uma parte da página está ligada no config.js? (se a chave não existir, conta como ligada)
function secaoLigada(nome) {
  return !CONFIG.secoes || CONFIG.secoes[nome] !== false;
}

// O cardápio que vale nesta página: o do cardapio.js, menos os itens de seções desligadas
const cardapioAtivo = CARDAPIO.filter((item) => !item.secao || secaoLigada(item.secao));

/* ============================================================
   BLOCO 2 — FUNÇÕES AUXILIARES
   ============================================================ */

// Transforma centavos em texto de dinheiro: 1800 → "R$ 18,00"
const formatador = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
function formatarPreco(centavos) {
  return formatador.format(centavos / 100);
}

// Hora com fração em texto: 23.5 → "23h30"; 19 → "19h"
function formatarHora(hora) {
  const minutos = Math.round((hora % 1) * 60);
  return `${Math.floor(hora)}h${minutos ? String(minutos).padStart(2, "0") : ""}`;
}

// Atalho para pegar um elemento da página pelo id
function el(id) {
  return document.getElementById(id);
}

function buscarItem(id) {
  return cardapioAtivo.find((item) => item.id === id);
}

// Tira os repetidos de uma lista, mantendo a ordem: ["a","b","a"] → ["a","b"]
function semRepetir(lista) {
  return [...new Set(lista)];
}

// Categorias de um grupo, na ordem em que aparecem no cardapio.js
function categoriasDoGrupo(grupo) {
  return semRepetir(cardapioAtivo.filter((item) => item.grupo === grupo).map((item) => item.categoria));
}

/* ============================================================
   BLOCO 3 — REGRAS DAS OPÇÕES
   Funções "puras": recebem item + escolhas e devolvem uma resposta,
   sem mexer na tela. Isso deixa as contas fáceis de testar.
   ============================================================ */

function temOpcoes(item) {
  return Array.isArray(item.opcoes) && item.opcoes.length > 0;
}

// Grupos que aparecem agora. Um grupo com "mostrarSe" só aparece se o outro
// grupo tiver uma escolha diferente da indicada (ex.: bebida só se virou combo).
function gruposVisiveis(item, escolhas) {
  return (item.opcoes || []).filter((grupo) => {
    if (!grupo.mostrarSe) return true;
    const outras = escolhas[grupo.mostrarSe.grupo] || [];
    return outras.length > 0 && !outras.includes(grupo.mostrarSe.diferenteDe);
  });
}

// Quantas escolhas deste grupo são grátis (açaí: depende do tamanho do copo).
// Sem "gratis" no grupo: não há limite de grátis (Infinity = infinito).
function limiteGratis(grupo, escolhas) {
  if (!grupo.gratis) return Infinity;
  const referencia = (escolhas[grupo.gratis.conformeGrupo] || [])[0];
  return grupo.gratis.limites[referencia] || 0;
}

// Quanto um grupo soma ao preço: o preço de cada opção marcada,
// mais "precoExtra" para cada escolha que passou do limite grátis
function precoDoGrupo(grupo, escolhas) {
  const marcadas = escolhas[grupo.id] || [];
  let soma = 0;
  for (const idOpcao of marcadas) {
    const opcao = grupo.opcoes.find((o) => o.id === idOpcao);
    if (opcao) soma += opcao.preco;
  }
  const alemDoLimite = Math.max(0, marcadas.length - limiteGratis(grupo, escolhas));
  if (alemDoLimite > 0) soma += alemDoLimite * grupo.gratis.precoExtra;
  return soma;
}

// Preço de UMA unidade com as escolhas (só os grupos visíveis contam)
function precoUnitario(item, escolhas) {
  let total = item.preco;
  for (const grupo of gruposVisiveis(item, escolhas)) total += precoDoGrupo(grupo, escolhas);
  return total;
}

// Escolhas com que a janela abre: o "padrao" de cada grupo; num grupo de escolha
// única e obrigatória sem padrão, a primeira opção. O item pode trazer as suas
// próprias escolhas prontas em "escolhasProntas" (ex.: copos da casa do açaí).
function escolhasIniciais(item) {
  const escolhas = {};
  for (const grupo of item.opcoes || []) {
    if (grupo.padrao) escolhas[grupo.id] = [grupo.padrao];
    else if (grupo.tipo === "unica" && grupo.obrigatorio) escolhas[grupo.id] = [grupo.opcoes[0].id];
    else escolhas[grupo.id] = [];
  }
  for (const idGrupo in item.escolhasProntas || {}) {
    escolhas[idGrupo] = [...item.escolhasProntas[idGrupo]];
  }
  return escolhas;
}

// Devolve um texto de erro, ou "" se está tudo certo
function validarEscolhas(item, escolhas) {
  for (const grupo of gruposVisiveis(item, escolhas)) {
    if (grupo.obrigatorio && (escolhas[grupo.id] || []).length === 0) return `Escolha: ${grupo.titulo}`;
  }
  return "";
}

// Só as escolhas dos grupos visíveis e não vazios, em ordem fixa.
// É isso que vai para a sacola (e serve para comparar duas montagens).
function escolhasFinais(item, escolhas) {
  const finais = {};
  for (const grupo of gruposVisiveis(item, escolhas)) {
    const marcadas = escolhas[grupo.id] || [];
    if (marcadas.length) finais[grupo.id] = [...marcadas].sort();
  }
  return finais;
}

// Texto curto das escolhas: "Ao ponto · + Bacon · + Ovo · Combo: batata P + refri lata · Bebida: Guaraná"
function resumoEscolhas(item, escolhas) {
  const partes = [];
  for (const grupo of gruposVisiveis(item, escolhas)) {
    const nomes = (escolhas[grupo.id] || [])
      .map((id) => grupo.opcoes.find((o) => o.id === id))
      .filter((opcao) => opcao && opcao.resumo !== false)
      .map((opcao) => (grupo.prefixo || "") + (opcao.curto || opcao.nome)); // "curto": nome menor só para o resumo
    if (nomes.length === 0) continue;
    partes.push(grupo.rotulo ? `${grupo.rotulo}: ${nomes.join(", ")}` : nomes.join(" · "));
  }
  return partes.join(" · ");
}

// O que o cartão mostra: preço com as escolhas iniciais, e "a partir de"
// se alguma opção pode aumentar esse valor
function precoDoCartao(item) {
  const preco = precoUnitario(item, escolhasIniciais(item));
  const podeAumentar = (item.opcoes || []).some((g) => g.gratis || g.opcoes.some((o) => o.preco > 0));
  return (podeAumentar ? "a partir de " : "") + formatarPreco(preco);
}

/* ============================================================
   BLOCO 4 — DESENHAR O CARDÁPIO
   Dois níveis: GRUPO (aba de cima) e CATEGORIA (aba de baixo).
   ============================================================ */
const TODOS = "Todos";

// Qual grupo está aberto agora (para não redesenhar a barra de baixo à toa)
let grupoAtual = null;

// O HTML de um cartão de produto. "posicao" atrasa a animação de entrada, em cascata.
function desenharItem(item, posicao) {
  const imagem = item.foto
    ? `<img src="${item.foto}" alt="${item.nome}" loading="lazy" width="72" height="72">`
    : `<span aria-hidden="true">${item.emoji}</span>`;

  // Com opções: o "+" abre a janela e o número mostra quantos já estão na sacola.
  // Sem opções: contador "− n +" direto no cartão.
  let acao;
  if (!item.disponivel) {
    acao = `<span class="item__esgotado">Esgotado</span>`;
  } else if (temOpcoes(item)) {
    acao = `<div class="contador">
        <span class="contador__qtd contador__qtd--selo" aria-label="na sacola">0</span>
        <button type="button" class="contador__botao contador__mais" data-montar="${item.id}" aria-label="Escolher opções de ${item.nome}">+</button>
      </div>`;
  } else {
    acao = `<div class="contador">
        <button type="button" class="contador__botao contador__menos" data-diminuir="${item.id}" aria-label="Tirar um ${item.nome}">−</button>
        <span class="contador__qtd" aria-live="polite">0</span>
        <button type="button" class="contador__botao contador__mais" data-adicionar="${item.id}" aria-label="Adicionar ${item.nome}">+</button>
      </div>`;
  }

  return `
    <li class="item ${item.disponivel ? "" : "item--indisponivel"}" data-item="${item.id}" style="--posicao: ${posicao}">
      <div class="item__foto">${imagem}</div>
      <div class="item__texto">
        ${item.etiqueta ? `<span class="etiqueta">${item.etiqueta}</span>` : ""}
        <h5 class="item__nome">${item.nome}</h5>
        <p class="item__descricao">${item.descricao}</p>
      </div>
      <div class="item__acao">
        <span class="item__preco">${precoDoCartao(item)}</span>
        ${acao}
      </div>
    </li>`;
}

// Um botão da barra. "dados" vira atributos data-*, que o clique lê depois.
function botaoDaBarra(texto, dados) {
  const atributos = Object.entries(dados)
    .map(([chave, valor]) => `data-${chave}="${valor}"`)
    .join(" ");
  return `<button type="button" class="categorias__botao" ${atributos} aria-pressed="false">${texto}</button>`;
}

function desenharCardapio() {
  const grupos = semRepetir(cardapioAtivo.map((item) => item.grupo));

  el("linha-grupos").innerHTML = [TODOS, ...grupos].map((grupo) => botaoDaBarra(grupo, { grupo })).join("");

  let html = "";
  for (const grupo of grupos) {
    html += `<section class="cardapio__grupo" data-grupo="${grupo}">
      <h3 class="cardapio__grupo-titulo">${grupo}</h3>`;
    for (const categoria of categoriasDoGrupo(grupo)) {
      // Categoria com o mesmo nome do grupo não precisa de subtítulo
      const subtitulo = categoria === grupo ? "" : `<h4 class="cardapio__categoria">${categoria}</h4>`;
      html += `<div class="cardapio__secao" data-categoria="${categoria}">${subtitulo}<ul class="cardapio__lista">`;
      cardapioAtivo
        .filter((i) => i.categoria === categoria)
        .forEach((item, posicao) => (html += desenharItem(item, posicao)));
      html += `</ul></div>`;
    }
    html += `</section>`;
  }
  el("lista-cardapio").innerHTML = html;

  // Blocos de atalho: um por grupo, com o emoji do primeiro item dele
  const grade = el("grade-grupos");
  if (grade) {
    grade.innerHTML = grupos
      .map((grupo) => {
        const itens = cardapioAtivo.filter((item) => item.grupo === grupo);
        return `
          <button type="button" class="grupo" data-grupo="${grupo}" data-rolar>
            <span class="grupo__emoji" aria-hidden="true">${itens[0].emoji}</span>
            <span class="grupo__nome">${grupo}</span>
            <span class="grupo__qtd">${itens.length} ${itens.length === 1 ? "opção" : "opções"}</span>
          </button>`;
      })
      .join("");
  }
}

// Acende o botão escolhido numa linha da barra e apaga os outros
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

// Mostra só o grupo escolhido (ou todos) e, dentro dele, só a categoria escolhida (ou todas)
function mostrarCardapio(grupo, categoria = TODOS) {
  for (const secao of document.querySelectorAll(".cardapio__grupo")) {
    secao.hidden = grupo !== TODOS && secao.dataset.grupo !== grupo;
  }
  for (const secao of document.querySelectorAll(".cardapio__secao")) {
    secao.hidden = categoria !== TODOS && secao.dataset.categoria !== categoria;
  }

  // Barra de baixo: só redesenha quando o grupo muda; some em "Todos" ou com uma categoria só
  const sub = el("linha-subcategorias");
  if (grupo !== grupoAtual) {
    const categorias = grupo === TODOS ? [] : categoriasDoGrupo(grupo);
    sub.hidden = categorias.length < 2;
    sub.innerHTML = [TODOS, ...categorias].map((c) => botaoDaBarra(c, { grupo, categoria: c })).join("");
    grupoAtual = grupo;
  }

  acenderBotao(el("linha-grupos"), "grupo", grupo);
  acenderBotao(sub, "categoria", categoria);

  // Se a barra já está grudada (página rolada), volta para o começo da lista
  const barra = el("barra-categorias");
  const pontoDeGrudar = parseFloat(getComputedStyle(barra).top) || 0;
  if (barra.getBoundingClientRect().top <= pontoDeGrudar + 1) el("titulo-cardapio").scrollIntoView();
}

/* ============================================================
   BLOCO 5 — JANELA "MONTE SEU PEDIDO"
   ============================================================ */
function abrirMontagem(id) {
  const item = buscarItem(id);
  montando = { item, escolhas: escolhasIniciais(item), qtd: 1 };

  el("montar-emoji").textContent = item.emoji;
  el("montar-nome").textContent = item.nome;
  el("montar-descricao").textContent = item.descricao;
  el("montar-obs").value = "";
  el("montar-erro").textContent = "";

  desenharMontagem();
  el("montar").showModal();
  el("montar-corpo").scrollTop = 0;
}

// Desenha os grupos de opções e o total. É chamada a cada mudança,
// porque um grupo pode aparecer/sumir (bebida do combo) e os preços mudam.
function desenharMontagem() {
  const { item, escolhas, qtd } = montando;

  // Guarda qual opção estava com o foco, para devolvê-lo depois de redesenhar
  const focada = document.activeElement;
  const focoAnterior = focada && focada.dataset && focada.dataset.opcao ? focada.dataset.opcao : null;

  let html = "";
  for (const grupo of gruposVisiveis(item, escolhas)) {
    const marcadas = escolhas[grupo.id] || [];
    const limite = limiteGratis(grupo, escolhas);
    const tipoInput = grupo.tipo === "unica" ? "radio" : "checkbox";
    const cheio = grupo.max && marcadas.length >= grupo.max;

    // Texto de ajuda ao lado do título do grupo
    let ajuda = grupo.obrigatorio ? "Obrigatório" : "Opcional";
    if (grupo.max) ajuda = `Até ${grupo.max}`;
    if (grupo.gratis) {
      ajuda = `${Math.min(marcadas.length, limite)} de ${limite} grátis · depois ${formatarPreco(grupo.gratis.precoExtra)} cada`;
    }

    html += `<fieldset class="opcoes" data-grupo-opcoes="${grupo.id}">
      <legend class="opcoes__titulo"><span>${grupo.titulo}</span><small class="opcoes__ajuda ${grupo.gratis && marcadas.length > limite ? "opcoes__ajuda--alerta" : ""}">${ajuda}</small></legend>`;

    for (const opcao of grupo.opcoes) {
      const marcada = marcadas.includes(opcao.id);
      // Com limite grátis: as escolhas além do limite mostram o preço extra
      const posicao = marcadas.indexOf(opcao.id);
      const paga = grupo.gratis && marcada && posicao >= limite;
      let preco = opcao.preco ? `+ ${formatarPreco(opcao.preco)}` : "";
      if (paga) preco = `+ ${formatarPreco(grupo.gratis.precoExtra)}`;
      if (grupo.gratis && !marcada && marcadas.length >= limite) preco = `+ ${formatarPreco(grupo.gratis.precoExtra)}`;

      const desativada = cheio && !marcada;
      html += `
        <label class="opcao ${desativada ? "opcao--desativada" : ""}">
          <input type="${tipoInput}" name="g-${grupo.id}" value="${opcao.id}" data-grupo="${grupo.id}"
                 data-opcao="${grupo.id}:${opcao.id}" ${marcada ? "checked" : ""} ${desativada ? "disabled" : ""}>
          <span class="opcao__nome">${opcao.nome}</span>
          <span class="opcao__preco">${preco}</span>
        </label>`;
    }
    html += `</fieldset>`;
  }
  el("montar-opcoes").innerHTML = html;

  el("montar-qtd").textContent = qtd;
  el("montar-total").textContent = formatarPreco(precoUnitario(item, escolhas) * qtd);

  if (focoAnterior) {
    const devolver = el("montar-opcoes").querySelector(`[data-opcao="${focoAnterior}"]`);
    if (devolver) devolver.focus();
  }
}

// Marcou ou desmarcou uma opção
function mudarOpcao(input) {
  const idGrupo = input.dataset.grupo;
  const marcadas = montando.escolhas[idGrupo] || [];
  if (input.type === "radio") {
    montando.escolhas[idGrupo] = [input.value];
  } else if (input.checked) {
    montando.escolhas[idGrupo] = [...marcadas, input.value]; // no fim: guarda a ordem das escolhas
  } else {
    montando.escolhas[idGrupo] = marcadas.filter((id) => id !== input.value);
  }
  el("montar-erro").textContent = "";
  desenharMontagem();
}

function confirmarMontagem() {
  const { item, escolhas, qtd } = montando;
  const erro = validarEscolhas(item, escolhas);
  el("montar-erro").textContent = erro;
  if (erro) return;

  adicionarNaSacola(item, escolhasFinais(item, escolhas), el("montar-obs").value.trim(), qtd);
  el("montar").close();
}

/* ============================================================
   BLOCO 6 — MEXER NA SACOLA
   ============================================================ */

// Duas montagens iguais (mesmo item, mesmas escolhas, mesma observação) viram uma linha só
function adicionarNaSacola(item, escolhas, obs, qtd) {
  const chave = `${item.id}|${JSON.stringify(escolhas)}|${obs}`;
  const linha = sacola.find((l) => l.chave === chave);
  if (linha) {
    linha.qtd += qtd;
  } else {
    sacola.push({ chave, item, escolhas, obs, qtd, preco: precoUnitario(item, escolhas) });
  }
  atualizarComanda();
}

// Item sem opções: o "−" do cartão tira da linha simples dele
function diminuirSimples(id) {
  const indice = sacola.findIndex((l) => l.chave === `${id}|{}|`);
  if (indice >= 0) mudarLinha(indice, -1);
}

function mudarLinha(indice, mudanca) {
  sacola[indice].qtd += mudanca;
  if (sacola[indice].qtd <= 0) sacola.splice(indice, 1); // zerou: tira da sacola
  atualizarComanda();
}

function tipoRecebimento() {
  return document.querySelector('input[name="recebimento"]:checked').value;
}

// Subtotal, entrega e total (tudo em centavos)
function calcularTotais() {
  let subtotal = 0;
  let quantidade = 0;
  for (const linha of sacola) {
    subtotal += linha.preco * linha.qtd;
    quantidade += linha.qtd;
  }
  const entrega = tipoRecebimento() === "entrega" && quantidade > 0 ? CONFIG.taxaEntrega : 0;
  return { subtotal, entrega, total: subtotal + entrega, quantidade };
}

/* ============================================================
   BLOCO 7 — ATUALIZAR A COMANDA E OS CONTADORES
   ============================================================ */
function atualizarComanda() {
  el("itens-comanda").innerHTML = sacola
    .map((linha, indice) => {
      const resumo = resumoEscolhas(linha.item, linha.escolhas);
      return `
        <li class="comanda__item">
          <span class="comanda__qtd">${linha.qtd}×</span>
          <span class="comanda__nome">${linha.item.nome}</span>
          <span class="comanda__valor">${formatarPreco(linha.preco * linha.qtd)}</span>
          ${resumo ? `<span class="comanda__detalhe">${resumo}</span>` : ""}
          ${linha.obs ? `<span class="comanda__detalhe">Obs.: ${linha.obs}</span>` : ""}
          <span class="comanda__controles">
            <button type="button" data-linha-menos="${indice}" aria-label="Tirar um ${linha.item.nome}">−</button>
            <button type="button" data-linha-mais="${indice}" aria-label="Mais um ${linha.item.nome}">+</button>
          </span>
        </li>`;
    })
    .join("");

  const t = calcularTotais();
  el("comanda-vazia").hidden = sacola.length > 0;
  el("subtotal").textContent = formatarPreco(t.subtotal);
  el("valor-entrega").textContent = formatarPreco(t.entrega);
  el("linha-entrega").hidden = tipoRecebimento() !== "entrega";
  el("total").textContent = formatarPreco(t.total);

  // Barra fixa do celular: só aparece se há itens E a comanda não está na tela
  el("barra-pedido").hidden = t.quantidade === 0 || comandaNaTela;
  el("barra-qtd").textContent = t.quantidade === 1 ? "1 item" : `${t.quantidade} itens`;
  el("barra-total").textContent = formatarPreco(t.total);

  // Número em cada cartão: soma de todas as linhas daquele item
  for (const cartao of document.querySelectorAll(".item[data-item]")) {
    const qtd = sacola.filter((l) => l.item.id === cartao.dataset.item).reduce((soma, l) => soma + l.qtd, 0);
    cartao.classList.toggle("item--no-carrinho", qtd > 0);
    const numero = cartao.querySelector(".contador__qtd");
    if (numero) numero.textContent = qtd;
  }

  // Número na sacola do topo, que dá um "pulo" quando aumenta
  el("sacola-qtd").hidden = t.quantidade === 0;
  el("sacola-qtd").textContent = t.quantidade;
  if (t.quantidade > quantidadeAnterior) {
    const icone = el("sacola");
    icone.classList.remove("sacola--pulo");
    void icone.offsetWidth; // truque: força o navegador a "esquecer" a animação, para ela rodar de novo
    icone.classList.add("sacola--pulo");
  }
  quantidadeAnterior = t.quantidade;
}

/* ============================================================
   BLOCO 8 — FORMULÁRIO, MENSAGEM E WHATSAPP
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

function validar() {
  if (sacola.length === 0) return "Adicione pelo menos um item ao pedido.";
  if (el("nome").value.trim() === "") return "Escreva seu nome.";
  if (tipoRecebimento() === "entrega" && el("endereco").value.trim() === "") {
    return "Escreva o endereço de entrega, ou escolha retirar no balcão.";
  }
  return "";
}

function montarMensagem() {
  const t = calcularTotais();
  const linhas = [];

  // No WhatsApp, *texto* fica em negrito
  linhas.push(`*Pedido – ${CONFIG.nomeLoja}*`);
  linhas.push("");
  for (const linha of sacola) {
    linhas.push(`${linha.qtd}x ${linha.item.nome} – ${formatarPreco(linha.preco * linha.qtd)}`);
    const resumo = resumoEscolhas(linha.item, linha.escolhas);
    if (resumo) linhas.push(`   ${resumo}`);
    if (linha.obs) linhas.push(`   Obs.: ${linha.obs}`);
  }
  linhas.push("");
  linhas.push(`Subtotal: ${formatarPreco(t.subtotal)}`);
  if (tipoRecebimento() === "entrega") linhas.push(`Entrega: ${formatarPreco(t.entrega)}`);
  linhas.push(`*Total: ${formatarPreco(t.total)}*`);
  linhas.push("");
  linhas.push(`Nome: ${el("nome").value.trim()}`);
  linhas.push(tipoRecebimento() === "entrega" ? `Entrega em: ${el("endereco").value.trim()}` : "Vou retirar no balcão");

  let pagamento = el("pagamento").value;
  const troco = el("troco").value.trim();
  if (pagamento === "Dinheiro" && troco !== "") pagamento += ` (troco para R$ ${troco})`;
  linhas.push(`Pagamento: ${pagamento}`);

  const obs = el("observacao").value.trim();
  if (obs !== "") linhas.push(`Obs.: ${obs}`);

  return linhas.join("\n");
}

function abrirRevisao(evento) {
  evento.preventDefault(); // impede o formulário de recarregar a página
  const erro = validar();
  el("erro-form").textContent = erro;
  if (erro) return;
  mostrarRevisao(montarMensagem());
}

// Abre a janela de revisão com a mensagem e prepara o link do WhatsApp.
// encodeURIComponent troca espaços, acentos e quebras de linha por códigos que viajam num link.
function mostrarRevisao(mensagem) {
  const link = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(mensagem)}`;
  el("previa-mensagem").textContent = mensagem;
  el("link-whatsapp").href = link;
  el("link-whatsapp").hidden = CONFIG.modoDemo;
  el("nota-demo").hidden = !CONFIG.modoDemo;
  console.log("Link do WhatsApp:", link); // F12 → Console para ver o link gerado
  el("revisao").showModal();
}

/* ============================================================
   BLOCO 9 — SELO "ABERTO AGORA", SEÇÕES E TEXTOS DO CONFIG
   ============================================================ */
function atualizarSelo() {
  const f = CONFIG.funcionamento;
  if (!f || !el("selo-aberto")) return;
  const agora = new Date();
  const hora = agora.getHours() + agora.getMinutes() / 60; // 14h30 → 14.5
  const aberto = f.dias.includes(agora.getDay()) && hora >= f.abre && hora < f.fecha;
  el("selo-aberto").classList.toggle("selo--fechado", !aberto);
  el("selo-texto").textContent = aberto
    ? `Aberto agora · até ${formatarHora(f.fecha)}`
    : `Fechado agora · abrimos às ${formatarHora(f.abre)}`;
}

// Esconde tudo que tem data-secao="x" quando CONFIG.secoes.x está false
function aplicarSecoes() {
  for (const parte of document.querySelectorAll("[data-secao]")) {
    parte.hidden = !secaoLigada(parte.dataset.secao);
  }
}

// Elementos com data-config="x" recebem o valor de CONFIG.x
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

/* ============================================================
   BLOCO 10 — LIGAR TUDO (eventos)
   ============================================================ */

// Um único "ouvinte" de cliques para a página inteira (delegação de eventos)
document.addEventListener("click", (evento) => {
  const botao = evento.target.closest("button");
  if (!botao) return;
  const d = botao.dataset;

  if (d.adicionar) adicionarNaSacola(buscarItem(d.adicionar), {}, "", 1);
  if (d.diminuir) diminuirSimples(d.diminuir);
  if (d.montar) abrirMontagem(d.montar);
  if (d.linhaMais) mudarLinha(Number(d.linhaMais), +1);
  if (d.linhaMenos) mudarLinha(Number(d.linhaMenos), -1);
  if (d.grupo) mostrarCardapio(d.grupo, d.categoria || TODOS);
  if (d.rolar !== undefined) el("titulo-cardapio").scrollIntoView();
});

// Janela de montagem
el("montar-opcoes").addEventListener("change", (evento) => mudarOpcao(evento.target));
el("montar-mais").addEventListener("click", () => {
  montando.qtd += 1;
  desenharMontagem();
});
el("montar-menos").addEventListener("click", () => {
  montando.qtd = Math.max(1, montando.qtd - 1);
  desenharMontagem();
});
el("montar-confirmar").addEventListener("click", confirmarMontagem);
el("montar-fechar").addEventListener("click", () => el("montar").close());
el("montar").addEventListener("close", () => (montando = null));

// Formulário e revisão
el("form-pedido").addEventListener("change", atualizarCamposDoFormulario);
el("form-pedido").addEventListener("submit", abrirRevisao);
el("botao-voltar").addEventListener("click", () => el("revisao").close());

// Esconde a barra fixa quando a comanda já está visível
new IntersectionObserver((entradas) => {
  comandaNaTela = entradas[0].isIntersecting;
  atualizarComanda();
}).observe(el("comanda"));

// Início
aplicarSecoes();
preencherInformacoes();
atualizarSelo();
setInterval(atualizarSelo, 60 * 1000);
desenharCardapio();
mostrarCardapio(cardapioAtivo[0].grupo);
preencherPagamentos();
atualizarCamposDoFormulario();
