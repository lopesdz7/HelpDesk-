---
version: 1
slug: "web-src-app-tsx"
primary_target: "web/src/App.tsx"
related_targets: []
---

# HelpDesk web app (todas as telas do SPA)

Scope: SPA inteiro em web/ (auth, painéis admin/técnico/cliente). Visitor mode: **Operate**. Build path: code-led (superfície Operate; sem geração de imagem).

Audience/job: técnico atende a fila do dia; admin gerencia operação; cliente abre e acompanha chamados (muitas vezes no celular). Constraints: briefing seções 4 e 7; Figma "Plataforma de Chamados" é a autoridade visual pinada (tokens reconstruídos sem MCP — conferir quando conectado).

Direção pinada pelo brief (concept-seed não rodou: "a user- or brief-pinned direction beats the roll").

## Direction contract

THESIS: Um painel de chamados que se lê como a fila de um balcão de suporte: shell escuro e fixo, área de trabalho clara e recortada, e o próprio chamado tratado como um ticket físico com picote. Recusa o dashboard genérico de cards iguais e métricas-herói.

OWN-WORLD: Sidebar gray-100 (#151619) com logo e papel em azul-claro; conteúdo gray-600 (#F9FAFA) com canto superior-esquerdo de 20px descolado da sidebar; Lato em uma família só, escala fixa 10/12/14/16/20/24; inputs sublinhados com rótulo xxs maiúsculo; botões gray-200 5px; badges pílula tingidas (open #CC3D6A, progress #355EC5, done #508B26) com ícone lucide; bordas gray-500 hairline; tabelas densas.

STORY: O cliente entende quanto custa e quem vai atender; o técnico sabe qual chamado iniciar ou encerrar; o admin vê a operação e corrige.

FIRST VIEWPORT: Desktop — sidebar 200px à esquerda (logo, papel, nav com item ativo em blue-dark, card do usuário no rodapé), conteúdo com título 24px "Chamados" e ação primária à direita no topo; abaixo, tabela em card com bordas. Mobile — barra superior escura com hambúrguer, logo e avatar; conteúdo em cartões empilhados. Login — painel de marca à esquerda (cena 3D do ticket no desktop, gradiente estático no mobile), formulário em cards à direita, sobre fundo claro arredondado.

FORM: Shell de produto padrão (side rail + conteúdo), assinatura = **picote do ticket**: o resumo de valores do detalhe é um canhoto com recortes semicirculares e linha tracejada separando base/adicionais do total, ecoando o ticket 3D do login e o flip 3D do badge. Posição: direção pinada pelo brief (sem lista ordenada); seed key: none (pinned-by-brief).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved
- Conferir todos os tokens contra o Figma quando o MCP estiver conectado.
