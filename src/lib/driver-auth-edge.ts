export const DRIVER_ROLE = "driver";

export function isDriverUser(user: { app_metadata?: Record<string, unknown> } | null) {
  return user?.app_metadata?.role === DRIVER_ROLE;
}
