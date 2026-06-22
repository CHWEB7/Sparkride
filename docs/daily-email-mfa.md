# Daily email verification (2FA)

Customer accounts require a **daily email verification code** after password sign-in. This uses Supabase **email OTP** (Supabase does not offer email as a native MFA factor — only TOTP and SMS — so we send a one-time code to the registered email after each day's first sign-in).

## Behaviour

- After password sign-in, the user is sent a **6-digit code** by email.
- Entering the code unlocks booking until **midnight UK time** (`Europe/London`).
- **Once per day**: further sign-ins the same day skip the code if the daily session is still valid.
- **Midnight logout**: at the start of a new UK calendar day, the session is cleared and the user must sign in again (password + email code).

## Supabase dashboard setup

1. **Authentication → URL configuration**
   - **Site URL:** `https://sparkride-umber.vercel.app`
   - Redirect URLs: see `docs/supabase-phase1.md`

2. **Authentication → Email Templates**
   - Update the **Magic Link** template to send `{{ .Token }}` (not a link). See `docs/supabase-email-templates.md` for copy-paste HTML.

3. **Authentication → Providers → Email**
   - Ensure **Email** is enabled.

## Technical notes

- Web: signed httpOnly cookie `sparkride_daily_mfa` (expires at midnight London).
- Mobile: `CustomerMfaSession` row in Postgres, checked on API requests.
- Protected routes: `/book`, `/my-bookings`, `/account`, `/booking/*`, and customer booking APIs.
- Verification page: `/verify-2fa` (web and mobile).

## Database

Apply the Prisma schema change (adds `CustomerMfaSession`):

```bash
npx prisma db push
```

Or deploy via your usual migration workflow.
