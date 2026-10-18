/*
  config.js — CONFIGURAÇÕES DO NEGÓCIO
  ------------------------------------
  Tudo que muda de um cliente para outro, mas NÃO é o cardápio, fica aqui.
  Este arquivo ENTRA no Git e vai para a internet, por isso o número é FICTÍCIO.

  O seu número real fica em "config.local.js", que o Git ignora.
*/

const CONFIG = {
  nomeLoja: "Chapa Quente",

  // Número no formato internacional: 55 + DDD + número, só dígitos.
  // Fictício de propósito. Veja config.local.js para os testes.
  whatsapp: "5500000000000",

  // Modo demonstração: em vez de abrir o WhatsApp, só mostra a mensagem pronta.
  // Online fica "true" para ninguém mandar pedido de mentira.
  modoDemo: true,

  // Valores em CENTAVOS (500 = R$ 5,00). Explicação no README.
  taxaEntrega: 500,

  formasPagamento: ["Pix", "Cartão (maquininha na entrega)", "Dinheiro"],

  horario: "Terça a domingo, das 18h às 23h",
};
