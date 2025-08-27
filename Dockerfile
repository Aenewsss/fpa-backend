# ────────────────────────────────
# Etapa 1: build da aplicação
# ────────────────────────────────
FROM node:20 AS builder

WORKDIR /app

# Copia arquivos de dependências e instala (com fallback de dependências)
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copia o restante do projeto
COPY . .

# Gera o Prisma Client (para o build funcionar corretamente)
RUN npx prisma generate

# Gera o build do NestJS
RUN npm run build

# ─────────────────────────────────────────────
# Etapa 2: imagem de produção (otimizada e leve)
# ─────────────────────────────────────────────
FROM node:20-slim

WORKDIR /app

# ARGs (recebidos durante o build)
ARG DATABASE_URL
ARG UPSTASH_REDIS_REST_URL
ARG UPSTASH_REDIS_REST_TOKEN
ARG SENDPULSE_API_USER_ID
ARG SENDPULSE_API_SECRET
ARG SENDPULSE_FROM_EMAIL
ARG SENDPULSE_FROM_NAME
ARG SENDPULSE_TEMPLATE_ID
ARG SENDPULSE_TEMPLATE_ID_INVITE
ARG JWT_SECRET
ARG R2_ENDPOINT
ARG R2_ACCESS_KEY
ARG R2_SECRET_KEY
ARG R2_BUCKET
ARG R2_PUBLIC_BASE_URL

# Transfere os ARGs para variáveis de ambiente (ENV) no runtime
ENV DATABASE_URL=${DATABASE_URL}
ENV UPSTASH_REDIS_REST_URL=${UPSTASH_REDIS_REST_URL}
ENV UPSTASH_REDIS_REST_TOKEN=${UPSTASH_REST_TOKEN}
ENV SENDPULSE_API_USER_ID=${SENDPULSE_API_USER_ID}
ENV SENDPULSE_API_SECRET=${SENDPULSE_API_SECRET}
ENV SENDPULSE_FROM_EMAIL=${SENDPULSE_FROM_EMAIL}
ENV SENDPULSE_FROM_NAME=${SENDPULSE_FROM_NAME}
ENV SENDPULSE_TEMPLATE_ID=${SENDPULSE_TEMPLATE_ID}
ENV SENDPULSE_TEMPLATE_ID_INVITE=${SENDPULSE_TEMPLATE_ID_INVITE}
ENV JWT_SECRET=${JWT_SECRET}
ENV R2_ENDPOINT=${R2_ENDPOINT}
ENV R2_ACCESS_KEY=${R2_ACCESS_KEY}
ENV R2_SECRET_KEY=${R2_SECRET_KEY}
ENV R2_BUCKET=${R2_BUCKET}
ENV R2_PUBLIC_BASE_URL=${R2_PUBLIC_BASE_URL}

# Copia pacotes e instala apenas as dependências de produção
COPY package*.json ./
RUN npm install --only=production --legacy-peer-deps

# Copia apenas os arquivos buildados (sem fontes, testes, etc.)
COPY --from=builder /app/dist ./dist

# Define ambiente de execução como produção
ENV NODE_ENV=production

# Comando de inicialização
CMD ["node", "dist/src/main"]