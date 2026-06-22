# Daily email verification (2FA)

Daily sign-in verification uses **Sparkride's own email codes** sent via [Resend](https://resend.com). This avoids Supabase Auth's built-in email rate limits (~4 emails/hour on the free tier), which caused `email rate limit exceeded` errors.

## Behaviour

- After password sign-in, the user requests a **6-digit code** by email.
- Codes expire after **10 minutes**.
- Resend is limited to **once every 2 minutes** per user.
- Once verified, access lasts until **midnight UK time** (`Europe/London`).

---

## Required setup (about 5 minutes)

### 1. Create a free Resend account

1. Sign up at [resend.com](https://resend.com) (free tier: **100 emails/day**, **3,000/month**).
2. Go to **API Keys** → Create API key.
3. Copy the key (`re_...`).

### 2. Add environment variables in Vercel

Project → Settings → Environment Variables:

```env
RESEND_API_KEY=re_your_key_here
JWT_SECRET=your-long-random-string
```

Optional (recommended for production):

```env
MFA_EMAIL_FROM=Sparkride <verify@yourdomain.com>
```

If `MFA_EMAIL_FROM` is omitted, Resend's test sender is used (`onboarding@resend.dev`), which only delivers to **your own Resend account email** until you verify a domain.

### 3. Verify your domain (production)

In Resend → **Domains**, add `sparkride.co.uk` (or your domain) and add the DNS records shown. Then set:

```env
MFA_EMAIL_FROM=Sparkride <verify@sparkride.co.uk>
```

### 4. Redeploy

Push to GitHub or redeploy on Vercel so the new env vars are live.

---

## Do I need a paid Supabase subscription?

**No** — for daily MFA codes. Supabase Pro does **not** fix this by itself.

| Email type | Provider | Free tier limit |
|------------|----------|-----------------|
| Daily MFA codes | **Resend** (our app) | 100/day |
| Signup confirm / password reset | **Supabase** built-in | ~4/hour |

For signup and password-reset emails at scale, either:

- Configure **custom SMTP** in Supabase ([Authentication → SMTP](https://supabase.com/dashboard/project/ukpkntvjqedtbycrpanv/auth/smtp)), or
- Upgrade Supabase and use custom SMTP (recommended for production).

---

## Database

Columns on `CustomerMfaSession`: `otpHash`, `otpExpiresAt`, `lastOtpSentAt`.

If not applied yet:

```bash
npx prisma db push
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `Email is not configured` | Add `RESEND_API_KEY` to Vercel and redeploy |
| Email only arrives at your address | Using test sender — verify a domain in Resend |
| `Invalid or expired code` | Code lasts 10 min; click Resend after cooldown |
| Still see Supabase rate limit | Deploy latest code — MFA no longer uses `signInWithOtp` |

Signup/password-reset templates: see `docs/supabase-email-templates.md`.
