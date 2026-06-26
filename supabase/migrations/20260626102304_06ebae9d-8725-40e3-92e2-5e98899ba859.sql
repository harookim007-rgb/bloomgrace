
-- 1. OTP: drop user-facing UPDATE/DELETE policies (server uses service role)
DROP POLICY IF EXISTS "Users update own otp" ON public.otp_codes;
DROP POLICY IF EXISTS "Users delete own otp" ON public.otp_codes;

-- 2. Storage: scope public read to product/banner assets only
DROP POLICY IF EXISTS "Media public read" ON storage.objects;
CREATE POLICY "Media public read products and banners"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'media'
  AND (storage.foldername(name))[1] IN ('products', 'banners')
);

-- 3. Lock down SECURITY DEFINER ranking function from anon/authenticated
REVOKE EXECUTE ON FUNCTION public.get_top_selling_products(text, integer, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_top_selling_products(text, integer, integer) TO service_role;
