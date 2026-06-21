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

## If the build fails again

Open the failed build on expo.dev → **Logs** → expand **Bundle JavaScript**.

Common fixes (already applied in this repo):
- `@/` import paths replaced with relative imports
- `tsconfigPaths` enabled in app.json
- App icons generated on `npm install` via `postinstall`

Retry:

```bat
cd mobile
node create-assets.js
npx eas-cli build -p android --profile preview --clear-cache
```

## Build Android APK for the website

The site serves the app at **`/download`** and **`/downloads/sparkride.apk`**.

1. Update `EXPO_PUBLIC_API_URL` in `mobile/eas.json` to your live Vercel URL
2. Log in to Expo: `npx eas-cli login`
3. Build the APK:
   ```bat
   cd mobile
   npx eas-cli build -p android --profile preview
   ```
4. Download the `.apk` from the Expo build page
5. Copy it to:
   ```
   public/downloads/sparkride.apk
   ```
6. Commit and push — Vercel will deploy the download

**Large APK?** Vercel has deployment size limits. Host the file elsewhere (GitHub Releases, Supabase Storage) and set `NEXT_PUBLIC_APK_URL` in Vercel env vars to the direct download link.

## Push to GitHub

From the project root:

```bat
cd "C:\Users\Charly Admin\sparkride-booking"
git add .
git commit -m "Add Sparkride mobile app for bookings and driver view"
git push
```
