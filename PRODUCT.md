# Product

<!-- impeccable:product-schema 1 -->

> Escrito a partir do BRIEFING-HELPDESK.md sem entrevista: o usuário pediu execução autônoma ("pode seguir tudo sem minha permissão"). Itens marcados *(inferido)* não vêm do briefing e devem ser confirmados.

## Platform

web

## Stack

Fixada pelo briefing: API Node.js + Express + Prisma (PostgreSQL) + Zod + JWT; SPA Vite + React + TypeScript + TailwindCSS; react-router-dom, @tanstack/react-query, react-hook-form + Zod, axios, framer-motion, lucide-react; three + @react-three/fiber + @react-three/drei apenas na camada 3D. Deploy: API no Render, web na Vercel.

## Users

- **Cliente**: pessoa ou pequena empresa que precisa de suporte de TI. Abre chamados (título, descrição, um serviço), acompanha o andamento e o valor. Usa ocasionalmente, muitas vezes no celular *(inferido)*.
- **Técnico**: atende os chamados atribuídos a ele. Inicia e encerra atendimentos e lança serviços adicionais com valor. Usa várias vezes ao dia, durante o expediente.
- **Administrador**: gerencia técnicos (incluindo os horários de disponibilidade), clientes e o catálogo de serviços, vê todos os chamados e altera o status de qualquer um.

## Product Purpose

Sistema de gerenciamento de chamados de suporte de TI com três painéis por papel. Sucesso: o cliente abre um chamado em segundos e sabe quanto vai custar; ele é atribuído automaticamente a um técnico disponível; o técnico vê o que fazer a seguir; o admin enxerga a operação inteira.

## Positioning

A atribuição é automática pelo horário de disponibilidade do técnico (blocos de 1 hora entre 07:00 e 23:00) e, sem ninguém disponível, pela menor carga. O valor fica transparente: preço do serviço congelado na abertura, mais os serviços adicionais lançados pelo técnico.

## Operating Context

- Chamados com código sequencial exibido como `#00004`; status **Aberto**, **Em atendimento** e **Encerrado**.
- Valores em BRL (`Intl.NumberFormat('pt-BR')`) e datas em `dd/MM/yy HH:mm`.
- Interface inteira em português do Brasil.

## Capabilities and Constraints

- As regras de negócio estão no BRIEFING-HELPDESK.md (seção 4), e as decisões tomadas onde ele não define nada estão no README.md, seção "Decisões".
- O técnico não altera os próprios horários, não cria nem exclui chamados. O cliente não altera status.
- Serviços nunca são apagados, só desativados.
- Avatar: só jpg/png, até 3 MB.
- Responsivo de 360 px a 1440 px+, com a versão mobile seguindo os frames do Figma.

## Brand Commitments

- **Referência visual obrigatória**: o arquivo do Figma "Plataforma de Chamados (Community)" (https://www.figma.com/design/53o7XjVQIfl966bWHN4ZBZ). Login e cadastro em tela dividida, sidebar escura com logo, navegação por papel e card do usuário no rodapé, área de conteúdo clara com cantos arredondados, tabelas com badges de status, detalhe com resumo de valores e menu hambúrguer no mobile.
- Badges de status com ícone e texto, nas cores Aberto (rosa/vermelho), Em atendimento (azul) e Encerrado (verde).
- Camada 3D só nos quatro lugares da seção 7.2 do briefing, sempre com fallback estático e respeito a reduced-motion.
- Nome do produto: **HelpDesk**.

## Evidence on Hand

- Não há logotipo, fotos nem ilustrações fornecidas. O MCP do Figma não estava conectado na construção, então os tokens foram reconstruídos a partir do arquivo de referência e precisam ser conferidos *(pendente)*.
- Os dados de exemplo vêm do seed (`api/prisma/seed.ts`): fictícios, não são clientes reais.

## Product Principles

1. O painel é ferramenta de trabalho: as tabelas, os formulários e as listas não levam decoração.
2. O próximo passo de cada papel precisa estar sempre visível: abrir chamado, iniciar ou encerrar atendimento, mudar status.
3. O valor do chamado nunca é surpresa: base, adicionais e total sempre explícitos.
4. O status se lê por ícone e texto, nunca só pela cor.

## Accessibility & Inclusion

Contraste AA, foco visível, navegação completa por teclado, `aria-label` em botões só com ícone, modais com focus trap, `prefers-reduced-motion` respeitado (inclusive desligando o 3D). Meta de Lighthouse Performance ≥ 85 no login mobile.
