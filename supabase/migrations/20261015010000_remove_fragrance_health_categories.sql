-- The owner dropped the Fragrance and Health categories. Products filed there keep existing
-- but become uncategorized (products.category_id does not cascade).
UPDATE public.products SET category_id = NULL
WHERE category_id IN (SELECT id FROM public.categories WHERE slug IN ('fragrance', 'health'));
DELETE FROM public.categories WHERE slug IN ('fragrance', 'health');
