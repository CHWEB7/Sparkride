# Sparkride

Marketing website for Sparkride airport transfers (Castleford, West Yorkshire).

Booking and trip management are handled by a third-party system. Set the public booking URL in Vercel:

```
NEXT_PUBLIC_BOOKING_URL=https://your-provider.example
```

All “Book” / “Reserve a ride” CTAs use that URL. If it is unset, CTAs fall back to `mailto:info@sparkride.co.uk`.

## Local development

```bash
npm install
npm run dev
```

## What’s included

- Homepage, services, fares, and cancellation policy
- External booking CTAs via `NEXT_PUBLIC_BOOKING_URL`

## What’s removed

- In-house booking wizard and customer portal
- Driver portal and Square payment integrations
- Supabase auth, Prisma booking database, and mobile booking app
