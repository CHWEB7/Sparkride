export function buildTimeSlots(startHour = 5, endHour = 24, stepMinutes = 15): string[] {
  const slots: string[] = [];
  for (let h = startHour; h < endHour; h++) {
    for (let m = 0; m < 60; m += stepMinutes) {
      slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return slots;
}

export type TimePeriod = {
  id: string;
  label: string;
  slots: string[];
};

export function groupTimeSlotsByPeriod(slots: string[]): TimePeriod[] {
  const morning: string[] = [];
  const afternoon: string[] = [];
  const evening: string[] = [];
  const night: string[] = [];

  for (const slot of slots) {
    const hour = Number(slot.split(":")[0]);
    if (hour < 12) morning.push(slot);
    else if (hour < 17) afternoon.push(slot);
    else if (hour < 21) evening.push(slot);
    else night.push(slot);
  }

  return [
    { id: "morning", label: "Morning", slots: morning },
    { id: "afternoon", label: "Afternoon", slots: afternoon },
    { id: "evening", label: "Evening", slots: evening },
    { id: "night", label: "Night", slots: night },
  ].filter((period) => period.slots.length > 0);
}

export function formatBookingTimeLabel(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "pm" : "am";
  const hour12 = h % 12 || 12;
  const minutes = String(m).padStart(2, "0");
  return `${hour12}.${minutes} ${period}`;
}

export const PICKUP_TIME_SLOTS = buildTimeSlots();
export const PICKUP_TIME_PERIODS = groupTimeSlotsByPeriod(PICKUP_TIME_SLOTS);

export const FLIGHT_TIME_SLOTS = buildTimeSlots(0, 24);
export const FLIGHT_TIME_PERIODS = groupTimeSlotsByPeriod(FLIGHT_TIME_SLOTS);
