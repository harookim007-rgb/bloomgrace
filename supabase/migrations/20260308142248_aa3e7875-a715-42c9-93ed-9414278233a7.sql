
-- Update banner translations
UPDATE banners SET translations = jsonb_build_object(
  'en', jsonb_build_object('title', 'Spring New Collection', 'subtitle', 'Discover our new beauty line inspired by nature'),
  'es', jsonb_build_object('title', 'Nueva Colección de Primavera', 'subtitle', 'Descubre nuestra nueva línea de belleza inspirada en la naturaleza'),
  'de', jsonb_build_object('title', 'Neue Frühlingskollektion', 'subtitle', 'Entdecken Sie unsere neue, von der Natur inspirierte Beauty-Linie')
) WHERE id = '9bbc19fb-6f2d-4f4f-892a-e0e7c5a8903b';

UPDATE banners SET translations = jsonb_build_object(
  'en', jsonb_build_object('title', '20% Off Everything', 'subtitle', 'Spring Special Sale - Until March 31'),
  'es', jsonb_build_object('title', '20% de Descuento en Todo', 'subtitle', 'Oferta Especial de Primavera - Hasta el 31 de marzo'),
  'de', jsonb_build_object('title', '20% Rabatt auf Alles', 'subtitle', 'Frühlings-Sonderangebot - Bis 31. März')
) WHERE id = '2b170d32-258a-42f8-a24d-e1275b08e463';

UPDATE banners SET translations = jsonb_build_object(
  'en', jsonb_build_object('title', '15% Off for New Members', 'subtitle', 'Sign up now and enjoy exclusive benefits'),
  'es', jsonb_build_object('title', '15% de Descuento para Nuevos Miembros', 'subtitle', 'Regístrate ahora y disfruta de beneficios exclusivos'),
  'de', jsonb_build_object('title', '15% Rabatt für Neue Mitglieder', 'subtitle', 'Jetzt anmelden und exklusive Vorteile genießen')
) WHERE id = '39f5b637-1d90-4098-9108-58bcea2f3762';

-- Update product translations
UPDATE products SET translations = jsonb_build_object(
  'en', jsonb_build_object('name', 'Rose Velvet Lipstick', 'description', 'Silky smooth formula with natural rose extract. Long-lasting color with moisturizing comfort.'),
  'es', jsonb_build_object('name', 'Lápiz Labial Rosa Terciopelo', 'description', 'Fórmula sedosa con extracto natural de rosa. Color duradero con confort hidratante.'),
  'de', jsonb_build_object('name', 'Rose Samt Lippenstift', 'description', 'Seidig glatte Formel mit natürlichem Rosenextrakt. Langanhaltende Farbe mit feuchtigkeitsspendendem Komfort.')
) WHERE id = '1972c72d-f6a5-429b-8953-222a5d57e319';

UPDATE products SET translations = jsonb_build_object(
  'en', jsonb_build_object('name', 'Botanical Face Cream', 'description', 'Nourishing cream with eucalyptus and shea butter. Deep hydration for dry skin.'),
  'es', jsonb_build_object('name', 'Crema Facial Botánica', 'description', 'Crema nutritiva con eucalipto y manteca de karité. Hidratación profunda para piel seca.'),
  'de', jsonb_build_object('name', 'Botanische Gesichtscreme', 'description', 'Pflegende Creme mit Eukalyptus und Sheabutter. Tiefe Feuchtigkeit für trockene Haut.')
) WHERE id = '4c0ffe4a-a518-48a1-874b-c8910b2b7a5b';

UPDATE products SET translations = jsonb_build_object(
  'en', jsonb_build_object('name', 'Fleur de Élégance Perfume', 'description', 'Signature fragrance with floral notes. Subtle and sophisticated scent that lasts all day.'),
  'es', jsonb_build_object('name', 'Perfume Fleur de Élégance', 'description', 'Fragancia exclusiva con notas florales. Aroma sutil y sofisticado que dura todo el día.'),
  'de', jsonb_build_object('name', 'Fleur de Élégance Parfüm', 'description', 'Signaturduft mit floralen Noten. Subtiler und raffinierter Duft, der den ganzen Tag hält.')
) WHERE id = '80cb30d0-8221-45d8-8323-357c15328d81';

UPDATE products SET translations = jsonb_build_object(
  'en', jsonb_build_object('name', 'Luxury Brush Set', 'description', 'Professional rose gold brush set of 12. Soft synthetic bristles for flawless makeup application.'),
  'es', jsonb_build_object('name', 'Set de Brochas de Lujo', 'description', 'Set profesional de 12 brochas en oro rosa. Cerdas sintéticas suaves para un maquillaje impecable.'),
  'de', jsonb_build_object('name', 'Luxus Pinsel-Set', 'description', 'Professionelles Roségold-Pinselset mit 12 Pinseln. Weiche synthetische Borsten für makellose Make-up-Anwendung.')
) WHERE id = 'a1ab18dc-0779-42ab-a249-25cebe0f9921';

