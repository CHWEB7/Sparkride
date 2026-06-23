# Sparkride Airport Transfer Booking

Private hire airport transfer platform with a **customer website**, **Expo mobile app**, and **driver management portal**.

## Open in Cursor

1. In Cursor, go to **File → Open Folder**
2. Select: `C:\Users\Charly Admin\sparkride-booking`
3. Open a terminal in Cursor (`Ctrl + `` ` ``) and run the setup below

> Do **not** wait for an agent workspace switch — open the folder manually.

## Push to GitHub

### 1. Create a GitHub repository

1. Go to [github.com/new](https://github.com/new)
2. Name it e.g. `sparkride-booking`
3. Leave it **empty** (no README, no `.gitignore`, no license — we already have those)
4. Click **Create repository**

### 2. Push from your PC (easiest)

Double-click **`github-setup.bat`** in the project folder, or run:

```bat
cd "C:\Users\Charly Admin\sparkride-booking"
github-setup.bat
```

Paste your repo URL when prompted (e.g. `https://github.com/YOUR_USERNAME/sparkride-booking.git`).

### 3. Push manually (alternative)

```bat
cd "C:\Users\Charly Admin\sparkride-booking"
git init
git branch -M main
git add .
git commit -m "Initial commit: Sparkride booking website and driver portal"
git remote add origin https://github.com/YOUR_USERNAME/sparkride-booking.git
git push -u origin main
```

If GitHub asks for credentials, use a [Personal Access Token](https://github.com/settings/tokens) instead of your password, or run `gh auth login`.

### 4. Connect to Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and import your GitHub repo
2. Install the **[Supabase integration](https://vercel.com/integrations/supabase)** and link your Supabase project — this auto-syncs Postgres and Auth env vars
3. Add app-only secrets in Vercel: `JWT_SECRET`, `GOOGLE_MAPS_API_KEY`, etc. (see [`docs/supabase-phase0.md`](docs/supabase-phase0.md))
4. Deploy, then run `npm run db:push` and `npm run db:seed` once against your Supabase database

> **Important:** `.env` is not pushed to GitHub. For local dev, run `npx vercel env pull .env` after linking the project — or copy vars from the Vercel / Supabase dashboards.

## Quick Start — Website (Windows)

**Prerequisite:** Supabase linked to Vercel (integration) or `.env` configured — see [`docs/supabase-phase0.md`](docs/supabase-phase0.md).

Pull env vars from Vercel (if integration is connected):

```bat
npx vercel link
npx vercel env pull .env
```

Then add `JWT_SECRET` and `GOOGLE_MAPS_API_KEY` to `.env`.

Double-click **`setup.bat`** in the project folder, or run in a terminal:

```bat
cd "C:\Users\Charly Admin\sparkride-booking"
setup.bat
```

This will install dependencies, create the database, seed a demo driver, and start the app.

### Manual setup

```bash
cd "C:\Users\Charly Admin\sparkride-booking"
copy .env.example .env
# Edit .env with Supabase credentials (see docs/supabase-phase0.md)
npm install
npm run db:push
npm run db:seed
npm run dev
```

## Mobile app

Expo (React Native) app in [`mobile/`](mobile/README.md). Uses the same Next.js API as the website.

| Feature | Website | Mobile app |
|---------|---------|------------|
| Customer booking | `/book` | Home → **Book a new ride** (multi-step wizard) |
| Driver bookings | `/driver/login` (auth) | Hidden — tap version footer **5 times** to unlock |
| Download | `/download` | Android APK (when built and uploaded) |

**Current app version:** `1.0.6` (Expo SDK 54)

### Quick start — mobile (Expo Go)

**Terminal 1 — website API:**

```bat
cd "C:\Users\Charly Admin\sparkride-booking"
npm run dev
```

**Terminal 2 — mobile app:**

```bat
cd "C:\Users\Charly Admin\sparkride-booking\mobile"
npm install
npx expo start --clear
```

Scan the QR code with **Expo Go** on your phone.

### API URL (`mobile/.env`)

```env
# Local dev (simulator on same PC)
EXPO_PUBLIC_API_URL=http://localhost:3000

# Physical phone on same Wi‑Fi — use your PC's IP
EXPO_PUBLIC_API_URL=http://192.168.1.10:3000

# Production (Vercel)
EXPO_PUBLIC_API_URL=https://sparkride-booking.vercel.app
```

### Build Android APK for `/download`

1. Log in: `npx eas-cli login`
2. Build:
   ```bat
   cd mobile
   npx eas-cli build -p android --profile preview --clear-cache
   ```
3. Download the `.apk` from [expo.dev](https://expo.dev)
4. Copy to `public/downloads/sparkride.apk`
5. Commit and push — Vercel deploys the download page

See [`mobile/README.md`](mobile/README.md) and [`mobile/BUILD_APK.md`](mobile/BUILD_APK.md) for full details.

## URLs

| Page | URL |
|------|-----|
| Homepage | http://localhost:3000 |
| Book a transfer | http://localhost:3000/book |
| Download Android app | http://localhost:3000/download |
| Booking confirmation | http://localhost:3000/booking/SR-XXXXXX |
| Driver login | http://localhost:3000/driver/login |
| Driver dashboard | http://localhost:3000/driver/dashboard |

## Demo Driver Login (website)

- **Email:** `driver@sparkride.co.uk`
- **Password:** `driver123`

## Google Maps address finder

The pickup address search uses **Google Places API (New)** for up-to-date UK addresses.

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project (or select an existing one)
3. Enable **Places API (New)**
4. Create an API key under **APIs & Services → Credentials**
5. Add the key to your `.env` file:

```
GOOGLE_MAPS_API_KEY="your-api-key-here"
```

6. Restart the dev server (`npm run dev`)

Billing must be enabled on your Google Cloud account (Google provides free monthly credit). Restrict the API key to Places API (New) and your domain in production.

## What was built

### Customer website
- Landing page with hero video, airports, how-it-works
- Multi-step booking wizard (journey → service → direction → route → schedule → contact)
- Instant fixed-price estimates
- Booking confirmation page with reference number
- Android app download page at `/download`

### Mobile app (`mobile/`)
- Home screen with **Book a new ride**
- Same multi-step booking wizard as the website
- Driver bookings list (hidden until version footer tapped 5 times)
- Connects to production or local API via `EXPO_PUBLIC_API_URL`

### Driver portal (website)
- Email + password login with mandatory TOTP MFA (authenticator app)
- One-time password enrollment at `/driver/enroll` to set up MFA
- Dashboard listing assigned bookings
- Filter by status (Pending, Confirmed, En Route, Completed, Cancelled)
- Update booking status in one click

### Tech stack
- **Next.js 15** — website + API routes
- **Supabase** — Postgres database + customer auth (Phase 1+)
- **Expo SDK 54 / React Native** — mobile app in `/mobile`
- **Prisma** — ORM against Supabase Postgres
- **Tailwind CSS v4** — website styling
- **Framer Motion** — menu animations
- **Zod** — validation

## Supabase & authentication

| Phase | Status | Scope |
|-------|--------|--------|
| **0** | Ready to configure | Postgres migration, Supabase client libs, health check |
| **1** | Implemented | Customer email auth, mandatory sign-up, no guest bookings |
| **2** | Planned | My bookings, cancel/amend |
| **3** | Planned | Notifications, profiles |
| **4** | Implemented | Driver auth on Supabase with mandatory TOTP MFA |

Setup guide: [`docs/supabase-phase0.md`](docs/supabase-phase0.md)

## Project structure

```
src/app/              Website pages and API routes
src/components/       UI components (Header, BookingForm, etc.)
src/lib/              Database, auth, airports, validation
prisma/               Database schema and seed script
docs/                 Supabase setup and phase guides
mobile/               Expo mobile app
public/downloads/     Android APK served at /download
```

## Refresh & deploy checklist

After code changes:

```bat
cd "C:\Users\Charly Admin\sparkride-booking"
git add .
git commit -m "Your message"
git push origin main
```

Vercel auto-deploys the website. For the mobile app:

| Goal | Command |
|------|---------|
| Test in Expo Go | `cd mobile && npx expo start --clear` |
| New Android APK | `cd mobile && npx eas-cli build -p android --profile preview` |
| Update website download | Copy APK to `public/downloads/sparkride.apk`, commit, push |

## Production build (website)

```bash
npm run build
npm start
```
