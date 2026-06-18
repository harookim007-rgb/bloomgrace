DROP POLICY IF EXISTS "payment_settings public read" ON public.payment_settings;
REVOKE SELECT ON public.payment_settings FROM anon;
CREATE POLICY "payment_settings authenticated read" ON public.payment_settings FOR SELECT TO authenticated USING (true);