UPDATE products SET translations = jsonb_build_object(
  'en', jsonb_build_object('name', 'Autumn Glow Serum', 'description', 'Brightening serum with Vitamin C. High-concentration formula to illuminate dull skin.'),
  'es', jsonb_build_object('name', 'Sérum Resplandor de Otoño', 'description', 'Sérum iluminador con Vitamina C. Fórmula de alta concentración para piel apagada.'),
  'de', jsonb_build_object('name', 'Herbstglanz Serum', 'description', 'Aufhellendes Serum mit Vitamin C. Hochkonzentrierte Formel für strahlende Haut.')
) WHERE id = '28beda47-cf39-45ce-9b5d-4f54e82cea46';

UPDATE products SET translations = jsonb_build_object(
  'en', jsonb_build_object('name', 'Pink Pearl Highlighter', 'description', 'Luminous pearl finish highlighter. Powder type that adds a natural glow.'),
  'es', jsonb_build_object('name', 'Iluminador Perla Rosa', 'description', 'Iluminador con acabado perlado luminoso. Tipo polvo que añade un brillo natural.'),
  'de', jsonb_build_object('name', 'Pink Perlen Highlighter', 'description', 'Leuchtender Perlglanz-Highlighter. Puderform für natürlichen Glanz.')
) WHERE id = '67098abb-6bb0-438f-941c-8353d0169e0f';

UPDATE products SET translations = jsonb_build_object(
  'en', jsonb_build_object('name', 'Green Tea Mist', 'description', 'Refreshing green tea facial mist. Convenient hydration anytime, anywhere.'),
  'es', jsonb_build_object('name', 'Bruma de Té Verde', 'description', 'Bruma facial refrescante de té verde. Hidratación conveniente en cualquier momento.'),
  'de', jsonb_build_object('name', 'Grüner Tee Gesichtsspray', 'description', 'Erfrischendes Grüner-Tee-Gesichtsspray. Bequeme Feuchtigkeit jederzeit und überall.')
) WHERE id = '948deb66-33f1-4657-ac21-8f5c26f30f6f';

UPDATE products SET translations = jsonb_build_object(
  'en', jsonb_build_object('name', 'Velvet Blush Duo', 'description', 'Soft matte blush duo. Two warm-toned shades perfect for the autumn season.'),
  'es', jsonb_build_object('name', 'Dúo de Rubor Terciopelo', 'description', 'Dúo de rubor mate suave. Dos tonos cálidos perfectos para la temporada de otoño.'),
  'de', jsonb_build_object('name', 'Samt Rouge Duo', 'description', 'Weiches mattes Rouge-Duo. Zwei warme Töne, perfekt für die Herbstsaison.')
) WHERE id = '898bedab-4a48-4442-b8f9-023d58a32a6f';

UPDATE products SET translations = jsonb_build_object(
  'en', jsonb_build_object('name', 'Silk Hair Essence', 'description', 'Silk protein hair essence for damaged hair. Restores softness and shine.'),
  'es', jsonb_build_object('name', 'Esencia Capilar de Seda', 'description', 'Esencia capilar de proteína de seda para cabello dañado. Restaura suavidad y brillo.'),
  'de', jsonb_build_object('name', 'Seiden Haar-Essenz', 'description', 'Seidenprotein-Haaressenz für geschädigtes Haar. Stellt Weichheit und Glanz wieder her.')
) WHERE id = 'b198ff15-27a4-4eda-8300-a54b008eda11';

UPDATE products SET translations = jsonb_build_object(
  'en', jsonb_build_object('name', 'Hyaluronic Acid Toner', 'description', 'High-concentration hyaluronic acid hydrating toner. Deeply replenishes skin moisture.'),
  'es', jsonb_build_object('name', 'Tónico de Ácido Hialurónico', 'description', 'Tónico hidratante con ácido hialurónico de alta concentración. Repone profundamente la humedad de la piel.'),
  'de', jsonb_build_object('name', 'Hyaluronsäure Toner', 'description', 'Hochkonzentrierter Hyaluronsäure-Feuchtigkeitstoner. Versorgt die Haut tiefenwirksam mit Feuchtigkeit.')
) WHERE id = '9d234173-5e6b-4566-9c3f-dca6157bf3ab';

UPDATE products SET translations = jsonb_build_object(
  'en', jsonb_build_object('name', 'Collagen Body Lotion', 'description', 'Marine collagen high-moisture body lotion. Creates firm and smooth body skin.'),
  'es', jsonb_build_object('name', 'Loción Corporal de Colágeno', 'description', 'Loción corporal de alta hidratación con colágeno marino. Piel corporal firme y suave.'),
  'de', jsonb_build_object('name', 'Kollagen Körperlotion', 'description', 'Marine Kollagen Feuchtigkeits-Körperlotion. Für straffe und glatte Körperhaut.')
) WHERE id = 'f8ce6b14-30a9-4c79-b5c1-ffcc4d28c9b8';

UPDATE products SET translations = jsonb_build_object(
  'en', jsonb_build_object('name', 'Multi Vitamin Supplement', 'description', 'Daily multivitamin capsule. Balanced blend of Vitamins A, B, C, D, and E.'),
  'es', jsonb_build_object('name', 'Suplemento Multivitamínico', 'description', 'Cápsula multivitamínica diaria. Mezcla equilibrada de vitaminas A, B, C, D y E.'),
  'de', jsonb_build_object('name', 'Multivitamin Nahrungsergänzung', 'description', 'Tägliche Multivitamin-Kapsel. Ausgewogene Mischung aus Vitamin A, B, C, D und E.')
) WHERE id = '5ee01548-448e-464d-af09-2b07f4311039';
