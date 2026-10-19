/*
  cardapio.js — SÓ DADOS, NENHUMA LÓGICA
  --------------------------------------
  Mesmo formato da demo da hamburgueria (veja a explicação completa lá).
  Todos os preços em CENTAVOS (1400 = R$ 14,00).

  A novidade aqui é o "gratis" no grupo de complementos:
    gratis: { conformeGrupo: "tamanho", limites: { "300": 3, ... }, precoExtra: 200 }
    → a quantidade de complementos grátis depende do TAMANHO escolhido;
      cada complemento além do limite custa precoExtra (R$ 2,00).

  E o "escolhasProntas" nos copos da casa: a janela já abre com tudo marcado,
  e o cliente pode mudar o que quiser.

  Cardápio FICTÍCIO para demonstração.
*/

/* ================= GRUPOS DE OPÇÕES DO COPO ================= */

const TAMANHO = {
  id: "tamanho",
  titulo: "Tamanho do copo",
  tipo: "unica",
  obrigatorio: true,
  padrao: "300",
  opcoes: [
    { id: "300", nome: "300 ml · 3 complementos grátis", curto: "300 ml", preco: 1400 },
    { id: "500", nome: "500 ml · 4 complementos grátis", curto: "500 ml", preco: 1900 },
    { id: "700", nome: "700 ml · 5 complementos grátis", curto: "700 ml", preco: 2400 },
  ],
};

const BASE = {
  id: "base",
  titulo: "Base",
  tipo: "unica",
  obrigatorio: true,
  opcoes: [
    { id: "tradicional", nome: "Açaí tradicional", preco: 0 },
    { id: "com-banana", nome: "Açaí batido com banana", preco: 0 },
    { id: "zero", nome: "Açaí zero açúcar", preco: 200 },
    { id: "cupuacu", nome: "Creme de cupuaçu", preco: 0 },
    { id: "meio-a-meio", nome: "Meio açaí, meio cupuaçu", preco: 0 },
  ],
};

const COMPLEMENTOS = {
  id: "complementos",
  titulo: "Complementos",
  tipo: "varias",
  max: 10,
  prefixo: "+ ",
  gratis: { conformeGrupo: "tamanho", limites: { 300: 3, 500: 4, 700: 5 }, precoExtra: 200 },
  opcoes: [
    { id: "granola", nome: "Granola", preco: 0 },
    { id: "leite-po", nome: "Leite em pó", preco: 0 },
    { id: "pacoca", nome: "Paçoca", preco: 0 },
    { id: "banana", nome: "Banana", preco: 0 },
    { id: "morango", nome: "Morango", preco: 0 },
    { id: "kiwi", nome: "Kiwi", preco: 0 },
    { id: "coco", nome: "Coco ralado", preco: 0 },
    { id: "amendoim", nome: "Amendoim triturado", preco: 0 },
    { id: "flocos", nome: "Flocos de arroz", preco: 0 },
    { id: "confete", nome: "Confete de chocolate", preco: 0 },
  ],
};

const CALDA = {
  id: "calda",
  titulo: "Calda (1 grátis)",
  tipo: "unica",
  obrigatorio: true,
  padrao: "sem",
  rotulo: "Calda",
  opcoes: [
    { id: "sem", nome: "Sem calda", preco: 0, resumo: false },
    { id: "leite-condensado", nome: "Leite condensado", curto: "leite condensado", preco: 0 },
    { id: "mel", nome: "Mel", curto: "mel", preco: 0 },
    { id: "chocolate", nome: "Calda de chocolate", curto: "chocolate", preco: 0 },
    { id: "morango", nome: "Calda de morango", curto: "morango", preco: 0 },
  ],
};

const EXTRAS = {
  id: "extras",
  titulo: "Extras pagos",
  tipo: "varias",
  prefixo: "+ ",
  opcoes: [
    { id: "avela", nome: "Creme de avelã", preco: 500 },
    { id: "creme-leite-po", nome: "Creme de leite em pó", preco: 400 },
    { id: "brigadeiro", nome: "Brigadeiro de colher", preco: 400 },
    { id: "doce-leite", nome: "Doce de leite", preco: 300 },
    { id: "wafer", nome: "Wafer picado", preco: 300 },
    { id: "dobro-fruta", nome: "Fruta em dobro", preco: 400 },
  ],
};

const OPCOES_COPO = [TAMANHO, BASE, COMPLEMENTOS, CALDA, EXTRAS];

