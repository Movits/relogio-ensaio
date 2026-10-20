// checar.mjs (parte da skill review-landing)
//
// Abre o site num Chrome de verdade, em 3 larguras, e mede o que dá para medir sem opinião:
// erros no console, imagens, títulos, rolagem lateral, peso da página, foco pelo teclado,
// "reduzir movimento" e "JavaScript desligado". Não muda nada no projeto: só lê a página
// e salva capturas + resultado.json na pasta review-landing/ (onde você rodar o comando).
//
// Uso, na raiz do projeto e com o site rodando (npm run preview ou npm run dev):
//   node .claude/skills/review-landing/scripts/checar.mjs [url]
// URL padrão: http://localhost:4173/ (o "npm run preview" do Vite).
// Se o vite.config tiver "base" (ex.: base: '/sonora/'), ponha na URL: http://localhost:4173/sonora/
//
// Precisa do @playwright/test instalado NO PROJETO e do Google Chrome no computador.

import { createRequire } from 'node:module'
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const URL_ALVO = process.argv[2] || 'http://localhost:4173/'
const PASTA = resolve(process.cwd(), 'review-landing')
const TELAS = [
  { nome: 'desktop', width: 1440, height: 900 },
  { nome: 'tablet', width: 768, height: 1024 },
  { nome: 'celular', width: 390, height: 844, hasTouch: true, isMobile: true, deviceScaleFactor: 3 },
]
const CAPTURAS_POR_TELA = 6 // do topo até o fim da página
const avisos = [] // problemas do próprio script (não do site); aparecem no fim do resumo

// ---------------------------------------------------------------------------
// 1. Preparação: Playwright, site no ar e Chrome
// ---------------------------------------------------------------------------

// Procura o @playwright/test no projeto onde você está (process.cwd()), e não na pasta da skill.
// Assim a mesma skill funciona copiada para .claude/skills/ do projeto ou para ~/.claude/skills/.
function carregarPlaywright() {
  const requireDoProjeto = createRequire(join(process.cwd(), 'package.json'))
  try {
    return requireDoProjeto('@playwright/test')
  } catch (erro) {
    console.error(
      [
        `Não consegui carregar o @playwright/test a partir de ${process.cwd()}.`,
        'Rode este script na raiz do projeto (a pasta que tem o package.json).',
        'Se o projeto ainda não tem o Playwright, instale (isso muda o package.json):',
        '  npm i -D @playwright/test',
        'O script usa o Google Chrome já instalado (channel: "chrome"), então não precisa baixar outro navegador.',
        `Detalhe do erro: ${erro.message.split('\n')[0]}`,
      ].join('\n'),
    )
    process.exit(1)
  }
}

async function conferirSite(url) {
  let endereco
  try {
    endereco = new URL(url)
  } catch (erro) {
    console.error(`"${url}" não parece uma URL. Exemplo: http://localhost:4173/  (detalhe: ${erro.message})`)
    process.exit(1)
  }
  // "localhost:4173/" sem http:// vira uma URL com protocolo "localhost:", e o erro seguinte enganaria
  if (!/^https?:$/.test(endereco.protocol)) {
    console.error(`"${url}" precisa começar com http:// ou https://. Exemplo: http://localhost:4173/`)
    process.exit(1)
  }
  let resposta
  try {
    resposta = await fetch(endereco, { signal: AbortSignal.timeout(8000) })
  } catch (erro) {
    console.error(
      [
        `Não consegui abrir ${url}.`,
        'O site está rodando? Num terminal separado, rode "npm run preview" (ou "npm run dev") e tente de novo.',
        `Detalhe do erro: ${erro.cause?.code || erro.cause?.message || erro.message}`,
      ].join('\n'),
    )
    process.exit(1)
  }
  if (!resposta.ok) {
    console.error(
      [
        `${url} respondeu ${resposta.status} (${resposta.statusText}).`,
        'Confira o endereço. Se o projeto usa "base" no vite.config (ex.: base: \'/sonora/\'), inclua esse caminho:',
        `  node .claude/skills/review-landing/scripts/checar.mjs ${endereco.origin}/sonora/`,
      ].join('\n'),
    )
    process.exit(1)
  }
}

