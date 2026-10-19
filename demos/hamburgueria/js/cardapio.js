/*
  cardapio.js — SÓ DADOS, NENHUMA LÓGICA
  --------------------------------------
  Para trocar um preço, mude só o número aqui. O HTML não precisa ser tocado.
  Todos os preços em CENTAVOS (2800 = R$ 28,00).

  Cada item tem:
    id, nome, descricao, preco (o preço BASE, sem adicionais)
    grupo       → aba de cima (ex.: "Burgers")
    categoria   → aba de baixo, dentro do grupo. Nome ÚNICO no cardápio inteiro.
    emoji, foto (vazio = usa o emoji), disponivel (true/false)
    opcoes      → (opcional) lista de GRUPOS DE OPÇÕES. Com opções, o "+" abre a
                  janela "Monte seu pedido"; sem opções, o "+" já põe na sacola.

  Cada GRUPO DE OPÇÕES tem:
    id          → identificador sem espaço
    titulo      → o que aparece na janela ("Ponto da carne")
    tipo        → "unica" (escolhe uma: bolinha) ou "varias" (escolhe várias: quadradinho)
    obrigatorio → true = não deixa adicionar sem escolher
    max         → (opcional, só "varias") limite de escolhas
    padrao      → (opcional) id da opção que já vem marcada
    rotulo      → (opcional) texto antes da escolha no resumo ("Bebida: Guaraná")
    prefixo     → (opcional) texto antes de cada escolha no resumo ("+ Bacon")
    mostrarSe   → (opcional) só aparece se outro grupo tiver escolha diferente de X.
                  Ex.: { grupo: "combo", diferenteDe: "so-lanche" } → bebida só aparece se virou combo.
    opcoes      → lista de { id, nome, preco } (preco = quanto SOMA; 0 = grátis)
                  resumo: false → a opção não aparece no resumo do pedido (ex.: "Só o lanche")

  Cardápio FICTÍCIO para demonstração.
*/

/* ================= GRUPOS DE OPÇÕES REAPROVEITADOS =================
   Escritos uma vez e usados em vários lanches. Mudou o preço do bacon aqui? Muda em todos. */

const PONTO = {
  id: "ponto",
  titulo: "Ponto da carne",
  tipo: "unica",
  obrigatorio: true,
  padrao: "ao-ponto",
  opcoes: [
    { id: "mal", nome: "Mal passado", preco: 0 },
    { id: "ao-ponto", nome: "Ao ponto", preco: 0 },
    { id: "bem", nome: "Bem passado", preco: 0 },
  ],
};

const ADICIONAIS = {
  id: "adicionais",
  titulo: "Adicionais",
  tipo: "varias",
  max: 6,
  prefixo: "+ ",
  opcoes: [
    { id: "bacon", nome: "Bacon", preco: 500 },
    { id: "cheddar", nome: "Cheddar extra", preco: 400 },
    { id: "ovo", nome: "Ovo", preco: 300 },
    { id: "cebola-caramelizada", nome: "Cebola caramelizada", preco: 400 },
    { id: "onion-no-lanche", nome: "Onion rings no lanche", preco: 500 },
    { id: "jalapeno", nome: "Jalapeño", preco: 300 },
    { id: "blend-extra", nome: "Blend extra 160 g", preco: 1200 },
  ],
};

const RETIRAR = {
  id: "retirar",
  titulo: "Quer tirar algo?",
  tipo: "varias",
  opcoes: [
    { id: "sem-cebola", nome: "Sem cebola", preco: 0 },
    { id: "sem-tomate", nome: "Sem tomate", preco: 0 },
    { id: "sem-alface", nome: "Sem alface", preco: 0 },
    { id: "sem-picles", nome: "Sem picles", preco: 0 },
    { id: "sem-molho", nome: "Sem molho", preco: 0 },
  ],
};

