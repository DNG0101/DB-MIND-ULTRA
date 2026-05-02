# DB-MIND ULTRA — Cloudflare Deployment Guide

Everything runs on Cloudflare:
- **Frontend** → Cloudflare Pages (from GitHub)
- **Backend API** → Cloudflare Workers (Hono)
- **Database** → Cloudflare D1 (SQLite at the edge)

---

## Prerequisites

```bash
# Install wrangler CLI globally
npm install -g wrangler

# Login to your Cloudflare account
wrangler login
```

---

## Step 1 — Create the D1 Database

```bash
cd artifacts/cf-worker

# Create the database (run once)
wrangler d1 create db-mind-ultra
```

This prints output like:
```
✅ Successfully created DB 'd1-db-mind-ultra'!

[[d1_databases]]
binding = "DB"
database_name = "db-mind-ultra"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"   ← copy this
```

Open `artifacts/cf-worker/wrangler.toml` and paste the `database_id`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "db-mind-ultra"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"   ← paste here
```

---

## Step 2 — Apply Database Migration

```bash
cd artifacts/cf-worker

# Apply to remote (production) D1
wrangler d1 migrations apply db-mind-ultra --remote
```

This creates the `sessions` table. You should see:
```
✅ Applied 1 migration(s)
```

---

## Step 3 — Deploy the Cloudflare Worker

```bash
cd artifacts/cf-worker

# Install dependencies first
npm install

# Deploy to Cloudflare Workers
wrangler deploy
```

You'll get a Worker URL like:
```
https://db-mind-ultra.<your-subdomain>.workers.dev
```

Test it:
```bash
curl https://db-mind-ultra.<your-subdomain>.workers.dev/api/healthz
# → {"status":"ok"}
```

---

## Step 4 — Deploy Frontend to Cloudflare Pages

### Option A — Connect GitHub (Recommended)

1. Go to **[Cloudflare Dashboard](https://dash.cloudflare.com)** → Pages → Create a project
2. Connect your GitHub repo
3. Set these build settings:

| Setting | Value |
|---------|-------|
| Framework preset | None (custom) |
| Root directory | `artifacts/db-mind` |
| Build command | `cd ../.. && npm install -g pnpm && pnpm install && pnpm --filter @workspace/api-spec run codegen && pnpm --filter @workspace/db-mind run build` |
| Build output directory | `artifacts/db-mind/dist` |

4. Add environment variable:

| Variable | Value |
|----------|-------|
| `VITE_API_BASE_URL` | `https://db-mind-ultra.<your-subdomain>.workers.dev` |

5. Click **Save and Deploy**

### Option B — Deploy via CLI

```bash
cd artifacts/db-mind

# Build the frontend
cd ../.. && pnpm install
pnpm --filter @workspace/api-spec run codegen
pnpm --filter @workspace/db-mind run build

# Deploy to Pages
cd artifacts/db-mind
npx wrangler pages deploy dist --project-name db-mind-ultra-frontend
```

---

## Step 5 — Connect Worker to your Pages domain

In Cloudflare Dashboard:
1. Go to your Pages project → Settings → Functions
2. Under **KV namespace bindings** / route config, add a route:
   - `/api/*` → proxied to your Worker URL

Or use a `wrangler.toml` custom domain route for a cleaner setup.

---

## Step 6 — Custom Domain (Optional)

In Cloudflare Dashboard → Workers & Pages → your project → Custom domains:
```
db-mind.yourdomain.com   → Pages (frontend)
api.db-mind.yourdomain.com → Worker (backend)
```

---

## Local Development

```bash
# Install deps
pnpm install

# Run Worker locally (with local D1)
cd artifacts/cf-worker
wrangler dev --local

# Apply migrations to local D1
wrangler d1 migrations apply db-mind-ultra --local

# Run frontend locally
cd artifacts/db-mind
pnpm dev
```

---

## Architecture on Cloudflare

```
User Browser
     │
     ▼
Cloudflare Pages          (artifacts/db-mind — React + Vite)
     │  /api/* proxy
     ▼
Cloudflare Worker         (artifacts/cf-worker — Hono)
     │  DB binding
     ▼
Cloudflare D1             (SQLite — sessions table)
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `database_id` not found | Run `wrangler d1 list` to find your DB ID |
| CORS errors | Check Worker CORS config allows your Pages domain |
| 500 on first request | Make sure migration was applied: `wrangler d1 migrations apply db-mind-ultra --remote` |
| Build fails on Pages | Ensure build command includes `pnpm install` at root |
| `VITE_API_BASE_URL` undefined | Add it in Pages → Settings → Environment variables |
