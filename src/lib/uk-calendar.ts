import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { enGB } from "date-fns/locale";
import Holidays from "date-holidays";

const UK_TZ = "Europe/London";
const hd = new Holidays("GB");

export function toUkDateKey(date: Date | string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: UK_TZ }).format(new Date(date));
}

export function formatUkDate(date: Date | string, pattern = "EEE d MMM yyyy"): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: UK_TZ,
    weekday: pattern.includes("EEE") ? "short" : undefined,
    day: "numeric",
    month: pattern.includes("MMM") ? "short" : "long",
    year: pattern.includes("yyyy") ? "numeric" : undefined,
    hour: pattern.includes("HH") ? "2-digit" : undefined,
    minute: pattern.includes("mm") ? "2-digit" : undefined,
    hour12: false,
  }).format(d);
}

export function formatUkTime(date: Date | string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: UK_TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(date));
}

export function getMonthGrid(month: Date): Date[] {
  const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end });
}

export function formatMonthLabel(month: Date): string {
  return format(month, "MMMM yyyy", { locale: enGB });
}

export function getUkBankHolidaysForMonth(month: Date): Map<string, string> {
  const year = month.getFullYear();
  const holidays = hd.getHolidays(year) as Array<{ date: string; name: string }>;
  const map = new Map<string, string>();

  for (const h of holidays) {
    const key = h.date.slice(0, 10);
    const day = new Date(`${key}T12:00:00`);
    if (isSameMonth(day, month)) {
      map.set(key, h.name);
    }
  }

  return map;
}

export function isTodayInUk(day: Date): boolean {
  const todayKey = toUkDateKey(new Date());
  return toUkDateKey(day) === todayKey;
}

export { isSameDay, isSameMonth, addMonths, enGB };
