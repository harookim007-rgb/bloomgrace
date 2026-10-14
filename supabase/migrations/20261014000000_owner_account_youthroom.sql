-- The shop's admin account is youthroom@gmail.com (it replaces the earlier owner address).
-- Admin roles follow the owner address: the new owner gets them on a verified sign-in,
-- and every other account loses them.
CREATE OR REPLACE FUNCTION private.owner_email()
RETURNS text LANGUAGE sql IMMUTABLE
AS $$ SELECT 'youthroom@gmail.com'::text $$;

DELETE FROM public.user_roles r
USING auth.users u
WHERE r.user_id = u.id
  AND r.role IN ('admin'::public.app_role, 'master_admin'::public.app_role)
  AND lower(u.email) <> private.owner_email();

INSERT INTO public.user_roles (user_id, role)
SELECT u.id, granted.role
FROM auth.users u
CROSS JOIN (VALUES ('admin'::public.app_role), ('master_admin'::public.app_role)) AS granted(role)
WHERE lower(u.email) = private.owner_email() AND u.email_confirmed_at IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- Admin 2-step verification only emails whitelisted addresses.
DELETE FROM public.admin_whitelist WHERE email <> private.owner_email();
INSERT INTO public.admin_whitelist (email, note)
VALUES (private.owner_email(), 'owner')
ON CONFLICT (email) DO NOTHING;
