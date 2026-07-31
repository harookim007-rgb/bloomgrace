import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { sendEmail } from "../_shared/email-templates/send.ts";
import { renderPaymentReminderEmail } from "../_shared/email-templates/notifications.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Re-send a reminder at most once every N hours per order.
const MIN_HOURS_BETWEEN_REMINDERS = 12;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const json = (b: unknown, s = 200) =>
    new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const now = Date.now();

    const { data: orders } = await admin
      .from("orders")
      .select("id, user_id, total, customer_email, shipping_address, payment_deadline, payment_reminder_sent_at")
      .eq("status", "pending")
      .not("payment_deadline", "is", null)
      .limit(200);

    const { data: bank } = await admin
      .from("payment_settings")
      .select("bank_name, account_number, account_holder, business_name")
      .limit(1)
      .maybeSingle();

    let sent = 0;
    for (const o of orders || []) {
      const deadline = new Date(o.payment_deadline as string).getTime();
      if (deadline <= now) continue; // expired, nothing to remind about
      if (o.payment_reminder_sent_at) {
        const last = new Date(o.payment_reminder_sent_at as string).getTime();
        if (now - last < MIN_HOURS_BETWEEN_REMINDERS * 3600_000) continue;
      }

      let email = o.customer_email as string | null;
      if (!email) {
        const { data: u } = await admin.auth.admin.getUserById(o.user_id);
        email = u?.user?.email ?? null;
      }
      if (!email) continue;

      const customerName =
        (o.shipping_address as any)?.full_name || (o.shipping_address as any)?.name || email.split("@")[0];

      const { subject, html } = renderPaymentReminderEmail({
        customerName,
        orderId: o.id,
        total: Number(o.total),
        deadline: o.payment_deadline as string,
        bank: bank || undefined,
      });

      const res = await sendEmail({ to: email, subject, html, tag: "payment-reminder" });
      if (res.ok) {
        sent++;
        await admin.from("orders").update({ payment_reminder_sent_at: new Date().toISOString() }).eq("id", o.id);
      }
    }

    return json({ success: true, sent });
  } catch (e: any) {
    console.error("[payment-reminder] uncaught", e);
    return json({ error: e?.message || "unknown" }, 500);
  }
});
