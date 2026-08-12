export type ThemeZone = "marketing";

export const THEME_STORAGE_KEYS = {
  customer: "sparkride-theme",
  driver: "sparkride-driver-theme",
} as const;

/** Marketing site only — light/dark toggle is disabled. */
export function getThemeZone(_pathname: string): ThemeZone {
  return "marketing";
}
