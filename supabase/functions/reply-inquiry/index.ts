import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { adminClient, requireAdmin } from "../_shared/admin-auth.ts";
import { sendEmail } from "../_shared/email-templates/send.ts";
import { renderInquiryReplyEmail } from "../_shared/email-templates/notifications.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const json = (b: unknown, s = 200) =>
    new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const caller = await requireAdmin(req);
    if (!caller) return json({ error: "forbidden" }, 403);

    const { inquiryId, reply } = await req.json();
    if (!inquiryId || typeof inquiryId !== "string") return json({ error: "invalid_inquiry_id" }, 400);
    if (!reply || typeof reply !== "string" || reply.trim().length < 2 || reply.length > 5000) {
      return json({ error: "invalid_reply" }, 400);
    }

    const admin = adminClient();
    const { data: inquiry } = await admin
      .from("inquiries")
      .select("id, name, email, message")
      .eq("id", inquiryId)
      .maybeSingle();
    if (!inquiry) return json({ error: "inquiry_not_found" }, 404);

    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inquiry.email || "");

    let sendError: string | undefined;
    if (emailValid) {
      const { subject, html } = renderInquiryReplyEmail({
        customerName: inquiry.name || "there",
        question: inquiry.message || "",
        reply: reply.trim(),
      });
      const result = await sendEmail({ to: inquiry.email, subject, html, tag: "inquiry-reply" });
      if (!result.ok) sendError = result.error;
    } else {
      sendError = "invalid_customer_email";
    }

    await admin
      .from("inquiries")
      .update({
        admin_reply: reply.trim(),
        status: "answered",
        replied_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", inquiryId);

    return json({ success: true, emailed: !sendError, error: sendError });
  } catch (e: any) {
    console.error("[reply-inquiry] uncaught", e);
    return json({ error: e?.message || "unknown" }, 500);
  }
});
