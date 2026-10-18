/*
  cardapio.js — SÓ DADOS, NENHUMA LÓGICA
  --------------------------------------
  Para trocar um preço, mude só o número aqui. O HTML não precisa ser tocado.

  Cada item tem:
    id          → identificador único, sem espaço nem acento (usado pelo carrinho)
    nome        → como aparece para o cliente
    descricao   → texto curto
    preco       → em CENTAVOS (700 = R$ 7,00)
    categoria   → agrupa os itens na tela
    foto        → caminho da imagem (ex.: "img/coxinha.webp"); vazio = usa o emoji
    emoji       → reserva enquanto não há foto
    disponivel  → true (aparece para pedir) ou false (aparece como "esgotado")

  ATENÇÃO: cada item termina com "}," e o último pode terminar só com "}".
  Esqueceu uma vírgula? O site fica em branco. Aperte F12 → aba Console para ver o erro.

  Cardápio FICTÍCIO para demonstração.
*/

const CARDAPIO = [
  {
    id: "coxinha-frango",
    nome: "Coxinha de frango",
    descricao: "Massa macia, frango desfiado temperado e casquinha crocante.",
    preco: 700,
    categoria: "Salgados",
    foto: "",
    emoji: "🍗",
    disponivel: true,
  },
  {
    id: "risole-presunto-queijo",
    nome: "Risole de presunto e queijo",
    descricao: "Recheio cremoso, empanado e frito na hora.",
    preco: 700,
    categoria: "Salgados",
    foto: "",
    emoji: "🧀",
    disponivel: true,
  },
  {
    id: "enroladinho-salsicha",
    nome: "Enroladinho de salsicha",
    descricao: "Salsicha envolvida em massa de pão, assada.",
    preco: 600,
    categoria: "Salgados",
    foto: "",
    emoji: "🌭",
    disponivel: true,
  },
  {
    id: "pao-de-queijo",
    nome: "Pão de queijo (porção com 6)",
    descricao: "Saído do forno, casquinha firme e miolo puxa-puxa.",
    preco: 900,
    categoria: "Salgados",
    foto: "",
    emoji: "🥯",
    disponivel: true,
  },
  {
    id: "pastel-carne",
    nome: "Pastel de carne",
    descricao: "Massa crocante, carne moída temperada e azeitona.",
    preco: 900,
    categoria: "Pastéis",
    foto: "",
    emoji: "🥟",
    disponivel: true,
  },
  {
    id: "pastel-queijo",
    nome: "Pastel de queijo",
    descricao: "Muito queijo derretido, do jeito que puxa.",
    preco: 900,
    categoria: "Pastéis",
    foto: "",
    emoji: "🥟",
    disponivel: true,
  },
  {
    id: "pastel-pizza",
    nome: "Pastel de pizza",
    descricao: "Queijo, presunto, tomate e orégano.",
    preco: 1000,
    categoria: "Pastéis",
    foto: "",
    emoji: "🥟",
    disponivel: true,
  },
  {
    id: "mini-pizza-mussarela",
    nome: "Mini pizza de mussarela",
    descricao: "Massa caseira, molho de tomate, mussarela e orégano.",
    preco: 800,
    categoria: "Mini pizzas e fogazzas",
    foto: "",
    emoji: "🍕",
    disponivel: true,
  },
  {
    id: "mini-pizza-calabresa",
    nome: "Mini pizza de calabresa",
    descricao: "Molho de tomate, calabresa fatiada e cebola.",
    preco: 900,
    categoria: "Mini pizzas e fogazzas",
    foto: "",
    emoji: "🍕",
    disponivel: true,
  },
  {
    id: "fogazza-queijo",
    nome: "Fogazza de queijo",
    descricao: "Massa de pizza fechada e frita, recheada de mussarela.",
    preco: 1200,
    categoria: "Mini pizzas e fogazzas",
    foto: "",
    emoji: "🫓",
    disponivel: true,
  },
  {
    id: "fogazza-calabresa-queijo",
    nome: "Fogazza de calabresa com queijo",
    descricao: "Calabresa moída e mussarela numa massa frita dourada.",
    preco: 1400,
    categoria: "Mini pizzas e fogazzas",
    foto: "",
    emoji: "🫓",
    disponivel: true,
  },
  {
    id: "suco-laranja",
    nome: "Suco de laranja",
    descricao: "500 ml, feito na hora.",
    preco: 900,
    categoria: "Sucos",
    foto: "",
    emoji: "🍊",
    disponivel: false, // ← exemplo de item esgotado
  },
  {
    id: "suco-maracuja",
    nome: "Suco de maracujá",
    descricao: "500 ml, feito na hora.",
    preco: 900,
    categoria: "Sucos",
    foto: "",
    emoji: "🥤",
    disponivel: true,
  },
  {
    id: "suco-limao",
    nome: "Suco de limão",
    descricao: "500 ml, feito na hora.",
    preco: 800,
    categoria: "Sucos",
    foto: "",
    emoji: "🍋",
    disponivel: true,
  },
];
