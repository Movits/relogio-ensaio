import { test, expect } from '@playwright/test'

// Teste de fumaça: o mínimo para saber que o site abre inteiro.
// Os testes de cada seção entram em arquivos novos nesta pasta.

// Junta erros de JavaScript, do console e arquivos que respondem com erro (ex.: 404 de imagem)
function vigiarErros(page) {
  const erros = []
  page.on('pageerror', (e) => erros.push(`pageerror: ${e.message}`))
  page.on('console', (m) => {
    if (m.type() === 'error') erros.push(`console: ${m.text()}`)
  })
  page.on('response', (r) => {
    if (r.status() >= 400) erros.push(`${r.status()} ${r.url()}`)
  })
  return erros
}

test('abre, tem título e o console fica sem erro', async ({ page }) => {
  const erros = vigiarErros(page)
  const resposta = await page.goto('./')
  expect(resposta.ok()).toBe(true)
  await expect(page).toHaveTitle(/\S/)
  await page.waitForLoadState('networkidle')
  expect(erros).toEqual([])
})

test.describe('no celular (390 px)', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true })

  test('não tem rolagem para os lados', async ({ page }) => {
    await page.goto('./')
    const sobra = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    expect(sobra).toBeLessThanOrEqual(0)
  })
})
