---
name: HelpDesk
description: Painel de chamados de suporte de TI com três papéis (admin, técnico, cliente), em que o chamado se lê como um ticket físico com picote.
colors:
  white: "#ffffff"
  gray-100: "#151619"
  gray-200: "#1e2024"
  gray-300: "#535964"
  gray-400: "#858b99"
  gray-500: "#e3e5e8"
  gray-600: "#f9fafa"
  muted: "#676d7b"
  blue-dark: "#2e3da3"
  blue-base: "#5165e1"
  blue-light: "#8996eb"
  danger: "#d03e3e"
  open: "#cc3d6a"
  open-ink: "#a3305a"
  progress: "#355ec5"
  progress-ink: "#355ec5"
  done: "#508b26"
  done-ink: "#3d6b1c"
typography:
  headline:
    fontFamily: "Lato, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.4
  title:
    fontFamily: "Lato, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.4
  title-sm:
    fontFamily: "Lato, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 700
    lineHeight: 1.4
  body:
    fontFamily: "Lato, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.4
  body-sm:
    fontFamily: "Lato, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.4
  label:
    fontFamily: "Lato, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.625rem"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "0.02em"
rounded:
  xs: "4px"
  sm: "5px"
  md: "8px"
  lg: "10px"
  xl: "20px"
  full: "9999px"
spacing:
  control: "40px"
  control-sm: "28px"
  card: "20px"
  card-md: "28px"
  content-x: "24px"
  content-x-md: "48px"
  sidebar: "200px"
  content-max: "1200px"
components:
  button-primary:
    backgroundColor: "{colors.gray-200}"
    textColor: "{colors.white}"
    rounded: "{rounded.sm}"
    padding: "0 16px"
    height: "40px"
  button-primary-hover:
    backgroundColor: "{colors.gray-100}"
  button-secondary:
    backgroundColor: "{colors.gray-500}"
    textColor: "{colors.gray-200}"
    rounded: "{rounded.sm}"
    padding: "0 16px"
    height: "40px"
  button-ghost:
    textColor: "{colors.gray-300}"
    rounded: "{rounded.sm}"
    padding: "0 16px"
    height: "40px"
  button-danger:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.white}"
    rounded: "{rounded.sm}"
    padding: "0 16px"
    height: "40px"
  button-sm:
    rounded: "{rounded.sm}"
    padding: "0 8px"
    height: "28px"
  input:
    textColor: "{colors.gray-200}"
    typography: "{typography.title-sm}"
    height: "40px"
  status-badge:
    typography: "{typography.body-sm}"
    rounded: "{rounded.full}"
    padding: "0 8px"
    height: "28px"
  status-badge-open:
    textColor: "{colors.open-ink}"
  status-badge-progress:
    textColor: "{colors.progress-ink}"
  status-badge-done:
    textColor: "{colors.done-ink}"
  card:
    rounded: "{rounded.lg}"
    padding: "20px"
  nav-item:
    textColor: "{colors.gray-400}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "44px"
  nav-item-active:
    backgroundColor: "{colors.blue-dark}"
    textColor: "{colors.gray-600}"
  ticket-value-stub-total:
    textColor: "{colors.blue-dark}"
    rounded: "{rounded.lg}"
    padding: "24px 20px 20px"
---

# Design System: HelpDesk

> Tokens reconstruídos do arquivo do Figma "Plataforma de Chamados (Community)" **sem o MCP do Figma**. Os valores abaixo são os que o build usa (`web/src/styles/index.css`) e precisam ser conferidos contra o Figma quando o MCP estiver conectado. A paleta padrão do Tailwind é zerada (`--color-*: initial`): só existem as cores listadas aqui.

## Overview

**Creative North Star: "O Balcão de Chamados"**

O HelpDesk se lê como a fila de um balcão de suporte: um shell escuro e fixo (sidebar gray-100) segura uma área de trabalho clara e recortada (gray-600, com o canto superior-esquerdo de 20px descolado da sidebar), e o próprio chamado é tratado como um ticket físico com picote. O ticket é o único motivo ornamental do sistema e aparece em três escalas: a marca (LogoMark), o resumo de valores do detalhe (TicketValueStub) e o ticket 3D/SVG do painel de login.

