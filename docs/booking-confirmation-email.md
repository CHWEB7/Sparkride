# Transactional email: Resend vs Supabase

Sparkride uses **Resend** for operational emails (MFA codes, booking confirmations). **Supabase Auth** handles signup/password-reset only.

## Recommendation: use Resend for booking confirmations

| | **Resend** | **Supabase built-in SMTP** |
|---|------------|----------------------------|
| **Best for** | MFA, booking confirmations, any app-triggered email | Signup verify, password reset (auth flows) |
| **Free tier** | ~100 emails/day, 3,000/month | ~4 auth emails/hour (very limited) |
| **Custom domain** | Required for sending to any customer | Custom SMTP needed for production volume |
| **Already configured** | Yes (`RESEND_API_KEY`, `voltrondigital.co.uk`) | Not for transactional booking mail |
| **Rate limits** | Generous on free tier; scales with paid plans | Strict on free tier; Pro still needs SMTP for volume |

**Booking confirmation** is sent by your app when a driver sets status to `CONFIRMED` — this is **not** a Supabase Auth event, so Supabase would not send it unless you built custom SMTP + Edge Function yourself.

Use **Resend** (already integrated in `src/lib/send-booking-email.ts`).

## Current behaviour

1. Customer books and selects a driver (Lee, Darren, or Test Driver).
2. Assigned driver sees **only their** bookings in the driver portal.
3. **Test Driver** (`test@sparkride.co.uk`) sees **all** bookings.
4. When status changes to **CONFIRMED**, customer gets a Resend email (if `RESEND_API_KEY` is set and domain verified).

## Environment variables

```env
RESEND_API_KEY=re_...
MFA_EMAIL_FROM=Sparkride <verify@voltrondigital.co.uk>
BOOKINGS_EMAIL_FROM=Sparkride <verify@voltrondigital.co.uk>   # optional
```

## Restrictions to be aware of

### Resend (free)
- Verified sending domain required to email **any** customer address
- Without verification: only your Resend account email receives mail
- 100 emails/day on free plan

### Supabase Auth email (if you used it)
- ~4 emails/hour on free tier for the whole project
- Not suitable for booking confirmations at scale
- Configure **custom SMTP** in Supabase Dashboard → Authentication → SMTP for production auth mail

## Failure handling

If Resend fails (misconfigured key, rate limit), the booking status **still updates**; the error is logged server-side. Check Vercel logs if customers report missing confirmation emails.
