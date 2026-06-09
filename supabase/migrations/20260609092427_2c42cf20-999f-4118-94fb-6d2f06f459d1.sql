
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS detail_images text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS description_top text,
  ADD COLUMN IF NOT EXISTS description_bottom text,
  ADD COLUMN IF NOT EXISTS description_position text NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS image_alt text;

ALTER TABLE public.products
  DROP CONSTRAINT IF EXISTS products_description_position_check;
ALTER TABLE public.products
  ADD CONSTRAINT products_description_position_check
  CHECK (description_position IN ('top','bottom','both','none'));
