// One-shot admin: create or update user and grant admin + master_admin roles
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { email, password } = await req.json();

  // Find existing
  const { data: list, error: listErr } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (listErr) return new Response(JSON.stringify({ error: listErr.message }), { status: 500, headers: cors });

  let user = list.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());

  if (user) {
    const { error: updErr } = await admin.auth.admin.updateUserById(user.id, {
      password,
      email_confirm: true,
    });
    if (updErr) return new Response(JSON.stringify({ error: updErr.message }), { status: 500, headers: cors });
  } else {
    const { data: created, error: cErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { display_name: "Admin" },
    });
    if (cErr) return new Response(JSON.stringify({ error: cErr.message }), { status: 500, headers: cors });
    user = created.user!;
  }

  // Grant roles
  const { error: rErr } = await admin.from("user_roles").upsert(
    [
      { user_id: user.id, role: "admin" },
      { user_id: user.id, role: "master_admin" },
    ],
    { onConflict: "user_id,role" }
  );
  if (rErr) return new Response(JSON.stringify({ error: rErr.message }), { status: 500, headers: cors });

  return new Response(JSON.stringify({ ok: true, user_id: user.id, email: user.email }), {
    headers: { ...cors, "Content-Type": "application/json" },
  });
});
