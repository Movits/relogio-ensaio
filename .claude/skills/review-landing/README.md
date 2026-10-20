# Skill `review-landing`

Uma "receita de revisão" para o Claude Code. Quando você digita `/review-landing` (ou pede "revisa a
landing", "revisa o site"), o Claude revisa a sua landing page **sem mudar nada**: roda o build, abre o site
num Chrome de verdade em três larguras, mede o que dá para medir, olha as capturas de tela e devolve um
relatório com nota de 0 a 10 por área. No fim, ele oferece aplicar as correções que você escolher.

Feita para o Workshop de IA da WRW (20/10/2026), com o site SONORA como exemplo. Serve para qualquer
landing page ou site estático (HTML, CSS e JavaScript, com ou sem Vite).

## O que tem na pasta

```text
review-landing/
├── SKILL.md            ← a receita: quando usar, passo a passo, critérios e formato do relatório
├── README.md           ← este arquivo (para pessoas; o Claude segue o SKILL.md)
└── scripts/
    └── checar.mjs      ← script que abre o site no Chrome e mede (console, imagens, títulos, peso...)
```

## Antes de instalar: leia o que a skill faz

Uma skill é um conjunto de instruções (e às vezes programas) que o Claude vai seguir **no seu computador**.
Antes de instalar qualquer skill de terceiros, inclusive esta, abra o `SKILL.md` e os scripts e confira:
que comandos ela roda, se envia algo para a internet, se lê arquivos de segredo (como o `.env`) e se apaga ou
muda arquivos. Se não entender algum trecho, pergunte ao próprio Claude o que ele faz antes de usar.

O que esta skill faz e não faz:

- Abre só a URL que você passar (normalmente `localhost`). Não envia dados para nenhum serviço.
- Escreve apenas na pasta `review-landing/` da raiz do projeto (capturas e `resultado.json`).
- Não edita o seu código, não instala pacotes sem perguntar e não abre o `.env`.

## Requisitos

- [Node.js](https://nodejs.org) 22 ou mais novo.
- Google Chrome instalado (o script usa o Chrome do sistema, então não baixa outro navegador).
- `@playwright/test` instalado no projeto. Se não tiver: `npm i -D @playwright/test`
  (isso acrescenta uma linha no `package.json`).

## Como instalar em outro projeto

**Só num projeto** (a skill vai junto para o Git e vale para quem clonar): copie a pasta para
`.claude/skills/` dentro do projeto.

```powershell
# Windows (PowerShell), dentro da pasta do SEU projeto
New-Item -ItemType Directory -Force .claude\skills
Copy-Item -Recurse C:\caminho\para\sonora\.claude\skills\review-landing .claude\skills\
```

```bash
# macOS ou Linux, dentro da pasta do SEU projeto
mkdir -p .claude/skills
cp -R /caminho/para/sonora/.claude/skills/review-landing .claude/skills/
```

**Em todos os seus projetos**: copie a mesma pasta para `~/.claude/skills/`
(no Windows: `C:\Users\<seu-usuário>\.claude\skills\`). O script procura o Playwright no projeto que está
sendo revisado, então funciona igual dos dois jeitos.

Depois:

1. Acrescente esta linha ao `.gitignore` do projeto, para as capturas não irem para o Git:

   ```gitignore
   /review-landing/
   ```

   A barra no começo é importante: sem ela, o Git ignoraria também a pasta da skill em
   `.claude/skills/review-landing/`.
2. Abra uma sessão nova do Claude Code na pasta do projeto e digite `/skills` (ou só `/`) para ver se a
   `review-landing` aparece (o nome do menu pode variar com a versão).

## Como usar

1. Deixe o site rodando, por exemplo com `npm run preview` (ou deixe o Claude subir o servidor).
2. No Claude Code, digite:

   ```text
   /review-landing
   ```

   Pode passar a URL junto: `/review-landing http://localhost:5173/`. Se o `vite.config.js` tiver `base`
   (no SONORA é `/sonora/`), a URL precisa terminar nela: `http://localhost:4173/sonora/`.
3. Também funciona sem a barra: "revisa a landing", "o site tá bom pra publicar?". O Claude reconhece pela
   descrição da skill.

Dica: use o modo **Plan** (ou Manual) numa sessão nova. Quem construiu a página tende a defender o que fez;
uma conversa limpa revisa com olhos de fora.

## O que esperar

1. O Claude lê o `CLAUDE.md`, o `README.md` e o `package.json`, roda `npm run build` e sobe o site.
2. Roda o script (cerca de 1 minuto) e olha as capturas em `review-landing/`.
3. Entrega o relatório:
   - uma tabela `| Área | Nota 0-10 | Evidência | Correção sugerida |` para visual, responsividade,
     acessibilidade, performance, animações e código;
   - as 3 prioridades, com onde mexer e como conferir;
   - "o que não consegui verificar" (por exemplo, Safari no iPhone ou um celular fraco de verdade).
4. Pergunta quais correções aplicar e **para** ali. Nada muda até você responder.

Confira com `git status`: depois da revisão, nenhum arquivo do projeto deve aparecer como modificado.

## Rodar só o script (sem o Claude)

Na raiz do projeto, com o site rodando:

```bash
node .claude/skills/review-landing/scripts/checar.mjs http://localhost:4173/
```

Ele imprime um resumo legível e um JSON, e salva em `review-landing/`:

| Arquivo | O que é |
|---|---|
| `desktop-1.jpg` a `-6`, `tablet-*`, `celular-*` | a página do topo ao fim em 1440, 768 e 390 px |
| `foco-desktop.jpg` | a tela depois do primeiro Tab (mostra o foco do teclado) |
| `reduzido-desktop.jpg`, `reduzido-celular.jpg` | primeira tela com "reduzir movimento" ligado |
| `sem-js-desktop.jpg` | primeira tela com o JavaScript desligado |
| `resultado.json` | todos os números medidos |

Se faltar alguma coisa (Playwright, Chrome, site fora do ar, URL errada), o script diz o que fazer.

## Como adaptar

- **Outros critérios:** edite a seção "Os critérios" do `SKILL.md` (ex.: regras do manual da sua marca).
- **Outras larguras:** mude a lista `TELAS` no começo do `scripts/checar.mjs`.
- **Outro formato de relatório:** troque o modelo em "Formato do relatório" no `SKILL.md`.

Mantenha a `description` do `SKILL.md` dizendo o que a skill faz **e** quando usar: é por ela que o Claude
decide abrir a skill sozinho.
