# Daily email verification (2FA)

Customer accounts require a **daily email verification code** after password sign-in. This uses Supabase **email OTP** (Supabase does not offer email as a native MFA factor — only TOTP and SMS — so we send a one-time code to the registered email after each day's first sign-in).

## Behaviour

- After password sign-in, the user is sent a **6-digit code** by email.
- Entering the code unlocks booking until **midnight UK time** (`Europe/London`).
- **Once per day**: further sign-ins the same day skip the code if the daily session is still valid.
- **Midnight logout**: at the start of a new UK calendar day, the session is cleared and the user must sign in again (password + email code).

## Supabase dashboard setup

1. **Authentication → Providers → Email**
   - Ensure **Email** is enabled.
   - Enable **Email OTP** (one-time password codes), not only magic links.

2. **Authentication → URL configuration**
   - Site URL and redirect URLs should already include your production domain (see `docs/supabase-phase1.md`).

3. **Email templates** (optional)
   - Under **Authentication → Email templates**, customise the **Magic Link / OTP** template if you want Sparkride branding on the verification code email.

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
