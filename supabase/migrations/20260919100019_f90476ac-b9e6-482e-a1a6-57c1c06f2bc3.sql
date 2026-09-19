
ALTER TABLE public.inquiries
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS inquiries_user_id_idx ON public.inquiries(user_id);

DROP POLICY IF EXISTS "Anyone can submit inquiry" ON public.inquiries;

CREATE POLICY "Users can view own inquiries"
ON public.inquiries FOR SELECT TO authenticated
USING (user_id = auth.uid());

GRANT SELECT ON public.inquiries TO authenticated;
GRANT ALL ON public.inquiries TO service_role;
