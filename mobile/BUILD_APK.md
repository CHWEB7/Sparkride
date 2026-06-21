# How to get the Android APK

Creating an **Expo account alone does not create an APK**. You must start a **cloud build** and wait for it to finish.

## Step-by-step

### 1. Open a terminal in the `mobile` folder

```bat
cd "C:\Users\Charly Admin\sparkride-booking\mobile"
```

### 2. Run the build script

Double-click **`build-apk.bat`** or run:

```bat
build-apk.bat
```

This will:
- Log you in to Expo (if needed)
- Link the project to your account
- Start an Android build in Expo’s cloud

### 3. Wait for the build URL

When the build **starts**, the terminal prints a link like:

```
https://expo.dev/accounts/YOUR_NAME/projects/sparkride-mobile/builds/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

**Open that link in your browser.**

### 4. Wait for “Finished” (10–20 minutes)

On the build page you will see:

| Status | Meaning |
|--------|---------|
| **Queued** | Waiting to start |
| **In progress** | Building — wait |
| **Finished** | **Download button appears** |
| **Errored** | Build failed — open the logs on that page |

### 5. Download the APK

When status is **Finished**, click **Download** on the build page (or **Install** → download the `.apk` file).

### 6. Add it to your website

Copy the downloaded file to:

```
public/downloads/sparkride.apk
```

Then from the project root:

```bat
cd ..
git add public/downloads/sparkride.apk
git commit -m "Add Android APK for download"
git push
```

---

## Where to find builds on expo.dev

1. Go to [expo.dev](https://expo.dev) and sign in  
2. Click your profile (top right) → **Dashboard**  
3. Open project **sparkride-mobile** (created on first build)  
4. Click **Builds** in the left menu  
5. Open the latest **Android** build → **Download** when finished  

Or run in terminal:

```bat
cd mobile
npx eas-cli build:list
```

This lists builds with links.

---

## Troubleshooting

**“I only created an account”**  
→ You still need to run `build-apk.bat`. The APK is not auto-generated.

**“No Download button”**  
→ Build is not finished yet, or it failed. Check status on the build page.

**“Build failed”**  
→ Open the build logs on expo.dev. Common fixes:
- Run `npm install` in `mobile/`
- Run `node create-assets.js`
- Run `npx eas-cli login` again

**“Wrong API URL in the app”**  
→ Edit `eas.json` and set `EXPO_PUBLIC_API_URL` to your real Vercel URL, then rebuild.

---

## After the APK is on the website

Users visit **your-site.com/download** and tap **Download for Android**.
