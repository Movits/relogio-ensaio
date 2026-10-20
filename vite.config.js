import { defineConfig } from 'vite'

export default defineConfig({
  // Troque pelo nome do repositório no GitHub: o GitHub Pages publica em
  // https://<usuario>.github.io/<repositorio>/. Em desenvolvimento o endereço também
  // leva a base: http://localhost:5173/relogio-ensaio/
  // Os testes (playwright.config.js) leem este valor, então só precisa trocar aqui.
  base: '/relogio-ensaio/',

  // Sem o modo "SPA" padrão, arquivo que não existe responde 404 de verdade (no dev e no
  // preview), igual ao GitHub Pages. No modo padrão o Vite devolve o index.html com status
  // 200 e uma imagem com o nome errado não aparece como 404 na aba Network (achado do ensaio).
  appType: 'mpa',
})