Fora do ticket, o sistema é ferramenta de trabalho: uma família tipográfica, escala fixa de seis passos, bordas hairline gray-500, tabelas densas e badges de status com ícone e texto. Densidade alta, decoração zero nas listas e formulários. Recusa o dashboard genérico de cards iguais com métricas-herói: os totais por status do admin existem, mas são o filtro da tabela, não um enfeite.

A camada 3D é um acento opcional, nunca uma dependência: carregada sob demanda, sempre com equivalente estático, e desligada onde não ajuda.

**Key Characteristics:**
- Shell escuro fixo + área de conteúdo clara com canto de 20px.
- Lato em uma família só, escala fixa 10/12/14/16/20/24, tudo com line-height 1.4.
- Inputs sublinhados com rótulo xxs maiúsculo em negrito.
- Bordas hairline gray-500 no lugar de sombra; sombra só em camadas flutuantes.
- Assinatura: o picote do ticket (recortes semicirculares + tracejado).
- Status sempre por ícone + texto em pílula tingida.

## Colors

Paleta de produto quase toda neutra, com um azul de marca contido e três cores de status que só aparecem como estado.

### Primary
- **Azul Balcão** (blue-dark): a cor de identidade. Item ativo da navegação, títulos de página (h1), avatares sem foto, o rótulo "Total" e o fundo tingido a 6% do canhoto do TicketValueStub, corpo do LogoMark.
- **Azul Sinal** (blue-base): reservado a interação: anel de foco (2px, offset 2px), borda de input em foco, rótulo do campo em foco, caret, seleção de texto (28%) e o topo do gradiente do painel de marca. Não é cor de preenchimento de botão.
- **Azul Papel-carbono** (blue-light): subtítulo do papel sob o logo, tracejado do picote no LogoMark e no ticket do login, contorno de foco sobre o shell escuro, fundo (15%) do objeto do estado vazio.

### Tertiary (status)
- **Rosa Aberto** (open) / **tinta** (open-ink): status Aberto. A cor base vira fundo a 12% (6% no card de filtro selecionado, borda cheia); o texto e o ícone usam a tinta.
- **Azul Atendimento** (progress) / **tinta** (progress-ink): status Em atendimento, mesma mecânica.
- **Verde Encerrado** (done) / **tinta** (done-ink): status Encerrado, mesma mecânica.
- **Vermelho Alerta** (danger): erros de campo (borda, rótulo, mensagem com ícone), botão destrutivo, lixeira de adicional.

### Neutral
- **Grafite Shell** (gray-100): fundo da página e da sidebar; fundo dos menus flutuantes; hover do botão primário.
- **Grafite Texto** (gray-200): texto principal na área clara, botão primário, divisórias dentro do shell.
- **Cinza Ardósia** (gray-300): texto secundário (serviço, datas, descrições), botão ghost, rótulos de campo em repouso.
- **Cinza Névoa** (gray-400): texto inativo da navegação sobre o shell escuro; borda de hover de inputs e cards; ícone do select.
- **Cinza Hairline** (gray-500): todas as bordas e divisórias na área clara, botão secundário, skeleton.
- **Papel** (gray-600): fundo da área de trabalho, modais, toasts; o "furo" das notches do picote.
- **Cinza Legível** (muted): gray-400 escurecido para AA. Placeholders, cabeçalhos de tabela, títulos pequenos de card (CardLabel).
- **Branco** (white): texto sobre botões cheios e avatares; traços do LogoMark.

### Named Rules
**A Regra da Tinta.** Cor de status nunca é usada como texto no valor do Figma: fundo tingido usa open/progress/done, texto e ícone usam a variante -ink (AA ≥ 4.5:1 sobre o tingido). Os ajustes -ink e muted ficam por cima dos valores do Figma, não os substituem.

