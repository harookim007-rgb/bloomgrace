import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const MAX_ATTEMPTS = 5;

async function sha256(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);
    const token = authHeader.slice(7);

    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: claimsRes, error: claimsErr } = await userClient.auth.getClaims(token);
    if (claimsErr || !claimsRes?.claims) return json({ error: "Unauthorized" }, 401);
    const userId = claimsRes.claims.sub as string;

    const body = await req.json().catch(() => ({}));
    const code = String(body?.code ?? "").trim();
    if (!/^\d{6}$/.test(code)) return json({ error: "6자리 숫자 코드를 입력하세요." }, 400);

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: otp } = await admin
      .from("admin_otp")
      .select("id, code_hash, expires_at, attempts, consumed")
      .eq("user_id", userId)
      .eq("consumed", false)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!otp) return json({ error: "요청된 인증코드가 없습니다. 코드를 다시 발송해 주세요." }, 400);
    if (new Date(otp.expires_at) < new Date()) {
      await admin.from("admin_otp").update({ consumed: true }).eq("id", otp.id);
      return json({ error: "인증코드가 만료되었습니다. 다시 발송해 주세요." }, 400);
    }
    if (otp.attempts >= MAX_ATTEMPTS) {
      await admin.from("admin_otp").update({ consumed: true }).eq("id", otp.id);
      return json({ error: "시도 횟수를 초과했습니다. 5분 후 새 코드를 요청하세요.", locked: true }, 429);
    }

    const expected = await sha256(`${userId}:${code}`);
    if (expected !== otp.code_hash) {
      const nextAttempts = otp.attempts + 1;
      await admin.from("admin_otp").update({ attempts: nextAttempts }).eq("id", otp.id);
      const remaining = MAX_ATTEMPTS - nextAttempts;
      return json({ error: `인증번호가 일치하지 않습니다. (남은 시도 ${Math.max(0, remaining)}회)` }, 400);
    }

    await admin.from("admin_otp").update({ consumed: true }).eq("id", otp.id);
    return json({ success: true });
  } catch (e: any) {
    console.error("[verify-admin-otp] uncaught", e);
    return json({ error: e?.message || "Unknown error" }, 500);
  }
});
