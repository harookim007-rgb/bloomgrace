import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { adminClient, requireAdmin } from "../_shared/admin-auth.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const json = (b: unknown, s = 200) =>
    new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const caller = await requireAdmin(req);
    if (!caller) return json({ error: "forbidden" }, 403);

    const { userId } = await req.json();
    if (!userId || typeof userId !== "string") return json({ error: "invalid_user_id" }, 400);
    if (userId === caller.userId) return json({ error: "cannot_delete_self" }, 400);

    const admin = adminClient();

    // Detach the customer from historical records, then remove personal data.
    await admin.from("cart_items").delete().eq("user_id", userId);
    await admin.from("wishlists").delete().eq("user_id", userId);
    await admin.from("addresses").delete().eq("user_id", userId);
    await admin.from("reviews").delete().eq("user_id", userId);
    await admin.from("point_transactions").delete().eq("user_id", userId);
    await admin.from("profiles").delete().eq("user_id", userId);
    await admin.from("user_roles").delete().eq("user_id", userId);

    const { error } = await admin.auth.admin.deleteUser(userId);
    if (error) return json({ error: error.message }, 500);

    return json({ success: true });
  } catch (e: any) {
    console.error("[delete-customer] uncaught", e);
    return json({ error: e?.message || "unknown" }, 500);
  }
});
