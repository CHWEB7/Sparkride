# Driver passkey authentication (Phase 4)

Drivers now sign in with **Supabase Auth passkeys** (WebAuthn). Passwords are only used once during initial passkey enrollment.

## Enable passkeys in Supabase (required once)

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project → **Authentication** → **Passkeys**
2. Turn on **Enable Passkey authentication**
3. Configure WebAuthn relying party:
   - **Display name:** Sparkride
   - **RP ID:** `sparkride-umber.vercel.app` (or your custom domain — no `https://`)
   - **Origins:** `https://sparkride-umber.vercel.app`, `http://localhost:3000`

Changing RP ID after drivers enroll will invalidate existing passkeys.

## Sync driver accounts to Supabase Auth

After seeding drivers or adding new ones:

```bash
npx prisma db seed
npx tsx scripts/sync-driver-auth-users.ts
```

This creates Supabase Auth users with `app_metadata.role = "driver"` and links `Driver.authUserId`.

## Driver onboarding flow

1. Admin runs sync script (above)
2. Driver visits **`/driver/enroll`**
3. Signs in with **one-time password** (from seed / admin — not shown in the UI)
4. Registers a **passkey** on their device
5. All future sign-ins: **`/driver/login`** → Sign in with passkey

## Test driver (QA)

| Step | Action |
|------|--------|
| Sync | `npx tsx scripts/sync-driver-auth-users.ts` |
| Enroll | https://sparkride-umber.vercel.app/driver/enroll |
| Email | `test@sparkride.co.uk` |
| One-time password | `TestDriver2024!` |
| Login | https://sparkride-umber.vercel.app/driver/login (passkey only) |

## Security notes

- Driver portal requires a registered passkey for dashboard and API access
- Customer accounts cannot access `/driver/*` (role check on `app_metadata.role`)
- Legacy bcrypt JWT cookies (`sparkride-driver-session`) are removed
- `GET /api/drivers` no longer re-hashes passwords on every request

## Client requirements

- `@supabase/supabase-js` v2.105+ with `auth.experimental.passkey: true`
- HTTPS in production (localhost exempt for dev)
- Browser or OS with passkey support (Face ID, Touch ID, Windows Hello, etc.)