**A Regra da Paleta Fechada.** Não existe cor fora desta lista: a paleta do Tailwind está zerada. Variações vêm de opacidade sobre um token (`/6`, `/12`, `/15`, `/30`), nunca de um hex novo.

**A Regra do Azul de Foco.** blue-base sinaliza interação (foco, caret, seleção, campo ativo). Preenchimento de marca é blue-dark.

## Typography

**Fonte única:** Lato 400, 400 itálico e 700 (via @fontsource), com fallback `ui-sans-serif, system-ui, sans-serif`.

**Character:** Uma humanista neutra de produto, em escala fixa e sem tamanhos fluidos: o painel é lido em linhas, não em manchetes. Hierarquia por peso (700) e cor (blue-dark, gray-200, gray-300), não por tamanho.

### Hierarchy
- **Headline** (700, 24px, 1.4): título de página no desktop, em blue-dark. No mobile cai para 20px.
- **Title** (700, 20px, 1.4): título de página no mobile, wordmark "HelpDesk", total do TicketValueStub, contadores dos cards de filtro.
- **Title-sm** (700, 16px, 1.4): título de card de chamado, de modal e de estado vazio. Em peso 400, é o tamanho do texto digitado nos inputs.
- **Body** (400, 14px, 1.4): texto padrão do corpo, células de tabela, botões (700), itens de navegação.
- **Body-sm** (400, 12px, 1.4): metadados, datas, mensagens de erro e dica, badges (700), CardLabel (700, muted), linhas do resumo de valores.
- **Label** (700, 10px, 0.02em, MAIÚSCULO): rótulo de campo e legenda de fieldset; subtítulo do papel sob o logo.

### Named Rules
**A Regra da Escala Fixa.** Só existem os seis passos (10/12/14/16/20/24); a escala do Tailwind está zerada. Nada de clamp(), nada de display maior que 24px.

**A Regra dos Números Tabulares.** Código do chamado (`#00004`), valores em BRL, datas e contagens usam algarismos tabulares; o corpo não.

## Layout

Shell de produto: no desktop (≥ 768px), sidebar fixa de 200px (logo com papel, navegação, card do usuário no rodapé, separados por divisórias gray-200) e área de conteúdo gray-600 que começa 12px abaixo do topo, com o canto superior-esquerdo de 20px, padding 48px × 52px e largura máxima de 1200px centralizada. No mobile, a sidebar vira uma barra superior escura (hambúrguer 40px, logo, avatar) e o conteúdo sobe como uma folha com os dois cantos superiores de 20px e padding 24px × 28px.

Login e cadastro usam a mesma lógica de folha: painel de marca à esquerda (flex-1) e a folha clara à direita, até 680px, com o formulário em coluna de até 400px. No mobile, a marca vira uma faixa estática de 192px atrás do topo da folha.

Ritmo: cabeçalho de página com título à esquerda e ações à direita (empilha no mobile, ações em largura igual); cards com padding 20px (28px no desktop); grid de filtros 2 colunas no mobile, 4 no desktop, gap 8/12px. Tabelas no desktop, cartões empilhados (TicketCard) no mobile. Breakpoint único: 768px.

## Elevation & Depth

Sistema plano com bordas. Superfícies em repouso não têm sombra: a separação é por hairline gray-500 sobre gray-600, e a profundidade principal é o próprio recorte da folha clara sobre o shell escuro. Sombra aparece só no que flutua sobre a página. As sombras são tingidas do gray-100.

### Shadow Vocabulary
- **sm** (`0 1px 2px rgb(21 22 25 / 0.06)`): disponível no tema; sem uso recorrente no build.
- **md** (`0 6px 16px -4px rgb(21 22 25 / 0.12)`): toasts.
- **lg** (`0 24px 48px -12px rgb(21 22 25 / 0.28)`): modais, menu móvel e menu do usuário (estes dois com anel gray-200).
- **Backdrop de modal**: gray-100 a 50% com blur de 2px.

