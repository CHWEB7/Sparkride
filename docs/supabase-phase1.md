# Phase 1 — Customer authentication (email)

**Supabase project:** `ukpkntvjqedtbycrpanv`  
**API URL:** `https://ukpkntvjqedtbycrpanv.supabase.co`

## Completed via Supabase (database)

| Item | Status |
|------|--------|
| `Customer`, `Driver`, `Booking` tables | Created |
| Enums (`BookingStatus`, etc.) | Created |
| Auto-create `Customer` on signup (trigger on `auth.users`) | Created |
| Demo driver row | Seeded (`driver@sparkride.co.uk`) |

Run `npm run db:seed` locally if you need to refresh the driver password hash.

## Required — Supabase Auth dashboard

Open: [Supabase → Authentication → URL configuration](https://supabase.com/dashboard/project/ukpkntvjqedtbycrpanv/auth/url-configuration)

| Setting | Value |
|---------|--------|
| **Site URL** | `https://sparkride-umber.vercel.app` |
| **Redirect URLs** | Add each line below |

```
http://localhost:3000/**
https://sparkride-umber.vercel.app/**
https://sparkride-sparkride.vercel.app/**
https://*.vercel.app/**
```

Open: [Authentication → Providers → Email](https://supabase.com/dashboard/project/ukpkntvjqedtbycrpanv/auth/providers)

| Setting | Recommended |
|---------|-------------|
| **Enable Email provider** | On |
| **Confirm email** | Off for testing · On for production |
| **Secure email change** | On |

## Required — Vercel env var

Add to Vercel (and local `.env`):

```env
NEXT_PUBLIC_SITE_URL=https://sparkride-umber.vercel.app
```

This ensures signup and password-reset emails link to production, not localhost.

Mobile `eas.json` / `.env` should already include:

```env
EXPO_PUBLIC_SUPABASE_URL=https://ukpkntvjqedtbycrpanv.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<from Vercel integration>
```

## Test flow

1. Visit `/signup` → create account  
2. If email confirm is **off**: redirected to `/book` immediately  
3. If email confirm is **on**: click link in email → `/auth/callback` → `/book`  
4. Complete a booking → row in `Booking` with `customerId`  
5. `/my-bookings` lists your trips  

## Security note (RLS)

Supabase flagged that **Row Level Security is disabled** on `Customer`, `Driver`, and `Booking`.  
This is acceptable while all access goes through your **Next.js API** (Prisma).  
If you later query these tables directly from the client, enable RLS and add policies.

## What's next — Phase 2

- Cancel / amend bookings  
- Google sign-in  
- Email notifications on status changes  
