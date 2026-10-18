# Vitrine de landing pages

Exemplos de sites para o comércio local com pedido pelo WhatsApp.
Todos os negócios são **fictícios**.

## Estrutura

```
vitrine/
├── index.html                 → a vitrine (cartões das demos)
├── css/vitrine.css            → aparência da vitrine
└── demos/
    └── lanchonete/
        ├── index.html         → esqueleto da página
        ├── css/estilos.css    → aparência
        ├── img/               → fotos dos produtos (.webp)
        └── js/
            ├── config.js                → nome, número FICTÍCIO, taxa, pagamentos
            ├── config.local.exemplo.js  → modelo para o seu número de teste
            ├── config.local.js          → SEU número (ignorado pelo Git; você cria)
            ├── cardapio.js              → só os dados do cardápio
            └── app.js                   → a lógica (carrinho, mensagem, WhatsApp)
```

## Como abrir

Dê dois cliques em `index.html`. Não precisa de servidor, porque o cardápio está
num arquivo `.js` (e não `.json`), que o navegador carrega mesmo direto do disco.

## Como testar o pedido com o seu número

1. Em `demos/lanchonete/js/`, copie `config.local.exemplo.js` e renomeie a cópia para `config.local.js`.
2. Troque `55DDDNUMERO` pelo seu número (55 + DDD + número, só dígitos).
3. Recarregue a página. Agora o botão abre o WhatsApp de verdade.
4. Confira com `git status`: o `config.local.js` **não** pode aparecer na lista.

## Como trocar um preço

Abra `demos/lanchonete/js/cardapio.js` e mude o número de `preco`.
Os preços ficam em **centavos** (`1800` = R$ 18,00). Isso evita erros de conta com vírgula:
no JavaScript, `0.1 + 0.2` dá `0.30000000000000004`, enquanto `10 + 20` dá exatamente `30`.

## Se a página ficar em branco

Aperte **F12** → aba **Console**. O erro vermelho mostra o arquivo e a linha.
O mais comum: vírgula faltando no `cardapio.js`.

## Limitações do pedido por WhatsApp

- O site só **abre** o chat com a mensagem pronta; quem envia é o cliente.
- O cliente pode editar a mensagem: o dono precisa conferir itens e total.
- Não há registro dos pedidos nem pagamento online.
