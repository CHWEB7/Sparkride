let driverModeUnlocked = false;

export function isDriverModeUnlocked(): boolean {
  return driverModeUnlocked;
}

export function unlockDriverMode(): void {
  driverModeUnlocked = true;
}

export function lockDriverMode(): void {
  driverModeUnlocked = false;
}
