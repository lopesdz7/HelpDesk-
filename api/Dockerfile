# syntax=docker/dockerfile:1

# ---------- build: instala tudo, gera o Prisma Client e compila o TypeScript ----------
FROM node:24-alpine AS build
WORKDIR /app

# O prisma.config.ts lê DATABASE_URL; durante o build basta um valor fictício.
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build"

COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma.config.ts tsconfig.json tsconfig.build.json ./
RUN npm ci

COPY src ./src
RUN npm run build && npm prune --omit=dev

# ---------- runtime: só dependências de produção + dist ----------
FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts ./

RUN mkdir -p uploads && chown -R node:node /app
USER node

EXPOSE 3333
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