/* ================= CARDÁPIO ================= */
const CARDAPIO = [
  /* ---------- MONTE O SEU ---------- */
  {
    id: "monte-seu-copo",
    nome: "Monte seu copo",
    descricao: "Escolha tamanho, base, complementos, calda e extras. Do seu jeito, do zero.",
    preco: 0, // o preço vem do tamanho
    grupo: "Monte o seu",
    categoria: "Monte o seu",
    foto: "",
    emoji: "🍇",
    etiqueta: "Mais pedido",
    disponivel: true,
    opcoes: OPCOES_COPO,
  },

  /* ---------- COPOS DA CASA (já vêm montados; dá para mudar tudo) ---------- */
  {
    id: "classico-da-praca",
    nome: "Clássico da praça",
    descricao: "500 ml de açaí tradicional, granola, banana, leite em pó e leite condensado.",
    preco: 0,
    grupo: "Copos da casa",
    categoria: "Copos da casa",
    foto: "",
    emoji: "🍌",
    disponivel: true,
    opcoes: OPCOES_COPO,
    escolhasProntas: { tamanho: ["500"], base: ["tradicional"], complementos: ["granola", "banana", "leite-po"], calda: ["leite-condensado"] },
  },
  {
    id: "tropical",
    nome: "Tropical",
    descricao: "500 ml de açaí com banana, morango, kiwi, coco ralado, granola e mel.",
    preco: 0,
    grupo: "Copos da casa",
    categoria: "Copos da casa",
    foto: "",
    emoji: "🥝",
    disponivel: true,
    opcoes: OPCOES_COPO,
    escolhasProntas: { tamanho: ["500"], base: ["com-banana"], complementos: ["morango", "kiwi", "coco", "granola"], calda: ["mel"] },
  },
  {
    id: "fit",
    nome: "Fit",
    descricao: "300 ml de açaí zero açúcar, granola, banana e morango. Sem calda.",
    preco: 0,
    grupo: "Copos da casa",
    categoria: "Copos da casa",
    foto: "",
    emoji: "🍓",
    disponivel: true,
    opcoes: OPCOES_COPO,
    escolhasProntas: { tamanho: ["300"], base: ["zero"], complementos: ["granola", "banana", "morango"], calda: ["sem"] },
  },
  {
    id: "chocolatra",
    nome: "Chocólatra",
    descricao: "700 ml com confete, paçoca, leite em pó, flocos de arroz, calda de chocolate e creme de avelã.",
    preco: 0,
    grupo: "Copos da casa",
    categoria: "Copos da casa",
    foto: "",
    emoji: "🍫",
    disponivel: true,
    opcoes: OPCOES_COPO,
    escolhasProntas: { tamanho: ["700"], base: ["tradicional"], complementos: ["confete", "pacoca", "leite-po", "flocos"], calda: ["chocolate"], extras: ["avela"] },
  },
  {
    id: "cupuacu-cremoso",
    nome: "Cupuaçu cremoso",
    descricao: "500 ml de creme de cupuaçu, granola, coco ralado e leite condensado.",
    preco: 0,
    grupo: "Copos da casa",
    categoria: "Copos da casa",
    foto: "",
    emoji: "🥥",
    disponivel: false, // ← exemplo de item esgotado
    opcoes: OPCOES_COPO,
    escolhasProntas: { tamanho: ["500"], base: ["cupuacu"], complementos: ["granola", "coco"], calda: ["leite-condensado"] },
  },

  /* ---------- PARA LEVAR ---------- */
  {
    id: "pote-1l",
    nome: "Pote de 1 litro",
    descricao: "Só o creme, para servir em casa. Rende cerca de 4 copos.",
    preco: 3800,
    grupo: "Para levar",
    categoria: "Para levar",
    foto: "",
    emoji: "🫙",
    disponivel: true,
    opcoes: [{ ...BASE, titulo: "Sabor do pote" }],
  },
  {
    id: "pote-2l",
    nome: "Pote de 2 litros",
    descricao: "Para a família ou a festa. Rende cerca de 8 copos.",
    preco: 6900,
    grupo: "Para levar",
    categoria: "Para levar",
    foto: "",
    emoji: "🫙",
    disponivel: true,
    opcoes: [{ ...BASE, titulo: "Sabor do pote" }],
  },
  {
    id: "granola-500g",
    nome: "Granola da casa (500 g)",
    descricao: "A mesma dos copos: aveia, mel, castanhas e uva-passa.",
    preco: 2200,
    grupo: "Para levar",
    categoria: "Para levar",
    foto: "",
    emoji: "🥣",
    disponivel: true,
  },

  /* ---------- BEBIDAS ---------- */
  {
    id: "smoothie",
    nome: "Smoothie de açaí",
    descricao: "400 ml de açaí batido com banana e leite. Para tomar de canudo.",
    preco: 1600,
    grupo: "Bebidas",
    categoria: "Bebidas",
    foto: "",
    emoji: "🥤",
    disponivel: true,
  },
  {
    id: "agua-coco",
    nome: "Água de coco",
    descricao: "300 ml, gelada.",
    preco: 900,
    grupo: "Bebidas",
    categoria: "Bebidas",
    foto: "",
    emoji: "🥥",
    disponivel: true,
  },
  {
    id: "agua",
    nome: "Água mineral",
    descricao: "500 ml, sem gás.",
    preco: 400,
    grupo: "Bebidas",
    categoria: "Bebidas",
    foto: "",
    emoji: "💧",
    disponivel: true,
  },
];