### Named Rules
**A Regra da Hairline.** Card, tabela, canhoto e estado vazio se separam por borda gray-500 de 1px, nunca por sombra. Se precisa de sombra, é porque flutua.

**A Regra do 3D Opcional.** Toda peça 3D é carregada sob demanda (React.lazy, three fora do bundle inicial), tem um equivalente estático exibido no Suspense e no error boundary, e fica desligada com `prefers-reduced-motion`, abaixo de 768px e em GPU por software ou aparelho fraco (≤ 2 núcleos ou ≤ 2 GB). O 3D WebGL existe só no painel de marca do login/cadastro e no objeto do estado vazio, nunca junto de linhas de dados.

## Shapes

Cantos suaves e consistentes por função: 5px em botões, inputs e skeletons; 8px em itens de navegação; 10px em cards, tabelas, menus flutuantes e no TicketValueStub; 20px na folha de conteúdo, nos painéis de autenticação e nos modais; pílula em badges e avatares. Bordas sempre 1px gray-500; o estado vazio usa borda tracejada.

A forma recorrente é o **ticket com picote**: retângulo arredondado com dois recortes semicirculares opostos e uma linha tracejada ligando um ao outro. Ela é a silhueta do LogoMark (recortes laterais, tracejado vertical em blue-light), do ticket do login (recortes no topo e na base) e do TicketValueStub (notches de 28px nas laterais, tracejado de 2px gray-500).

## Components

### Buttons
Diretos e escuros, sem gradiente nem sombra.
- **Shape:** canto de 5px; altura 40px (sm: 28px, padding 8px, texto 12px); texto 14px negrito; ícone a 1.125em.
- **Primary:** grafite gray-200 com texto branco; hover e active escurecem para gray-100.
- **Secondary:** gray-500 com texto gray-200; hover a 70%. É o padrão dos botões só de ícone.
- **Ghost:** sem fundo, texto gray-300; hover ganha fundo gray-500.
- **Danger:** danger com texto branco; hover a 85%.
- **Estados:** transição de cor 150ms; desabilitado a 50% sem ponteiro; carregando troca o ícone por um spinner e marca aria-busy. Botão só de ícone exige rótulo acessível (aria-label + title).

### Status Badge
- **Style:** pílula de 28px, padding 8px, ícone lucide 16px + texto 12px negrito; fundo da cor de status a 12%, texto em -ink. Ícones: Aberto = círculo de interrogação, Em atendimento = relógio, Encerrado = círculo com check.
- **Movimento:** flip 3D em CSS (rotateX de -90° a 0°, 420ms, ease-out-expo) **só quando o status muda**, nunca no primeiro render; desligado em reduced-motion.

### Cards / Containers
- **Corner Style:** 10px.
- **Background:** transparente sobre o papel gray-600.
- **Shadow Strategy:** nenhuma (ver A Regra da Hairline).
- **Border:** 1px gray-500; hover e foco interno sobem para gray-400 em cards clicáveis.
- **Internal Padding:** 20px, 28px no desktop. Título de seção do card em 12px negrito muted.
- **TicketCard (mobile/fila):** código tabular, título 16px com link esticado sobre o card, serviço, badge à direita; linha de data e total; rodapé com avatar e ações rápidas de status, separado por hairline.

### Inputs / Fields
- **Style:** sublinhado: só borda inferior gray-500, fundo transparente, altura 40px, texto 16px gray-200, placeholder muted. Rótulo acima em 10px maiúsculo negrito gray-300. Select com chevron gray-400 à direita; prefixo fixo opcional ("R$") em negrito.
- **Focus:** borda inferior e rótulo passam a blue-base; hover da borda em gray-400.
- **Error / Disabled:** borda e rótulo em danger, mensagem 12px com ícone de alerta e role="alert"; dica em 12px itálico gray-300. Desabilitado com texto gray-400.

### Tables
- Dentro de um contêiner de 10px com borda gray-500 e rolagem horizontal. Cabeçalho de 48px em 14px negrito muted; linhas de 64px separadas por hairline, hover gray-500 a 30%. Padding lateral de 12px.

