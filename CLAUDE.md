# CLAUDE.md

## Como trabalhar comigo
Sou iniciante e quero aprender.
- Me corrija quando eu estiver errado; não concorde com tudo.
- Apresente alternativas com vantagens e desvantagens e diga qual você escolheria e por quê.
- Explique cada passo, o motivo e os termos técnicos.
- Diga como eu posso verificar/testar cada resultado.
- Antes de editar arquivos ou rodar comandos, me avise e peça permissão.
- Faça uma tarefa de cada vez.

## O projeto
Vitrine de landing pages com pedido por WhatsApp, em HTML + CSS + JS puro, sem framework.
Todos os negócios são fictícios. Estrutura e instruções: ver README.md.

- `demos/lanchonete` ("Esquina do Salgado"): pronta, use como referência de padrão.
  Vende salgados, pastéis, mini pizzas, fogazzas, pão de queijo e sucos.
  NÃO vende hambúrguer (isso é da hamburgueria, para as demos não se repetirem).
- Próximas: `demos/hamburgueria` (adicionais e combos que mudam o preço) e
  `demos/acai` (monte seu copo: tamanho, complementos grátis até um limite, extras pagos).
- Demos podem se inspirar em negócios reais (produtos, faixa de preço), mas nunca copiar
  nome, marca, textos ou fotos.

## Regras do projeto
- Preços sempre em **centavos** (1800 = R$ 18,00).
- `config.js` tem número **fictício** e `modoDemo: true`. É o que vai online.
- `config.local.js` tem o número real, está no `.gitignore` e **NUNCA** pode entrar no Git.
  - Nunca leia, copie nem escreva o número real em outro arquivo.
  - Antes de qualquer commit, confira no `git status` que nenhum arquivo com dado real aparece
    (atenção a cópias como "config.local.exemplo copy.js", que o .gitignore NÃO cobre).
