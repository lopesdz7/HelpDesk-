# HelpDesk — Sistema de Gerenciamento de Chamados

Aplicação full-stack com três perfis (Administrador, Técnico e Cliente). A especificação completa está em [BRIEFING-HELPDESK.md](BRIEFING-HELPDESK.md).

| Pacote | Stack |
|---|---|
| [`api/`](api/) | Node.js + Express + Prisma (PostgreSQL) + Zod + JWT + Jest |
| [`web/`](web/) | Vite + React + TypeScript + TailwindCSS |

> Em construção. Os links de deploy e os prints serão adicionados ao fim do projeto.

## Executando localmente

Pré-requisitos: Node.js 22+ e Docker.

```bash
# 1. Banco de dados (PostgreSQL 16, cria também o banco helpdesk_test)
docker compose up -d

# 2. API
cd api
cp .env.example .env
cp .env.test.example .env.test
npm install            # também roda `prisma generate`
npm run db:migrate     # aplica as migrations
npm run db:seed        # popula com dados de exemplo
npm run dev            # http://localhost:3333

# Testes (usam o banco helpdesk_test)
npm test
```

**Sem Docker?** Rode `npm run db:local` em `api/`. Ele sobe um PostgreSQL 16 embutido (pacote `embedded-postgres`) em `localhost:5432`, já com os bancos `helpdesk` e `helpdesk_test`, e os demais passos são os mesmos.

### Contas de teste (seed)

Todas usam a senha `123456`.

| Perfil | E-mail | Observação |
|---|---|---|
| Admin | admin@test.com | |
| Técnico | carlos.silva@test.com | 08–12 e 14–18 |
| Técnico | ana.oliveira@test.com | 10–14 e 16–20 |
| Técnico | lucas.martins@test.com | 12–16 e 18–22 |
| Cliente | andre.costa@test.com | |
| Cliente | julia.maria@test.com | |

O seed não faz nada se `admin@test.com` já existir (pode ser rodado de novo sem duplicar dados).

## API

Base local: `http://localhost:3333`. Todas as rotas, exceto `POST /sessions` e `POST /users`, exigem `Authorization: Bearer <token>`.

| Método | Rota | Acesso |
|---|---|---|
| POST | `/sessions` | público |
| POST | `/users` | público (cadastro de cliente) |
| GET / PUT / DELETE | `/profile` | autenticado (DELETE só cliente) |
| PATCH | `/profile/password` | autenticado |
| PATCH / DELETE | `/profile/avatar` | autenticado (multipart, campo `avatar`) |
| GET / POST | `/technicians` | admin |
| GET / PUT | `/technicians/:id` | admin |
| GET | `/clients` | admin |
| PUT / DELETE | `/clients/:id` | admin |
| GET | `/services` | autenticado (cliente vê só ativos; `?active=` para os demais) |
| POST / PUT | `/services`, `/services/:id` | admin |
| PATCH | `/services/:id/status` | admin |
| GET | `/tickets` | todos (escopo por papel; `?status=`) |
| GET | `/tickets/:id` | dono, técnico atribuído ou admin |
| POST | `/tickets` | cliente |
| PATCH | `/tickets/:id/status` | técnico atribuído ou admin |
| POST | `/tickets/:id/additional-services` | técnico atribuído |
| DELETE | `/tickets/:id/additional-services/:serviceId` | técnico atribuído |
| GET | `/uploads/:file` | estático |

As listagens aceitam `?page=&perPage=` (padrão 1 e 10, máximo 100) e respondem `{ data, meta: { page, perPage, total, totalPages } }`. Os erros seguem o formato `{ message, issues? }`. Os chamados vêm com `servicePrice` (preço do serviço na abertura), `additionalTotal` e `total`, já calculados.

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
14. **Valores dos serviços no seed** (o briefing não define): softwares R$ 120, hardwares R$ 180, vírus R$ 150, impressoras R$ 90, periféricos R$ 80, conectividade R$ 110, backup R$ 200, otimização do SO R$ 130, VPN R$ 160.
15. **Testes**: o `globalSetup` aplica as migrations com `prisma migrate deploy` no banco de teste e cada suíte limpa as tabelas com `TRUNCATE`. Não usamos `migrate reset`.
16. **Sem técnicos cadastrados**: a criação de chamado responde 503 ("Nenhum técnico cadastrado"), já que não há a quem atribuir.
17. **Métricas do admin**: são obtidas por `GET /tickets?status=<x>&perPage=1` (lendo `meta.total`), sem criar uma rota extra fora do briefing.