### Navigation
- **Sidebar:** itens de 44px, canto 8px, ícone 20px + texto 14px. Inativo gray-400, hover com fundo gray-200 e texto gray-500; ativo com fundo blue-dark e texto gray-600. Foco em blue-light sobre o escuro.
- **Mobile:** botão hambúrguer gray-200 de 40px abre um painel flutuante gray-100 (canto 10px, sombra lg, anel gray-200) com a mesma lista; fecha ao navegar, ao clicar fora e com Esc.

### Modal
- `<dialog>` nativo com focus trap, até 440px, canto 20px, fundo gray-600, sombra lg. Cabeçalho e rodapé separados por hairline; botões do rodapé dividem a largura.

### Filtro de status (admin)
- Quatro cards (Todos, Abertos, Em atendimento, Encerrados) com ícone em círculo tingido, contagem 20px tabular e rótulo; são botões com aria-pressed que filtram a tabela abaixo. Selecionado: borda na cor de status e fundo a 6%, com check.
- **Inclinação:** até 6° em CSS (framer-motion, perspectiva 800px) com brilho especular que segue o ponteiro; só com ponteiro fino e sem reduced-motion. Sem WebGL.

### Ticket Value Stub (assinatura)
O resumo de valores do detalhe é o canhoto de um ticket. Corpo com "Valores", preço base (serviço) e adicionais em 12px tabular, com lixeira ghost por adicional quando o técnico pode remover. No meio, o **picote real**: duas notches semicirculares de 28px cobrindo a borda (preenchidas de gray-600, com contorno só no arco interno) ligadas por um tracejado de 2px gray-500. Abaixo, o canhoto com fundo blue-dark a 6%, rótulo "Total" em blue-dark e o valor em 20px negrito tabular.
- **Movimento:** o total é "carimbado" (desce 6px de 1.08× com blur de 1px e cor blue-dark, 520ms, ease-out-expo) **só quando o valor muda**; aria-live polite.
- **Ecos:** o LogoMark (ticket blue-dark com recortes laterais e tracejado blue-light) e o ticket do login (cena 3D flutuando que segue o ponteiro; fallback SVG inclinado -6° sobre gradiente radial blue-base → blue-dark → gray-100).

### Estado vazio
- Contêiner de 10px com borda tracejada gray-500, centralizado, título 16px e descrição 14px. Objeto acima: cena 3D pequena girando devagar quando permitido; caso contrário, ícone lucide em círculo blue-light a 15%.

## Do's and Don'ts

### Do:
- **Do** usar só os tokens de cor listados; variações por opacidade sobre um token.
- **Do** mostrar status sempre com ícone + texto, em pílula tingida a 12% com texto -ink.
- **Do** separar superfícies na área clara com hairline gray-500 de 1px; sombra só em modal, menu e toast.
- **Do** usar inputs sublinhados com rótulo de 10px maiúsculo negrito acima.
- **Do** usar algarismos tabulares em códigos, valores, datas e contagens.
- **Do** dar a toda peça 3D carregamento sob demanda, fallback estático e desligamento em reduced-motion, < 768px e GPU por software.
- **Do** animar badge e total só quando o valor muda, nunca no primeiro render.
- **Do** reservar a forma de ticket com picote para a marca, o resumo de valores e o painel de login.

### Don't:
- **Don't** introduzir cores da paleta padrão do Tailwind ou hex avulsos; ela está zerada.
- **Don't** usar open, progress ou done como cor de texto; use a variante -ink.
- **Don't** criar tamanhos de fonte fora de 10/12/14/16/20/24 nem uma segunda família.
- **Don't** colocar 3D WebGL junto de linhas de dados, tabelas ou formulários.
- **Don't** inclinar cards além de 6° nem aplicar tilt fora dos cards de filtro do admin.
- **Don't** preencher botões com blue-base; ele é a cor de foco.
- **Don't** fazer da linha de cards de métrica um enfeite: se existir, ela filtra o conteúdo abaixo.
