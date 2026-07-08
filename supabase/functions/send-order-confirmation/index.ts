import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { renderOrderConfirmationEmail } from "../_shared/email-templates/order-confirmation.ts";
import { sendEmail } from "../_shared/email-templates/send.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const json = (b: unknown, s = 200) =>
    new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: claims, error: cErr } = await userClient.auth.getClaims(authHeader.slice(7));
    if (cErr || !claims?.claims) return json({ error: "Unauthorized" }, 401);
    const userId = claims.claims.sub as string;
    const email = (claims.claims.email as string | undefined)?.toLowerCase();
    if (!email) return json({ error: "no_email" }, 400);

    const { orderId } = await req.json();
    if (!orderId || typeof orderId !== "string") return json({ error: "invalid_order_id" }, 400);

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: order, error: oErr } = await admin
      .from("orders")
      .select("id, user_id, total, subtotal, shipping_fee, points_used, payment_deadline, shipping_address")
      .eq("id", orderId)
      .maybeSingle();
    if (oErr || !order) return json({ error: "order_not_found" }, 404);
    if (order.user_id !== userId) return json({ error: "forbidden" }, 403);

    const { data: items } = await admin
      .from("order_items")
      .select("product_name, quantity, price")
      .eq("order_id", orderId);

    const { data: bank } = await admin
      .from("payment_settings")
      .select("bank_name, account_number, account_holder, business_name")
      .limit(1)
      .maybeSingle();

    const { data: profile } = await admin
      .from("profiles")
      .select("display_name")
      .eq("user_id", userId)
      .maybeSingle();

    const customerName =
      (order.shipping_address as any)?.full_name ||
      profile?.display_name ||
      email.split("@")[0];

    const { subject, html } = renderOrderConfirmationEmail({
      customerName,
      orderId: order.id,
      items: (items || []).map(i => ({ product_name: i.product_name, quantity: i.quantity, price: Number(i.price) })),
      subtotal: Number(order.subtotal),
      shippingFee: Number(order.shipping_fee),
      pointsUsed: Number(order.points_used || 0),
      total: Number(order.total),
      bank: bank ? {
        bank_name: bank.bank_name,
        account_number: bank.account_number,
        account_holder: bank.account_holder,
        business_name: bank.business_name || undefined,
      } : undefined,
      paymentDeadline: order.payment_deadline || undefined,
    });

    const result = await sendEmail({ to: email, subject, html, tag: "order-confirmation" });
    if (!result.ok) return json({ error: result.error }, result.status || 500);

    return json({ success: true });
  } catch (e: any) {
    console.error("[send-order-confirmation] uncaught", e);
    return json({ error: e?.message || "unknown" }, 500);
  }
});
