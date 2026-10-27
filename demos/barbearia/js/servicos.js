/*
  servicos.js — SÓ OS DADOS (serviços e barbeiros). Demo fictícia · Renan Aizzo
  Preços em CENTAVOS (4500 = R$ 45,00). Duração em minutos.
*/

const SERVICOS = [
  { id: "corte",      nome: "Corte",                       descricao: "Tesoura e máquina, lavagem e finalização.",          preco: 4500, minutos: 40 },
  { id: "barba",      nome: "Barba com toalha quente",     descricao: "Toalha quente, navalha e balm no final.",            preco: 3500, minutos: 30 },
  { id: "combo",      nome: "Corte + barba",               descricao: "Os dois juntos, numa sessão só.",                    preco: 7000, minutos: 70 },
  { id: "pezinho",    nome: "Pezinho e acabamento",        descricao: "Contorno da nuca e das costeletas entre um corte e outro.", preco: 1500, minutos: 15 },
  { id: "sobrancelha",nome: "Sobrancelha na navalha",      descricao: "Limpeza rápida, sem afinar demais.",                 preco: 1500, minutos: 10 },
  { id: "infantil",   nome: "Corte infantil (até 12 anos)",descricao: "Com calma e cadeira com assento elevado.",           preco: 3500, minutos: 30 },
  { id: "pigmentacao",nome: "Pigmentação de barba",        descricao: "Preenche falhas e uniformiza a cor.",                preco: 3000, minutos: 30 },
];

// Fotos: [PREENCHER] — sem foto, a página mostra a inicial do nome.
const BARBEIROS = [
  { id: "toninho", nome: "Toninho", especialidade: "Barba clássica e navalha", foto: "" },
  { id: "rafa",    nome: "Rafa",    especialidade: "Degradê e cortes modernos", foto: "" },
  { id: "juliano", nome: "Juliano", especialidade: "Corte social e infantil",   foto: "" },
];
