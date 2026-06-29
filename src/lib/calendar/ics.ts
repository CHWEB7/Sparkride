import type { CalendarEvent } from "./booking-events";

const UK_TZ = "Europe/London";

function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function formatIcsUtcStamp(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function formatIcsLocalDateTime(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: UK_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "00";

  return `${get("year")}${get("month")}${get("day")}T${get("hour")}${get("minute")}${get("second")}`;
}

function foldIcsLine(line: string): string {
  const maxLength = 75;
  if (line.length <= maxLength) return line;

  const chunks: string[] = [line.slice(0, maxLength)];
  let index = maxLength;

  while (index < line.length) {
    chunks.push(` ${line.slice(index, index + maxLength - 1)}`);
    index += maxLength - 1;
  }

  return chunks.join("\r\n");
}

function buildVevent(event: CalendarEvent, dtStamp: Date): string {
  const lines = [
    "BEGIN:VEVENT",
    `UID:${event.uid}`,
    `DTSTAMP:${formatIcsUtcStamp(dtStamp)}`,
    `DTSTART;TZID=${UK_TZ}:${formatIcsLocalDateTime(event.start)}`,
    `DTEND;TZID=${UK_TZ}:${formatIcsLocalDateTime(event.end)}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
    `DESCRIPTION:${escapeIcsText(event.description)}`,
    `LOCATION:${escapeIcsText(event.location)}`,
    "END:VEVENT",
  ];

  return lines.map(foldIcsLine).join("\r\n");
}

export function buildIcsCalendar(events: CalendarEvent[]): string {
  const dtStamp = new Date();
  const body = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Sparkride//Booking Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-TIMEZONE:${UK_TZ}`,
    ...events.map((event) => buildVevent(event, dtStamp)),
    "END:VCALENDAR",
  ].join("\r\n");

  return `${body}\r\n`;
}
