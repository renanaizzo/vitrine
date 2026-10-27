/*
  app.js — LÓGICA DA DEMO "BARBEARIA DO LARGO" · Renan Aizzo
  Cada bloco corresponde a uma parte da página.
*/

/* ===== HEADER: selo "Aberto agora / Fechado" ===== */
(function seloAberto() {
  // Dois selos com o mesmo texto: no header (desktop) e no hero (celular)
  const selos = [document.getElementById("selo"), document.getElementById("selo-hero")].filter(Boolean);
  const textos = [document.getElementById("selo-texto"), document.getElementById("selo-hero-texto")].filter(Boolean);
  if (!selos.length || !CONFIG.funcionamento) return;
  const mostrar = (msg, aberto) => {
    textos.forEach((t) => (t.textContent = msg));
    if (aberto) selos.forEach((s) => s.classList.add("selo--aberto"));
  };

  const nomesDias = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
  const hora = (h) => (h % 1 ? `${Math.floor(h)}h${String(Math.round((h % 1) * 60)).padStart(2, "0")}` : `${h}h`);
  const regraDoDia = (dia) => CONFIG.funcionamento.find((r) => r.dias.includes(dia));

  const agora = new Date();
  const dia = agora.getDay();
  const horaAgora = agora.getHours() + agora.getMinutes() / 60;
  const hoje = regraDoDia(dia);

  if (hoje && horaAgora >= hoje.abre && horaAgora < hoje.fecha) {
    mostrar(`Aberto agora · até ${hora(hoje.fecha)}`, true);
    return;
  }

  // Fechado: procura a próxima abertura (hoje mais tarde ou nos próximos 7 dias)
  for (let i = 0; i < 8; i++) {
    const d = (dia + i) % 7;
    const regra = regraDoDia(d);
    if (!regra || (i === 0 && horaAgora >= regra.abre)) continue;
    const quando = i === 0 ? "hoje" : i === 1 ? "amanhã" : nomesDias[d];
    mostrar(`Fechado · abre ${quando} às ${hora(regra.abre)}`);
    return;
  }
  mostrar("Fechado");
})();

/* ===== GERAL: textos que vêm do config.js (data-config="horario" etc.) ===== */
document.querySelectorAll("[data-config]").forEach((el) => {
  const valor = CONFIG[el.dataset.config];
  if (valor !== undefined) el.textContent = valor;
});

