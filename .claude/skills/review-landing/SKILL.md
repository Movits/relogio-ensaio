---
name: review-landing
description: Revisão só de leitura de uma landing page ou site estático (HTML, CSS, JavaScript, Vite, GSAP). Roda o build, abre o site num Chrome de verdade em 1440, 768 e 390 px, mede erros de console, imagens, títulos, rolagem lateral, peso, foco, reduced-motion e "sem JavaScript", olha as capturas e devolve uma tabela com nota de 0 a 10 por área (visual, responsividade, acessibilidade, performance, animações, código), as 3 prioridades e o que não deu para verificar. Use sempre que chamarem /review-landing ou pedirem para revisar, auditar ou conferir a landing, o site ou a página ("revisa a landing", "revisa o site", "o site tá bom?", "dá uma olhada no site antes da PR", "checa o celular e a acessibilidade da página"), mesmo sem a palavra "revisão". Não altera o código: propõe correções e oferece aplicá-las depois.
---

# Revisar a landing

Revise a página como alguém de fora: meça o que dá para medir, olhe o que precisa de olho e entregue um
relatório curto, com nota e evidência por área.

**Só leitura.** Não edite arquivos do projeto, não instale pacotes e não rode comandos git que mudam algo.
A única coisa que a revisão cria é a pasta `review-landing/` (capturas e `resultado.json`).
Por quê: revisar e corrigir são etapas separadas. A pessoa lê a lista, escolhe o que faz sentido e só então
você aplica. Assim ninguém perde trabalho por uma "melhoria" que não pediu.

- Se quem chamou passou uma URL (`/review-landing http://localhost:5173/`), use essa URL.
- Se o pedido trouxer um formato de relatório próprio, siga o pedido; o formato daqui é o padrão.

## Passo a passo

**1. Entender o projeto.** Leia `CLAUDE.md`, `README.md` e `package.json` (scripts e dependências), veja as
pastas e o `index.html`. Anote como o site roda, a `base` do `vite.config.js` (ela entra na URL: base
`/sonora/` vira `http://localhost:4173/sonora/`) e as regras do projeto (ex.: "nada de CDN").
Por quê: uma revisão justa compara o site com as regras que o próprio projeto escolheu, não só com o seu gosto.

**2. Rodar o build.** `npm run build`. Se falhar, esse já é o achado número 1: anote o erro e continue com o
que der (o `npm run dev` ainda pode funcionar). Site sem build (HTML puro): pule.
Por quê: o build é o que vai para o ar. Erro aqui é site quebrado em produção.

**3. Subir o site.** Se já houver um servidor rodando, use-o. Senão, rode `npm run preview` em segundo plano
(Vite: porta 4173); sem preview, use `npm run dev`. Lembre o que você subiu, para desligar no fim.
Por quê preview: ele serve a versão final (`dist/`), igual à publicada; o dev tem atalhos de desenvolvimento.

**4. Rodar o script de checagem**, na raiz do projeto:

```bash
node .claude/skills/review-landing/scripts/checar.mjs http://localhost:4173/
```

Se a skill estiver em `~/.claude/skills/`, troque o caminho pelo da pasta desta skill (o Claude Code mostra
como "Base directory" ao carregá-la). O script precisa do `@playwright/test` no projeto e do Google Chrome.
Se faltar, ele explica como instalar. Instalar muda o `package.json`: **pergunte antes**. Se a pessoa não
quiser, revise só pelo código e registre isso em "o que não consegui verificar".

| O script mede | Serve para a área |
|---|---|
| erros de console e de JavaScript, respostas 404, falhas de rede | Código |
| imagens quebradas, sem `alt`, `alt` vazio, `loading="lazy"` | Acessibilidade, Performance |
| rolagem lateral (`scrollWidth > innerWidth`) e quem passa da largura | Responsividade |
| títulos h1-h3 em ordem, quantos h1, pulos de nível | Acessibilidade |
| campos sem rótulo, links e botões sem nome, foco com Tab | Acessibilidade |
| peso da 1ª carga e depois de rolar, por tipo, 5 maiores, domínios externos | Performance, Código |
| texto invisível com "reduzir movimento" e com JavaScript desligado | Animações |

