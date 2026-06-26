import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const p_skin_type = typeof body.p_skin_type === "string" ? body.p_skin_type : null;
    const p_days = Number.isFinite(body.p_days) ? Math.min(Math.max(parseInt(body.p_days), 1), 365) : 7;
    const p_limit = Number.isFinite(body.p_limit) ? Math.min(Math.max(parseInt(body.p_limit), 1), 100) : 30;

    const { data, error } = await supabase.rpc("get_top_selling_products", {
      p_skin_type, p_days, p_limit,
    });
    if (error) throw error;
    return new Response(JSON.stringify({ data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
