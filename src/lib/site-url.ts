/**
 * Canonical site URL for auth redirects (email confirmation, password reset).
 * Set NEXT_PUBLIC_SITE_URL in Vercel to your production domain.
 */
const PRODUCTION_URL = "https://sparkride-umber.vercel.app";

export function getSiteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  // In the browser, use the current origin (works on Vercel without a build-time env var)
  if (typeof window !== "undefined") {
    const origin = window.location.origin;
    if (origin && !origin.includes("localhost")) {
      return origin;
    }
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  if (process.env.NODE_ENV === "production") {
    return PRODUCTION_URL;
  }
  return "http://localhost:3000";
}

export function getAuthCallbackUrl(redirect = "/book") {
  const base = getSiteUrl();
  return `${base}/auth/callback?redirect=${encodeURIComponent(redirect)}`;
}
