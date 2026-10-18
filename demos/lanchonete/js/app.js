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
  return CARDAPIO.find((item) => item.id === id);
}

/* ============================================================
   BLOCO 3 — DESENHAR O CARDÁPIO
   Agrupa os itens por categoria e cria o HTML de cada um.
   ============================================================ */
function desenharCardapio() {
  const lista = el("lista-cardapio");

  // Descobre as categorias, na ordem em que aparecem no cardapio.js
  const categorias = [...new Set(CARDAPIO.map((item) => item.categoria))];

  let html = "";
  for (const categoria of categorias) {
    html += `<h3 class="cardapio__categoria">${categoria}</h3><ul class="cardapio__lista">`;

    const itensDaCategoria = CARDAPIO.filter((item) => item.categoria === categoria);
    for (const item of itensDaCategoria) {
      // Foto, se houver; senão, o emoji
      const imagem = item.foto
        ? `<img src="${item.foto}" alt="${item.nome}" loading="lazy" width="72" height="72">`
        : `<span aria-hidden="true">${item.emoji}</span>`;

      // Botão de adicionar, ou aviso de esgotado
      const acao = item.disponivel
        ? `<button type="button" class="botao botao--pequeno" data-adicionar="${item.id}">Adicionar</button>`
        : `<span class="item__esgotado">Esgotado</span>`;

      html += `
        <li class="item ${item.disponivel ? "" : "item--indisponivel"}">
          <div class="item__foto">${imagem}</div>
          <div class="item__texto">
            <h4 class="item__nome">${item.nome}</h4>
            <p class="item__descricao">${item.descricao}</p>
          </div>
          <div class="item__acao">
            <span class="item__preco">${formatarPreco(item.preco)}</span>
            ${acao}
          </div>
        </li>`;
    }
    html += `</ul>`;
  }
  lista.innerHTML = html;
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

  const mensagem = montarMensagem();
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

// Um único "ouvinte" para todos os botões + e −  (técnica chamada delegação de eventos)
document.addEventListener("click", (evento) => {
  const botao = evento.target.closest("button");
  if (!botao) return;
  if (botao.dataset.adicionar) alterarQuantidade(botao.dataset.adicionar, +1);
  if (botao.dataset.diminuir) alterarQuantidade(botao.dataset.diminuir, -1);
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
el("horario").textContent = CONFIG.horario;
desenharCardapio();
preencherPagamentos();
atualizarCamposDoFormulario();
