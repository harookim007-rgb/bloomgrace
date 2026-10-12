-- Admin access belongs to a single owner account. The role is granted automatically
-- once that email is verified, and no other account can hold an admin role.
CREATE OR REPLACE FUNCTION private.owner_email()
RETURNS text LANGUAGE sql IMMUTABLE
AS $$ SELECT 'harookim007@gmail.com'::text $$;

CREATE OR REPLACE FUNCTION private.grant_owner_admin()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF lower(NEW.email) = private.owner_email() AND NEW.email_confirmed_at IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin'::public.app_role), (NEW.id, 'master_admin'::public.app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION private.grant_owner_admin() FROM PUBLIC;

DROP TRIGGER IF EXISTS on_auth_user_owner_admin ON auth.users;
CREATE TRIGGER on_auth_user_owner_admin
  AFTER INSERT OR UPDATE OF email, email_confirmed_at ON auth.users
  FOR EACH ROW EXECUTE FUNCTION private.grant_owner_admin();

CREATE OR REPLACE FUNCTION private.enforce_owner_only_admin()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NEW.role IN ('admin'::public.app_role, 'master_admin'::public.app_role)
     AND NOT EXISTS (
       SELECT 1 FROM auth.users u
       WHERE u.id = NEW.user_id
         AND lower(u.email) = private.owner_email()
         AND u.email_confirmed_at IS NOT NULL
     ) THEN
    RAISE EXCEPTION 'admin roles are reserved for the owner account';
  END IF;
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION private.enforce_owner_only_admin() FROM PUBLIC;

DROP TRIGGER IF EXISTS trg_enforce_owner_only_admin ON public.user_roles;
CREATE TRIGGER trg_enforce_owner_only_admin
  BEFORE INSERT OR UPDATE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION private.enforce_owner_only_admin();

-- Admin 2-step verification (send-admin-otp) only emails whitelisted addresses.
INSERT INTO public.admin_whitelist (email, note)
VALUES (private.owner_email(), 'owner')
ON CONFLICT (email) DO NOTHING;
