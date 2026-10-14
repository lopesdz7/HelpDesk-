# HelpDesk — Sistema de Gerenciamento de Chamados

Aplicação full-stack com três perfis (Administrador, Técnico e Cliente). A especificação completa está em [BRIEFING-HELPDESK.md](BRIEFING-HELPDESK.md).

| Pacote | Stack |
|---|---|
| [`api/`](api/) | Node.js + Express + Prisma (PostgreSQL) + Zod + JWT + Jest |
| [`web/`](web/) | Vite + React + TypeScript + TailwindCSS |

> Em construção. As instruções de execução local, as contas de teste e os links de deploy serão adicionados ao longo das fases.

## Decisões

Pontos que o briefing não define, resolvidos pela opção mais simples:

1. **Métricas do admin**: os 3 cards (abertos / em atendimento / encerrados) ficam no topo da tela *Chamados* do admin, já que o briefing não prevê uma tela de dashboard.
2. **3D em estados vazios**: o objeto 3D só aparece quando a lista está vazia, no lugar dela, nunca junto com linhas de tabela.
3. **Fuso da atribuição automática**: `America/Sao_Paulo` (variável `TZ_BUSINESS`). O bloco `"08:00"` cobre de 08:00 a 08:59.
4. **Carga do técnico**: número de chamados `open` + `in_progress`. Entre vários técnicos disponíveis, vence o de menor carga; o empate é decidido pelo cadastro mais antigo.
5. **Transições de status**: o técnico só avança um passo por vez (`open → in_progress → closed`); o admin pode definir qualquer status.
6. **Serviços adicionais**: só podem ser adicionados ou removidos com o chamado em `in_progress`.
7. **Excluir cliente** apaga os chamados dele (cascade do schema); o modal de confirmação avisa isso.
8. **Técnicos não são excluídos** (não há rota para isso).
9. **O admin não troca a senha do técnico**: `PUT /technicians/:id` edita nome, e-mail e horários.
10. **Senha**: mínimo de 6 caracteres.
11. **`GET /services`**: o cliente vê só os ativos; técnico e admin veem todos (filtro opcional `?active=`).
12. **Schemas Zod do front** duplicados em `web/src/lib/schemas.ts` (em vez de um pacote compartilhado), para manter os deploys de Render e Vercel independentes.
13. **Disponibilidade**: blocos com início entre 07:00 e 22:00. Na grade do front: manhã 07–12, tarde 13–18, noite 19–22.
