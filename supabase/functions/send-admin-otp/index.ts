import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ADMIN_OTP_FROM = Deno.env.get("ADMIN_OTP_FROM") || "Bloom & Grace Admin <admin@bloomgrace.shop>";

const RESEND_COOLDOWN_MS = 45_000;
const OTP_TTL_MS = 5 * 60 * 1000;

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

    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.slice(7);
    const { data: claimsRes, error: claimsErr } = await userClient.auth.getClaims(token);
    if (claimsErr || !claimsRes?.claims) return json({ error: "Unauthorized" }, 401);
    const userId = claimsRes.claims.sub as string;
    const email = (claimsRes.claims.email as string | undefined)?.toLowerCase();
    if (!email) return json({ error: "이메일이 확인되지 않았습니다." }, 400);

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Whitelist check
    const { data: white } = await admin
      .from("admin_whitelist")
      .select("id")
      .eq("email", email)
      .maybeSingle();
    if (!white) return json({ error: "관리자 접근 권한이 없는 계정입니다." }, 403);

    // Cooldown check — most recent OTP for this user
    const { data: recent } = await admin
      .from("admin_otp")
      .select("created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (recent) {
      const elapsed = Date.now() - new Date(recent.created_at).getTime();
      if (elapsed < RESEND_COOLDOWN_MS) {
        const wait = Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000);
        return json({ error: `너무 잦은 요청입니다. ${wait}초 후 재시도하세요.`, cooldown: wait }, 429);
      }
    }

    // Generate 6-digit code
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const code_hash = await sha256(`${userId}:${code}`);
    const expires_at = new Date(Date.now() + OTP_TTL_MS).toISOString();

    // Prepare one active code, but mark it consumed again if email delivery fails.
    await admin.from("admin_otp").update({ consumed: true })
      .eq("user_id", userId).eq("consumed", false);

    const { data: insertedOtp, error: insErr } = await admin.from("admin_otp")
      .insert({ user_id: userId, email, code_hash, expires_at })
      .select("id")
      .single();
    if (insErr) return json({ error: "OTP 저장 실패", details: insErr.message }, 500);

    // Send via Resend
    if (!RESEND_API_KEY) {
      console.warn("[send-admin-otp] RESEND_API_KEY missing — returning dev code");
      return json({ success: true, dev_mode: true, dev_code: code, masked_email: email });
    }

    const subject = "관리자 인증코드 (5분 유효)";
    const html = `
      <div style="font-family: -apple-system, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color:#111; margin:0 0 12px; font-size:18px;">관리자 로그인 인증</h2>
        <p style="color:#555; font-size:14px; margin:0 0 16px;">아래 6자리 인증번호를 관리자 로그인 화면에 입력해 주세요. 코드는 5분 후 만료됩니다.</p>
        <div style="background:#f4f4f5; border:1px solid #e4e4e7; border-radius:8px; padding:20px; text-align:center; letter-spacing:0.35em; font-size:28px; font-weight:700; color:#111; font-family: 'SF Mono', monospace;">
          ${code}
        </div>
        <p style="color:#888; font-size:12px; margin-top:16px;">본인이 요청하지 않았다면 이 이메일을 무시하세요.</p>
      </div>`;

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: ADMIN_OTP_FROM,
        to: [email],
        subject,
        html,
      }),
    });

    if (!resendRes.ok) {
      const details = await resendRes.text();
      console.error(`[send-admin-otp] Resend failed ${resendRes.status}:`, details);
      if (insertedOtp?.id) await admin.from("admin_otp").update({ consumed: true }).eq("id", insertedOtp.id);
      return json({ error: "이메일 발송 실패", status: resendRes.status, details }, resendRes.status);
    }

    const masked = email.replace(/(.{2}).+(@.+)/, "$1***$2");
    return json({ success: true, masked_email: masked });
  } catch (e: any) {
    console.error("[send-admin-otp] uncaught", e);
    return json({ error: e?.message || "Unknown error" }, 500);
  }
});
