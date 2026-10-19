/*
  config.js — CONFIGURAÇÕES DO NEGÓCIO
  ------------------------------------
  Tudo que muda de um cliente para outro, mas NÃO é o cardápio, fica aqui.
  Este arquivo ENTRA no Git e vai para a internet, por isso o número é FICTÍCIO.

  O seu número real fica em "config.local.js", que o Git ignora.
*/

const CONFIG = {
  nomeLoja: "Brasa Burger",

  // Número no formato internacional: 55 + DDD + número, só dígitos.
  // Fictício de propósito. Veja config.local.exemplo.js para os testes.
  whatsapp: "5500000000000",

  // Modo demonstração: em vez de abrir o WhatsApp, só mostra a mensagem pronta.
  // Online fica "true" para ninguém mandar pedido de mentira.
  modoDemo: true,

  // Valores em CENTAVOS (600 = R$ 6,00).
  taxaEntrega: 600,

  formasPagamento: ["Pix", "Cartão (maquininha na entrega)", "Dinheiro"],

  horario: "Terça a domingo, das 18h às 23h30",

  // O mesmo horário em números, para o selo "Aberto agora / Fechado".
  // dias: 0 = domingo, 1 = segunda ... 6 = sábado. Horas com fração: 23.5 = 23h30.
  // Mudou o horário? Mude o texto acima E os números aqui.
  funcionamento: { dias: [0, 2, 3, 4, 5, 6], abre: 18, fecha: 23.5 },

  // Endereço FICTÍCIO
  endereco: "Av. dos Ipês, 1200 · Jardim Primavera",
  cidade: "Campinas (SP)",

  // LIGA/DESLIGA partes da página. true = mostra; false = esconde.
  secoes: {
    perguntas: true,    // perguntas frequentes
  },
};
