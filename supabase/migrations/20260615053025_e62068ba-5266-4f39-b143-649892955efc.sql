
-- shipping_rates
CREATE TABLE IF NOT EXISTS public.shipping_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code text NOT NULL UNIQUE,
  country_name text NOT NULL,
  fee numeric NOT NULL DEFAULT 0,
  min_days integer NOT NULL DEFAULT 3,
  max_days integer NOT NULL DEFAULT 7,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.shipping_rates TO anon, authenticated;
GRANT ALL ON public.shipping_rates TO service_role;
ALTER TABLE public.shipping_rates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "shipping_rates public read" ON public.shipping_rates FOR SELECT USING (true);
CREATE POLICY "shipping_rates admin write" ON public.shipping_rates FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_shipping_rates_updated BEFORE UPDATE ON public.shipping_rates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- payment_settings (singleton)
CREATE TABLE IF NOT EXISTS public.payment_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_name text,
  account_number text,
  account_holder text,
  business_name text,
  business_number text,
  payment_deadline_hours integer NOT NULL DEFAULT 48,
  instructions text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.payment_settings TO anon, authenticated;
GRANT ALL ON public.payment_settings TO service_role;
ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payment_settings public read" ON public.payment_settings FOR SELECT USING (true);
CREATE POLICY "payment_settings admin write" ON public.payment_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_payment_settings_updated BEFORE UPDATE ON public.payment_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
INSERT INTO public.payment_settings (bank_name, account_number, account_holder, business_name)
  VALUES ('HANA BANK','3949-1050-354-207','BLOOM & GRACE','BLOOM & GRACE Co., Ltd.')
  ON CONFLICT DO NOTHING;

-- point_transactions
CREATE TABLE IF NOT EXISTS public.point_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount integer NOT NULL,
  reason text NOT NULL,
  order_id uuid,
  review_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.point_transactions TO authenticated;
GRANT ALL ON public.point_transactions TO service_role;
ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "point_tx own read" ON public.point_transactions FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "point_tx admin write" ON public.point_transactions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- orders additions
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS subtotal numeric,
  ADD COLUMN IF NOT EXISTS shipping_fee numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS shipping_country text,
  ADD COLUMN IF NOT EXISTS depositor_name text,
  ADD COLUMN IF NOT EXISTS payment_deadline timestamptz,
  ADD COLUMN IF NOT EXISTS cancel_reason text,
  ADD COLUMN IF NOT EXISTS points_used integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS points_earned integer NOT NULL DEFAULT 0;

-- reviews additions
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS image_urls text[] NOT NULL DEFAULT '{}';

-- profiles additions
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS points integer NOT NULL DEFAULT 0;

-- Award points on review insert
CREATE OR REPLACE FUNCTION public.award_review_points()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  UPDATE public.profiles SET points = points + 1000 WHERE user_id = NEW.user_id;
  INSERT INTO public.point_transactions (user_id, amount, reason, review_id)
    VALUES (NEW.user_id, 1000, 'review_reward', NEW.id);
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_award_review_points ON public.reviews;
CREATE TRIGGER trg_award_review_points AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.award_review_points();

-- Auto-cancel function for unpaid bank transfers
CREATE OR REPLACE FUNCTION public.auto_cancel_expired_orders()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  UPDATE public.orders
    SET status='cancelled', cancel_reason='payment_timeout', updated_at=now()
    WHERE status='pending'
      AND payment_method='bank_transfer'
      AND payment_deadline IS NOT NULL
      AND payment_deadline < now();
END $$;

-- Schedule (pg_cron)
CREATE EXTENSION IF NOT EXISTS pg_cron;
DO $$ BEGIN
  PERFORM cron.unschedule('auto-cancel-bank-orders');
EXCEPTION WHEN OTHERS THEN NULL; END $$;
SELECT cron.schedule('auto-cancel-bank-orders', '*/15 * * * *', $$SELECT public.auto_cancel_expired_orders();$$);

-- Seed a few default shipping rates
INSERT INTO public.shipping_rates (country_code, country_name, fee, min_days, max_days, sort_order) VALUES
  ('KR','South Korea',3000,1,3,1),
  ('US','United States',25000,7,14,2),
  ('JP','Japan',12000,3,6,3),
  ('CN','China',15000,4,8,4),
  ('DE','Germany',28000,8,15,5),
  ('ES','Spain',28000,8,15,6)
ON CONFLICT (country_code) DO NOTHING;
