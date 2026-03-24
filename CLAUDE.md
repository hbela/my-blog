# CLAUDE.md

## Project Overview

Personal portfolio and blog application built with Next.js 16.2.1 (App Router), React 19, Prisma ORM, and NextAuth v4. Features a markdown-based blog, projects showcase, contact form, and an admin dashboard.

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.1 (App Router), React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS v4, custom CSS design tokens |
| Database | PostgreSQL via Prisma ORM v6 |
| Auth | NextAuth v4 — Google OAuth + Credentials |
| Email | Resend API |
| Package Manager | **pnpm** |

## Common Commands

```bash
pnpm dev          # Dev server at http://localhost:3000
pnpm build        # Production build (standalone output)
pnpm start        # Start production server
pnpm lint         # ESLint

npx prisma studio              # Open database GUI
npx prisma migrate dev --name <name>   # Create and apply a new migration
npx prisma migrate deploy      # Apply pending migrations (used in Docker entrypoint)
npx prisma generate            # Regenerate Prisma client after schema changes
```

## Project Structure

```
src/
  app/
    actions/          # Server actions (post.ts, project.ts)
    api/
      auth/[...nextauth]/  # NextAuth handler
      comments/[slug]/     # Comments API
      contact/             # Contact form (Resend)
    admin/            # Protected admin dashboard
      posts/          # Post list, new, edit
      projects/       # Project list, new, edit
    blog/[slug]/      # Public blog pages
    projects/[slug]/  # Public projects pages
    contact/          # Contact form page
  components/
    admin/            # PostForm, ProjectForm, Editor
    Navbar.tsx
    Footer.tsx
  lib/
    prisma.ts         # Prisma client singleton
prisma/
  schema.prisma       # Database schema (PostgreSQL)
  migrations/         # Migration history
  prisma.config.ts    # Prisma v6 config (loads .env via dotenv)
```

## Environment Variables

Required in `.env` (local) or Coolify UI (production):

```
DATABASE_URL          # PostgreSQL connection string
NEXTAUTH_URL          # Full URL of the app (e.g. http://localhost:3000)
NEXTAUTH_SECRET       # Random secret (openssl rand -base64 32)
GOOGLE_CLIENT_ID      # Google OAuth app
GOOGLE_CLIENT_SECRET
RESEND_API_KEY        # Resend email service
CONTACT_EMAIL         # Recipient for contact form emails
```

## Authentication

- **Admin credentials:** `admin@example.com` / `admin` (auto-created in DB on first login)
- **Google OAuth:** configured via Google Cloud Console
- Admin role is stored in the `User.role` field; only `ADMIN` users can access `/admin/*`
- Sessions use JWT strategy

## Database

- Provider: PostgreSQL (Prisma Postgres at `db.prisma.io`)
- Schema: `prisma/schema.prisma`
- After any schema change: run `npx prisma migrate dev --name <description>`
- The `prisma.config.ts` file loads env vars via `dotenv/config` for the Prisma CLI

## Deployment

Docker + Coolify on Hetzner VPS. See [docs/DEPLOY_GUIDE.md](docs/DEPLOY_GUIDE.md) for full instructions.

Key files:
- `Dockerfile` — 3-stage build (deps → builder → runner), uses `node:20-alpine` and pnpm
- `entrypoint.sh` — runs `prisma migrate deploy` then starts `node server.js`
- `.dockerignore` — excludes `.env`, `node_modules`, `prisma/*.db`
- `next.config.ts` — `output: "standalone"` required for Docker

## Content Management

Create and edit posts/projects via the admin dashboard at `/admin`. Content supports Markdown with GitHub Flavored Markdown (via `react-markdown` + `remark-gfm`). Posts and projects must be toggled **published** to appear publicly.