/* ===== GERAL: dinheiro e estado ===== */
const reais = (centavos) => (centavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const escolhidos = new Set();   // ids dos serviços escolhidos (usado também no agendamento)
const aoMudarEscolha = [];      // funções avisadas quando a escolha muda

function alternarServico(id) {
  escolhidos.has(id) ? escolhidos.delete(id) : escolhidos.add(id);
  aoMudarEscolha.forEach((fn) => fn());
}

/* ===== SERVIÇOS ===== */
(function listaServicos() {
  const lista = document.getElementById("lista-servicos");
  if (!lista) return;
  // Ícone Lucide "clock"
  const relogio = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>';

  lista.innerHTML = SERVICOS.map((s) => `
    <li class="servico" data-id="${s.id}">
      <h3 class="servico__nome">${s.nome}</h3>
      <span class="servico__preco">${reais(s.preco)}</span>
      <p class="servico__desc">${s.descricao}</p>
      <div class="servico__rodape">
        <span class="servico__tempo">${relogio} ${s.minutos} min</span>
        <button type="button" class="btn servico__botao" aria-pressed="false" aria-label="Escolher ${s.nome}">Escolher</button>
      </div>
    </li>`).join("");

  lista.addEventListener("click", (e) => {
    const botao = e.target.closest(".servico__botao");
    if (botao) alternarServico(botao.closest(".servico").dataset.id);
  });

  aoMudarEscolha.push(() => {
    lista.querySelectorAll(".servico").forEach((li) => {
      const ativo = escolhidos.has(li.dataset.id);
      li.classList.toggle("servico--escolhido", ativo);
      const b = li.querySelector(".servico__botao");
      b.textContent = ativo ? "Escolhido" : "Escolher";
      b.setAttribute("aria-pressed", ativo);
    });
  });
})();

/* ===== BARBEIROS ===== */
let barbeiroEscolhido = "";     // "" = sem preferência
(function listaBarbeiros() {
  const lista = document.getElementById("lista-barbeiros");
  if (!lista) return;

  lista.innerHTML = BARBEIROS.map((b) => `
    <li class="barbeiro">
      ${b.foto
        ? `<img class="barbeiro__foto" src="${b.foto}" alt="${b.nome}" width="96" height="96" loading="lazy" data-inicial="${b.nome[0]}">`
        : `<span class="barbeiro__foto" aria-hidden="true" title="[PREENCHER: foto real]">${b.nome[0]}</span>`}
      <div>
        <h3 class="barbeiro__nome">${b.nome}</h3>
        <p class="barbeiro__esp">${b.especialidade}</p>
      </div>
      <a class="btn barbeiro__botao" href="#agendar" data-barbeiro="${b.id}">Agendar com ${b.nome}</a>
    </li>`).join("");

  lista.addEventListener("click", (e) => {
    const link = e.target.closest("[data-barbeiro]");
    if (!link) return;
    barbeiroEscolhido = link.dataset.barbeiro;
    const campo = document.getElementById("campo-barbeiro");
    if (campo) campo.value = barbeiroEscolhido;
  });
})();

/* ===== AGENDAMENTO ===== */
(function agendamento() {
  const form = document.getElementById("form-agendar");
  if (!form) return;
  const $ = (id) => document.getElementById(id);
  const campoBarbeiro = $("campo-barbeiro"), campoDia = $("campo-dia"), campoPeriodo = $("campo-periodo");
  const erro = $("form-erro"), revisao = $("revisao");

  // Barbeiros no <select>
  BARBEIROS.forEach((b) => campoBarbeiro.add(new Option(b.nome, b.id)));
  campoBarbeiro.value = barbeiroEscolhido;

  // Datas: de hoje até 30 dias (formato AAAA-MM-DD, no fuso local)
  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const hoje = new Date();
  campoDia.min = iso(hoje);
  campoDia.max = iso(new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 30));

  // Resumo dos serviços escolhidos
  function atualizarResumo() {
    const itens = SERVICOS.filter((s) => escolhidos.has(s.id));
    $("resumo-servicos").innerHTML = itens.map((s) => `
      <li class="resumo__item">
        <span>${s.nome} · ${reais(s.preco)}</span>
        <button type="button" class="resumo__tirar" data-tirar="${s.id}" aria-label="Tirar ${s.nome}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </li>`).join("");
    $("resumo-vazio").hidden = itens.length > 0;
    const total = $("resumo-total");
    total.hidden = !itens.length;
    if (itens.length) {
      const preco = itens.reduce((t, s) => t + s.preco, 0);
      const min = itens.reduce((t, s) => t + s.minutos, 0);
      total.innerHTML = `Total: <strong>${reais(preco)}</strong> · cerca de ${min} min`;
    }
  }
  aoMudarEscolha.push(atualizarResumo);
  atualizarResumo();
  $("resumo-servicos").addEventListener("click", (e) => {
    const b = e.target.closest("[data-tirar]");
    if (b) alternarServico(b.dataset.tirar);
  });

  // Faixas de cada período (horas) para checar com o horário de funcionamento
  const PERIODOS = { manha: { nome: "manhã", de: 8, ate: 12 }, tarde: { nome: "tarde", de: 12, ate: 18 }, noite: { nome: "noite", de: 18, ate: 24 } };
  const nomesDias = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];

  function validar() {
    if (!escolhidos.size) return "Escolha pelo menos um serviço na lista acima.";
    if (!campoDia.value) return "Escolha o dia.";
    const [a, m, d] = campoDia.value.split("-").map(Number);
    const data = new Date(a, m - 1, d);
    const regra = CONFIG.funcionamento.find((r) => r.dias.includes(data.getDay()));
    if (!regra) return `Não abrimos ${nomesDias[data.getDay()]}. ${CONFIG.horario}.`;
    const p = PERIODOS[campoPeriodo.value];
    if (p.ate <= regra.abre || p.de >= regra.fecha) return `Nesse dia não atendemos à ${p.nome}. ${CONFIG.horario}.`;
    if (!$("campo-nome").value.trim()) return "Diga seu nome para a barbearia saber quem vem.";
    return "";
  }

  function montarMensagem() {
    const itens = SERVICOS.filter((s) => escolhidos.has(s.id));
    const [a, m, d] = campoDia.value.split("-").map(Number);
    const data = new Date(a, m - 1, d);
    const barbeiro = BARBEIROS.find((b) => b.id === campoBarbeiro.value);
    const obs = $("campo-obs").value.trim();
    return [
      `Olá, ${CONFIG.nomeLoja}! Quero agendar:`,
      ...itens.map((s) => `• ${s.nome} (${s.minutos} min) – ${reais(s.preco)}`),
      `Total: ${reais(itens.reduce((t, s) => t + s.preco, 0))} · cerca de ${itens.reduce((t, s) => t + s.minutos, 0)} min`,
      ``,
      `Barbeiro: ${barbeiro ? barbeiro.nome : "sem preferência"}`,
      `Dia: ${nomesDias[data.getDay()]}, ${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}`,
      `Período: ${PERIODOS[campoPeriodo.value].nome}`,
      `Nome: ${$("campo-nome").value.trim()}`,
      ...(obs ? [`Observação: ${obs}`] : []),
      ``,
      `Pode confirmar o horário?`,
    ].join("\n");
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const msg = validar();
    erro.textContent = msg;
    erro.hidden = !msg;
    if (msg) return;

    const texto = montarMensagem();
    $("previa-mensagem").textContent = texto;
    const link = $("link-whatsapp");
    link.href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(texto)}`;
    link.hidden = CONFIG.modoDemo;
    $("nota-demo").hidden = !CONFIG.modoDemo;
    revisao.showModal();
  });
  $("botao-voltar").addEventListener("click", () => revisao.close());
})();

/* ===== GERAL: liga/desliga seções (data-secao + CONFIG.secoes) ===== */
document.querySelectorAll("[data-secao]").forEach((el) => {
  if (CONFIG.secoes && CONFIG.secoes[el.dataset.secao] === false) el.hidden = true;
});

/* ===== LOCAL: pagamentos e link do mapa ===== */
(function local() {
  const pag = document.getElementById("pagamentos");
  if (pag && CONFIG.formasPagamento) pag.textContent = CONFIG.formasPagamento.join(" · ");
  const mapa = document.getElementById("link-mapa");
  if (mapa) mapa.href = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(`${CONFIG.endereco}, ${CONFIG.cidade}`);
})();

/* ===== ACABAMENTO: foto que falhou vira a inicial (estado de erro) ===== */
document.addEventListener("error", (e) => {
  const img = e.target;
  if (!(img instanceof HTMLImageElement) || !img.dataset.inicial) return;
  const vazio = document.createElement("span");
  vazio.className = img.className;
  vazio.setAttribute("aria-hidden", "true");
  vazio.textContent = img.dataset.inicial;
  img.replaceWith(vazio);
}, true);
