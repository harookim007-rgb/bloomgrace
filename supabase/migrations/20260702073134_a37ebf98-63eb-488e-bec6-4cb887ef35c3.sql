
-- 1) otp_codes: explicit admin-only SELECT (fail-closed for everyone else)
DROP POLICY IF EXISTS "otp_codes_admin_select" ON public.otp_codes;
CREATE POLICY "otp_codes_admin_select" ON public.otp_codes
  FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role));

-- 2) payment_settings: restrict SELECT to admins only
DROP POLICY IF EXISTS "payment_settings authenticated read" ON public.payment_settings;
DROP POLICY IF EXISTS "payment_settings_authenticated_read" ON public.payment_settings;
DROP POLICY IF EXISTS "payment_settings_admin_read" ON public.payment_settings;
CREATE POLICY "payment_settings_admin_read" ON public.payment_settings
  FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role));

-- Safe function to expose only checkout-relevant fields to any authenticated user
CREATE OR REPLACE FUNCTION public.get_checkout_payment_info()
RETURNS TABLE (
  bank_name text,
  account_number text,
  account_holder text,
  business_name text,
  payment_deadline_hours integer,
  instructions text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT bank_name, account_number, account_holder, business_name,
         payment_deadline_hours, instructions
  FROM public.payment_settings
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_checkout_payment_info() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_checkout_payment_info() TO authenticated;

-- 3) storage: allow public SELECT for the reviews folder in the media bucket
DROP POLICY IF EXISTS "media reviews public read" ON storage.objects;
CREATE POLICY "media reviews public read" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'media' AND (storage.foldername(name))[1] = 'reviews');
