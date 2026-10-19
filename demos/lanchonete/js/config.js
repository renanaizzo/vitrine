/*
  config.js — CONFIGURAÇÕES DO NEGÓCIO
  ------------------------------------
  Tudo que muda de um cliente para outro, mas NÃO é o cardápio, fica aqui.
  Este arquivo ENTRA no Git e vai para a internet, por isso o número é FICTÍCIO.

  O seu número real fica em "config.local.js", que o Git ignora.
*/

const CONFIG = {
  nomeLoja: "Esquina do Salgado",

  // Número no formato internacional: 55 + DDD + número, só dígitos.
  // Fictício de propósito. Veja config.local.js para os testes.
  whatsapp: "5500000000000",

  // Modo demonstração: em vez de abrir o WhatsApp, só mostra a mensagem pronta.
  // Online fica "true" para ninguém mandar pedido de mentira.
  modoDemo: true,

  // Valores em CENTAVOS (350 = R$ 3,50). Explicação no README.
  taxaEntrega: 350,

  formasPagamento: ["Pix", "Cartão (maquininha na entrega)", "Dinheiro"],

  horario: "Segunda a sábado, das 9h às 19h",

  // O mesmo horário em números, para o selo "Aberto agora / Fechado" do topo.
  // dias: 0 = domingo, 1 = segunda ... 6 = sábado. Horas de 0 a 24.
  // Mudou o horário? Mude o texto acima E os números aqui.
  funcionamento: { dias: [1, 2, 3, 4, 5, 6], abre: 9, fecha: 19 },
};
