/** In-app booking page with the embedded third-party form. */
export const BOOKING_PATH = "/book";

/** Optional override to send Book CTAs somewhere else (e.g. full provider URL). */
export const BOOKING_URL_ENV = "NEXT_PUBLIC_BOOKING_URL";

export function getBookingUrl(): string {
  const url = process.env.NEXT_PUBLIC_BOOKING_URL?.trim();
  if (url) return url;
  return BOOKING_PATH;
}

export function isExternalBookingUrl(url: string = getBookingUrl()): boolean {
  return /^(https?:|mailto:|tel:)/i.test(url);
}
