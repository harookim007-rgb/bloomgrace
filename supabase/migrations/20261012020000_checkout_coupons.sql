-- Lets signed-in shoppers apply a coupon at checkout. Customers cannot read the coupons
-- table, so the check runs here and returns only the outcome for the code they typed.
CREATE OR REPLACE FUNCTION public.validate_coupon(_code text, _subtotal numeric)
RETURNS TABLE (valid boolean, reason text, code text, discount numeric, min_order_amount numeric)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  c public.coupons%ROWTYPE;
BEGIN
  SELECT * INTO c FROM public.coupons WHERE upper(coupons.code) = upper(trim(_code)) LIMIT 1;
  IF NOT FOUND OR NOT c.is_active THEN
    RETURN QUERY SELECT false, 'not_found'::text, NULL::text, 0::numeric, 0::numeric; RETURN;
  END IF;
  IF c.starts_at IS NOT NULL AND c.starts_at > now() THEN
    RETURN QUERY SELECT false, 'not_started'::text, c.code, 0::numeric, 0::numeric; RETURN;
  END IF;
  IF c.expires_at IS NOT NULL AND c.expires_at < now() THEN
    RETURN QUERY SELECT false, 'expired'::text, c.code, 0::numeric, 0::numeric; RETURN;
  END IF;
  IF c.max_uses IS NOT NULL AND COALESCE(c.used_count, 0) >= c.max_uses THEN
    RETURN QUERY SELECT false, 'used_up'::text, c.code, 0::numeric, 0::numeric; RETURN;
  END IF;
  IF COALESCE(c.min_order_amount, 0) > _subtotal THEN
    RETURN QUERY SELECT false, 'min_order'::text, c.code, 0::numeric, c.min_order_amount; RETURN;
  END IF;
  RETURN QUERY SELECT true, 'ok'::text, c.code,
    LEAST(_subtotal, CASE WHEN c.discount_type = 'percentage'
      THEN round(_subtotal * c.discount_value / 100, 2)
      ELSE c.discount_value END),
    COALESCE(c.min_order_amount, 0);
END $$;
REVOKE ALL ON FUNCTION public.validate_coupon(text, numeric) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.validate_coupon(text, numeric) TO authenticated, service_role;

-- Counts each use so 최대 사용 횟수 in the admin coupon screen is enforced.
CREATE OR REPLACE FUNCTION private.count_coupon_use()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE public.coupons SET used_count = COALESCE(used_count, 0) + 1
  WHERE upper(code) = upper(NEW.coupon_code);
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION private.count_coupon_use() FROM PUBLIC;

DROP TRIGGER IF EXISTS trg_count_coupon_use ON public.orders;
CREATE TRIGGER trg_count_coupon_use
  AFTER INSERT ON public.orders
  FOR EACH ROW WHEN (NEW.coupon_code IS NOT NULL AND NEW.coupon_code <> '')
  EXECUTE FUNCTION private.count_coupon_use();
