# Sparkride

Marketing website for Sparkride airport transfers (Castleford, West Yorkshire).

## Booking

The `/book` page embeds the DM Taxi Assistant booking form inline:

```html
<script src="https://dmtaxiassistant.com/booking/v1.js" data-operator="8bycg38i982l" async></script>
```

All “Book” / “Reserve a ride” CTAs link to `/book` by default.

Optional override (Vercel → Environment Variables):

```
NEXT_PUBLIC_BOOKING_URL=https://other-destination.example
```

## Local development

```bash
npm install
npm run dev
```

## What’s included

- Homepage, services, fares, and cancellation policy
- `/book` with the third-party booking form embed
