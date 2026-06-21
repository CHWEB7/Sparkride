# Sparkride Airport Transfer Booking

Private hire airport transfer web app with a customer booking front-end and driver management portal.

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

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repo
3. Add environment variables from `.env.example` in the Vercel project settings
4. Deploy

> **Important:** `.env` is not pushed to GitHub. Copy values into Vercel (and later Supabase) manually.

## Quick Start (Windows)

Double-click **`setup.bat`** in the project folder, or run in a terminal:

```bat
cd "C:\Users\Charly Admin\sparkride-booking"
setup.bat
```

This will install dependencies, create the database, seed a demo driver, and start the app.

## Manual Setup

```bash
cd "C:\Users\Charly Admin\sparkride-booking"
npm install
npm run db:push
npm run db:seed
npm run dev
```

## URLs

| Page | URL |
|------|-----|
| Homepage | http://localhost:3000 |
| Book a transfer | http://localhost:3000/book |
| Booking confirmation | http://localhost:3000/booking/SR-XXXXXX |
| Driver login | http://localhost:3000/driver/login |
| Driver dashboard | http://localhost:3000/driver/dashboard |

## Demo Driver Login

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

## What Was Built

### Customer app
- Landing page inspired by Sparkride (hero, airports, how-it-works)
- Bolt-style full-screen hamburger menu with animated overlay
- Booking form for 12 UK airports (LBA, MAN, LHR, etc.)
- Instant fixed-price estimates by vehicle type
- Booking confirmation page with reference number

### Driver portal
- Secure login (JWT cookie session)
- Dashboard listing all bookings
- Filter by status (Pending, Confirmed, En Route, Completed, Cancelled)
- Update booking status in one click

### Tech stack
- **Next.js 15** — full-stack React framework (front-end + API in one project)
- **Prisma + SQLite** — local database, no external services needed
- **Tailwind CSS v4** — modern styling
- **Framer Motion** — Bolt-style menu animations
- **Zod** — form validation

## Project Structure

```
src/app/           Pages and API routes
src/components/    UI components (Header, BookingForm, etc.)
src/lib/           Database, auth, airports, validation
prisma/            Database schema and seed script
```

## Production Build

```bash
npm run build
npm start
```
