import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MASTER_ADMIN_PHONE = "+821055225217";
const TWILIO_API_KEY = Deno.env.get("TWILIO_API_KEY");
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const TWILIO_FROM = Deno.env.get("TWILIO_FROM_NUMBER"); // e.g. +1XXXXXXXXXX

const GATEWAY_URL = "https://connector-gateway.lovable.dev/twilio";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function sendSms(to: string, body: string): Promise<{ ok: boolean; error?: string }> {
  if (!TWILIO_API_KEY || !LOVABLE_API_KEY || !TWILIO_FROM) {
    return { ok: false, error: "twilio_not_configured" };
  }
  const res = await fetch(`${GATEWAY_URL}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": TWILIO_API_KEY,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ To: to, From: TWILIO_FROM, Body: body }),
  });
  if (!res.ok) {
    const txt = await res.text();
    return { ok: false, error: `twilio_${res.status}: ${txt}` };
  }
  await res.text();
  return { ok: true };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { phone, purpose } = await req.json();
    if (!purpose || !["signup", "admin_login"].includes(purpose)) {
      return new Response(JSON.stringify({ error: "invalid_purpose" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    let targetPhone = phone;

    // For admin login, must be authenticated + master_admin + force phone
    if (purpose === "admin_login") {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader?.startsWith("Bearer ")) {
        return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const userClient = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } } },
      );
      const token = authHeader.replace("Bearer ", "");
      const { data: claims, error: claimsErr } = await userClient.auth.getClaims(token);
      if (claimsErr || !claims?.claims) {
        return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const userId = claims.claims.sub as string;
      const { data: role } = await supabase
        .from("user_roles").select("role").eq("user_id", userId).eq("role", "master_admin").maybeSingle();
      if (!role) {
        return new Response(JSON.stringify({ error: "not_master_admin" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      targetPhone = MASTER_ADMIN_PHONE; // always hardcoded
    } else {
      if (!phone || !/^\+[1-9]\d{6,15}$/.test(phone)) {
        return new Response(JSON.stringify({ error: "invalid_phone" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    const code = generateOtp();
    await supabase.from("otp_codes").insert({ phone: targetPhone, code, purpose });

    const sms = await sendSms(targetPhone, `[BLOOM & GRACE] 인증번호: ${code} (5분간 유효)`);

    const devMode = !sms.ok;
    if (devMode) {
      console.log(`[DEV MODE OTP] phone=${targetPhone} purpose=${purpose} code=${code} reason=${sms.error}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        dev_mode: devMode,
        dev_code: devMode ? code : undefined,
        masked_phone: targetPhone.slice(0, 4) + "****" + targetPhone.slice(-3),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
