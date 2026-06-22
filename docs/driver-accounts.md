# Driver accounts (Supabase Postgres)

Driver logins are stored in the **`Driver`** table in Supabase Postgres — not Supabase Auth. Customers use Supabase Auth; drivers use email + password via `/driver/login`.

## Test driver (recommended for QA)

| Field | Value |
|-------|--------|
| **Portal** | https://sparkride-umber.vercel.app/driver/login |
| **Email** | `test@sparkride.co.uk` |
| **Password** | `TestDriver2024!` |
| **Bookable in customer wizard** | Yes — appears as **Test Driver** (Saloon, 4 seats) |

## Bookable drivers (customer booking step)

| Driver | Email | Password (driver portal) | Vehicle |
|--------|-------|--------------------------|---------|
| Lee | `lee@sparkride.co.uk` | `driver123` | KIA Carnival (6 seater) |
| Darren | `darren@sparkride.co.uk` | `driver123` | Tesla Model 3 (4 seater) |
| Test Driver | `test@sparkride.co.uk` | `TestDriver2024!` | Saloon (4 seater) |

## Legacy demo account

| Email | Password |
|-------|----------|
| `driver@sparkride.co.uk` | `driver123` |

Not shown in the customer driver picker (`bookable: false`).

## Sync drivers to the database

Drivers are upserted when:

1. **`GET /api/drivers`** runs (e.g. customer opens the booking wizard), or  
2. You run **`npx prisma db seed`** locally with database env vars set.

To add or change drivers in production, deploy code changes and hit `/api/drivers` once, or apply a Supabase SQL migration.

## Security

Change `TestDriver2024!` and `driver123` before going live. Do not use these passwords in production.
