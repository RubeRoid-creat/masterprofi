# syntax=docker/dockerfile:1
# Multi-stage Dockerfile for NestJS backend (production)

FROM node:20-slim AS base
WORKDIR /app
ENV NODE_ENV=production \
    PUPPETEER_SKIP_DOWNLOAD=true

# Install system deps (fonts for Cyrillic + deps for node-gyp if needed)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    fonts-noto \
    fonts-noto-cjk \
    fonts-dejavu-core \
    && rm -rf /var/lib/apt/lists/*

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM node:20-slim AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY nest-cli.json tsconfig.json tsconfig.build.json* ./ 2>/dev/null || true
COPY src ./src
COPY ormconfig.ts ./
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy node_modules from deps and compiled dist from builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package.json ./
COPY ormconfig.ts ./

# Expose API port
EXPOSE 3000

# Healthcheck (optional: adjust to your health endpoint)
# HEALTHCHECK --interval=30s --timeout=3s --start-period=20s --retries=3 \
#   CMD node -e "require('http').get('http://localhost:3000/health',r=>{if(r.statusCode!==200)process.exit(1)}).on('error',()=>process.exit(1))"

CMD ["node", "dist/main.js"]






