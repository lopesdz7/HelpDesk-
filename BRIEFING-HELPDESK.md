# Briefing — Sistema de Gerenciamento de Chamados (HelpDesk)

> Documento para o Claude Code. Leia inteiro antes de começar. Use as skills de design (impeccable design) em toda a camada de front-end.
> Referência visual: Figma "Plataforma de Chamados (Community)" — https://www.figma.com/design/53o7XjVQIfl966bWHN4ZBZ/Plataforma-de-Chamados--Community-?node-id=0-1
> Se o MCP do Figma estiver disponível, extraia dele cores, tipografia, espaçamentos e componentes antes de escrever qualquer CSS. O Figma é a base; a camada 3D descrita na seção 7 é um acréscimo por cima dele, não um substituto.

---

## 1. Objetivo

Aplicação full-stack de gerenciamento de chamados com três perfis — **Administrador**, **Técnico** e **Cliente** — cada um com seu próprio painel. Back-end em API REST, front-end SPA, ambos em TypeScript, com deploy público.

## 2. Requisitos técnicos (obrigatórios)

| Camada | Tecnologia |
|---|---|
| Back-end | Node.js + **Express.js** |
| Banco | **PostgreSQL** |
| Acesso a dados | **Prisma** (escolhido no lugar do Knex) |
| Validação | **Zod** (body, params e query em todas as rotas) |
| Autenticação | **JWT** (Bearer token) + senha com bcrypt |
| Testes | **Jest** (+ Supertest para rotas) |
| Front-end | **Vite** + React + TypeScript + **TailwindCSS** |
| Infra local | **Docker** (docker-compose com PostgreSQL; Dockerfile da API) |
| Deploy | API no **Render**; front-end na **Vercel** (ou Netlify) |
| Linguagem | **TypeScript** em todo o projeto |

Bibliotecas complementares sugeridas: `react-router-dom`, `@tanstack/react-query`, `react-hook-form` + `@hookform/resolvers/zod`, `axios`, `multer` (upload de avatar), `three` + `@react-three/fiber` + `@react-three/drei` (camada 3D), `framer-motion` (micro-interações), `lucide-react` (ícones).

## 3. Estrutura do repositório

```
helpdesk/
├─ api/
│  ├─ prisma/ (schema.prisma, migrations/, seed.ts)
│  ├─ src/
│  │  ├─ app.ts / server.ts
│  │  ├─ env.ts                (variáveis validadas com Zod)
│  │  ├─ routes/               (index + um arquivo por recurso)
│  │  ├─ controllers/
│  │  ├─ middlewares/          (ensureAuthenticated, verifyUserAuthorization(roles[]), errorHandling)
│  │  ├─ utils/AppError.ts
│  │  ├─ configs/ (auth.ts, upload.ts)
│  │  └─ tests/                (*.test.ts)
│  ├─ Dockerfile
│  ├─ jest.config.ts
│  └─ .env.example
├─ web/
│  ├─ src/
│  │  ├─ components/ (ui/, layout/, three/)
│  │  ├─ pages/ (auth/, admin/, technician/, client/)
│  │  ├─ routes/ (AuthRoutes, AdminRoutes, TechnicianRoutes, ClientRoutes)
│  │  ├─ hooks/ contexts/ services/ lib/ styles/
│  └─ .env.example
├─ docker-compose.yml
└─ README.md
```

## 4. Regras de negócio

### Administrador
- Conta criada pelo seed (não há cadastro público de admin).
- **Técnicos**: criar, listar, editar. Ao criar, define nome, e-mail, senha provisória e **horários de disponibilidade**.
  - Horários disponíveis: blocos de 1 hora entre 07:00 e 23:00.
  - Padrão sugerido ao criar: 08:00–12:00 e 14:00–18:00 (comercial).
- **Serviços**: criar, listar, editar e **desativar** (soft delete — nunca apagar, pois chamados antigos os referenciam). Serviço tem título e valor (R$).
- **Clientes**: listar, editar e excluir.
- **Chamados**: vê todos e pode alterar o status de qualquer um.

### Técnico
- Edita o próprio perfil (nome, e-mail, avatar) e troca a senha. **Não** pode alterar os próprios horários — só o admin.
- Vê apenas os chamados atribuídos a ele.
- Altera o status: `aberto` → `em_atendimento` → `encerrado`.
- Pode **adicionar e remover serviços adicionais** ao chamado durante o atendimento (título + valor).
- Não cria nem exclui chamados.

### Cliente
- Cadastro público (nome, e-mail, senha) e login.
- Cria chamado informando título, descrição e **um serviço** (categoria). O técnico é atribuído **automaticamente** a um técnico disponível no horário de criação; se ninguém estiver disponível, escolher o de menor carga de chamados abertos.
- Vê apenas os próprios chamados (lista + detalhe). Não altera status, não edita.
- Edita perfil, troca senha, envia/remove avatar e pode **excluir a própria conta**.

