import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { renderWelcomeEmail } from "../_shared/email-templates/welcome.ts";
import { sendEmail } from "../_shared/email-templates/send.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

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

    const email = (claims.claims.email as string | undefined)?.toLowerCase();
    if (!email) return json({ error: "no_email" }, 400);

    const body = await req.json().catch(() => ({}));
    const name =
      body?.name ||
      (claims.claims.user_metadata as any)?.display_name ||
      (claims.claims.user_metadata as any)?.name ||
      email.split("@")[0];

    const { subject, html } = renderWelcomeEmail({ name });
    const result = await sendEmail({ to: email, subject, html, tag: "welcome" });
    if (!result.ok) return json({ error: result.error }, result.status || 500);

    return json({ success: true });
  } catch (e: any) {
    console.error("[send-welcome-email] uncaught", e);
    return json({ error: e?.message || "unknown" }, 500);
  }
});