const COMBO = {
  id: "combo",
  titulo: "Vira combo?",
  tipo: "unica",
  obrigatorio: true,
  padrao: "so-lanche",
  opcoes: [
    { id: "so-lanche", nome: "Só o lanche", preco: 0, resumo: false },
    { id: "combo", nome: "Combo: batata P + refri lata", preco: 1600 },
    { id: "combo-grande", nome: "Combo grande: batata G + refri lata", preco: 2200 },
  ],
};

// Só aparece quando o lanche virou combo
const BEBIDA_DO_COMBO = {
  id: "bebida-combo",
  titulo: "Bebida do combo",
  tipo: "unica",
  obrigatorio: true,
  rotulo: "Bebida",
  mostrarSe: { grupo: "combo", diferenteDe: "so-lanche" },
  opcoes: [
    { id: "cola", nome: "Cola", preco: 0 },
    { id: "cola-zero", nome: "Cola zero", preco: 0 },
    { id: "guarana", nome: "Guaraná", preco: 0 },
    { id: "laranja", nome: "Laranja", preco: 0 },
    { id: "agua", nome: "Água sem gás", preco: 0 },
  ],
};

const MOLHO = {
  id: "molho",
  titulo: "Molho",
  tipo: "unica",
  obrigatorio: true,
  rotulo: "Molho",
  opcoes: [
    { id: "da-casa", nome: "Maionese da casa", preco: 0 },
    { id: "barbecue", nome: "Barbecue", preco: 0 },
    { id: "mostarda-mel", nome: "Mostarda e mel", preco: 0 },
  ],
};

// Lanches de carne bovina "alta": têm ponto. Smash e frango não têm (são sempre bem passados).
const OPCOES_BURGER = [PONTO, ADICIONAIS, RETIRAR, COMBO, BEBIDA_DO_COMBO];
const OPCOES_SEM_PONTO = [ADICIONAIS, RETIRAR, COMBO, BEBIDA_DO_COMBO];

