# Deploy Guide — RC Monthly Report (Next.js + Neon + Vercel)

## Prerequisites
- GitHub account (free) — https://github.com/join
- Vercel account (free) — https://vercel.com/signup
- Neon account (free) — https://console.neon.tech/signup

## Step 1 — Create the Neon database
1. Sign in at https://console.neon.tech/
2. **New Project** → name it `rolling-crunchys` → pick the region closest to you.
3. Copy the connection string (starts with `postgresql://…`) — you'll need it twice.

## Step 2 — Push the code to GitHub
From this project folder:
```bash
git init
git add .
git commit -m "Initial RC Monthly Report"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/rc-monthly-report.git
git push -u origin main
```

## Step 3 — Create the database tables
Either with Drizzle locally (`npx drizzle-kit push` after `cp .env.example .env`), OR paste the SQL below into the Neon SQL Editor:
```sql
CREATE TABLE IF NOT EXISTS app_data (
  id INTEGER PRIMARY KEY,
  data JSONB NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS users (
  email TEXT PRIMARY KEY,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS authorized_emails (
  email TEXT PRIMARY KEY,
  invited_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## Step 4 — Import into Vercel
1. Go to https://vercel.com/new
2. **Import** your `rc-monthly-report` repo (install the Vercel GitHub app if asked).
3. On the import screen, expand **Environment Variables** and add:

   | Name           | Value                                |
   |----------------|--------------------------------------|
   | `DATABASE_URL` | The Neon connection string (Step 1)  |

4. Click **Deploy**. Wait ~1 minute.

## Step 5 — First login (becomes admin)
1. Open the deployed URL Vercel gives you.
2. You'll be redirected to `/login`.
3. Enter your email and a password — because no users exist yet, this account is created with the **admin** role.
4. You're in. The report loads with your data (or seed data if first run).

## Step 6 — Invite the team
Inside the app:
- Click the **🛡️ Authorize** tab (admin only).
- Use **① Create User** to create an account directly with email + password + role, OR
- Use **② Invite by Email** to add an email — that user can set their own password on first login.
- To remove a user, click **🗑️ Delete** on their row.

## Step 7 — Share the URL
- Just send the Vercel URL via WhatsApp / email. Anyone with an account (or authorized email) signs in and sees the live shared report.
- For a custom domain: Vercel **Settings → Domains**.

## Day-to-day
- Every keystroke debounces a save to `/api/data` (250 ms).
- Status pill shows **✓ Saved to server** when persisted.
- Logout: click the user badge in the toolbar → Logout (or POST to `/api/auth/logout`).

## Concurrency
This implementation uses **last-write-wins** for simplicity. For team sizes up to a dozen people working at the same time, this is fine. If two people save the same field within ~250ms of each other, the later save wins. If you need optimistic concurrency (reject stale writes with 409), wire `version` into PUT — `app_data` already tracks it.

## Troubleshooting
- **`relation "users" does not exist`** — you skipped Step 3.
- **Login screen loops back** — clear cookies or check that `DATABASE_URL` is set in Vercel env vars and redeploy.
- **Can't see Authorize tab** — only admins see it; check role with `/api/auth/me`.
- **Charts blank** — `chart.js` loads from jsdelivr CDN. Confirm browser allows it.
