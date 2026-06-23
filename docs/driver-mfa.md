# Driver MFA authentication

Drivers sign in with **Supabase Auth** using email, password, and **mandatory TOTP MFA** (authenticator app codes).

## Enable MFA in Supabase (required once)

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project → **Authentication** → **Multi-Factor**
2. Enable **TOTP (Authenticator app)**
3. Save changes

Passkeys are no longer used for drivers.

## Sync driver accounts to Supabase Auth

Driver rows in the database are **not** Supabase Auth users until you sync them.

### Option A — production API (after deploy)

1. Set `ADMIN_SYNC_SECRET` in Vercel (long random string)
2. Redeploy, then run:

```bash
curl -X POST https://sparkride-umber.vercel.app/api/admin/sync-driver-auth \
  -H "Authorization: Bearer YOUR_ADMIN_SYNC_SECRET"
```

### Option B — local script

```bash
npx vercel env pull .env.production.local --environment=production
npm run sync:driver-auth
```

(with `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `DATABASE_URL` in env)

After sync, drivers appear in **Supabase Dashboard → Authentication → Users** with role `driver` in app metadata.

## Driver onboarding flow

1. Admin runs sync script (above)
2. Driver visits **`/driver/enroll`**
3. Signs in with **one-time password** (from seed / admin)
4. Scans the QR code with an authenticator app (Google Authenticator, Microsoft Authenticator, Authy, etc.)
5. Enters the 6-digit code to verify setup
6. All future sign-ins: **`/driver/login`** → email + password + authenticator code

## Test driver (QA)

| Step | Action |
|------|--------|
| Sync | `npm run sync:driver-auth` |
| Enroll | https://sparkride-umber.vercel.app/driver/enroll |
| Email | `test@sparkride.co.uk` |
| One-time password | `TestDriver2024!` |
| Login | https://sparkride-umber.vercel.app/driver/login |

## Security notes

- Driver portal requires a verified TOTP factor and AAL2 session for dashboard and API access
- Customer accounts cannot access `/driver/*` (role check on `app_metadata.role`)
- Legacy bcrypt JWT cookies (`sparkride-driver-session`) are removed
- `GET /api/drivers` no longer re-hashes passwords on every request

## Client requirements

- `@supabase/supabase-js` v2.x with MFA support
- HTTPS in production
- Authenticator app that supports TOTP (6-digit codes)
