# Docker + Coolify Deployment Guide

Deployment target: Hetzner VPS via Coolify, PostgreSQL database.

---

## Step 1: Update `prisma/schema.prisma`

Change `provider = "sqlite"` to `provider = "postgresql"` and add `binaryTargets` for Alpine Linux compatibility:

```prisma
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "linux-musl-openssl-3.0.x"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

No model changes needed — all field types map identically to PostgreSQL.

---

## Step 2: Recreate Prisma Migrations for PostgreSQL

The existing migration contains SQLite-specific DDL that PostgreSQL will reject. Delete it and regenerate.

```bash
# Delete the old SQLite migrations
rm -rf prisma/migrations/

# Point to a local PostgreSQL instance for migration generation
export DATABASE_URL="postgresql://user:pass@localhost:5432/myblog_dev"

# Generate a fresh PostgreSQL-compatible migration
npx prisma migrate dev --name init
```

The new `prisma/migrations/` folder gets baked into the Docker image and applied at container startup via `prisma migrate deploy`.

---

## Step 3: Update `next.config.ts`

Add `output: "standalone"` so Next.js generates a `server.js` entrypoint for Docker:

```typescript
const nextConfig: NextConfig = {
  output: "standalone",   // add this line
  images: {
    remotePatterns: [ ... ],
  },
};
```

---

## Step 4: Create `entrypoint.sh`

Create this file at the project root:

```bash
#!/bin/sh
set -e

echo "Running Prisma migrations..."
npx prisma migrate deploy

echo "Starting Next.js server..."
exec node server.js
```

`set -e` ensures the container crashes (and Coolify retries) if migrations fail rather than silently starting against a broken DB. `exec` makes Node PID 1 so Docker signals work correctly.

---

## Step 5: Create `Dockerfile`

Create this file at the project root:

```dockerfile
# Stage 1: Install dependencies
FROM node:20-alpine AS deps
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# Stage 2: Build
FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN pnpm build

# Stage 3: Production runner
FROM node:20-alpine AS runner
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Standalone Next.js bundle
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Prisma: schema + migrations (for migrate deploy at runtime)
COPY --from=builder /app/prisma ./prisma

# Prisma query engine binaries (not included in standalone JS bundle)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma

# Entrypoint
COPY --from=builder /app/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["./entrypoint.sh"]
```

---

## Step 6: Create `.dockerignore`

Create this file at the project root:

```
node_modules
.next
.git
.gitignore
.env
.env.*
prisma/dev.db
prisma/*.db
prisma/*.db-journal
.vscode
*.log
README.md
```

---

## Step 7: Coolify Setup

### 7a. Create PostgreSQL Service

1. Coolify → Project → **+ New Resource** → **Database** → **PostgreSQL 16**
2. Name: `myblog-postgres`, DB: `myblog`, User: `myblog_user`, strong password
3. Start it and note the **Internal Connection URL**:
   `postgresql://myblog_user:PASS@myblog-postgres:5432/myblog`

### 7b. Create Application Service

1. **+ New Resource** → **Application** → connect GitHub repo
2. Build pack: **Dockerfile** (auto-detected)
3. Port: `3000`

### 7c. Set Environment Variables

Set these in the Coolify UI — never hardcode them:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Internal PostgreSQL URL from step 7a |
| `NEXTAUTH_URL` | `https://your-domain.com` |
| `NEXTAUTH_SECRET` | Run `openssl rand -base64 32` and paste the output |
| `GOOGLE_CLIENT_ID` | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console |
| `RESEND_API_KEY` | From resend.com dashboard |
| `CONTACT_EMAIL` | Your contact email address |

### 7d. Domain & SSL

1. Add your domain in Coolify → **Domains**
2. Enable HTTPS — Let's Encrypt certificate is provisioned automatically
3. Set DNS `A` record pointing your domain to your server IP

### 7e. Update Google OAuth Redirect URI

In Google Cloud Console, add to authorized redirect URIs:

```
https://your-domain.com/api/auth/callback/google
```

Without this, Google OAuth will fail with a `redirect_uri_mismatch` error.

---

## Files to Create / Modify

| File | Action |
|---|---|
| `prisma/schema.prisma` | Edit: `provider = "postgresql"`, add `binaryTargets` |
| `prisma/migrations/` | Delete entirely, regenerate with `prisma migrate dev` |
| `next.config.ts` | Edit: add `output: "standalone"` |
| `entrypoint.sh` | Create new |
| `Dockerfile` | Create new |
| `.dockerignore` | Create new |

---

## Verification

### Local Docker test (before pushing to Coolify)

```bash
docker build -t myblog .
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e NEXTAUTH_URL="http://localhost:3000" \
  -e NEXTAUTH_SECRET="any-test-secret" \
  myblog
```

Visit `http://localhost:3000` — migrations should run on startup and the app should load.

### Production check

- `https://your-domain.com` — site loads
- `https://your-domain.com/api/auth/session` — returns JSON
- `https://your-domain.com/admin` — test credential login (`admin@example.com` / `admin`) and Google OAuth
