/** Hub transfers with fixed fares that skip manual driver acceptance. */
export function isAutoAcceptedHubBooking(serviceType: string): boolean {
  return serviceType === "AIRPORT_TRANSFER" || serviceType === "CRUISE_TERMINAL_TRANSFER";
}