// ---------------------------------------------------------------------------
// 2. Funções que rodam DENTRO da página (no navegador).
//    O Playwright copia só o texto de cada função para o navegador, então uma função de fora
//    não existe lá. Por isso "descrever" é definido uma vez em window.__descrever (definirDescrever,
//    chamado logo depois de abrir a página) e as outras funções usam esse.
// ---------------------------------------------------------------------------

// Nome curto de um elemento para o relatório: tag#id.classe1.classe2
function definirDescrever() {
  window.__descrever = (el) => el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + [...el.classList].slice(0, 2).map((c) => '.' + c).join('')
}

// Logo depois de carregar: imagens, títulos e nomes de campos e botões
function medirTopo() {
  const descrever = window.__descrever
  const imagens = [...document.images].map((img) => {
    const r = img.getBoundingClientRect()
    return {
      src: (img.currentSrc || img.getAttribute('src') || '(sem src)').replace(location.origin, '').slice(0, 80),
      alt: img.hasAttribute('alt') ? img.getAttribute('alt') : null,
      lazy: img.loading === 'lazy',
      naPrimeiraTela: r.width > 0 && r.bottom > 0 && r.top < innerHeight,
    }
  })
  const titulos = [...document.querySelectorAll('h1, h2, h3')].map((h) => ({
    nivel: Number(h.tagName[1]),
    texto: h.textContent.replace(/\s+/g, ' ').trim().slice(0, 80),
  }))
  const ignorar = ['hidden', 'submit', 'button', 'reset', 'image']
  const camposSemRotulo = [...document.querySelectorAll('input, select, textarea')]
    .filter((c) => !ignorar.includes(c.type))
    .filter((c) => !c.labels?.length && !c.getAttribute('aria-label') && !c.getAttribute('aria-labelledby') && !c.title)
    .map(descrever)
  const controlesSemNome = [...document.querySelectorAll('a[href], button, [role="button"]')]
    .filter((c) => !(c.textContent.trim() || c.getAttribute('aria-label') || c.getAttribute('aria-labelledby') || c.title || c.querySelector('img[alt]:not([alt=""]), svg title')))
    .map(descrever)
  return { imagens, titulos, camposSemRotulo, controlesSemNome }
}

// Textos que ocupam espaço na tela mas ninguém consegue ler: opacidade ~0, visibility hidden
// ou empurrados para fora de uma caixa que corta o excesso (overflow: hidden).
// soPrimeiraTela = true olha só o que aparece sem rolar; false olha a página inteira.
function textosInvisiveis(soPrimeiraTela) {
  const descrever = window.__descrever
  const achados = []
  const vistos = new Set()
  const andador = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
  while (andador.nextNode()) {
    const el = andador.currentNode.parentElement
    if (!el || vistos.has(el) || !andador.currentNode.textContent.trim()) continue
    vistos.add(el)
    if (el.closest('script, style, noscript, template, [hidden], [aria-hidden="true"], dialog:not([open])')) continue
    const r = el.getBoundingClientRect()
    if (r.width === 0 || r.height === 0) continue // não ocupa espaço (display: none, por exemplo)
    if (r.width <= 2 || r.height <= 2) continue // 1 px: texto só para leitor de tela ("sr-only", "pular para o conteúdo"), escondido de propósito
    if (soPrimeiraTela && (r.bottom <= 0 || r.top >= innerHeight || r.right <= 0 || r.left >= innerWidth)) continue
    let opacidade = 1
    let motivo = ''
    // Um elemento absolute só é recortado pelo overflow do ancestral posicionado mais próximo
    // (o "bloco de contenção") e dos de cima dele; um fixed escapa de todos.
    let escapa = null // null | 'absolute' | 'fixed'
    for (let a = el; a; a = a.parentElement) {
      const cs = getComputedStyle(a)
      opacidade *= Number(cs.opacity)
      if (a !== el && escapa !== 'fixed') {
        const posicionado = cs.position !== 'static'
        const recorta = escapa !== 'absolute' || posicionado
        const cortaX = recorta && /hidden|clip/.test(cs.overflowX)
        const cortaY = recorta && /hidden|clip/.test(cs.overflowY)
        if (cortaX || cortaY) {
          const c = a.getBoundingClientRect()
          const foraX = cortaX && (r.right <= c.left || r.left >= c.right)
          const foraY = cortaY && (r.bottom <= c.top || r.top >= c.bottom)
          if (foraX || foraY) motivo = `fora da área visível de ${descrever(a)} (overflow)`
        }
        if (escapa === 'absolute' && posicionado) escapa = null // daqui para cima o recorte volta a valer
      }
      if (cs.position === 'fixed') escapa = 'fixed'
      else if (cs.position === 'absolute' && escapa === null) escapa = 'absolute'
    }
    if (getComputedStyle(el).visibility !== 'visible') motivo = 'visibility: hidden'
    else if (opacidade < 0.1) motivo = `opacidade ${opacidade.toFixed(2)}`
    if (motivo) achados.push({ texto: el.textContent.replace(/\s+/g, ' ').trim().slice(0, 60), elemento: descrever(el), motivo })
  }
  return { total: achados.length, exemplos: achados.slice(0, 8) }
}

