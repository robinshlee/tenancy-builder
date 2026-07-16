// Minimal transactional email sender via Resend's REST API (no SDK dependency).
// Requires RESEND_API_KEY to be set; without it, this logs and no-ops rather than
// blocking whatever action triggered the email (approval, signup notification, etc).
export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn(`[email] RESEND_API_KEY not set — skipping email to ${to}: "${subject}"`);
    return;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "Tenancy Builder <onboarding@resend.dev>",
        to,
        subject,
        html,
      }),
    });
    if (!res.ok) {
      console.error(`[email] Failed to send to ${to}:`, await res.text().catch(() => res.statusText));
    }
  } catch (err) {
    console.error(`[email] Error sending to ${to}:`, err);
  }
}

function emailShell(title: string, bodyHtml: string): string {
  return `
    <div style="font-family: -apple-system, Segoe UI, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #0b1626;">
      <h1 style="font-size: 18px; margin: 0 0 16px;">${title}</h1>
      ${bodyHtml}
      <p style="margin-top: 32px; font-size: 12px; color: #64748b;">Tenancy Builder</p>
    </div>
  `;
}

export function accountApprovedEmail(loginUrl: string): string {
  return emailShell(
    "Your account has been approved",
    `
      <p style="font-size: 14px; line-height: 1.6;">
        Good news — your Tenancy Builder account has been approved. You can log in now.
      </p>
      <p style="margin: 24px 0;">
        <a href="${loginUrl}" style="background: #14b8a6; color: #fff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 500;">
          Log in
        </a>
      </p>
    `,
  );
}

export function newSignupPendingApprovalEmail(applicantEmail: string, companyName: string | null, approveUrl: string): string {
  return emailShell(
    "New account pending approval",
    `
      <p style="font-size: 14px; line-height: 1.6;">
        <strong>${applicantEmail}</strong>${companyName ? ` (${companyName})` : ""} just signed up for Tenancy Builder
        and is waiting for admin approval.
      </p>
      <p style="margin: 24px 0;">
        <a href="${approveUrl}" style="background: #14b8a6; color: #fff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 500;">
          Review &amp; approve
        </a>
      </p>
    `,
  );
}
