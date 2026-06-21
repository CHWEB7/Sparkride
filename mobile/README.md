# Sparkride Mobile App

Expo (React Native) app with two tabs:

- **Book** — customers create transfer bookings
- **Driver** — view all bookings and update job status

No authentication yet (prototype mode). Uses the same Next.js API as the website.

## Setup

```bat
cd "C:\Users\Charly Admin\sparkride-booking\mobile"
setup.bat
```

Or manually:

```bat
cd mobile
node create-assets.js
npm install
copy .env.example .env
```

## Run

**Terminal 1 — website API:**

```bat
cd "C:\Users\Charly Admin\sparkride-booking"
npm run dev
```

**Terminal 2 — mobile app:**

```bat
cd "C:\Users\Charly Admin\sparkride-booking\mobile"
npm start
```

Scan the QR code with **Expo Go** on your phone, or press `a` for Android emulator / `i` for iOS simulator.

## API URL

Edit `mobile/.env`:

```env
# Local dev on same machine (simulator)
EXPO_PUBLIC_API_URL=http://localhost:3000

# Physical phone on same Wi‑Fi — use your PC's IP address
EXPO_PUBLIC_API_URL=http://192.168.1.10:3000

# Production (Vercel)
EXPO_PUBLIC_API_URL=https://your-app.vercel.app
```

## API routes used

| Route | Purpose |
|-------|---------|
| `POST /api/bookings` | Create customer booking |
| `GET /api/mobile/bookings` | List bookings (driver tab) |
| `PATCH /api/mobile/bookings` | Update booking status |
| `GET /api/mobile/meta` | Airports and vehicle types |

> **Security note:** Mobile routes have no auth yet. Add authentication before public release.

## Push to GitHub

From the project root:

```bat
cd "C:\Users\Charly Admin\sparkride-booking"
git add .
git commit -m "Add Sparkride mobile app for bookings and driver view"
git push
```
