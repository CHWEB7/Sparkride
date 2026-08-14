/** In-app booking page with the embedded third-party form. */
export const BOOKING_PATH = "/book";

/** Optional override to send Book CTAs somewhere else (e.g. full provider URL). */
export const BOOKING_URL_ENV = "NEXT_PUBLIC_BOOKING_URL";

export type BookingUrlOptions = {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
};

function appendUtmParams(url: string, options?: BookingUrlOptions): string {
  if (!options?.utmSource) return url;

  const params = new URLSearchParams();
  params.set("utm_source", options.utmSource);
  if (options.utmMedium) params.set("utm_medium", options.utmMedium);
  if (options.utmCampaign) params.set("utm_campaign", options.utmCampaign);

  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}${params.toString()}`;
}

export function getBookingUrl(options?: BookingUrlOptions): string {
  const url = process.env.NEXT_PUBLIC_BOOKING_URL?.trim();
  const base = url || BOOKING_PATH;
  return appendUtmParams(base, options);
}

export function isExternalBookingUrl(url: string = getBookingUrl()): boolean {
  return /^(https?:|mailto:|tel:)/i.test(url);
}
