# Plano — site Calibre Norte (MVP)

**Contexto:** página única de lançamento (docs/brief.md, docs/requisitos.md). Uma ação: lista de espera simulada. Base pronta (Vite, GSAP, git, `base: '/meu-site/'`). Sem bibliotecas extras nem CDN.

## Seções
1. **Hero:** nome, "mecânica à vista", `hero.webp`, botão da lista (visível em 390 px).
2. **Por dentro (o relógio se abre):** hero → explodido; origem "a confirmar".
3. **Mostrador:** verde e acabamento.
4. **Pulseiras:** 3 lado a lado, nome e uso; material "a confirmar".
5. **Na caixa:** relógio + 3 pulseiras.
6. **Lista de espera:** e-mail, erro claro, confirmação "demonstração".

## Árvore
```
index.html                    ← HTML semântico das 6 seções
src/main.js                   ← importa estilos e inicia seções
src/sections/abertura.js      ← GSAP + ScrollTrigger
src/sections/lista-espera.js  ← validação e confirmação simulada
src/styles/base.css           ← tokens, tipografia, foco, layout
src/styles/secoes.css
public/img/*.webp
.github/workflows/pages.yml   ← build e deploy no GitHub Pages
```

## O relógio se abre
- Sem JS e com movimento reduzido: `explodido.webp` estático com legenda (por padrão no HTML/CSS).
- `gsap.matchMedia()`, só com `(prefers-reduced-motion: no-preference)`: duas imagens empilhadas no mesmo quadro; ScrollTrigger com `pin: true`, `scrub: true`, `end: '+=150%'`; timeline: hero sai (opacity e scale 1 → 0,96) e explodido entra (opacity 0 → 1, scale 1,04 → 1), legendas em 2 etapas.
- `matchMedia` desfaz pin e estilos ao mudar a preferência; `ScrollTrigger.refresh()` no `load`.
- Imagens com `width`/`height` (sem salto de layout). O hero carrega com `fetchpriority="high"`.

## Ativos (public/img)
`hero.webp` e `explodido.webp` (**mesmo enquadramento e proporção**), `mostrador.webp`, `pulseira-1/2/3.webp`, `favicon.svg`. Cerca de 1600 px, ≤ 200 KB cada. Faltando, usar marcadores cinza do mesmo tamanho.

## Passos do MVP
**1. Estrutura e conteúdo (20 min):** `index.html` com as 6 seções, textos no tom do brief, CSS mobile-first, `100svh` no hero.
*Testar:* `npm run dev`; DevTools 390×844 e 390×664: botão inteiro visível; console: `document.documentElement.scrollWidth === innerWidth`.

**2. Lista de espera (15 min):** `lista-espera.js`: `preventDefault`, `checkValidity`, erro em `aria-live`, confirmação simulada; nada de `fetch` ou storage.
*Testar:* campo vazio, inválido, válido; aba Network vazia; Application sem storage ou cookie.

**3. O relógio se abre (20 min):** `abertura.js` como descrito acima.
*Testar:* rolar para frente e para trás (o scrub reverte); redimensionar; DevTools → Rendering → `prefers-reduced-motion: reduce`: sem pin, imagem estática; console limpo.

**4. Polimento e publicação (20 min):** alt, foco visível, contraste AA, termos proibidos, workflow do Pages (`actions/deploy-pages`).
*Testar:* `npm run build` sai com 0; `npm run preview` em `/meu-site/` sem 404; buscar "luxo|exclusivo|promoção|imperdível|!!"; abrir a URL publicada.

## Riscos
- **Caminho base:** imagens em `/img/...` dentro do JS dão 404 no Pages. Usar `import.meta.env.BASE_URL`.
- **Pin no celular:** a barra do navegador muda a altura e a página pula. Usar `svh` e `ScrollTrigger.config({ ignoreMobileResize: true })`.
- **Imagens desalinhadas:** a troca hero → explodido "pula".
- **Imagem lazy acima do pin:** pode deslocar o ponto de início. Resolver com `width`/`height` e refresh.
- **Pages:** o repositório deve se chamar `meu-site`; Settings → Pages → Source: GitHub Actions.
- **Pendências do brief:** sem resposta, os textos ficam "a confirmar".
