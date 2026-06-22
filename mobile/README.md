# Sparkride Mobile App

Expo SDK 54 app for **customer bookings** and **driver job management**. Uses the same Next.js API as the website.

**Version:** `1.0.6` · **Build label:** `1.0.6-wizard` (shown in app footer)

## App screens

| Screen | How to access |
|--------|----------------|
| **Home** | App launch — logo, tagline, **Book a new ride** |
| **Book** | Home → Book a new ride — multi-step wizard matching the website |
| **Driver bookings** | Tap the version footer **5 times** to unlock, then **Driver bookings** |

### Booking wizard steps

1. Journey (single / return)
2. Service (airport transfer / pre-booked)
3. Direction (to / from airport — single airport only)
4. Route (airport + addresses)
5. Schedule (dates, times, passengers, luggage)
6. Contact (name, phone, email)

No vehicle selection — pricing uses a default saloon rate.

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

## Run (Expo Go)

**Terminal 1 — website API:**

```bat
cd "C:\Users\Charly Admin\sparkride-booking"
npm run dev
```

**Terminal 2 — mobile app:**

```bat
cd "C:\Users\Charly Admin\sparkride-booking\mobile"
npx expo start --clear
```

Scan the QR code with **Expo Go** on your phone, or press `a` for Android emulator.

> **Note:** Expo Go and an installed APK are different runtimes. Use Expo Go while developing; build an APK when ready to publish on `/download`.

## API URL

Edit `mobile/.env`:

```env
# Local dev on same machine (simulator)
EXPO_PUBLIC_API_URL=http://localhost:3000

# Physical phone on same Wi‑Fi — use your PC's IP address
EXPO_PUBLIC_API_URL=http://192.168.1.10:3000

# Production (Vercel)
EXPO_PUBLIC_API_URL=https://sparkride-booking.vercel.app
```

EAS builds use the URL in `eas.json` (`preview` and `production` profiles).

## API routes used

| Route | Purpose |
|-------|---------|
| `POST /api/bookings` | Create customer booking |
| `GET /api/mobile/bookings` | List bookings (driver screen) |
| `PATCH /api/mobile/bookings` | Update booking status |
| `GET /api/mobile/meta` | Airports list |

> **Security note:** Mobile driver routes have no auth yet. Add authentication before public release.

## Build Android APK

The website serves the app at **`/download`** and **`/api/download/apk`**.

1. Confirm `EXPO_PUBLIC_API_URL` in `mobile/eas.json` points to your live Vercel URL
2. Log in: `npx eas-cli login`
3. Build:
   ```bat
   cd mobile
   npx eas-cli build -p android --profile preview --clear-cache
   ```
4. Download the `.apk` from the Expo build page
5. Copy to `public/downloads/sparkride.apk` in the project root
6. Commit and push — Vercel deploys the download

**Large APK?** Host elsewhere (GitHub Releases, Supabase Storage) and set `NEXT_PUBLIC_APK_URL` in Vercel env vars.

## After each release

1. Bump `version` in `app.json` and `package.json`
2. Bump `versionCode` in `app.json` (Android)
3. Update `BUILD_LABEL` in `lib/build-info.ts` so you can confirm the build in the app footer
4. Rebuild APK and upload to `public/downloads/` if publishing via the website

## Troubleshooting

**Bundling failed / import errors** — use relative imports under `mobile/` (no `@/` paths).

**Booking screen stuck loading** — check `EXPO_PUBLIC_API_URL` and that the website API is reachable from your phone.

**Unmatched route on APK** — rebuild with latest code; old APKs may have stale routing.

Retry EAS build:

```bat
cd mobile
node create-assets.js
npx eas-cli build -p android --profile preview --clear-cache
```
