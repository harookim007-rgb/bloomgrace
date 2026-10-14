// Shared Resend sender with error logging + optional admin alert.
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
// The shop's own inbox: gets inquiry notices, failure alerts and copies of customer emails,
// and is where customers' replies go (mail is sent from the verified youthroom.shop domain).
export const ADMIN_NOTIFY_EMAIL = Deno.env.get("ADMIN_NOTIFY_EMAIL") || "youthroom@gmail.com";
const FROM = Deno.env.get("EMAIL_FROM") || "YOUTHROOM <hello@youthroom.shop>";

export interface SendArgs {
  to: string;
  subject: string;
  html: string;
  tag?: string; // e.g. "welcome", "order-confirmation"
  replyTo?: string;
  copyToAdmin?: boolean; // also deliver a copy to the shop inbox
}

export async function sendEmail({ to, subject, html, tag, replyTo, copyToAdmin }: SendArgs): Promise<{ ok: boolean; error?: string; status?: number }> {
  if (!RESEND_API_KEY) {
    const msg = "RESEND_API_KEY is not configured";
    console.error(`[email:${tag}] ${msg}`);
    return { ok: false, error: msg };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM, to: [to], subject, html,
        reply_to: [replyTo || ADMIN_NOTIFY_EMAIL],
        ...(copyToAdmin && to.toLowerCase() !== ADMIN_NOTIFY_EMAIL.toLowerCase() ? { bcc: [ADMIN_NOTIFY_EMAIL] } : {}),
      }),
    });

    if (!res.ok) {
      const details = await res.text();
      console.error(`[email:${tag}] Resend failed ${res.status}: ${details}`);
      await notifyAdmin(tag ?? "email", `Recipient: ${to}\nStatus: ${res.status}\n${details}`);
      return { ok: false, error: details, status: res.status };
    }

    console.log(`[email:${tag}] sent to ${to}`);
    return { ok: true, status: res.status };
  } catch (e: any) {
    const msg = e?.message || String(e);
    console.error(`[email:${tag}] exception: ${msg}`);
    await notifyAdmin(tag ?? "email", `Recipient: ${to}\nException: ${msg}`);
    return { ok: false, error: msg };
  }
}

async function notifyAdmin(tag: string, body: string) {
  if (!RESEND_API_KEY || !ADMIN_NOTIFY_EMAIL) return;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM,
        to: [ADMIN_NOTIFY_EMAIL],
        subject: `[YOUTHROOM] Email send failed: ${tag}`,
        html: `<pre style="font-family:monospace;font-size:12px;white-space:pre-wrap;">${body.replace(/[&<>]/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;" }[c]!))}</pre>`,
      }),
    });
  } catch (e) {
    console.error("[email:admin-notify] failed", e);
  }
}
