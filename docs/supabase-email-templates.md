# Supabase email templates

Update these in the [Supabase Dashboard → Authentication → Email Templates](https://supabase.com/dashboard/project/ukpkntvjqedtbycrpanv/auth/templates).

Also set **Site URL** to `https://sparkride-umber.vercel.app` under [URL configuration](https://supabase.com/dashboard/project/ukpkntvjqedtbycrpanv/auth/url-configuration).

---

## 1. Magic Link (daily 2FA codes)

Used by `signInWithOtp` for daily verification. **Must show a code, not a link.**

Replace the template body with:

```html
<h2>Your Sparkride sign-in code</h2>
<p>Enter this code on the verification page to continue booking:</p>
<p style="font-size: 28px; font-weight: bold; letter-spacing: 6px; margin: 24px 0;">{{ .Token }}</p>
<p>This code expires shortly. Your session ends at midnight UK time.</p>
<p>If you did not try to sign in, you can safely ignore this email.</p>
```

**Important:** Remove any `{{ .ConfirmationURL }}` from this template. If that variable is present, Supabase sends a magic link instead of a code.

---

## 2. Confirm signup (account verification)

Used when a new customer signs up. **Uses a link** that should open on the live website.

```html
<h2>Confirm your Sparkride account</h2>
<p>Thanks for signing up. Click the link below to verify your email and start booking:</p>
<p><a href="{{ .ConfirmationURL }}">Verify my email</a></p>
<p>If you did not create an account, you can ignore this email.</p>
```

The app passes `emailRedirectTo` as `https://sparkride-umber.vercel.app/auth/callback?redirect=/book` so the link returns to production.

---

## 3. Reset password

```html
<h2>Reset your Sparkride password</h2>
<p>Click the link below to choose a new password:</p>
<p><a href="{{ .ConfirmationURL }}">Reset password</a></p>
<p>If you did not request this, you can ignore this email.</p>
```

---

## Redirect URLs (allow list)

Under URL configuration, ensure these are listed:

```
http://localhost:3000/**
https://sparkride-umber.vercel.app/**
https://*.vercel.app/**
```

---

## Vercel environment variable

Set in Vercel project settings:

```env
NEXT_PUBLIC_SITE_URL=https://sparkride-umber.vercel.app
```

This ensures signup and password-reset emails always use the production URL, even during local development builds.