/* ================= CARDÁPIO ================= */
const CARDAPIO = [
  /* ---------- BURGERS ---------- */
  {
    id: "classico",
    nome: "Clássico",
    descricao: "Blend bovino 160 g, queijo prato, alface, tomate e molho da casa no pão brioche.",
    preco: 2800,
    grupo: "Burgers",
    categoria: "Clássicos",
    foto: "",
    emoji: "🍔",
    disponivel: true,
    opcoes: OPCOES_BURGER,
  },
  {
    id: "cheese-bacon",
    nome: "Cheese bacon",
    descricao: "Blend 160 g, cheddar derretido e bacon crocante.",
    preco: 3200,
    grupo: "Burgers",
    categoria: "Clássicos",
    foto: "",
    emoji: "🥓",
    disponivel: true,
    opcoes: OPCOES_BURGER,
  },
  {
    id: "salada",
    nome: "Salada",
    descricao: "Blend 160 g, queijo prato, alface, tomate, cebola roxa e picles.",
    preco: 2900,
    grupo: "Burgers",
    categoria: "Clássicos",
    foto: "",
    emoji: "🥬",
    disponivel: true,
    opcoes: OPCOES_BURGER,
  },
  {
    id: "brasa",
    nome: "Brasa",
    descricao: "O da casa: blend 180 g, provolone grelhado, cebola caramelizada e barbecue.",
    preco: 3900,
    grupo: "Burgers",
    categoria: "Especiais",
    foto: "",
    emoji: "🔥",
    disponivel: true,
    opcoes: OPCOES_BURGER,
  },
  {
    id: "duplo-cheddar",
    nome: "Duplo cheddar",
    descricao: "Dois blends de 120 g, muito cheddar cremoso e bacon.",
    preco: 3600,
    grupo: "Burgers",
    categoria: "Especiais",
    foto: "",
    emoji: "🧀",
    disponivel: true,
    opcoes: OPCOES_BURGER,
  },
  {
    id: "monstro",
    nome: "Monstro",
    descricao: "Dois blends de 160 g, bacon, cheddar, onion rings e barbecue. Para quem tem fome.",
    preco: 4800,
    grupo: "Burgers",
    categoria: "Especiais",
    foto: "",
    emoji: "👹",
    disponivel: true,
    opcoes: OPCOES_BURGER,
  },
  {
    id: "chicken-crispy",
    nome: "Chicken crispy",
    descricao: "Sobrecoxa empanada e crocante, maionese de ervas, alface e picles.",
    preco: 3100,
    grupo: "Burgers",
    categoria: "Especiais",
    foto: "",
    emoji: "🍗",
    disponivel: true,
    opcoes: OPCOES_SEM_PONTO,
  },
  {
    id: "veggie",
    nome: "Veggie de grão-de-bico",
    descricao: "Hambúrguer de grão-de-bico, queijo prato, tomate e maionese de ervas.",
    preco: 3000,
    grupo: "Burgers",
    categoria: "Especiais",
    foto: "",
    emoji: "🌱",
    disponivel: false, // ← exemplo de item esgotado
    opcoes: OPCOES_SEM_PONTO,
  },
  {
    id: "smash-simples",
    nome: "Smash simples",
    descricao: "Blend de 90 g prensado na chapa até caramelizar, cheddar e cebola picadinha.",
    preco: 2200,
    grupo: "Burgers",
    categoria: "Smash",
    foto: "",
    emoji: "🍔",
    disponivel: true,
    opcoes: OPCOES_SEM_PONTO,
  },
  {
    id: "smash-duplo",
    nome: "Smash duplo",
    descricao: "Dois smash de 90 g, cheddar duplo e cebola picadinha.",
    preco: 2900,
    grupo: "Burgers",
    categoria: "Smash",
    foto: "",
    emoji: "🍔",
    disponivel: true,
    opcoes: OPCOES_SEM_PONTO,
  },
  {
    id: "smash-triplo",
    nome: "Smash triplo",
    descricao: "Três smash de 90 g, cheddar triplo e bacon.",
    preco: 3500,
    grupo: "Burgers",
    categoria: "Smash",
    foto: "",
    emoji: "🍔",
    disponivel: true,
    opcoes: OPCOES_SEM_PONTO,
  },

  /* ---------- ACOMPANHAMENTOS ---------- */
  {
    id: "batata",
    nome: "Batata frita",
    descricao: "Corte rústico, com casca, sequinha e com sal na medida.",
    preco: 1400,
    grupo: "Acompanhamentos",
    categoria: "Acompanhamentos",
    foto: "",
    emoji: "🍟",
    disponivel: true,
    opcoes: [
      {
        id: "tamanho-batata",
        titulo: "Tamanho",
        tipo: "unica",
        obrigatorio: true,
        padrao: "p",
        opcoes: [
          { id: "p", nome: "Pequena (200 g)", preco: 0 },
          { id: "g", nome: "Grande (400 g)", preco: 800 },
        ],
      },
      {
        id: "cobertura-batata",
        titulo: "Cobertura",
        tipo: "varias",
        prefixo: "+ ",
        opcoes: [
          { id: "cheddar", nome: "Cheddar cremoso", preco: 500 },
          { id: "bacon", nome: "Bacon em cubos", preco: 500 },
          { id: "paprica", nome: "Páprica defumada", preco: 0 },
        ],
      },
    ],
  },
  {
    id: "onion-rings",
    nome: "Onion rings",
    descricao: "Anéis de cebola empanados, 12 unidades.",
    preco: 2000,
    grupo: "Acompanhamentos",
    categoria: "Acompanhamentos",
    foto: "",
    emoji: "🧅",
    disponivel: true,
    opcoes: [MOLHO],
  },
  {
    id: "nuggets",
    nome: "Nuggets (10 unidades)",
    descricao: "Peito de frango empanado, feito aqui.",
    preco: 2200,
    grupo: "Acompanhamentos",
    categoria: "Acompanhamentos",
    foto: "",
    emoji: "🍗",
    disponivel: true,
    opcoes: [MOLHO],
  },

  /* ---------- BEBIDAS ---------- */
  {
    id: "refri",
    nome: "Refrigerante lata",
    descricao: "350 ml, bem gelado.",
    preco: 700,
    grupo: "Bebidas",
    categoria: "Bebidas",
    foto: "",
    emoji: "🥤",
    disponivel: true,
    opcoes: [
      {
        id: "sabor-refri",
        titulo: "Sabor",
        tipo: "unica",
        obrigatorio: true,
        opcoes: [
          { id: "cola", nome: "Cola", preco: 0 },
          { id: "cola-zero", nome: "Cola zero", preco: 0 },
          { id: "guarana", nome: "Guaraná", preco: 0 },
          { id: "laranja", nome: "Laranja", preco: 0 },
        ],
      },
    ],
  },
  {
    id: "agua",
    nome: "Água mineral",
    descricao: "500 ml.",
    preco: 400,
    grupo: "Bebidas",
    categoria: "Bebidas",
    foto: "",
    emoji: "💧",
    disponivel: true,
    opcoes: [
      {
        id: "gas",
        titulo: "Com ou sem gás?",
        tipo: "unica",
        obrigatorio: true,
        opcoes: [
          { id: "sem", nome: "Sem gás", preco: 0 },
          { id: "com", nome: "Com gás", preco: 0 },
        ],
      },
    ],
  },
  {
    id: "limonada-suica",
    nome: "Limonada suíça",
    descricao: "500 ml, limão batido com leite condensado e gelo.",
    preco: 1200,
    grupo: "Bebidas",
    categoria: "Bebidas",
    foto: "",
    emoji: "🍋",
    disponivel: true,
  },
  {
    id: "milkshake",
    nome: "Milkshake",
    descricao: "Sorvete batido na hora, com chantilly.",
    preco: 2200,
    grupo: "Bebidas",
    categoria: "Milkshakes",
    foto: "",
    emoji: "🍨",
    disponivel: true,
    opcoes: [
      {
        id: "sabor-shake",
        titulo: "Sabor",
        tipo: "unica",
        obrigatorio: true,
        opcoes: [
          { id: "chocolate", nome: "Chocolate", preco: 0 },
          { id: "morango", nome: "Morango", preco: 0 },
          { id: "baunilha", nome: "Baunilha", preco: 0 },
          { id: "doce-de-leite", nome: "Doce de leite", preco: 0 },
          { id: "maltado", nome: "Maltado crocante", preco: 200 },
        ],
      },
      {
        id: "tamanho-shake",
        titulo: "Tamanho",
        tipo: "unica",
        obrigatorio: true,
        padrao: "400",
        opcoes: [
          { id: "400", nome: "400 ml", preco: 0 },
          { id: "600", nome: "600 ml", preco: 700 },
        ],
      },
    ],
  },

  /* ---------- SOBREMESAS ---------- */
  {
    id: "brownie",
    nome: "Brownie com sorvete",
    descricao: "Brownie quente, bola de sorvete de creme e calda de chocolate.",
    preco: 1900,
    grupo: "Sobremesas",
    categoria: "Sobremesas",
    foto: "",
    emoji: "🍫",
    disponivel: true,
  },
  {
    id: "petit-gateau",
    nome: "Petit gâteau",
    descricao: "Bolinho com recheio cremoso e sorvete de creme.",
    preco: 2300,
    grupo: "Sobremesas",
    categoria: "Sobremesas",
    foto: "",
    emoji: "🍰",
    disponivel: true,
  },
  {
    id: "cookie",
    nome: "Cookie gigante",
    descricao: "Com gotas de chocolate, crocante na borda e macio no meio.",
    preco: 1200,
    grupo: "Sobremesas",
    categoria: "Sobremesas",
    foto: "",
    emoji: "🍪",
    disponivel: true,
  },
];
