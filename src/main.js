// Ponto de entrada do site: o Vite começa por aqui e junta o resto.
import './styles/tokens.css'
import './styles/base.css'

// O GSAP já está instalado. Quando a primeira animação entrar, descomente:
// import { gsap } from 'gsap'
// import { ScrollTrigger } from 'gsap/ScrollTrigger'
// gsap.registerPlugin(ScrollTrigger)

// Cada seção ganha um arquivo em src/sections/ com uma função init. Exemplo:
// import { initHero } from './sections/hero.js'
// initHero()
//
// Funções pequenas usadas por várias seções (ex.: "reduzir movimento ligado?") vão em src/lib/.
