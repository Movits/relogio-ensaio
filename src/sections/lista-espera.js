// Lista de espera: validação do e-mail e confirmação simulada (sem fetch, sem storage).
export function init() {
  const secao = document.getElementById('lista-espera')
  if (!secao) return

  const form = secao.querySelector('form')
  const campo = secao.querySelector('input[type="email"]')
  const status = secao.querySelector('[data-status]')
  if (!form || !campo || !status) return

  const mostrar = (texto, tipo) => {
    status.textContent = texto
    status.dataset.tipo = tipo
    campo.setAttribute('aria-invalid', String(tipo === 'erro'))
  }

  form.addEventListener('submit', (evento) => {
    evento.preventDefault()
    campo.value = campo.value.trim()

    if (campo.value === '') {
      mostrar('Digite seu e-mail para entrar na lista de espera.', 'erro')
      campo.focus()
    } else if (!campo.checkValidity()) {
      mostrar('Esse e-mail parece incompleto. Use o formato nome@exemplo.com.', 'erro')
      campo.focus()
    } else {
      form.reset()
      mostrar('Pronto. Isto é uma demonstração: seu e-mail não foi enviado nem guardado.', 'ok')
    }
  })

  // O botão do hero é um link para esta seção; o foco acompanha o salto.
  document.querySelectorAll('a[href="#lista-espera"]').forEach((link) => {
    // setTimeout: o navegador ajusta o foco ao seguir o link; só depois o campo o recebe.
    link.addEventListener('click', () => setTimeout(() => campo.focus({ preventScroll: true }), 0))
  })
}
