-- Makeup subcategories become Base / Eye / Lip / Cheek & Face, in that order
-- (the makeup recommendation lists products in this order).
UPDATE public.categories SET name = '베이스 메이크업', sort_order = 21 WHERE slug = 'base-makeup';
UPDATE public.categories SET name = '아이 메이크업', sort_order = 22 WHERE slug = 'eye-makeup';
UPDATE public.categories SET name = '립 메이크업', sort_order = 23 WHERE slug = 'lip-makeup';
INSERT INTO public.categories (name, slug, parent_id, sort_order, translations)
SELECT '페이스 메이크업', 'cheek-face', p.id, 24,
  '{"en":"Cheek & Face","es":"Mejillas y rostro","de":"Wangen & Gesicht","fr":"Joues et visage","pt":"Bochechas e rosto","ja":"チーク・フェイス","ar":"الخدود والوجه"}'::jsonb
FROM public.categories p
WHERE p.slug = 'makeup' AND p.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM public.categories c WHERE c.slug = 'cheek-face');