Leia o fim do resumo antes de seguir. Se aparecer **"a revisão ficou INCOMPLETA"** (o script também sai com
código 1) ou um "Avisos do script" sobre uma largura ou variação, o que faltou vai para "O que não consegui
verificar" e **não recebe nota**. Por quê: "0 erros" numa tela que nem abriu não é evidência de nada.

**5. Olhar as capturas** em `review-landing/` com a ferramenta de leitura de arquivos (só as que o resumo
listou em "Capturas", que são desta execução). No mínimo:
`desktop-1.jpg`, `tablet-1.jpg` e `celular-1.jpg` (a primeira tela), duas ou três do meio no celular,
`reduzido-desktop.jpg`, `sem-js-desktop.jpg` e `foco-desktop.jpg`. Procure texto cortado ou encostado na
borda, botão escondido, contraste fraco, imagem esticada, seções desalinhadas.
Cuidado: a captura de uma página com animação de scroll mostra um instante. Se algo parecer estranho,
confirme no código antes de chamar de defeito.

**6. Ler o código que explica os números.** Use `grep` e leitura: CSS, JS e `index.html` (critérios abaixo).
Um número sem causa vira uma correção chutada.

**7. Escrever o relatório** (formato no fim) e **desligar o servidor** que você subiu. Depois confira se
a porta ficou livre: no Windows, encerrar o `npm`/`npx` às vezes deixa o processo do Vite vivo.

## Os critérios, e por que cada um importa

### Visual
- **Hierarquia:** em 5 segundos dá para saber o que é, para quem e o que fazer? Um título principal e uma
  ação principal por tela. *Por quê:* o visitante decide em segundos se fica.
- **Contraste:** texto normal com pelo menos 4,5:1 sobre o fundo; texto grande, 3:1 (WCAG AA). Calcule com as
  cores do CSS (tokens). Texto sobre foto: julgue pela captura e diga que não foi medido. *Por quê:* texto
  apagado some no sol, no projetor e para quem enxerga pouco.
- **Tipografia:** poucas famílias, corpo com pelo menos 16 px, linhas de 45 a 75 caracteres, entrelinha
  confortável. *Por quê:* ler cansa menos e a página parece cuidada.
- **Espaçamento e consistência:** mesmo ritmo entre seções; botões, cantos e cores iguais em toda a página,
  vindos dos tokens. *Por quê:* consistência passa confiança; cada exceção parece erro.

### Responsividade
- 1440, 768 e 390 px **sem rolagem lateral**, nada cortado, botões fáceis de tocar (cerca de 44 px).
  *Por quê:* a maioria visita pelo celular, e página que "balança" para os lados parece quebrada.

### Acessibilidade
- **alt:** imagem com informação tem `alt` que descreve; imagem decorativa tem `alt=""` (vazio está certo).
  *Por quê:* é o que o leitor de tela fala para quem não vê a imagem.
- **Títulos:** um `h1`, `h2` por seção, `h3` dentro dela, sem pular nível. *Por quê:* os títulos são o índice
  da página para quem navega por leitor de tela e para o Google.
- **Foco visível:** apertando Tab, sempre dá para ver onde se está. *Por quê:* muita gente usa só o teclado.
- **Rótulos:** todo campo e todo botão tem nome (texto, `<label>` ou `aria-label`). *Por quê:* "botão" sem
  nome não diz nada a quem ouve a página.
- **prefers-reduced-motion:** com "reduzir movimento" ligado no sistema, nada grande se mexe e nada some.
  *Por quê:* movimento forte pode causar tontura e enjoo.

### Performance
- **Imagens:** WebP ou AVIF, no tamanho em que aparecem, `loading="lazy"` nas que estão fora da primeira
  tela, e **sem** lazy na imagem principal do topo. *Por quê:* imagem é quase sempre o que mais pesa.
