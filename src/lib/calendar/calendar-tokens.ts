import { SignJWT, jwtVerify } from "jose";
import type { CalendarLeg } from "./booking-events";

type CalendarTokenPayload = {
  reference: string;
  leg: CalendarLeg;
  audience: "customer";
};

function calendarTokenSecret(): Uint8Array {
  const secret =
    process.env.CALENDAR_LINK_SECRET ||
    process.env.JWT_SECRET ||
    "sparkride-calendar-links";
  return new TextEncoder().encode(secret);
}

export async function createCalendarDownloadToken(
  reference: string,
  leg: CalendarLeg = "all"
): Promise<string> {
  return new SignJWT({ reference, leg, audience: "customer" } satisfies CalendarTokenPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("90d")
    .sign(calendarTokenSecret());
}

export async function verifyCalendarDownloadToken(
  token: string
): Promise<CalendarTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, calendarTokenSecret());
    const reference = payload.reference;
    const leg = payload.leg;
    const audience = payload.audience;

    if (typeof reference !== "string") return null;
    if (leg !== "outbound" && leg !== "return" && leg !== "all") return null;
    if (audience !== "customer") return null;

    return { reference, leg, audience };
  } catch {
    return null;
  }
}
