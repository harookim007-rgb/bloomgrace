-- Correct owner address: youthroom.shop@gmail.com (youthroom@gmail.com was a mistake).
CREATE OR REPLACE FUNCTION private.owner_email()
RETURNS text LANGUAGE sql IMMUTABLE
AS $$ SELECT 'youthroom.shop@gmail.com'::text $$;

DELETE FROM public.user_roles r
USING auth.users u
WHERE r.user_id = u.id
  AND r.role IN ('admin'::public.app_role, 'master_admin'::public.app_role)
  AND lower(u.email) <> private.owner_email();

-- The owner has already signed in once, so grant the roles now instead of waiting for the next sign-in.
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, granted.role
FROM auth.users u
CROSS JOIN (VALUES ('admin'::public.app_role), ('master_admin'::public.app_role)) AS granted(role)
WHERE lower(u.email) = private.owner_email() AND u.email_confirmed_at IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

DELETE FROM public.admin_whitelist WHERE email <> private.owner_email();
INSERT INTO public.admin_whitelist (email, note)
VALUES (private.owner_email(), 'owner')
ON CONFLICT (email) DO NOTHING;