### Gerais
- Valor total do chamado = valor do serviço base + soma dos serviços adicionais. Guardar o valor do serviço **no momento da abertura** (snapshot), para mudanças de preço não alterarem chamados antigos.
- Avatar: só `.jpg`/`.png`, máx. 3 MB. Remover o arquivo antigo ao trocar.
- Toda rota, exceto login e cadastro de cliente, exige JWT. Autorização por papel em middleware.
- Erros padronizados `{ message, issues? }` com status corretos (400 Zod, 401, 403, 404, 409 e-mail duplicado).

## 5. Modelo de dados (Prisma — ponto de partida)

```prisma
enum UserRole { admin technician client }
enum TicketStatus { open in_progress closed }

model User {
  id           String    @id @default(uuid())
  name         String
  email        String    @unique
  password     String
  role         UserRole  @default(client)
  avatar       String?
  availability String[]  @default([])   // ["08:00","09:00",...] — só técnicos
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")
  ticketsAsClient     Ticket[] @relation("ClientTickets")
  ticketsAsTechnician Ticket[] @relation("TechnicianTickets")
  @@map("users")
}

model Service {
  id        String   @id @default(uuid())
  title     String
  price     Decimal  @db.Decimal(10, 2)
  active    Boolean  @default(true)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  tickets   Ticket[]
  @@map("services")
}

model Ticket {
  id           String       @id @default(uuid())
  code         Int          @default(autoincrement()) @unique   // exibido como #00004
  title        String
  description  String
  status       TicketStatus @default(open)
  servicePrice Decimal      @db.Decimal(10, 2) @map("service_price")
  clientId     String       @map("client_id")
  technicianId String       @map("technician_id")
  serviceId    String       @map("service_id")
  client       User    @relation("ClientTickets", fields: [clientId], references: [id], onDelete: Cascade)
  technician   User    @relation("TechnicianTickets", fields: [technicianId], references: [id])
  service      Service @relation(fields: [serviceId], references: [id])
  additionalServices AdditionalService[]
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")
  @@map("tickets")
}

model AdditionalService {
  id        String   @id @default(uuid())
  title     String
  price     Decimal  @db.Decimal(10, 2)
  ticketId  String   @map("ticket_id")
  ticket    Ticket   @relation(fields: [ticketId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now()) @map("created_at")
  @@map("additional_services")
}
```

**Seed**: 1 admin (`admin@test.com` / `123456`), 3 técnicos com turnos diferentes (08–12/14–18, 10–14/16–20, 12–16/18–22), 9 serviços (Instalação e atualização de softwares, Instalação e atualização de hardwares, Diagnóstico e remoção de vírus, Suporte a impressoras, Suporte a periféricos, Solução de problemas de conectividade de internet, Backup e recuperação de dados, Otimização de desempenho do sistema operacional, Configuração de VPN e Acesso Remoto) e alguns chamados de exemplo.

## 6. API REST

| Método | Rota | Acesso |
|---|---|---|
| POST | `/sessions` | público |
| POST | `/users` (cadastro de cliente) | público |
| GET / PUT / DELETE | `/profile` | autenticado (DELETE só cliente) |
| PATCH | `/profile/password` | autenticado |
| PATCH / DELETE | `/profile/avatar` | autenticado |
| GET / POST | `/technicians` | admin |
| GET / PUT | `/technicians/:id` | admin |
| GET | `/clients` | admin |
| PUT / DELETE | `/clients/:id` | admin |
| GET | `/services` | autenticado (cliente vê só ativos) |
| POST / PUT | `/services`, `/services/:id` | admin |
| PATCH | `/services/:id/status` | admin |
| GET | `/tickets` | todos (escopo por papel; filtros `?status=`) |
| GET | `/tickets/:id` | dono, técnico atribuído ou admin |
| POST | `/tickets` | cliente |
| PATCH | `/tickets/:id/status` | técnico atribuído ou admin |
| POST | `/tickets/:id/additional-services` | técnico atribuído |
| DELETE | `/tickets/:id/additional-services/:serviceId` | técnico atribuído |
| GET | `/uploads/:file` | estático |

Paginação simples (`?page=&perPage=`) nas listagens.

## 7. Front-end e direção visual

### 7.1 Base: o Figma
Reproduza fielmente a estrutura do Figma: login/cadastro em tela dividida, **sidebar escura** com logo, navegação por papel e card do usuário no rodapé (menu com "Perfil" e "Sair"), área de conteúdo clara com cantos arredondados, tabelas de chamados com badges de status, telas de detalhe com resumo de valores, modais de perfil/edição e versão **mobile** com menu hambúrguer. Extraia os tokens (cores, fontes, raios, sombras) do Figma e registre-os no `tailwind.config` / `@theme` — nada de cor solta no JSX.

Badges de status: **Aberto** (rosa/vermelho), **Em atendimento** (azul), **Encerrado** (verde), com ícone + texto (nunca só cor).

### 7.2 Camada 3D (acréscimo, com moderação)
O 3D deve dar personalidade sem prejudicar a usabilidade de um painel de trabalho. Onde usar:

