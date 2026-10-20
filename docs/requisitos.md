# Requisitos — Calibre Norte (site de lançamento)

Base: `docs/brief.md`. Versão demonstrativa, página única, em português, só Brasil.

**Legenda de prioridade:** Precisa (sem isso não publica; máximo 6) · Deveria · Poderia · Fora (não entra nesta versão).
**Backend:** 🔌 = exige backend. Ausência da marca = funciona só no navegador (estático).

Itens em aberto no brief (preço, data, origem do movimento, resistência à água, tamanho da caixa, materiais das pulseiras, concorrentes) **não aparecem como número ou afirmação** no site. Onde o conteúdo falta, a tela mostra o texto "a confirmar" ou omite a informação.

## 1. Escopo

### Dentro
- Página única com 6 seções: hero, o relógio por dentro, mostrador, pulseiras, na caixa, lista de espera.
- Uma única ação: entrar na lista de espera, com confirmação simulada (nenhum dado coletado ou armazenado).
- Tom de voz do brief: sóbrio, preciso, "você", sem urgência falsa.
- Funcionamento em celular (390 px) e desktop.

### Fora
- Compra, carrinho, pagamento, cadastro real, login. 🔌
- Coleta, armazenamento ou envio de e-mail da lista de espera. 🔌
- Preço, data de lançamento, estoque e especificações técnicas ainda não definidas.
- Segunda chamada para ação concorrente (ex.: "comprar", "falar conosco").
- Comparação com concorrentes no site, outros idiomas e outros países.
- Contagem regressiva, selos de promoção, as palavras "luxo" e "exclusivo".

## 2. Requisitos funcionais

| ID | Funcionalidade | Requisito | Prioridade | Backend |
|---|---|---|---|---|
| RF-01 | Hero | Apresentar o relógio (aço, mostrador verde) com a promessa "mecânica à vista" e o botão de entrar na lista de espera. | **Precisa** | — |
| RF-02 | O relógio por dentro | Explicar como o movimento automático funciona, em linguagem técnica acessível; origem do movimento marcada "a confirmar". | Deveria | — |
| RF-03 | Mostrador | Mostrar o mostrador verde e o acabamento em destaque, com detalhes legíveis. | Deveria | — |
| RF-04 | Pulseiras | Apresentar as 3 pulseiras trocáveis e como mudam o uso (dia a dia ao social); materiais "a confirmar". | Deveria | — |
| RF-05 | Na caixa | Listar o que vem na caixa (relógio e as 3 pulseiras); itens além disso só se confirmados. | Deveria | — |
| RF-06 | Lista de espera | Receber o e-mail na tela e mostrar confirmação simulada, sem enviar nem guardar o dado. | **Precisa** | — (demo) |
| RF-07 | Lista de espera real | Gravar o e-mail, evitar duplicados, enviar confirmação e respeitar a LGPD. | Fora | 🔌 |
| RF-08 | Botão repetido | Repetir o botão de lista de espera em seções intermediárias, levando ao mesmo formulário. | Poderia | — |
| RF-09 | Navegação por âncoras | Menu simples que leva às seções da página. | Poderia | — |

### Critérios de aceite (funcionais)

**RF-01 Hero**
- Dado que abro o site, quando a página carrega, então vejo o nome Calibre Norte, a promessa principal, a imagem do relógio e o botão de lista de espera.
- Dado o hero, quando clico no botão, então a página vai ao formulário da lista de espera (ou o abre) sem recarregar.

**RF-02 O relógio por dentro**
- Dado que rolo até a seção, quando ela entra na tela, então leio como o movimento automático funciona em frases curtas.
- Dado um dado técnico não confirmado (origem do movimento), quando a seção é exibida, então ele aparece como "a confirmar" e não como fato.

**RF-03 Mostrador**
- Dado a seção do mostrador, quando ela é exibida, então vejo o verde do mostrador em destaque e o texto sobre o acabamento.
- Dado a imagem do mostrador, quando uso leitor de tela, então ela tem texto alternativo descritivo.

**RF-04 Pulseiras**
- Dado a seção das pulseiras, quando ela é exibida, então vejo exatamente 3 pulseiras, cada uma com nome e uso sugerido.
- Dado que escolho uma pulseira (toque ou clique), quando a seleção muda, então o relógio mostrado reflete a pulseira escolhida. *(Se for só texto e imagem fixa, o critério vira: as 3 aparecem lado a lado.)*
- Dado um material não confirmado, quando a pulseira é exibida, então o material aparece como "a confirmar".

**RF-05 Na caixa**
- Dado a seção "na caixa", quando ela é exibida, então vejo a lista de itens incluídos, com o relógio e as 3 pulseiras.
- Dado um item não confirmado, quando a lista é exibida, então ele não aparece.

**RF-06 Lista de espera (demonstração)**
- Dado o formulário, quando envio um e-mail válido, então vejo a mensagem de confirmação simulada, que avisa que é uma demonstração.
- Dado o formulário, quando envio o campo vazio ou um e-mail inválido, então vejo uma mensagem de erro clara e a confirmação não aparece.
- Dado o envio, quando abro a aba de rede do navegador, então não há nenhuma requisição com o e-mail e nada fica salvo (armazenamento local, cookies).

**RF-07 Lista de espera real** 🔌 (Fora desta versão)
- Dado um e-mail novo, quando envio, então ele é gravado e recebo e-mail de confirmação.
- Dado um e-mail já cadastrado, quando envio de novo, então não há duplicidade e vejo uma mensagem neutra.

