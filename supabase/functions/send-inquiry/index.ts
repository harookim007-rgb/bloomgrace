import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { sendEmail } from "../_shared/email-templates/send.ts";
import { renderInquiryAdminEmail } from "../_shared/email-templates/notifications.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ADMIN_INBOX = Deno.env.get("ADMIN_NOTIFY_EMAIL") || "offical@bloomgrace.shop";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const json = (b: unknown, s = 200) =>
    new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const { name, email, message, language } = await req.json();

    if (!name || typeof name !== "string" || name.length > 120) return json({ error: "invalid_name" }, 400);
    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ error: "invalid_email" }, 400);
    }
    if (!message || typeof message !== "string" || message.trim().length < 2 || message.length > 5000) {
      return json({ error: "invalid_message" }, 400);
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { error } = await admin.from("inquiries").insert({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim(),
      language: typeof language === "string" ? language : "en",
      status: "pending",
    });
    if (error) console.error("[send-inquiry] db insert failed:", error.message);

    // Notify the shop owner
    const rendered = renderInquiryAdminEmail({
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
      language: typeof language === "string" ? language : "en",
    });
    await sendEmail({ to: ADMIN_INBOX, subject: rendered.subject, html: rendered.html, tag: "inquiry-admin" });

    return json({ success: true });
  } catch (e: any) {
    console.error("[send-inquiry] uncaught", e);
    return json({ error: e?.message || "unknown" }, 500);
  }
});
