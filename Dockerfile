# Etapa 1: build da aplicação
FROM node:20 AS builder

WORKDIR /app

# Copia os arquivos de dependência e instala apenas o necessário
COPY package*.json ./
RUN npm install  --legacy-peer-deps

# Copia o restante do código da aplicação
COPY . .

# ⚠️ Gera o Prisma Client (node_modules/.prisma/client)
RUN npx prisma generate

# Gera o build
RUN npm run build

# Etapa 2: imagem de produção (menor e otimizada)
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --only=production --legacy-peer-deps

# Copia apenas os arquivos buildados
COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production

CMD ["node", "dist/main"]