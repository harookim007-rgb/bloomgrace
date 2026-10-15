-- Subcategories under Skincare and Makeup. Skincare subcategories double as the routine steps
-- used by the beauty consultation (src/lib/consultation.ts), so their slugs must stay stable.
INSERT INTO public.categories (name, slug, parent_id, sort_order, translations)
SELECT v.name, v.slug, p.id, v.sort_order, v.translations::jsonb
FROM (VALUES
  ('skincare', '스킨/토너', 'skin-toner', 11, '{"en":"Skin & Toner","es":"Tónico","de":"Toner","fr":"Lotion tonique","pt":"Tônico","ja":"化粧水・トナー","ar":"تونر"}'),
  ('skincare', '에센스/세럼/앰플', 'essence-serum', 12, '{"en":"Essence, Serum & Ampoule","es":"Esencia, sérum y ampolla","de":"Essenz, Serum & Ampulle","fr":"Essence, sérum et ampoule","pt":"Essência, sérum e ampola","ja":"エッセンス・美容液・アンプル","ar":"إسنس وسيروم وأمبول"}'),
  ('skincare', '크림', 'cream', 13, '{"en":"Cream","es":"Crema","de":"Creme","fr":"Crème","pt":"Creme","ja":"クリーム","ar":"كريم"}'),
  ('skincare', '미스트/오일', 'mist-oil', 14, '{"en":"Mist & Oil","es":"Bruma y aceite","de":"Mist & Öl","fr":"Brume et huile","pt":"Bruma e óleo","ja":"ミスト・オイル","ar":"بخاخ وزيت"}'),
  ('skincare', '마스크팩', 'mask-pack', 15, '{"en":"Masks","es":"Mascarillas","de":"Masken","fr":"Masques","pt":"Máscaras","ja":"マスク・パック","ar":"أقنعة"}'),
  ('makeup', '립메이크업', 'lip-makeup', 21, '{"en":"Lip Makeup","es":"Maquillaje de labios","de":"Lippen-Make-up","fr":"Maquillage des lèvres","pt":"Maquiagem para lábios","ja":"リップメイク","ar":"مكياج الشفاه"}'),
  ('makeup', '베이스메이크업', 'base-makeup', 22, '{"en":"Base Makeup","es":"Maquillaje de base","de":"Teint-Make-up","fr":"Maquillage du teint","pt":"Maquiagem de base","ja":"ベースメイク","ar":"مكياج الأساس"}'),
  ('makeup', '아이메이크업', 'eye-makeup', 23, '{"en":"Eye Makeup","es":"Maquillaje de ojos","de":"Augen-Make-up","fr":"Maquillage des yeux","pt":"Maquiagem para olhos","ja":"アイメイク","ar":"مكياج العيون"}')
) AS v(parent_slug, name, slug, sort_order, translations)
JOIN public.categories p ON p.slug = v.parent_slug AND p.parent_id IS NULL
WHERE NOT EXISTS (SELECT 1 FROM public.categories c WHERE c.slug = v.slug);
