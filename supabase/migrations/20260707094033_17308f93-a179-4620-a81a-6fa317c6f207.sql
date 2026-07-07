
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS image_links jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE TABLE IF NOT EXISTS public.menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  link text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.menu_items TO anon, authenticated;
GRANT ALL ON public.menu_items TO service_role;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "menu_items_public_read" ON public.menu_items;
CREATE POLICY "menu_items_public_read" ON public.menu_items FOR SELECT USING (true);
DROP POLICY IF EXISTS "menu_items_admin_write" ON public.menu_items;
CREATE POLICY "menu_items_admin_write" ON public.menu_items FOR ALL
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
DROP TRIGGER IF EXISTS trg_menu_items_updated ON public.menu_items;
CREATE TRIGGER trg_menu_items_updated BEFORE UPDATE ON public.menu_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.menu_items (label, link, sort_order, is_visible)
SELECT * FROM (VALUES
  ('nav_home', '/', 10, true),
  ('nav_products', '/products', 20, true),
  ('nav_ranking', '/ranking', 30, true),
  ('nav_routine', '__routine__', 40, true),
  ('nav_contact', '/contact', 50, true)
) AS v(label, link, sort_order, is_visible)
WHERE NOT EXISTS (SELECT 1 FROM public.menu_items);

CREATE TABLE IF NOT EXISTS public.admin_whitelist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_whitelist TO authenticated;
GRANT ALL ON public.admin_whitelist TO service_role;
ALTER TABLE public.admin_whitelist ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin_whitelist_admin_all" ON public.admin_whitelist;
CREATE POLICY "admin_whitelist_admin_all" ON public.admin_whitelist FOR ALL
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

INSERT INTO public.admin_whitelist (email, note)
SELECT lower(u.email), 'auto-seeded from existing admin role'
FROM auth.users u
JOIN public.user_roles r ON r.user_id = u.id
WHERE r.role = 'admin'::public.app_role
  AND u.email IS NOT NULL
ON CONFLICT (email) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.admin_otp (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  email text NOT NULL,
  code_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  attempts integer NOT NULL DEFAULT 0,
  consumed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.admin_otp TO service_role;
ALTER TABLE public.admin_otp ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS admin_otp_user_active_idx
  ON public.admin_otp (user_id, created_at DESC)
  WHERE consumed = false;

CREATE OR REPLACE FUNCTION public.is_admin_email(_email text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.admin_whitelist WHERE lower(email) = lower(_email))
$$;
