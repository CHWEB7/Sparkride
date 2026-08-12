/** External third-party booking system URL (set in Vercel env). */
export const BOOKING_URL_ENV = "NEXT_PUBLIC_BOOKING_URL";

const FALLBACK_CONTACT = "mailto:info@sparkride.co.uk?subject=Book%20a%20transfer";

export function getBookingUrl(): string {
  const url = process.env.NEXT_PUBLIC_BOOKING_URL?.trim();
  if (url) return url;
  return FALLBACK_CONTACT;
}

export function isExternalBookingUrl(url: string = getBookingUrl()): boolean {
  return /^https?:\/\//i.test(url) || url.startsWith("mailto:");
}
