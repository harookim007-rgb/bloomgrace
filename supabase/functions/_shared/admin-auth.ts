import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

export function adminClient() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
}

/** Verifies the caller's JWT and that they hold the admin (or master_admin) role. */
export async function requireAdmin(req: Request): Promise<{ userId: string; email?: string } | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: claims, error } = await userClient.auth.getClaims(authHeader.slice(7));
  if (error || !claims?.claims) return null;
  const userId = claims.claims.sub as string;

  const { data: roles } = await adminClient()
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);

  const ok = (roles || []).some((r: any) => r.role === "admin" || r.role === "master_admin");
  if (!ok) return null;
  return { userId, email: claims.claims.email as string | undefined };
}
