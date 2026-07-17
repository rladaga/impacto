// Best-effort transactional email via Resend (https://resend.com).
//
// Wiring is complete but inert until the env vars are set, so deploys without
// mail config simply skip sending instead of failing the request:
//   RESEND_API_KEY   – Resend API key
//   EMAIL_FROM       – verified sender, e.g. "IMPACTO <no-reply@tudominio.com>"
//   IMPACTO_INBOX    – address that receives the IMPACTO copy (trazabilidad)
//
// Returns true if an email was dispatched, false if skipped/failed (never throws
// so a mail outage can't block a Supabase write).
interface SendEmailArgs {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}

export const IMPACTO_INBOX = process.env.IMPACTO_INBOX;

export async function sendEmail({
  to,
  subject,
  html,
  replyTo,
}: SendEmailArgs): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    console.warn(
      "[email] RESEND_API_KEY/EMAIL_FROM not set — skipping email:",
      subject,
    );
    return false;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    });

    if (!res.ok) {
      console.error("[email] Resend error:", res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error("[email] Resend request failed:", err);
    return false;
  }
}
