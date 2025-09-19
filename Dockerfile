# Stage 1 - Install dependencies once
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm ci

# Stage 2 - Build application (backend + frontend)
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/frontend/node_modules ./frontend/node_modules
COPY . .
RUN npm run build
RUN cd frontend && npm run build

# Stage 3 - Production image
FROM node:18-alpine AS runner
RUN apk add --no-cache dumb-init
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001
WORKDIR /app

COPY package*.json ./
COPY --from=deps /app/node_modules ./node_modules
RUN npm prune --omit=dev

COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/frontend/dist ./frontend/dist
RUN mkdir -p uploads && chown nestjs:nodejs uploads

USER nestjs
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

CMD ["dumb-init", "node", "dist/src/main.js"]
