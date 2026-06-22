# Driver accounts (Supabase Auth + passkeys)

Driver logins use **Supabase Auth** with **mandatory passkeys**. See [`docs/driver-passkeys.md`](./driver-passkeys.md) for setup.

## Test driver (recommended for QA)

| Field | Value |
|-------|--------|
| **Portal** | https://sparkride-umber.vercel.app/driver/login |
| **First-time setup** | `/driver/enroll` |
| **Email** | `test@sparkride.co.uk` |
| **One-time password** | `TestDriver2024!` (enrollment only) |
| **Bookable in customer wizard** | Yes — **Test Driver** (Saloon, 4 seats) |

## Bookable drivers

| Driver | Email | One-time password (enroll only) | Vehicle |
|--------|-------|----------------------------------|---------|
| Lee | `lee@sparkride.co.uk` | `driver123` | KIA Carnival (6 seater) |
| Darren | `darren@sparkride.co.uk` | `driver123` | Tesla Model 3 (4 seater) |
| Test Driver | `test@sparkride.co.uk` | `TestDriver2024!` | Saloon (4 seater) |

## Sync drivers

```bash
npx prisma db seed
npx tsx scripts/sync-driver-auth-users.ts
```

## Legacy demo account

| Email | Notes |
|-------|--------|
| `driver@sparkride.co.uk` | Not bookable; sync script creates Supabase Auth user |

## Booking confirmation emails

When a driver sets a booking to **CONFIRMED**, the customer receives a confirmation email via **Resend**.

Optional env override:

```env
BOOKINGS_EMAIL_FROM=Sparkride <verify@voltrondigital.co.uk>
```
