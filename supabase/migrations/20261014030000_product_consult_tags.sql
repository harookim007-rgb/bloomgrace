-- Beauty consultation answers each product is recommended for (concern IDs and, for
-- skincare, one product type such as "Toner"). Chosen in the admin product form.
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS consult_tags text[] NOT NULL DEFAULT '{}';