- **Peso da 1ª carga:** quanto menor, melhor; acima de 2 MB já pesa no 4G. Veja o que carrega antes de a
  pessoa rolar. *Por quê:* cada MB custa segundos e o plano de dados de quem visita.
- **JS e fontes:** JavaScript enxuto; fontes locais, só os pesos usados. *Por quê:* tudo isso atrasa a
  primeira tela.
- O número vem do servidor local. Em produção pode mudar (compressão, cache, CDN da hospedagem).

### Animações
- **Só `transform` e `opacity`.** Procure `transition`, `@keyframes` e chamadas do GSAP mexendo em `top`,
  `left`, `width`, `height` ou `margin`. *Por quê:* essas propriedades fazem o navegador recalcular a página
  a cada quadro, e a animação engasga.
- **Hover com movimento só com mouse:** dentro de `@media (hover: hover) and (pointer: fine)`. *Por quê:* no
  celular o hover "gruda" depois do toque.
- **Reduced-motion e sem JavaScript:** o script mostra se algum texto fica invisível. O padrão seguro é só
  esconder para animar depois que o JS marcou a página (ex.: classe `.js` no `<html>`). *Por quê:* se o JS
  falhar (erro, rede ruim, bloqueador), a página não pode ficar em branco.
- **Propósito:** cada animação ajuda a entender ou só enfeita? Isso é opinião: marque como [opinião].

### Código
- **Organização:** pastas claras (conteúdo, estilos, scripts, imagens), sem arquivos soltos ou duplicados.
- **Sem CDN não declarada:** procure `<script src="https://`, `@import url(` e veja "domínios externos" no
  script. *Por quê:* o site passa a depender do servidor de outra pessoa e deixa de funcionar sem internet.
- **Sem segredos:** procure chaves no código e no `dist/` (`api_key`, `secret`, `token`, `sk-`) e confira se o
  `.env` está no `.gitignore`. **Não abra o `.env`.** *Por quê:* tudo que vai para o navegador é público.
- **Console sem erros** nas três larguras (o script mostra).

## Formato do relatório

Notas: **9-10** nada que o visitante perceba · **7-8** detalhes de acabamento · **5-6** problemas que o
visitante percebe, mas a página funciona · **0-4** algo quebrado ou que impede alguém de usar.
Toda nota precisa de evidência: um número do script, o nome de uma captura ou `arquivo:linha`.
Sem evidência, não dê nota baixa: escreva "não verificado". Separe fato de gosto e marque gosto como [opinião].

```markdown
## Revisão da landing: <nome do projeto> (<data>)
URL: <url> · Build: ok/falhou · Capturas: review-landing/

| Área | Nota 0-10 | Evidência | Correção sugerida |
|---|---|---|---|
| Visual | 8 | desktop-1.jpg: título e botão claros; texto cinza #8a8a8a sobre #111 dá 5,5:1 | ... |
| Responsividade | | | |
| Acessibilidade | | | |
| Performance | | | |
| Animações | | | |
| Código | | | |

### As 3 prioridades
1. **<o problema>**: por que importa para o visitante, onde mexer (`arquivo:linha`), como conferir depois.
2. ...
3. ...

### O que não consegui verificar
- <ex.: contraste do texto sobre a foto do topo; desempenho num celular fraco; Safari no iPhone; leitor de tela de verdade>

Quer que eu aplique alguma dessas correções? Diga quais (ex.: "a 1 e a 3").
```

Escolha as prioridades pelo impacto para quem visita, não pela facilidade. Correção sugerida é concreta:
valor atual e valor proposto (px, hex, ms) ou o trecho a trocar.

## Depois do relatório

Pare e espere a resposta. Se a pessoa aprovar itens, aplique só esses, um por vez, e rode o build (e os
testes, se o projeto tiver) depois de cada um. Se a pasta `review-landing/` não estiver no `.gitignore`,
sugira acrescentar `/review-landing/`; a barra no começo evita ignorar também a pasta da skill.
