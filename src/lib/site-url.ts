/**
 * Canonical site URL for auth redirects (email confirmation, password reset).
 * Set NEXT_PUBLIC_SITE_URL in Vercel to your production domain.
 */
export function getSiteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

export function getAuthCallbackUrl(redirect = "/book") {
  const base = getSiteUrl();
  return `${base}/auth/callback?redirect=${encodeURIComponent(redirect)}`;
}
