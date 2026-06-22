type SendResult = { ok: true } | { ok: false; error: string };

function buildEmailHtml(code: string): string {
  return `
    <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #191c23; margin-bottom: 8px;">Your Sparkride sign-in code</h2>
      <p style="color: #6b7280; font-size: 15px; line-height: 1.5;">
        Enter this code on the verification page to continue. It expires in 10 minutes.
      </p>
      <p style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #6a68de; margin: 28px 0;">
        ${code}
      </p>
      <p style="color: #9ca3af; font-size: 13px;">
        If you did not try to sign in, you can ignore this email.
      </p>
    </div>
  `.trim();
}

/** Sends MFA code via Resend (recommended). Avoids Supabase auth email rate limits. */
export async function sendVerificationCodeEmail(
  to: string,
  code: string
): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from =
    process.env.MFA_EMAIL_FROM || "Sparkride <onboarding@resend.dev>";

  if (!apiKey) {
    return {
      ok: false,
      error:
        "Email is not configured. Add RESEND_API_KEY to Vercel (see docs/daily-email-mfa.md).",
    };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: `${code} is your Sparkride verification code`,
      html: buildEmailHtml(code),
    }),
  });

  const data = (await res.json().catch(() => ({}))) as { message?: string };

  if (!res.ok) {
    const raw = data.message || `Email provider error (${res.status})`;
    const testingOnly =
      raw.includes("testing emails to your own email") ||
      raw.includes("verify a domain");
    return {
      ok: false,
      error: testingOnly
        ? "Verification emails can only be sent to your Resend account email until a domain is verified. Use that email to test, or verify your domain in Resend and set MFA_EMAIL_FROM in Vercel (see docs/daily-email-mfa.md)."
        : raw,
    };
  }

  return { ok: true };
}
