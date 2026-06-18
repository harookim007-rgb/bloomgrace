
-- 1. otp_codes: prevent NULL user_id matching anonymous callers
DROP POLICY IF EXISTS "Users access own otp" ON public.otp_codes;
CREATE POLICY "Users access own otp" ON public.otp_codes
  FOR ALL TO authenticated
  USING (auth.uid() IS NOT NULL AND user_id IS NOT NULL AND auth.uid() = user_id)
  WITH CHECK (auth.uid() IS NOT NULL AND user_id IS NOT NULL AND auth.uid() = user_id);

-- 2. coupons: restrict reads to admins only (app uses coupons only in admin views)
DROP POLICY IF EXISTS "Active coupons viewable by authenticated" ON public.coupons;

-- 3. inquiries: tighten INSERT with-check (remove always-true)
DROP POLICY IF EXISTS "Anyone can submit inquiry" ON public.inquiries;
CREATE POLICY "Anyone can submit inquiry" ON public.inquiries
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    length(btrim(name)) > 0
    AND length(btrim(email)) BETWEEN 3 AND 200
    AND email LIKE '%_@_%.__%'
    AND length(btrim(message)) BETWEEN 1 AND 5000
    AND admin_reply IS NULL
    AND status IS NOT DISTINCT FROM 'pending'
  );

-- 4. reviews: require purchase verification on insert
DROP POLICY IF EXISTS "Users create own reviews" ON public.reviews;
CREATE POLICY "Users create own reviews" ON public.reviews
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.order_items oi
      JOIN public.orders o ON o.id = oi.order_id
      WHERE oi.product_id = reviews.product_id
        AND o.user_id = auth.uid()
        AND o.status IN ('delivered','completed','shipped')
    )
  );

-- 5. Revoke EXECUTE on SECURITY DEFINER trigger/maintenance functions from public API roles
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.award_review_points() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.auto_cancel_expired_orders() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
-- has_role is intentionally callable (used inside RLS policies)
