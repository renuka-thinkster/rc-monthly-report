# Rolling Crunchys — Monthly Report (Next.js + Neon)

Shared, multi-user monthly report. Same UI as the standalone HTML, but data lives in a Neon Postgres database and access is gated by email/password authentication.

## Features

All features of the standalone HTML report, plus:

- **Server-side authentication** (cookies + sessions in Postgres)
- **Multi-user shared data** — every authenticated user sees the same numbers
- **Admin role**: first user becomes admin; admins can create, delete, reset, and promote users
- **Invite by email**: admin authorizes an email → user sets their own password on first login
- **Live shareable URL** for the whole team

## Tech

- Next.js 14 (App Router, Edge runtime for all API routes)
- Neon Postgres (serverless HTTP driver via `@neondatabase/serverless`)
- Drizzle ORM
- Chart.js (loaded from CDN inside the report HTML)
- Web Crypto API for password hashing (SHA-256 + per-user salt) and session tokens

## Quick Start

See **[DEPLOY.md](./DEPLOY.md)** for the end-to-end Neon → GitHub → Vercel guide.

Local dev:
```bash
cp .env.example .env  # paste your Neon DATABASE_URL
npm install
npx drizzle-kit push  # creates the 4 tables
npm run dev
```
Then open http://localhost:3000 — you'll be redirected to `/login` to create the first (admin) account.

## File Structure

```
src/
├─ app/
│  ├─ page.tsx          ← server-checks auth, then serves /report.html in an iframe
│  ├─ login/page.tsx    ← email/password login (also handles first-user admin signup)
│  ├─ layout.tsx, globals.css
│  └─ api/
│     ├─ data/route.ts            ← GET / PUT shared JSON state
│     └─ auth/
│        ├─ login/route.ts        ← POST → set session cookie
│        ├─ register/route.ts     ← POST → first user OR pre-authorized invite
│        ├─ logout/route.ts       ← POST → clear cookie
│        ├─ me/route.ts           ← GET current user + hasUsers flag
│        ├─ users/route.ts        ← GET/POST/PATCH/DELETE (admin only)
│        └─ authorized/route.ts   ← GET/POST/DELETE (admin only)
├─ db/
│  ├─ schema.ts                   ← app_data, users, sessions, authorized_emails
│  └─ index.ts                    ← Drizzle + Neon
└─ lib/
   └─ auth.ts                     ← hashPassword, verifyPassword, sessions, cookies

public/
└─ report.html                    ← The complete report UI (Dashboard, Sales, Inventory, …,
                                     Daily Sales, Product Consumption, Yearly Summary, Authorize).
                                     A small server-mode override at the bottom routes data to /api/data
                                     and user management to /api/auth/*.
```
