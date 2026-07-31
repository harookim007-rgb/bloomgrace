import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { adminClient, requireAdmin } from "../_shared/admin-auth.ts";
import { sendEmail } from "../_shared/email-templates/send.ts";
import {
  renderPaymentConfirmedEmail,
  renderShippingStartedEmail,
  renderDeliveredEmail,
} from "../_shared/email-templates/notifications.ts";

type Kind = "payment_confirmed" | "shipping_started" | "delivered";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const json = (b: unknown, s = 200) =>
    new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const caller = await requireAdmin(req);
    if (!caller) return json({ error: "forbidden" }, 403);

    const { orderId, type } = await req.json();
    if (!orderId || typeof orderId !== "string") return json({ error: "invalid_order_id" }, 400);
    const kinds: Kind[] = ["payment_confirmed", "shipping_started", "delivered"];
    if (!kinds.includes(type)) return json({ error: "invalid_type" }, 400);

    const admin = adminClient();
    const { data: order } = await admin
      .from("orders")
      .select("id, user_id, total, customer_email, shipping_address, tracking_carrier, tracking_number, tracking_url")
      .eq("id", orderId)
      .maybeSingle();
    if (!order) return json({ error: "order_not_found" }, 404);

    let email = order.customer_email as string | null;
    if (!email) {
      const { data: u } = await admin.auth.admin.getUserById(order.user_id);
      email = u?.user?.email ?? null;
    }
    if (!email) return json({ error: "no_recipient_email" }, 400);

    const customerName =
      (order.shipping_address as any)?.full_name ||
      (order.shipping_address as any)?.name ||
      email.split("@")[0];

    let rendered;
    if (type === "payment_confirmed") {
      rendered = renderPaymentConfirmedEmail({ customerName, orderId: order.id, total: Number(order.total) });
    } else if (type === "shipping_started") {
      rendered = renderShippingStartedEmail({
        customerName,
        orderId: order.id,
        carrier: order.tracking_carrier,
        trackingNumber: order.tracking_number,
        trackingUrl: order.tracking_url,
      });
    } else {
      rendered = renderDeliveredEmail({ customerName, orderId: order.id });
    }

    const result = await sendEmail({ to: email, subject: rendered.subject, html: rendered.html, tag: type });
    if (!result.ok) return json({ error: result.error }, result.status || 500);
    return json({ success: true, sentTo: email });
  } catch (e: any) {
    console.error("[order-status-email] uncaught", e);
    return json({ error: e?.message || "unknown" }, 500);
  }
});
