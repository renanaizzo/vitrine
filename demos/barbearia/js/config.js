/*
  config.js — CONFIGURAÇÕES DO NEGÓCIO (demo "Barbearia do Largo")
  Entra no Git e vai para a internet: número FICTÍCIO.
  Seu número real fica em "config.local.js", que o Git ignora.
*/

const CONFIG = {
  nomeLoja: "Barbearia do Largo",

  // 55 + DDD + número, só dígitos. Fictício de propósito.
  whatsapp: "5500000000000",

  // true = só mostra a mensagem pronta, sem abrir o WhatsApp.
  modoDemo: true,

  horario: "Terça a sexta, das 9h às 20h · Sábado, das 8h às 17h",

  // O mesmo horário em números, para o selo "Aberto agora".
  // dias: 0 = domingo ... 6 = sábado. Mudou o texto acima? Mude aqui também.
  funcionamento: [
    { dias: [2, 3, 4, 5], abre: 9, fecha: 20 },
    { dias: [6], abre: 8, fecha: 17 },
  ],

  formasPagamento: ["Pix", "Cartão de débito e crédito", "Dinheiro"],

  // Endereço FICTÍCIO
  endereco: "Largo da Matriz, 45 · Centro",
  cidade: "Sorocaba (SP)",

  // LIGA/DESLIGA partes da página. true = mostra; false = esconde.
  secoes: {
    galeria: true,
    perguntas: true,
  },
};
