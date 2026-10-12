ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS cafe24_buy_url text,
  ADD COLUMN IF NOT EXISTS cafe24_product_no text;

CREATE TABLE IF NOT EXISTS public.cafe24_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  is_enabled boolean NOT NULL DEFAULT false,
  mall_url text NOT NULL DEFAULT '',
  join_url text NOT NULL DEFAULT '',
  login_url text NOT NULL DEFAULT '',
  cart_url text NOT NULL DEFAULT '',
  show_join_prompt boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.cafe24_settings TO anon;
GRANT SELECT ON public.cafe24_settings TO authenticated;
GRANT ALL ON public.cafe24_settings TO service_role;

ALTER TABLE public.cafe24_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cafe24_settings public read" ON public.cafe24_settings
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "cafe24_settings admin write" ON public.cafe24_settings
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

DROP TRIGGER IF EXISTS trg_cafe24_settings_updated ON public.cafe24_settings;
CREATE TRIGGER trg_cafe24_settings_updated
  BEFORE UPDATE ON public.cafe24_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.cafe24_settings (is_enabled)
  SELECT false WHERE NOT EXISTS (SELECT 1 FROM public.cafe24_settings);