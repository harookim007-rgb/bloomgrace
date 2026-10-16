-- Hair Care subcategories; the hair consultation's first step ("What are you looking for?")
-- recommends from the chosen one. Slugs must match HAIR_PRODUCT_SLUGS in src/lib/hairConsultData.ts.
INSERT INTO public.categories (name, slug, parent_id, sort_order, translations)
SELECT v.name, v.slug, p.id, v.sort_order, v.translations::jsonb
FROM (VALUES
  ('샴푸', 'shampoo', 31, '{"en":"Shampoo","es":"Champú","de":"Shampoo","fr":"Shampooing","pt":"Shampoo","ja":"シャンプー"}'),
  ('트리트먼트', 'treatment', 32, '{"en":"Treatment","es":"Tratamiento","de":"Kur","fr":"Soin","pt":"Tratamento","ja":"トリートメント"}'),
  ('두피 케어', 'scalp-care', 33, '{"en":"Scalp Care","es":"Cuidado del cuero cabelludo","de":"Kopfhautpflege","fr":"Soin du cuir chevelu","pt":"Cuidado do couro cabeludo","ja":"頭皮ケア"}'),
  ('스타일링', 'styling', 34, '{"en":"Styling","es":"Peinado","de":"Styling","fr":"Coiffant","pt":"Finalização","ja":"スタイリング"}'),
  ('헤어 오일', 'hair-oil', 35, '{"en":"Hair Oil","es":"Aceite capilar","de":"Haaröl","fr":"Huile capillaire","pt":"Óleo capilar","ja":"ヘアオイル"}')
) AS v(name, slug, sort_order, translations)
JOIN public.categories p ON p.slug = 'haircare' AND p.parent_id IS NULL
WHERE NOT EXISTS (SELECT 1 FROM public.categories c WHERE c.slug = v.slug);
