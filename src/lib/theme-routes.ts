export type ThemeZone = "marketing" | "customer" | "driver";

export const THEME_STORAGE_KEYS = {
  customer: "sparkride-theme",
  driver: "sparkride-driver-theme",
} as const;

/** Routes where users can toggle light/dark (customer booking & account). */
export function getThemeZone(pathname: string): ThemeZone {
  if (pathname.startsWith("/driver")) return "driver";

  if (
    pathname === "/book" ||
    pathname.startsWith("/book/") ||
    pathname === "/my-bookings" ||
    pathname.startsWith("/my-bookings/") ||
    pathname.startsWith("/booking/") ||
    pathname === "/account" ||
    pathname.startsWith("/account/") ||
    pathname === "/payments" ||
    pathname.startsWith("/payments/") ||
    pathname === "/login" ||
    pathname.startsWith("/login/") ||
    pathname === "/signup" ||
    pathname.startsWith("/signup/") ||
    pathname === "/verify-2fa" ||
    pathname.startsWith("/verify-2fa/")
  ) {
    return "customer";
  }

  return "marketing";
}
