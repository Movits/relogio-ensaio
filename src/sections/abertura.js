// O relógio se abre: hero.webp → explodido.webp, com a seção fixada (pin) e o scroll controlando a animação.
// Só transform, opacity e o traço do SVG. Com movimento reduzido (ou sem JS) fica a composição estática do HTML.
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// A barra de endereço do celular muda a altura da janela; sem isto a página pula durante o pin.
ScrollTrigger.config({ ignoreMobileResize: true })

const MOVIMENTO_PERMITIDO = '(prefers-reduced-motion: no-preference)'
const DISTANCIA_DO_PIN = '+=250%' // 2,5 telas de rolagem (limite do plano: 3)

// Carrega e decodifica as imagens antes de montar o gatilho, para o cruzamento não piscar.
function precarregar(imagens) {
  return Promise.all(
    imagens.map((img) => {
      img.loading = 'eager'
      return img.decode().catch((erro) => {
        console.warn('abertura: a imagem não decodificou', img.currentSrc, erro)
      })
    }),
  )
}

function montar(secao, { hero, explodido, tracos, rotulo, legenda, passos }) {
  secao.classList.add('abertura--animada')

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: secao,
      start: 'top top',
      end: DISTANCIA_DO_PIN,
      pin: true,
      scrub: 0.5,
      invalidateOnRefresh: true,
    },
  })

  // 0–4: o relógio fechado sai e o calibre aberto entra, no mesmo quadro.
  tl.fromTo(hero, { opacity: 1, scale: 1 }, { opacity: 0, scale: 0.96, duration: 4 }, 0)
    .fromTo(explodido, { opacity: 0, scale: 1.04 }, { opacity: 1, scale: 1, duration: 4 }, 0)
    .fromTo(legenda, { opacity: 0 }, { opacity: 1, duration: 2 }, 2)
    // 4–6: o traço marca o movimento.
    .fromTo(tracos, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 2 }, 4)
    .fromTo(rotulo, { opacity: 0 }, { opacity: 1, duration: 0.5 }, 5.5)

  // 4,5–11: um passo por vez; o último fica.
  passos.forEach((passo, i) => {
    const inicio = 4.5 + i * 2
    tl.fromTo(passo, { opacity: 0 }, { opacity: 1, duration: 0.5 }, inicio)
    if (i < passos.length - 1) tl.to(passo, { opacity: 0, duration: 0.5 }, inicio + 1.5)
  })

  // Pausa no fim, com tudo à mostra, antes de soltar a seção.
  tl.to({}, { duration: 1 }, 11)
}

export function init() {
  const secao = document.getElementById('abertura')
  if (!secao) return

  const partes = {
    hero: secao.querySelector('.abertura__hero'),
    explodido: secao.querySelector('.abertura__explodido'),
    tracos: secao.querySelectorAll('.abertura__traco ellipse, .abertura__traco path'),
    rotulo: secao.querySelector('.abertura__rotulo'),
    legenda: secao.querySelector('figcaption'),
    passos: gsap.utils.toArray('.etapas li', secao),
  }
  if (!partes.hero || !partes.explodido || !partes.rotulo || !partes.legenda || !partes.passos.length) return

  // matchMedia desfaz tudo (pin, estilos e a classe) quando a preferência de movimento muda.
  const mm = gsap.matchMedia()
  mm.add(MOVIMENTO_PERMITIDO, (contexto) => {
    let ativo = true

    precarregar([partes.hero, partes.explodido]).then(() => {
      if (!ativo) return
      // contexto.add: o que nasce depois do await também é desfeito pelo matchMedia.
      contexto.add(() => montar(secao, partes))

      // Imagens e fontes mudam as medidas da página: recalcula onde o pin começa e termina.
      const recalcular = () => ativo && ScrollTrigger.refresh()
      if (document.readyState === 'complete') recalcular()
      else window.addEventListener('load', recalcular, { once: true })
      document.fonts.ready.then(recalcular)
    })

    return () => {
      ativo = false
      secao.classList.remove('abertura--animada')
    }
  })
}