**RF-08 Botão repetido**
- Dado um botão em qualquer seção, quando clico, então chego ao mesmo formulário do RF-06.

**RF-09 Navegação por âncoras**
- Dado o menu, quando clico em um item, então a página rola até a seção correspondente e o foco do teclado acompanha.

## 3. Requisitos não funcionais

| ID | Requisito | Prioridade | Backend |
|---|---|---|---|
| RNF-01 | Build sem erro | **Precisa** | — |
| RNF-02 | Console limpo | **Precisa** | — |
| RNF-03 | Botão de lista de espera visível na 1ª tela do celular | **Precisa** | — |
| RNF-04 | Sem rolagem lateral em 390 px | **Precisa** | — |
| RNF-05 | Acessibilidade básica (contraste, teclado, texto alternativo, foco visível) | Deveria | — |
| RNF-06 | Desempenho: imagens otimizadas e carregamento sem saltos de layout | Deveria | — |
| RNF-07 | Respeitar `prefers-reduced-motion` em qualquer animação | Deveria | — |
| RNF-08 | Tom de voz conforme o brief (sem termos proibidos) | Deveria | — |
| RNF-09 | Privacidade: sem rastreadores nem coleta nesta versão | Deveria | — |
| RNF-10 | Publicação com HTTPS e domínio próprio | Fora | 🔌 (hospedagem) |

### Critérios de aceite (não funcionais)

**RNF-01 Build sem erro**
- Dado o código do projeto, quando executo o comando de build, então ele termina com código de saída 0, sem erros (avisos são listados e avaliados).
- Dado o build pronto, quando abro a versão gerada, então a página carrega completa.

**RNF-02 Console limpo**
- Dado a página aberta em celular e desktop, quando carrego e percorro todas as seções, então o console não mostra erros nem avisos.
- Dado o envio do formulário (válido e inválido), quando observo o console, então continua sem erros nem avisos.
- Dado qualquer recurso externo (fonte, imagem), quando a página carrega, então não há resposta 404.

**RNF-03 Botão na 1ª tela do celular**
- Dado uma tela de celular com largura de 390 px, quando a página carrega sem rolar, então o botão de lista de espera está inteiro dentro da área visível.
- Dado a barra do navegador do celular aberta (altura útil menor), quando a página carrega, então o botão continua visível sem rolar.
- Dado o botão, quando o toco, então a área de toque é grande o bastante para o dedo e leva ao formulário.

**RNF-04 390 px sem rolagem lateral**
- Dado a largura de 390 px, quando percorro a página de cima a baixo, então a largura do conteúdo não excede a da janela e não há barra de rolagem horizontal.
- Dado larguras maiores (tablet e desktop), quando redimensiono a janela, então também não há rolagem lateral.
- Dado textos longos, quando exibidos em 390 px, então quebram linha em vez de estourar a coluna.

**RNF-05 Acessibilidade básica**
- Dado a navegação só por teclado, quando percorro a página, então alcanço todos os controles na ordem lógica, com foco visível.
- Dado texto sobre o fundo verde ou escuro, quando medido, então o contraste atende ao mínimo AA da WCAG.

**RNF-06 Desempenho**
- Dado a conexão móvel comum, quando a página carrega, então o conteúdo da 1ª tela aparece sem esperar as imagens abaixo dela.
- Dado o carregamento, quando as imagens chegam, então o texto não se desloca.

**RNF-07 Movimento reduzido**
- Dado que o sistema pede menos movimento, quando a página carrega, então as animações ficam desligadas ou reduzidas ao mínimo.

**RNF-08 Tom de voz**
- Dado todo o texto do site, quando o reviso, então não há "promoção", "imperdível", "luxo", "exclusivo", contagem regressiva nem exclamações em série.

**RNF-09 Privacidade**
- Dado a página carregada, quando inspeciono as requisições, então não há script de análise nem cookie de terceiros.

## 4. Resumo das prioridades "Precisa" (6 de 6)

| ID | Requisito |
|---|---|
| RF-01 | Hero com botão |
| RF-06 | Lista de espera (confirmação simulada) |
| RNF-01 | Build sem erro |
| RNF-02 | Console limpo |
| RNF-03 | Botão na 1ª tela do celular |
| RNF-04 | 390 px sem rolagem lateral |

## 5. O que exige backend

| ID | O que | Situação |
|---|---|---|
| RF-07 | Gravar e-mails, deduplicar, confirmar por e-mail, LGPD | Fora desta versão |
| RNF-10 | Hospedagem com HTTPS e domínio | Fora desta versão |

Todo o resto roda no navegador, sem servidor próprio.

## 6. Pendências que bloqueiam conteúdo (do brief)

Preço, data de lançamento, origem do movimento, resistência à água, tamanho da caixa, materiais das pulseiras, lista final de concorrentes. Até o Roberto responder, o site usa "a confirmar" ou omite o dado (RF-02, RF-04, RF-05).

## 7. Decisões a validar

- **[SUPOSIÇÃO]** Pulseiras, mostrador e "por dentro" ficaram como Deveria, porque o limite de 6 "Precisa" foi usado em hero, lista de espera e nos 4 critérios de qualidade. Se o Roberto preferir pulseiras como Precisa (é uma das 3 mensagens), algum outro item sai da lista.
- **[SUPOSIÇÃO]** Seleção interativa de pulseira (RF-04) depende de haver imagens do relógio com cada pulseira; sem elas, vale a versão estática.
