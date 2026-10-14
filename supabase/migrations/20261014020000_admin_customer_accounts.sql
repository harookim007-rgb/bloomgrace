-- Sign-in emails live in auth.users, which the browser cannot read. This lets the admin
-- customer screen list each member's email; anyone who is not an admin gets an error.
CREATE OR REPLACE FUNCTION public.admin_customer_accounts()
RETURNS TABLE (user_id uuid, email text, last_sign_in_at timestamptz)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT private.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'admin only' USING ERRCODE = '42501';
  END IF;
  RETURN QUERY SELECT u.id, u.email::text, u.last_sign_in_at FROM auth.users u;
END $$;
REVOKE ALL ON FUNCTION public.admin_customer_accounts() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_customer_accounts() TO authenticated;