// Depois de rolar a página inteira: imagens que falharam e quem passa da largura da tela
function medirDepoisDeRolar(sobraMaxima) {
  const descrever = window.__descrever
  const src = (img) => (img.currentSrc || img.getAttribute('src') || '').replace(location.origin, '').slice(0, 80)
  const imagens = [...document.images]
  // SVG sem width/height próprios pode ter naturalWidth 0 mesmo carregado: não conta como quebrado
  const ehSvg = (i) => /\.svg(\?|#|$)/i.test(src(i)) || src(i).startsWith('data:image/svg')
  const quebradas = imagens.filter((i) => i.complete && i.naturalWidth === 0 && src(i) && !ehSvg(i)).map(src)
  const naoCarregadas = imagens.filter((i) => !i.complete).map(src)
  const culpados = []
  if (sobraMaxima > 0) {
    for (const el of document.body.querySelectorAll('*')) {
      const r = el.getBoundingClientRect()
      if (r.width === 0 || (r.right <= innerWidth + 1 && r.left >= -1)) continue
      // quem está dentro de um pai que corta o excesso não causa rolagem lateral
      let cortado = false
      for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
        if (getComputedStyle(a).overflowX !== 'visible') {
          cortado = true
          break
        }
      }
      if (!cortado) culpados.push(`${descrever(el)} (vai de ${Math.round(r.left)} a ${Math.round(r.right)} px)`)
      if (culpados.length >= 5) break
    }
  }
  return { quebradas, naoCarregadas, culpados }
}

// Estilos que costumam mudar quando um elemento recebe foco (contorno, sombra, cor, posição)
function guardarEstilosSemFoco() {
  // Só o que costuma ser indicação de foco. transform, opacity e top ficam de fora: eles mudam quando o Tab
  // rola a página e dispara animações de entrada, e dariam um falso "tem foco visível".
  window.__propsDeFoco = ['outlineStyle', 'outlineWidth', 'outlineColor', 'boxShadow', 'backgroundColor', 'borderColor', 'color', 'textDecorationLine']
  window.__estiloSemFoco = new Map()
  for (const el of document.querySelectorAll('a[href], button, input, select, textarea, summary, [tabindex]')) {
    const cs = getComputedStyle(el)
    window.__estiloSemFoco.set(el, window.__propsDeFoco.map((p) => cs[p]).join('|'))
  }
}

function lerFocoAtual() {
  const descrever = window.__descrever
  const el = document.activeElement
  if (!el || el === document.body) return null
  window.__jaFocados ||= new WeakSet()
  if (window.__jaFocados.has(el)) return { repetido: true } // o Tab deu a volta na página
  window.__jaFocados.add(el)
  const cs = getComputedStyle(el)
  const antes = window.__estiloSemFoco.get(el)
  const agora = window.__propsDeFoco.map((p) => cs[p]).join('|')
  return {
    elemento: descrever(el),
    texto: (el.getAttribute('aria-label') || el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40),
    temIndicacao: antes === undefined ? null : antes !== agora, // null = não deu para comparar
  }
}

