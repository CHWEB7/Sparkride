# Driver MFA authentication

Drivers sign in with **Supabase Auth** using email, password, and **mandatory TOTP MFA** (authenticator app codes).

You do **not** need to edit raw JSON in the Supabase dashboard. The sync tool sets `app_metadata.role = "driver"` for every driver in your database.

## Enable MFA in Supabase (required once)

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project → **Authentication** → **Multi-Factor**
2. Enable **TOTP (Authenticator app)**
3. Save changes

## Sync drivers to Supabase Auth (scalable)

Every driver must exist in **two places**:

1. **Database** — `Driver` row (from seed or admin)
2. **Supabase Auth** — created by the sync tool

### Option A — production API (recommended)

1. In Vercel → **Settings** → **Environment Variables**, set `ADMIN_SYNC_SECRET` (long random string) for **Production**
2. **Redeploy** the site (env vars only apply after a new deployment)
3. Run:

```bash
# Sync all drivers in the database
curl -X POST "https://sparkride-umber.vercel.app/api/admin/sync-driver-auth" \
  -H "Authorization: Bearer YOUR_ADMIN_SYNC_SECRET"

# Or sync one driver only
curl -X POST "https://sparkride-umber.vercel.app/api/admin/sync-driver-auth?email=test@sparkride.co.uk" \
  -H "Authorization: Bearer YOUR_ADMIN_SYNC_SECRET"
```

This will:

- Create missing Supabase users
- Fix existing users (adds `role: driver` to app metadata)
- Reset passwords to seed values (see below)
- Link `authUserId` on the `Driver` row

### Option B — local script

Copy `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` from Vercel into a local `.env` file (do not commit), then:

```bash
npm run sync:driver-auth
npm run sync:driver-auth -- test@sparkride.co.uk
```

## Adding a new driver in the future

1. Add the driver to `src/lib/bookable-drivers.ts` (`BOOKABLE_DRIVER_SEEDS`)
2. Run `npm run db:seed` (creates/updates the `Driver` row)
3. Run the sync API or `npm run sync:driver-auth` (creates Supabase Auth user with `role: driver`)
4. Tell the driver their one-time password and send them to `/driver/enroll`

Default passwords:

| Driver | Password |
|--------|----------|
| `test@sparkride.co.uk` | `TestDriver2024!` |
| Other seeded drivers | `driver123` (or `DRIVER_PASSWORD` env) |
| Custom seed entry | `password` field in `BOOKABLE_DRIVER_SEEDS` |

## Driver onboarding flow

1. Admin runs sync (above)
2. Driver visits **`/driver/enroll`**
3. Signs in with **one-time password** (from seed / admin)
4. Scans the QR code with an authenticator app
5. Enters the 6-digit code to verify setup
6. **Chooses a personal password** (replaces the one-time password)
7. All future sign-ins: **`/driver/login`** → email + password + authenticator code

## Password management

| Situation | What the driver does |
|-----------|----------------------|
| First-time setup | Step 6 above — required before reaching the dashboard |
| Change password later | **Driver dashboard** → **Change password** section |
| Forgot password | **`/driver/login`** → **Forgot password?** → email link → set a new password on `/driver/enroll` |

The one-time password from sync is only for the first sign-in during enrollment. Re-running the admin sync **resets** passwords back to seed values — tell drivers to enroll again or use forgot-password if that happens.

`user_metadata.driver_password_set` is set to `true` when a driver saves their own password.

## Test driver (QA)

| Step | Action |
|------|--------|
| Sync | `curl -X POST ".../api/admin/sync-driver-auth?email=test@sparkride.co.uk" -H "Authorization: Bearer SECRET"` |
| Enroll | https://sparkride-umber.vercel.app/driver/enroll |
| Email | `test@sparkride.co.uk` |
| One-time password | `TestDriver2024!` |
| Login | https://sparkride-umber.vercel.app/driver/login |

## Troubleshooting

**User exists in Supabase but login fails / not a driver**  
→ Run sync for that email. It patches `app_metadata.role` without manual JSON editing.

**`ADMIN_SYNC_SECRET is not configured`**  
→ Add the secret in Vercel and redeploy.

**Driver not in database**  
→ Add to `BOOKABLE_DRIVER_SEEDS` and run `npm run db:seed` before sync.

## MFA shows "localhost" in authenticator app

The issuer label comes from Supabase **Site URL** and the TOTP `issuer` field.

1. **Supabase Dashboard** → **Authentication** → **URL Configuration**
2. Set **Site URL** to `https://sparkride-umber.vercel.app`
3. Add **Redirect URL**: `https://sparkride-umber.vercel.app/**`
4. **Vercel** → set `NEXT_PUBLIC_SITE_URL=https://sparkride-umber.vercel.app` and redeploy

To update an existing enrolment, remove the old TOTP factor in **Supabase** → **Authentication** → **Users** → user → **MFA factors**, then visit `/driver/enroll` again. New enrolments show **Sparkride Driver**.

## Driver dashboard application error

If `/driver/dashboard` crashes after MFA setup, the production database may be missing payment columns. In **Supabase SQL Editor**, run the script:

`prisma/sql/add-payment-columns.sql`

Then reload the dashboard.


- Driver portal requires a verified TOTP factor and AAL2 session for dashboard and API access
- Customer accounts cannot access `/driver/*` (role check on `app_metadata.role`)
- `GET /api/drivers` does not expose passwords
