
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS translations jsonb DEFAULT '{}';
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS translations jsonb DEFAULT '{}';
