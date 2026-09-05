# -----------------------------------------------------------------------------
# Dockerfile Multi-Stage Produksi: SIK-MBH Masjid Babul Khaer
# Berbasis Node.js v22 Alpine dengan Dukungan Native SQLite
# -----------------------------------------------------------------------------

# Stage 1: Instalasi Dependensi
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Stage 2: Kompilasi Builder (Standalone Output)
FROM node:22-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV DOCKER_BUILD=1
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# Stage 3: Runner Produksi Minimalis
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Pengguna non-root untuk standar keamanan server
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Direktori basis data SQLite persisten
RUN mkdir -p /app/data && chown -R nextjs:nodejs /app/data

# Salin aset publik dan output standalone
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

# Volume mount untuk persistensi data sik_mbh.sqlite
VOLUME ["/app/data"]

CMD ["node", "server.js"]
