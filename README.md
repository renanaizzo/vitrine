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
    ├── hamburgueria/          → mesma estrutura, com produtos que têm OPÇÕES
    ├── acai/                  → mesma estrutura e mesmo app.js da hamburgueria
    └── barbearia/             → AGENDAMENTO em vez de sacola (servicos.js no lugar de cardapio.js)
```

As quatro demos são independentes: para fazer o site de um cliente, copie a pasta da demo
mais parecida (sem o `config.local.js`) e troque `config.js`, `cardapio.js` e as cores.

## Produtos com opções (hamburgueria e açaí)

Nessas duas demos, um produto pode ter `opcoes`: ponto da carne, adicionais, combo,
tamanho do copo, complementos... O "+" abre a janela "Monte seu pedido", e o preço
muda conforme as escolhas. Todos os campos estão explicados no começo de
`demos/hamburgueria/js/cardapio.js`.

O `app.js` é **o mesmo arquivo** nas duas pastas. Mudou um? Copie para o outro.

## Barbearia (agendamento)

Em vez de sacola, o cliente escolhe serviços, barbeiro, dia e período, e a mensagem de
agendamento sai pronta para o WhatsApp. Os dados ficam em `demos/barbearia/js/servicos.js`
(serviços com preço em centavos e duração em minutos, e barbeiros). O `app.js` dela é
próprio, não é o mesmo da hamburgueria/açaí. O horário em números (`funcionamento`) aceita
regras diferentes por dia, por exemplo sábado com horário menor.

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

## Como adicionar um produto

Em `cardapio.js`, copie um item parecido e mude os campos. Dois deles definem as abas:

- `grupo` → aba de cima (ex.: `"Pastéis"`)
- `categoria` → aba de baixo, dentro do grupo (ex.: `"Pastéis especiais"`).
  O nome precisa ser **único** no cardápio inteiro.

As abas aparecem na ordem dos itens no arquivo. Um grupo novo vira aba e bloco de atalho sozinho.

## Como ligar e desligar partes da página

Em `config.js`, o objeto `secoes` mostra (`true`) ou esconde (`false`) partes inteiras:

| Chave        | O que some com `false`                                                  |
|--------------|-------------------------------------------------------------------------|
| `festas`     | seção "Festas e eventos" e os pacotes de cento prontos                  |
| `congelados` | produtos congelados, "Como fritar e aquecer" e frases sobre congelados  |
| `sobre`      | seção "Nossa história"                                                  |
| `perguntas`  | perguntas frequentes                                                    |

Como funciona: no HTML, um elemento com `data-secao="congelados"` some quando a chave está `false`;
no `cardapio.js`, um item com `secao: "congelados"` também.

Horário, endereço, taxa e formas de pagamento aparecem em vários lugares, mas são escritos
**só no `config.js`**: no HTML, `data-config="horario"` recebe o valor de `CONFIG.horario`.
O horário existe duas vezes no `config.js`: em texto (`horario`) e em números
(`funcionamento`, usado pelo selo "Aberto agora"). Mudou um, mude o outro.

## Se a página ficar em branco

Aperte **F12** → aba **Console**. O erro vermelho mostra o arquivo e a linha.
O mais comum: vírgula faltando no `cardapio.js`.

## Limitações do pedido por WhatsApp

- O site só **abre** o chat com a mensagem pronta; quem envia é o cliente.
- O cliente pode editar a mensagem: o dono precisa conferir itens e total.
- Não há registro dos pedidos nem pagamento online.
