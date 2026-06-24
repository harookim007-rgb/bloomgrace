ALTER TABLE public.products ADD COLUMN IF NOT EXISTS manual_rank INTEGER;
CREATE INDEX IF NOT EXISTS idx_products_manual_rank ON public.products(manual_rank) WHERE manual_rank IS NOT NULL;