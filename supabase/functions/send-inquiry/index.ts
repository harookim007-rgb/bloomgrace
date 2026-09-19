import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { sendEmail } from "../_shared/email-templates/send.ts";
import { renderInquiryAdminEmail } from "../_shared/email-templates/notifications.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const ADMIN_INBOX = Deno.env.get("ADMIN_NOTIFY_EMAIL") || "welcometo@bloomgrace.shop";

const CATEGORIES = ["product", "order", "shipping", "return", "payment", "other"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const json = (b: unknown, s = 200) =>
    new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    // Members only — verify the caller's session
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "").trim();
    if (!token) return json({ error: "auth_required" }, 401);

    const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: userData } = await authClient.auth.getUser();
    const user = userData?.user;
    if (!user) return json({ error: "auth_required" }, 401);

    const { name, phone, message, language, category, orderId, attachments } = await req.json();

    const safeAttachments: string[] = Array.isArray(attachments)
      ? attachments.filter((a: unknown) => typeof a === "string" && a.length > 0 && a.length < 2000).slice(0, 5)
      : [];

    const safeName = typeof name === "string" && name.trim() ? name.trim().slice(0, 120) : (user.email || "Customer");
    const email = (user.email || "").trim().toLowerCase();
    if (!email) return json({ error: "invalid_email" }, 400);
    if (!phone || typeof phone !== "string" || phone.replace(/\D/g, "").length < 7 || phone.length > 30) {
      return json({ error: "invalid_phone" }, 400);
    }
    if (!category || typeof category !== "string" || !CATEGORIES.includes(category)) {
      return json({ error: "invalid_category" }, 400);
    }
    const hasText = typeof message === "string" && message.trim().length >= 2;
    if (!hasText && safeAttachments.length === 0) return json({ error: "invalid_message" }, 400);
    if (typeof message === "string" && message.length > 5000) return json({ error: "invalid_message" }, 400);
    const safeMessage = hasText ? (message as string).trim() : "(image)";

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Validate the order belongs to this user, and build a short summary
    let validOrderId: string | null = null;
    let orderSummary: string | null = null;
    if (orderId && typeof orderId === "string") {
      const { data: order } = await admin
        .from("orders")
        .select("id, user_id, order_items(product_name, quantity)")
        .eq("id", orderId)
        .maybeSingle();
      if (order && order.user_id === user.id) {
        validOrderId = order.id;
        const items = (order as any).order_items || [];
        orderSummary = items.map((i: any) => `${i.product_name} x${i.quantity}`).join(", ").slice(0, 300) || null;
      }
    }

    const { error } = await admin.from("inquiries").insert({
      user_id: user.id,
      name: safeName,
      email,
      phone: phone.trim(),
      category,
      order_id: validOrderId,
      message: message.trim(),
      language: typeof language === "string" ? language : "en",
      status: "pending",
    });
    if (error) {
      console.error("[send-inquiry] db insert failed:", error.message);
      return json({ error: "save_failed" }, 500);
    }

    // Notify the shop owner
    const rendered = renderInquiryAdminEmail({
      name: safeName,
      email,
      phone: phone.trim(),
      category,
      orderId: validOrderId,
      orderSummary,
      message: message.trim(),
      language: typeof language === "string" ? language : "en",
    });
    await sendEmail({ to: ADMIN_INBOX, subject: rendered.subject, html: rendered.html, tag: "inquiry-admin", replyTo: email });

    return json({ success: true });
  } catch (e: any) {
    console.error("[send-inquiry] uncaught", e);
    return json({ error: e?.message || "unknown" }, 500);
  }
});