// ---------------------------------------------------------------------------
// 3. Ajudantes do lado do Node (formatar números e URLs)
// ---------------------------------------------------------------------------

const origemDoSite = new URL(URL_ALVO, 'http://x').origin
const curta = (url) => {
  const sem = url.startsWith(origemDoSite) ? url.slice(origemDoSite.length) : url
  return sem.length > 80 ? sem.slice(0, 77) + '...' : sem
}
const tamanho = (bytes) => (bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`)
const primeiraLinha = (erro) => String(erro?.message || erro).split('\n')[0]

function resumirRede(lista) {
  const soma = (l) => l.reduce((t, x) => t + x.bytes, 0)
  const inicial = lista.filter((x) => x.fase === 'inicial')
  const porTipo = {}
  const formatosDeImagem = {}
  for (const x of lista) {
    porTipo[x.tipo] ||= { bytes: 0, quantidade: 0 }
    porTipo[x.tipo].bytes += x.bytes
    porTipo[x.tipo].quantidade += 1
    if (x.tipo === 'image') formatosDeImagem[x.mime] = (formatosDeImagem[x.mime] || 0) + 1
  }
  const maiores = [...lista]
    .sort((a, b) => b.bytes - a.bytes)
    .slice(0, 5)
    .map((x) => ({ url: curta(x.url), tipo: x.tipo, bytes: x.bytes }))
  return {
    primeiraCarga: { bytes: soma(inicial), requisicoes: inicial.length },
    depoisDeRolarTudo: { bytes: soma(lista), requisicoes: lista.length },
    porTipo,
    formatosDeImagem,
    maiores,
  }
}

// ---------------------------------------------------------------------------
// 4. A revisão de uma largura de tela
// ---------------------------------------------------------------------------

async function revisarTela(navegador, tela) {
  console.log(`Abrindo ${tela.nome} (${tela.width}x${tela.height})...`)
  const contexto = await navegador.newContext({
    viewport: { width: tela.width, height: tela.height },
    hasTouch: !!tela.hasTouch,
    isMobile: !!tela.isMobile, // sem isMobile o Chrome continua dizendo que tem mouse (hover) e ignora a meta viewport
    deviceScaleFactor: tela.deviceScaleFactor || 1,
  })
  const pagina = await contexto.newPage()
  const r = { nome: tela.nome, tamanho: `${tela.width}x${tela.height}`, errosConsole: [], respostasComErro: [], falhasDeRede: [], capturas: [] }

  // Vigia a rede: o que falhou, quanto pesou e se a requisição saiu antes ou depois de rolar
  let fase = 'inicial'
  let emAndamento = 0
  let ultimaAtividade = Date.now()
  const faseDaRequisicao = new WeakMap()
  const medicoes = []
  pagina.on('console', (m) => {
    if (m.type() === 'error') r.errosConsole.push(`[console] ${m.text().slice(0, 200)}${m.location()?.url ? ` (${curta(m.location().url)})` : ''}`)
  })
  pagina.on('pageerror', (e) => r.errosConsole.push(`[erro de JavaScript] ${primeiraLinha(e)}`))
  pagina.on('response', (resp) => {
    if (resp.status() >= 400) r.respostasComErro.push(`${resp.status()} ${curta(resp.url())}`)
  })
  const dominiosExternos = new Set() // inclui os que falharam: uma CDN fora do ar também conta
  pagina.on('request', (req) => {
    const host = URL.canParse(req.url()) ? new URL(req.url()).host : ''
    if (host && host !== new URL(origemDoSite).host) dominiosExternos.add(host)
    faseDaRequisicao.set(req, fase)
    emAndamento += 1
    ultimaAtividade = Date.now()
  })
  pagina.on('requestfailed', (req) => {
    emAndamento -= 1
    ultimaAtividade = Date.now()
    const motivo = req.failure()?.errorText || 'falhou'
    // ERR_ABORTED = o próprio navegador cancelou (trocou de imagem, saiu da página); não é defeito do site
    if (!motivo.includes('ERR_ABORTED')) r.falhasDeRede.push(`${motivo} ${curta(req.url())}`)
  })
  pagina.on('requestfinished', (req) => {
    emAndamento -= 1
    ultimaAtividade = Date.now()
    medicoes.push(
      Promise.all([req.sizes(), req.response()])
        .then(([s, resp]) => ({
          url: req.url(),
          tipo: req.resourceType(),
          mime: (resp?.headers()['content-type'] || '?').split(';')[0],
          bytes: Math.max(0, s.responseBodySize) + Math.max(0, s.responseHeadersSize),
          fase: faseDaRequisicao.get(req) || 'inicial',
        }))
        .catch((erro) => {
          avisos.push(`${tela.nome}: não consegui medir ${curta(req.url())}: ${primeiraLinha(erro)}`)
          return null
        }),
    )
  })
  async function esperarRedeParada() {
    const inicio = Date.now()
    while (emAndamento > 0 || Date.now() - ultimaAtividade < 500) {
      if (Date.now() - inicio > 10_000) {
        avisos.push(`${tela.nome}: a rede não parou em 10 s (comum com vídeo ou quadros carregando sem parar); medi assim mesmo.`)
        return
      }
      await pagina.waitForTimeout(100)
    }
  }
  const capturar = async (arquivo) => {
    await pagina.screenshot({ path: join(PASTA, arquivo), type: 'jpeg', quality: 70 })
    r.capturas.push(arquivo)
  }
  const rolarPara = (y) => pagina.evaluate((v) => window.scrollTo({ top: v, behavior: 'instant' }), y)

  try {
    // Primeira tela, como o visitante vê ao chegar
    await pagina.goto(URL_ALVO, { waitUntil: 'load', timeout: 30_000 })
    await pagina.evaluate(definirDescrever)
    await pagina.waitForTimeout(1500) // tempo para as animações de entrada terminarem
    await capturar(`${tela.nome}-1.jpg`)
    const topo = await pagina.evaluate(medirTopo)
    r.textosInvisiveisNoTopo = await pagina.evaluate(textosInvisiveis, true)

    // Rola a página toda, devagar, para carregar imagens "lazy" e disparar as animações de scroll
    fase = 'rolagem'
    let sobraMaxima = 0
    for (let y = 0; y <= 300_000; y += Math.round(tela.height * 0.8)) {
      await rolarPara(y)
      await pagina.waitForTimeout(250)
      const { altura, sobra } = await pagina.evaluate(() => ({
        altura: document.documentElement.scrollHeight,
        sobra: document.documentElement.scrollWidth - window.innerWidth,
      }))
      sobraMaxima = Math.max(sobraMaxima, sobra)
      if (y >= altura - tela.height) break
    }
    await esperarRedeParada()
    const depois = await pagina.evaluate(medirDepoisDeRolar, sobraMaxima)

    // Capturas espalhadas do topo até o fim
    const fim = await pagina.evaluate(() => document.documentElement.scrollHeight - window.innerHeight)
    for (let i = 1; i < CAPTURAS_POR_TELA; i++) {
      await rolarPara(Math.round((fim * i) / (CAPTURAS_POR_TELA - 1)))
      await pagina.waitForTimeout(700)
      await capturar(`${tela.nome}-${i + 1}.jpg`)
    }

    // Foco pelo teclado (só no desktop): aperta Tab 10 vezes e vê se algo muda no elemento focado
    if (tela.nome === 'desktop') {
      await rolarPara(0)
      await pagina.waitForTimeout(500)
      await pagina.evaluate(guardarEstilosSemFoco)
      r.foco = []
      for (let i = 0; i < 10; i++) {
        await pagina.keyboard.press('Tab')
        await pagina.waitForTimeout(250) // espera a transição do estilo de foco
        if (i === 0) await capturar('foco-desktop.jpg')
        const passo = await pagina.evaluate(lerFocoAtual)
        if (passo?.repetido) break
        if (passo) r.foco.push(passo)
      }
      r.titulos = topo.titulos
      r.camposSemRotulo = topo.camposSemRotulo
      r.controlesSemNome = topo.controlesSemNome
    }

    r.imagens = {
      total: topo.imagens.length,
      quebradas: depois.quebradas,
      naoCarregadas: depois.naoCarregadas,
      semAlt: topo.imagens.filter((i) => i.alt === null).map((i) => i.src),
      comAltVazio: topo.imagens.filter((i) => i.alt === '').length,
      foraDaPrimeiraTelaSemLazy: topo.imagens.filter((i) => !i.naPrimeiraTela && !i.lazy).map((i) => i.src),
      naPrimeiraTelaComLazy: topo.imagens.filter((i) => i.naPrimeiraTela && i.lazy).map((i) => i.src),
    }
    r.rolagemLateral = { sobraPx: sobraMaxima, culpados: depois.culpados }
    r.rede = { ...resumirRede((await Promise.all(medicoes)).filter(Boolean)), dominiosExternos: [...dominiosExternos] }
    if (emAndamento > 0) avisos.push(`${tela.nome}: ${emAndamento} requisição(ões) ainda em andamento na hora de somar o peso; o total real é maior.`)
  } catch (erro) {
    console.error(`Erro ao revisar ${tela.nome}: ${primeiraLinha(erro)}`)
    avisos.push(`${tela.nome}: a revisão parou no meio (${primeiraLinha(erro)}). O que foi medido até ali está no JSON.`)
  } finally {
    await contexto.close()
  }
  r.errosConsole = [...new Set(r.errosConsole)]
  r.respostasComErro = [...new Set(r.respostasComErro)]
  return r
}

// Abre de novo com uma opção diferente (reduzir movimento ou sem JavaScript) e procura texto invisível
async function revisarVariacao(navegador, { nome, tela, opcoes, soPrimeiraTela }) {
  console.log(`Abrindo ${nome}...`)
  const contexto = await navegador.newContext({ viewport: { width: tela.width, height: tela.height }, ...opcoes })
  const pagina = await contexto.newPage()
  try {
    await pagina.goto(URL_ALVO, { waitUntil: 'load', timeout: 30_000 })
    await pagina.evaluate(definirDescrever)
    await pagina.waitForTimeout(1000)
    await pagina.screenshot({ path: join(PASTA, `${nome}.jpg`), type: 'jpeg', quality: 70 })
    return { captura: `${nome}.jpg`, ...(await pagina.evaluate(textosInvisiveis, soPrimeiraTela)) }
  } catch (erro) {
    console.error(`Erro em ${nome}: ${primeiraLinha(erro)}`)
    avisos.push(`${nome}: não consegui medir (${primeiraLinha(erro)}).`)
    return null
  } finally {
    await contexto.close()
  }
}

// ---------------------------------------------------------------------------
// 5. Resumo para pessoas (o JSON completo vem depois)
// ---------------------------------------------------------------------------

function imprimirResumo(res) {
  const linha = (txt = '') => console.log(txt)
  const lista = (itens, vazio = 'nenhum') => (itens?.length ? itens.join(' | ') : vazio)
  linha(`\n=== Revisão automática: ${res.url} ===`)
  linha(`Capturas e resultado.json em: ${res.pasta}`)

  for (const t of res.telas) {
    linha(`\n--- ${t.nome} (${t.tamanho}) ---`)
    linha(`Erros no console: ${t.errosConsole.length}${t.errosConsole.length ? '\n  ' + t.errosConsole.slice(0, 10).join('\n  ') : ''}`)
    linha(`Respostas com erro (404 etc.): ${lista(t.respostasComErro)}`)
    if (t.falhasDeRede.length) linha(`Falhas de rede: ${lista(t.falhasDeRede.slice(0, 5))}`)
    if (t.imagens) {
      const im = t.imagens
      linha(`Imagens: ${im.total} | quebradas: ${im.quebradas.length} | não carregaram: ${im.naoCarregadas.length} | sem alt: ${im.semAlt.length} | alt vazio (decorativas): ${im.comAltVazio}`)
      if (im.quebradas.length) linha(`  quebradas: ${lista(im.quebradas)}`)
      if (im.semAlt.length) linha(`  sem alt: ${lista(im.semAlt)}`)
      linha(`  lazy: ${im.foraDaPrimeiraTelaSemLazy.length} fora da 1ª tela SEM loading="lazy" | ${im.naPrimeiraTelaComLazy.length} na 1ª tela COM lazy`)
    }
    if (t.rolagemLateral) {
      const rl = t.rolagemLateral
      linha(`Rolagem lateral: ${rl.sobraPx > 0 ? `SIM, sobra ${rl.sobraPx} px` : 'não'}${rl.culpados.length ? '\n  culpados prováveis: ' + lista(rl.culpados) : ''}`)
    }
    if (t.textosInvisiveisNoTopo) linha(`Textos invisíveis na 1ª tela (modo normal, após 1,5 s): ${t.textosInvisiveisNoTopo.total}`)
    if (t.rede) {
      const rd = t.rede
      linha(`Peso: 1ª carga ${tamanho(rd.primeiraCarga.bytes)} (${rd.primeiraCarga.requisicoes} requisições) | depois de rolar tudo ${tamanho(rd.depoisDeRolarTudo.bytes)} (${rd.depoisDeRolarTudo.requisicoes})`)
      linha(`  por tipo: ${Object.entries(rd.porTipo).sort((a, b) => b[1].bytes - a[1].bytes).map(([tipo, v]) => `${tipo} ${tamanho(v.bytes)} (${v.quantidade})`).join(' · ')}`)
      linha(`  formatos de imagem: ${Object.entries(rd.formatosDeImagem).map(([m, n]) => `${m} ${n}`).join(' · ') || 'nenhuma'}`)
      linha(`  5 maiores: ${rd.maiores.map((m) => `${m.url} ${tamanho(m.bytes)}`).join(' | ')}`)
      linha(`  domínios externos: ${lista(rd.dominiosExternos)}`)
    }
    linha(`Capturas: ${t.capturas.join(', ')}`)
  }

  const d = res.telas.find((t) => t.nome === 'desktop')
  if (d?.titulos) {
    linha('\n--- Títulos (h1 a h3, na ordem da página) ---')
    for (const h of d.titulos) linha(`${'  '.repeat(h.nivel - 1)}h${h.nivel}: ${h.texto}`)
    if (res.titulos) linha(`Quantidade de h1: ${res.titulos.quantidadeH1} | pulos de nível: ${lista(res.titulos.pulosDeNivel)}`)
    linha(`Campos sem rótulo: ${lista(d.camposSemRotulo)} | links/botões sem nome: ${lista(d.controlesSemNome)}`)
  }
  if (d?.foco) {
    const sem = d.foco.filter((f) => f.temIndicacao === false)
    linha(`\n--- Foco pelo teclado (Tab x10, desktop) ---`)
    linha(`${d.foco.filter((f) => f.temIndicacao).length} com mudança visível | ${sem.length} sem mudança${sem.length ? ': ' + sem.map((f) => `${f.elemento} "${f.texto}"`).join(' | ') : ''} | captura: foco-desktop.jpg`)
  }

  linha('\n--- Movimento e JavaScript ---')
  const mostrar = (rotulo, v) =>
    linha(`${rotulo}: ${v ? `${v.total} texto(s) invisível(is)${v.exemplos.length ? '\n  ' + v.exemplos.map((e) => `"${e.texto}" ${e.elemento} → ${e.motivo}`).join('\n  ') : ''} | captura: ${v.captura}` : 'não medido'}`)
  mostrar('Reduzir movimento, desktop (1ª tela)', res.reducedMotion.desktop)
  mostrar('Reduzir movimento, celular (1ª tela)', res.reducedMotion.celular)
  mostrar('Sem JavaScript, desktop (página inteira)', res.semJavaScript)

  if (!res.gitignoreTemPasta) linha('\nDica: a pasta review-landing/ não está no .gitignore. Sugira adicionar a linha "/review-landing/" (com a barra no começo).')
  if (res.avisosDoScript.length) linha(`\nAvisos do script (não são defeitos do site):\n  ${res.avisosDoScript.join('\n  ')}`)
  if (!res.completa) linha('\nATENÇÃO: a revisão ficou INCOMPLETA (alguma largura ou variação não foi medida). Não dê nota sem evidência para essas partes.')
}

// ---------------------------------------------------------------------------
// 6. Programa principal
// ---------------------------------------------------------------------------

const { chromium } = carregarPlaywright()
await conferirSite(URL_ALVO)
mkdirSync(PASTA, { recursive: true })
// Tira as capturas e o resultado da execução anterior, para nenhuma imagem velha ser lida como nova.
// Só mexe em .jpg e resultado.json DENTRO de review-landing/.
for (const arquivo of readdirSync(PASTA)) {
  if (arquivo.endsWith('.jpg') || arquivo === 'resultado.json') rmSync(join(PASTA, arquivo))
}

let navegador
try {
  navegador = await chromium.launch({ channel: 'chrome' })
} catch (erro) {
  console.error(
    [
      'Não consegui abrir o Google Chrome pelo Playwright.',
      'Confira se o Chrome está instalado. Sem Chrome, dá para usar o Chromium do Playwright:',
      '  npx playwright install chromium   (e tire o "channel: chrome" deste script)',
      `Detalhe do erro: ${primeiraLinha(erro)}`,
    ].join('\n'),
  )
  process.exit(1)
}

const resultado = { url: URL_ALVO, quando: new Date().toISOString(), pasta: PASTA }
try {
  resultado.telas = []
  for (const tela of TELAS) {
    try {
      resultado.telas.push(await revisarTela(navegador, tela))
    } catch (erro) {
      // ex.: não conseguiu nem abrir a aba; registra e segue para as outras larguras
      console.error(`Erro ao abrir ${tela.nome}: ${primeiraLinha(erro)}`)
      avisos.push(`${tela.nome}: não consegui abrir a página nesta largura (${primeiraLinha(erro)}).`)
      resultado.telas.push({ nome: tela.nome, tamanho: `${tela.width}x${tela.height}`, errosConsole: [], respostasComErro: [], falhasDeRede: [], capturas: [] })
    }
  }
  const [desktop, , celular] = TELAS
  resultado.reducedMotion = {
    desktop: await revisarVariacao(navegador, { nome: 'reduzido-desktop', tela: desktop, opcoes: { reducedMotion: 'reduce' }, soPrimeiraTela: true }),
    celular: await revisarVariacao(navegador, { nome: 'reduzido-celular', tela: celular, opcoes: { reducedMotion: 'reduce', hasTouch: true, isMobile: true, deviceScaleFactor: 3 }, soPrimeiraTela: true }),
  }
  resultado.semJavaScript = await revisarVariacao(navegador, { nome: 'sem-js-desktop', tela: desktop, opcoes: { javaScriptEnabled: false }, soPrimeiraTela: false })
} finally {
  await navegador.close()
}

const titulos = resultado.telas.find((t) => t.nome === 'desktop')?.titulos
// Se o desktop não foi medido, "0 h1" seria uma mentira: deixa null para ficar claro que faltou medir
resultado.titulos = titulos
  ? {
      quantidadeH1: titulos.filter((h) => h.nivel === 1).length,
      pulosDeNivel: titulos.flatMap((h, i) => (i > 0 && h.nivel - titulos[i - 1].nivel > 1 ? [`h${titulos[i - 1].nivel} → h${h.nivel} ("${h.texto}")`] : [])),
    }
  : null
// Revisão incompleta não pode parecer completa: código de saída 1 se alguma parte não foi medida
resultado.completa =
  resultado.telas.every((t) => t.imagens && t.rede) &&
  !!resultado.reducedMotion?.desktop &&
  !!resultado.reducedMotion?.celular &&
  !!resultado.semJavaScript &&
  !!resultado.titulos
if (!resultado.completa) process.exitCode = 1
// Procura a regra de verdade: a linha "/review-landing/" (ou "/review-landing"). Um comentário ou
// "review-landing/" sem a barra não servem (sem a barra, o Git ignoraria também a pasta da skill).
resultado.gitignoreTemPasta = existsSync('.gitignore') && /^\/review-landing\/?\s*$/m.test(readFileSync('.gitignore', 'utf8'))
resultado.avisosDoScript = avisos

imprimirResumo(resultado)
// O JSON vai numa linha só (para outras ferramentas lerem); a versão formatada fica no arquivo
writeFileSync(join(PASTA, 'resultado.json'), JSON.stringify(resultado, null, 2))
console.log('\n=== JSON (versão formatada em review-landing/resultado.json) ===')
console.log(JSON.stringify(resultado))