1. **Login e cadastro** — no painel lateral da tela dividida, uma cena React Three Fiber: um "ticket" 3D estilizado (cartão com recorte de picote, material vidro/`MeshTransmissionMaterial` ou clay fosco) flutuando com `<Float>`, iluminação suave (`<Environment preset="city">`), leve parallax seguindo o mouse. Paleta presa aos tokens da marca.
2. **Estados vazios** ("nenhum chamado ainda") — objeto 3D pequeno e girando devagar (ex.: caixa de entrada, ferramenta), substituindo ilustrações planas.
3. **Cards de métricas no dashboard do admin** (total abertos / em atendimento / encerrados) — inclinação 3D sutil no hover (tilt de até ~6°, com brilho especular), feita em CSS/framer-motion, sem WebGL.
4. **Transição de status** — ao técnico mudar o status, micro-animação no badge (flip 3D em CSS).

Regras obrigatórias para o 3D:
- Carregar cenas com `React.lazy` + `Suspense`, com fallback estático (gradiente ou imagem) — o bundle inicial não pode depender do three.js.
- Respeitar `prefers-reduced-motion`: sem rotação/float, cena estática.
- Em mobile (< 768 px) ou GPU fraca, trocar a cena por imagem estática; usar `dpr={[1, 1.5]}` e `frameloop="demand"` quando possível.
- Nenhum 3D dentro de tabelas, formulários ou listas — essas áreas são para trabalhar.
- Meta: Lighthouse Performance ≥ 85 na tela de login no mobile.

### 7.3 Telas por perfil

**Público**: Login · Cadastro de cliente.

**Admin**: Chamados (lista com filtro por status, detalhe, mudar status) · Técnicos (lista, criar, editar com grade de horários clicável por turno manhã/tarde/noite) · Clientes (lista, editar, excluir com modal de confirmação) · Serviços (lista, criar, editar, ativar/desativar) · Perfil.

**Técnico**: Meus chamados (agrupados por status: em atendimento, abertos, encerrados) · Detalhe do chamado (iniciar/encerrar atendimento, adicionar/remover serviços adicionais, resumo de valores) · Perfil (horários visíveis, mas somente leitura).

**Cliente**: Meus chamados · Novo chamado (título, descrição, categoria/serviço, resumo do valor estimado) · Detalhe do chamado · Perfil (editar, avatar, trocar senha, excluir conta).

### 7.4 Qualidade de UI
- Responsivo de 360 px a 1440 px+, seguindo os frames mobile do Figma.
- Acessibilidade: contraste AA, foco visível, navegação por teclado, `aria-label` em botões só com ícone, modais com focus trap.
- Formulários com react-hook-form + Zod (os mesmos schemas da API, quando fizer sentido), mensagens de erro em português.
- Feedback: skeletons no carregamento, toasts de sucesso/erro, estados vazios.
- Valores em `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`; datas em `dd/MM/yy HH:mm`.
- Token em `localStorage`; interceptor do axios faz logout ao receber 401.

## 8. Testes (Jest)
Cobrir no mínimo:
- Sessões: login válido, senha errada, usuário inexistente.
- Cadastro de cliente e e-mail duplicado (409).
- Autorização: cliente tentando acessar `/technicians` (403); técnico vendo chamado de outro (403).
- Criação de chamado e atribuição automática de técnico.
- Mudança de status e cálculo do valor total com serviços adicionais.
- Desativação de serviço (não aparece para cliente, chamados antigos intactos).

Banco de teste separado (`DATABASE_URL` em `.env.test`), limpo entre suítes.

## 9. Docker e deploy
- `docker-compose.yml` com PostgreSQL 16 (volume persistente) para desenvolvimento.
- `api/Dockerfile` multi-stage (build TS → runtime enxuto), rodando `prisma migrate deploy` no start.
- **Render**: Web Service da API + PostgreSQL gerenciado; variáveis `DATABASE_URL`, `JWT_SECRET`, `PORT`, `CORS_ORIGIN`. Atenção: o disco do Render é efêmero — documentar isso para os avatares (ou usar um disco persistente/armazenamento externo).
- **Vercel**: projeto `web/` com `VITE_API_URL` e `vercel.json` com rewrite de SPA para `index.html`.

## 10. Ordem de execução sugerida
1. Docker + Prisma schema + migrations + seed.
2. Auth (sessões, JWT, middlewares de papel) + testes.
3. CRUDs de técnicos, clientes, serviços + testes.
4. Chamados (criação, atribuição, status, serviços adicionais) + testes.
5. Front-end: tokens do Figma → componentes base → layout com sidebar → telas por perfil.
6. Camada 3D (seção 7.2), com fallbacks e reduced-motion.
7. Polimento: acessibilidade, responsivo, Lighthouse.
8. Deploy (Render + Vercel) e README com links, contas de teste e prints.

## 11. Critérios de pronto
- Todos os fluxos da seção 4 funcionando nos três perfis, no deploy.
- `npm test` verde na API.
- Visual fiel ao Figma em desktop e mobile, com a camada 3D presente nas áreas definidas e desligando corretamente em reduced-motion/mobile.
- README com instruções de execução local (`docker compose up`, migrations, seed) e credenciais de teste.
