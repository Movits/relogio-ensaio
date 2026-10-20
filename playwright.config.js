import { defineConfig } from '@playwright/test'
import viteConfig from './vite.config.js'

// Testes de ponta a ponta: geram o build, sobem o preview e abrem o site num Chrome de verdade.
// Uso: npm test   (ou npx playwright test)
//
// A base vem do vite.config.js: trocou lá, os testes acompanham.
// Porta 4174 só para os testes, separada do "npm run preview" manual (4173), para os testes
// não reaproveitarem por engano um preview antigo que ficou aberto.
const PORTA = 4174
const URL_DO_SITE = `http://localhost:${PORTA}${viteConfig.base ?? '/'}`

export default defineConfig({
  testDir: 'tests',
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: URL_DO_SITE,
    channel: 'chrome', // usa o Google Chrome instalado (não precisa de "npx playwright install")
    trace: 'retain-on-failure',
  },
  webServer: {
    command: `npm run build && npm run preview -- --port ${PORTA} --strictPort`,
    url: URL_DO_SITE,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
