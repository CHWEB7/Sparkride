import { getSiteUrl } from "@/lib/site-url";

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
  paymentLinkUrl?: string | null;
  paymentStatus?: string | null;
};

export async function sendBookingConfirmedEmail(
  to: string,
  booking: BookingConfirmedDetails
): Promise<SendResult> {
  const siteUrl = getSiteUrl();
  const bookingPageUrl = `${siteUrl}/booking/${booking.reference}`;

  const dateStr = booking.pickupDate.toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/London",
  });

  const showPayButton =
    booking.paymentStatus === "AWAITING_PAYMENT" && booking.paymentLinkUrl;

  const nextSteps = showPayButton
    ? `
      <ol style="margin: 0; padding-left: 20px; color: #374151; font-size: 14px; line-height: 1.7;">
        <li><strong>Pay online now</strong> using the button below (secure Square checkout).</li>
        <li>Keep your reference <strong>${booking.reference}</strong> — you can also pay from your Sparkride booking page.</li>
        <li>Your driver will contact you before pickup if they need any further details.</li>
        <li>On travel day, be ready at the pickup location at the agreed time.</li>
      </ol>
    `
    : `
      <ol style="margin: 0; padding-left: 20px; color: #374151; font-size: 14px; line-height: 1.7;">
        <li>View your booking on Sparkride using the link below.</li>
        <li>Your driver will confirm payment arrangements if online pay is not yet available.</li>
        <li>Keep your reference <strong>${booking.reference}</strong> for any enquiries.</li>
        <li>On travel day, be ready at the pickup location at the agreed time.</li>
      </ol>
    `;

  const payBlock = showPayButton
    ? `
      <div style="margin: 28px 0; text-align: center;">
        <a href="${booking.paymentLinkUrl}"
           style="display: inline-block; background: linear-gradient(135deg, #6a68de, #82dbdf); color: #ffffff; text-decoration: none; font-weight: 600; padding: 14px 28px; border-radius: 999px;">
          Pay now — £${booking.estimatedPrice ?? ""}
        </a>
        <p style="color: #6b7280; font-size: 13px; margin-top: 12px; line-height: 1.5;">
          Secure payment via Square. Sparkride does not store your card details.
        </p>
      </div>
    `
    : "";

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
        ${booking.estimatedPrice ? `<tr><td style="padding: 8px 0; color: #6b7280;">Fare</td><td style="padding: 8px 0;">£${booking.estimatedPrice}</td></tr>` : ""}
      </table>

      <h3 style="color: #191c23; font-size: 16px; margin: 24px 0 12px;">Next steps</h3>
      ${nextSteps}

      ${payBlock}

      <div style="margin: 28px 0; text-align: center;">
        <a href="${bookingPageUrl}"
           style="display: inline-block; border: 2px solid #6a68de; color: #6a68de; text-decoration: none; font-weight: 600; padding: 12px 24px; border-radius: 999px;">
          View booking on Sparkride
        </a>
        <p style="color: #6b7280; font-size: 13px; margin-top: 12px; line-height: 1.5;">
          Sign in to track your trip, pay online, and see booking details.
        </p>
      </div>

      <p style="color: #9ca3af; font-size: 13px;">
        Questions? Reply to this email or visit <a href="${siteUrl}/payments" style="color: #6a68de;">how payments work</a>.
      </p>
    </div>
  `.trim();

  return sendResendEmail(
    to,
    `Booking ${booking.reference} confirmed — pay online`,
    html
  );
}

/** Email sent when driver accepts a booking (includes payment link when applicable). */
export async function sendBookingAcceptedEmail(
  to: string,
  booking: BookingConfirmedDetails
): Promise<SendResult> {
  const siteUrl = getSiteUrl();
  const bookingPageUrl = `${siteUrl}/booking/${booking.reference}`;

  const dateStr = booking.pickupDate.toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/London",
  });

  const showPayButton =
    booking.paymentStatus === "AWAITING_PAYMENT" && booking.paymentLinkUrl;

  const nextSteps = showPayButton
    ? `
      <ol style="margin: 0; padding-left: 20px; color: #374151; font-size: 14px; line-height: 1.7;">
        <li><strong>Pay online now</strong> using the button below (secure Square checkout).</li>
        <li>Keep your reference <strong>${booking.reference}</strong> — you can also pay from your Sparkride booking page.</li>
        <li>Your driver will contact you before pickup if they need any further details.</li>
        <li>On travel day, be ready at the pickup location at the agreed time.</li>
      </ol>
    `
    : `
      <ol style="margin: 0; padding-left: 20px; color: #374151; font-size: 14px; line-height: 1.7;">
        <li>View your booking on Sparkride using the link below.</li>
        <li>Your driver will confirm payment arrangements if online pay is not yet available.</li>
        <li>Keep your reference <strong>${booking.reference}</strong> for any enquiries.</li>
        <li>On travel day, be ready at the pickup location at the agreed time.</li>
      </ol>
    `;

  const payBlock = showPayButton
    ? `
      <div style="margin: 28px 0; text-align: center;">
        <a href="${booking.paymentLinkUrl}"
           style="display: inline-block; background: linear-gradient(135deg, #6a68de, #82dbdf); color: #ffffff; text-decoration: none; font-weight: 600; padding: 14px 28px; border-radius: 999px;">
          Pay now — £${booking.estimatedPrice ?? ""}
        </a>
        <p style="color: #6b7280; font-size: 13px; margin-top: 12px; line-height: 1.5;">
          Secure payment via Square. Sparkride does not store your card details.
        </p>
      </div>
    `
    : "";

  const html = `
    <div style="font-family: system-ui, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #191c23; margin-bottom: 8px;">Your driver has accepted your booking</h2>
      <p style="color: #6b7280; font-size: 15px; line-height: 1.5;">
        Hi ${booking.customerName}, your Sparkride booking <strong>${booking.reference}</strong> has been accepted by ${booking.driverName}.
      </p>
      <table style="width: 100%; margin: 24px 0; font-size: 14px; color: #191c23;">
        <tr><td style="padding: 8px 0; color: #6b7280;">Pickup</td><td style="padding: 8px 0;">${booking.pickupAddress}</td></tr>
        <tr><td style="padding: 8px 0; color: #6b7280;">Drop-off</td><td style="padding: 8px 0;">${booking.dropoffAddress}</td></tr>
        <tr><td style="padding: 8px 0; color: #6b7280;">Date & time</td><td style="padding: 8px 0;">${dateStr}</td></tr>
        <tr><td style="padding: 8px 0; color: #6b7280;">Driver</td><td style="padding: 8px 0;">${booking.driverName}${booking.vehicleLabel ? ` · ${booking.vehicleLabel}` : ""}</td></tr>
        ${booking.estimatedPrice ? `<tr><td style="padding: 8px 0; color: #6b7280;">Fare</td><td style="padding: 8px 0;">£${booking.estimatedPrice}</td></tr>` : ""}
      </table>

      <h3 style="color: #191c23; font-size: 16px; margin: 24px 0 12px;">Next steps</h3>
      ${nextSteps}

      ${payBlock}

      <div style="margin: 28px 0; text-align: center;">
        <a href="${bookingPageUrl}"
           style="display: inline-block; border: 2px solid #6a68de; color: #6a68de; text-decoration: none; font-weight: 600; padding: 12px 24px; border-radius: 999px;">
          View booking on Sparkride
        </a>
        <p style="color: #6b7280; font-size: 13px; margin-top: 12px; line-height: 1.5;">
          Sign in to track your trip, pay online, and see booking details.
        </p>
      </div>

      <p style="color: #9ca3af; font-size: 13px;">
        Questions? Reply to this email or visit <a href="${siteUrl}/payments" style="color: #6a68de;">how payments work</a>.
      </p>
    </div>
  `.trim();

  const subject = showPayButton
    ? `Booking ${booking.reference} accepted — pay online`
    : `Booking ${booking.reference} accepted by your driver`;

  return sendResendEmail(to, subject, html);
}
