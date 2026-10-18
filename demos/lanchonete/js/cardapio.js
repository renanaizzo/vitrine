/*
  cardapio.js — SÓ DADOS, NENHUMA LÓGICA
  --------------------------------------
  Para trocar um preço, mude só o número aqui. O HTML não precisa ser tocado.

  Cada item tem:
    id          → identificador único, sem espaço nem acento (usado pelo carrinho)
    nome        → como aparece para o cliente
    descricao   → texto curto
    preco       → em CENTAVOS (1800 = R$ 18,00)
    categoria   → agrupa os itens na tela
    foto        → caminho da imagem (ex.: "img/x-burguer.webp"); vazio = usa o emoji
    emoji       → reserva enquanto não há foto
    disponivel  → true (aparece para pedir) ou false (aparece como "esgotado")

  ATENÇÃO: cada item termina com "}," e o último pode terminar só com "}".
  Esqueceu uma vírgula? O site fica em branco. Aperte F12 → aba Console para ver o erro.

  Cardápio FICTÍCIO para demonstração.
*/

const CARDAPIO = [
  {
    id: "x-burguer",
    nome: "X-Burguer",
    descricao: "Pão, hambúrguer de 120 g, queijo e maionese da casa.",
    preco: 1800,
    categoria: "Lanches",
    foto: "",
    emoji: "🍔",
    disponivel: true,
  },
  {
    id: "x-salada",
    nome: "X-Salada",
    descricao: "O X-Burguer com alface, tomate e cebola roxa.",
    preco: 2000,
    categoria: "Lanches",
    foto: "",
    emoji: "🥬",
    disponivel: true,
  },
  {
    id: "x-tudo",
    nome: "X-Tudo",
    descricao: "Dois hambúrgueres, bacon, ovo, presunto, queijo e salada.",
    preco: 2800,
    categoria: "Lanches",
    foto: "",
    emoji: "🍳",
    disponivel: true,
  },
  {
    id: "misto-quente",
    nome: "Misto quente",
    descricao: "Pão de forma na chapa com presunto e queijo.",
    preco: 1000,
    categoria: "Lanches",
    foto: "",
    emoji: "🥪",
    disponivel: true,
  },
  {
    id: "pastel-carne",
    nome: "Pastel de carne",
    descricao: "Massa crocante, carne moída temperada e azeitona.",
    preco: 900,
    categoria: "Porções e salgados",
    foto: "",
    emoji: "🥟",
    disponivel: true,
  },
  {
    id: "porcao-batata",
    nome: "Porção de batata",
    descricao: "400 g de batata frita sequinha. Serve duas pessoas.",
    preco: 2200,
    categoria: "Porções e salgados",
    foto: "",
    emoji: "🍟",
    disponivel: true,
  },
  {
    id: "refri-lata",
    nome: "Refrigerante lata",
    descricao: "350 ml. Pergunte os sabores no WhatsApp.",
    preco: 600,
    categoria: "Bebidas",
    foto: "",
    emoji: "🥤",
    disponivel: true,
  },
  {
    id: "suco-laranja",
    nome: "Suco de laranja",
    descricao: "500 ml, feito na hora.",
    preco: 900,
    categoria: "Bebidas",
    foto: "",
    emoji: "🍊",
    disponivel: false, // ← exemplo de item esgotado
  },
];
