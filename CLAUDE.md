# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Site de página única de lançamento da Calibre Norte (relógio mecânico automático de aço, mostrador verde, 3 pulseiras). Vite + GSAP + Playwright, sem framework. Uma única ação: entrar na lista de espera (simulada). Responder em português.

## Comandos

- `npm run dev`: servidor de desenvolvimento em `http://localhost:5173/relogio-ensaio/` (a base entra no endereço).
- `npm run build`: build de produção em `dist/` (precisa sair com código 0).
- `npm run preview`: serve o `dist/` (porta 4173).
- `npm test`: Playwright. Faz o build, sobe o preview na porta 4174 e usa o Google Chrome instalado (sem `npx playwright install`).
- Um teste só: `npx playwright test tests/smoke.spec.js -g "trecho do título"`.

## Estrutura

- `index.html`: uma `<section id>` por parte, na ordem da página: `hero`, `abertura` (o relógio por dentro), `mostrador`, `pulseiras`, `na-caixa`, `lista-espera`.
- `src/main.js`: importa tokens.css e base.css e chama o `init()` de cada seção.
- `src/sections/<id>.js`: um arquivo por seção, exportando `init()`. Sai sem erro se a seção não existir. Hoje são esqueletos vazios.
- `src/lib/`: funções pequenas usadas por várias seções (ex.: "reduzir movimento ligado?").
- `src/styles/`: `tokens.css` (cores, fontes, tamanhos) e `base.css`. Estilos de seção vão em arquivo próprio, sempre com os tokens.
- `public/` (`img/`, `fonts/`, `frames/`): ativos estáticos.
- `docs/`: `brief.md`, `requisitos.md` e `plano.md` (a fonte da verdade do conteúdo e dos passos).
- `vite.config.js` define `base: '/relogio-ensaio/'` (nome do repositório no GitHub Pages) e `appType: 'mpa'` (arquivo inexistente dá 404 de verdade). O `playwright.config.js` lê a base de lá.

## Regras

- Nada novo no `package.json` (sem bibliotecas extras nem CDN) sem pedir ao Roberto.
- Caminhos de imagem dentro do JS usam `import.meta.env.BASE_URL`; `/img/...` fixo dá 404 no Pages.
- O CSS só esconde algo para animar se o `<html>` tiver a classe `js` (o `index.html` a adiciona). Sem JS e com `prefers-reduced-motion: reduce`, o conteúdo fica visível e estático.
- Animação do relógio se abrindo: `gsap.matchMedia()` com `(prefers-reduced-motion: no-preference)`, ScrollTrigger com pin e scrub, `svh` em vez de `vh`. O GSAP está instalado, mas o import em `main.js` está comentado até a primeira animação.
- Lista de espera: só validação no navegador e confirmação marcada como demonstração. Sem `fetch`, storage, cookie nem rastreador.
- Pendências do brief (preço, data, origem do movimento, resistência à água, tamanho da caixa, materiais das pulseiras, concorrentes): mostrar "a confirmar" ou omitir. Nunca inventar número.
- Tom: sóbrio, preciso, "você". Proibidos: "luxo", "exclusivo", "promoção", "imperdível", contagem regressiva, exclamações em série.
- Critérios que bloqueiam a publicação: build sem erro, console limpo, botão da lista inteiro visível na 1ª tela de 390 px e sem rolagem lateral em 390 px.
