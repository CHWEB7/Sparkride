type SendResult = { ok: true } | { ok: false; error: string };

function emailFromAddress(): string {
  return (
    process.env.BOOKINGS_EMAIL_FROM ||
    process.env.MFA_EMAIL_FROM ||
    "Sparkride <onboarding@resend.dev>"
  );
}

async function sendResendEmail(
  to: string,
  subject: string,
  html: string
): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "RESEND_API_KEY is not configured" };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: emailFromAddress(),
      to: [to],
      subject,
      html,
    }),
  });

  const data = (await res.json().catch(() => ({}))) as { message?: string };
  if (!res.ok) {
    return { ok: false, error: data.message || `Email provider error (${res.status})` };
  }
  return { ok: true };
}

export type BookingConfirmedDetails = {
  reference: string;
  customerName: string;
  pickupAddress: string;
  dropoffAddress: string;
  pickupDate: Date;
  driverName: string;
  vehicleLabel?: string | null;
  estimatedPrice?: number | null;
};

export async function sendBookingConfirmedEmail(
  to: string,
  booking: BookingConfirmedDetails
): Promise<SendResult> {
  const dateStr = booking.pickupDate.toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/London",
  });

  const html = `
    <div style="font-family: system-ui, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #191c23; margin-bottom: 8px;">Your transfer is confirmed</h2>
      <p style="color: #6b7280; font-size: 15px; line-height: 1.5;">
        Hi ${booking.customerName}, your Sparkride booking <strong>${booking.reference}</strong> has been confirmed by your driver.
      </p>
      <table style="width: 100%; margin: 24px 0; font-size: 14px; color: #191c23;">
        <tr><td style="padding: 8px 0; color: #6b7280;">Pickup</td><td style="padding: 8px 0;">${booking.pickupAddress}</td></tr>
        <tr><td style="padding: 8px 0; color: #6b7280;">Drop-off</td><td style="padding: 8px 0;">${booking.dropoffAddress}</td></tr>
        <tr><td style="padding: 8px 0; color: #6b7280;">Date & time</td><td style="padding: 8px 0;">${dateStr}</td></tr>
        <tr><td style="padding: 8px 0; color: #6b7280;">Driver</td><td style="padding: 8px 0;">${booking.driverName}${booking.vehicleLabel ? ` · ${booking.vehicleLabel}` : ""}</td></tr>
        ${booking.estimatedPrice ? `<tr><td style="padding: 8px 0; color: #6b7280;">Price</td><td style="padding: 8px 0;">£${booking.estimatedPrice}</td></tr>` : ""}
      </table>
      <p style="color: #9ca3af; font-size: 13px;">
        Questions? Reply to this email or contact Sparkride support.
      </p>
    </div>
  `.trim();

  return sendResendEmail(
    to,
    `Booking ${booking.reference} confirmed — Sparkride`,
    html
  );
}
