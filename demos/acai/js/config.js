/*
  config.js — CONFIGURAÇÕES DO NEGÓCIO
  ------------------------------------
  Tudo que muda de um cliente para outro, mas NÃO é o cardápio, fica aqui.
  Este arquivo ENTRA no Git e vai para a internet, por isso o número é FICTÍCIO.

  O seu número real fica em "config.local.js", que o Git ignora.
*/

const CONFIG = {
  nomeLoja: "Açaí da Praça",

  // Número no formato internacional: 55 + DDD + número, só dígitos.
  // Fictício de propósito. Veja config.local.exemplo.js para os testes.
  whatsapp: "5500000000000",

  // Modo demonstração: em vez de abrir o WhatsApp, só mostra a mensagem pronta.
  modoDemo: true,

  // Valores em CENTAVOS (500 = R$ 5,00).
  taxaEntrega: 500,

  formasPagamento: ["Pix", "Cartão (maquininha na entrega)", "Dinheiro"],

  horario: "Todos os dias, das 12h às 22h",

  // O mesmo horário em números, para o selo "Aberto agora / Fechado".
  // dias: 0 = domingo ... 6 = sábado. Mudou o horário? Mude o texto acima E os números aqui.
  funcionamento: { dias: [0, 1, 2, 3, 4, 5, 6], abre: 12, fecha: 22 },

  // Endereço FICTÍCIO
  endereco: "Praça das Acácias, 45 · Centro",
  cidade: "Santos (SP)",

  // LIGA/DESLIGA partes da página. true = mostra; false = esconde.
  secoes: {
    perguntas: true,    // perguntas frequentes
  },
};
