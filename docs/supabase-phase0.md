# Supabase setup — Phase 0

Phase 0 moves Sparkride from **SQLite** to **Supabase Postgres** and adds the Supabase client libraries. Customer authentication comes in **Phase 1** (mandatory sign-up, no guest bookings).

---

## Production (Vercel) — already done if integration is connected

If **Supabase is linked to Vercel via the [Supabase integration](https://vercel.com/integrations/supabase)**, the following are injected automatically on each deploy — you do **not** need to copy them manually:

| Variable | Purpose |
|----------|---------|
| `POSTGRES_PRISMA_URL` | Prisma app runtime (pooled) |
| `POSTGRES_URL_NON_POOLING` | Prisma `db:push` / migrations (direct) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public API key (browser / mobile) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only admin operations |

Prisma is configured to use `POSTGRES_PRISMA_URL` and `POSTGRES_URL_NON_POOLING` — matching what the integration provides.

### Vercel-only secrets (add manually)

In **Vercel → Project → Settings → Environment Variables**, add anything the integration does **not** supply:

| Variable | Required |
|----------|----------|
| `JWT_SECRET` | Yes (driver portal) |
| `DRIVER_EMAIL` | Optional (seed) |
| `DRIVER_PASSWORD` | Optional (seed) |
| `GOOGLE_MAPS_API_KEY` | Yes for address search |
| `NEXT_PUBLIC_APK_URL` | Optional |

Redeploy after adding these.

### Push schema to production database

Run once from your PC (uses the non-pooling URL from your local `.env`):

```bat
npm run db:push
npm run db:seed
```

Or use **Supabase → SQL Editor** if you prefer. After `db:push`, check **Table Editor** for `Driver` and `Booking` tables.

### Verify production

- `https://your-app.vercel.app/api/health` → `{ "status": "ok", "checks": { "database": "ok", "supabaseEnv": "ok" } }`
- Complete a test booking on `/book`
- Row appears in Supabase **Table Editor**

---

## Local development

Your machine still needs a `.env` file. Easiest path when Vercel + Supabase are already linked:

```bat
cd "C:\Users\Charly Admin\sparkride-booking"
npx vercel link
npx vercel env pull .env
```

> No global install needed — `npx` downloads the CLI for you. If prompted, log in with the same account linked to your Vercel project.

**Don't want the CLI?** Skip to [Copy from Supabase dashboard](#alternative-copy-from-supabase-dashboard) below.

Then open `.env` and add app secrets the integration does not provide:

```env
JWT_SECRET="your-local-secret"
GOOGLE_MAPS_API_KEY="your-key"
```

### Alternative: copy from Supabase dashboard

If you prefer not to use the Vercel CLI, copy values manually into `.env`:

1. **Supabase → Project Settings → Database**
   - **Transaction pooler** URI → `POSTGRES_PRISMA_URL` (port 6543, add `?pgbouncer=true` if missing)
   - **Direct connection** URI → `POSTGRES_URL_NON_POOLING` (port 5432)

2. **Supabase → Project Settings → API**
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

3. Add app secrets: `JWT_SECRET`, `GOOGLE_MAPS_API_KEY`, etc.

Or copy the same variable **names** from **Vercel → Project → Settings → Environment Variables** (eye icon to reveal values) into your local `.env`.

### Local setup

```bat
npm install
npm run db:push
npm run db:seed
npm run dev
```

Check http://localhost:3000/api/health

---

## Variable reference

```
POSTGRES_PRISMA_URL      → Prisma url (pooled, port 6543)
POSTGRES_URL_NON_POOLING → Prisma directUrl (port 5432)
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

> **Note:** Older guides use `DATABASE_URL` / `DIRECT_URL`. This project uses the **Vercel integration names** so production works without extra mapping.

---

## Auth roadmap

| Phase | Scope |
|-------|--------|
| **0** (now) | Supabase Postgres + client scaffolding |
| **1** | Customer auth (email + Google), **mandatory sign-up**, no guest bookings |
| **2** | My bookings, cancel/amend rules |
| **3** | Email notifications, profile management |
| **4** | Driver auth migration (later) |

**Your requirement:** sign-up is **mandatory** — guest checkout will be removed in Phase 1.

---

## What's next — Phase 1

1. `Customer` profile table + `customerId` on `Booking`
2. Sign-up / login pages (email + Google)
3. Protect `/book` and booking API — login required
4. Mobile login + JWT on API calls
5. Remove guest checkout

---

## Troubleshooting

**`db:push` fails locally**  
- Run `vercel env pull .env` or check `POSTGRES_URL_NON_POOLING` uses port **5432**  
- Confirm the Supabase project is running  

**Production health check fails**  
- Open Vercel → Environment Variables — confirm integration vars are present  
- Redeploy after any changes  
- Run `db:push` if tables do not exist yet  

**`supabaseEnv: missing`**  
- Integration should set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
- If missing, reconnect the Supabase integration in Vercel  

**SQLite / old local data**  
- Phase 0 does not migrate `prisma/dev.db`. Re-seed the driver and create new bookings in Postgres.
