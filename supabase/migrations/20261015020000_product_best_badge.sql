-- BEST badge chosen per product in the admin product editor, shown on product cards.
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_best boolean NOT NULL DEFAULT false;
