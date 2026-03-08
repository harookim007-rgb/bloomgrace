
-- Update banner translations
UPDATE banners SET translations = jsonb_build_object(
  'en', jsonb_build_object('title', 'Spring New Collection', 'subtitle', 'Discover our new beauty line inspired by nature'),
  'ko', jsonb_build_object('title', '봄 신상 컬렉션 출시', 'subtitle', '자연에서 영감받은 새로운 뷰티 라인을 만나보세요'),
  'es', jsonb_build_object('title', 'Nueva Colección de Primavera', 'subtitle', 'Descubre nuestra nueva línea de belleza inspirada en la naturaleza'),
  'de', jsonb_build_object('title', 'Neue Frühlingskollektion', 'subtitle', 'Entdecken Sie unsere neue, von der Natur inspirierte Beauty-Linie')
) WHERE id = '9bbc19fb-6f2d-4f4f-892a-e0e7c5a8903b';

UPDATE banners SET translations = jsonb_build_object(
  'en', jsonb_build_object('title', '20% Off Everything', 'subtitle', 'Spring Special Sale - Until March 31'),
  'ko', jsonb_build_object('title', '전 품목 20% 할인', 'subtitle', '봄맞이 특별 세일 - 3월 31일까지'),
  'es', jsonb_build_object('title', '20% de Descuento en Todo', 'subtitle', 'Oferta Especial de Primavera - Hasta el 31 de marzo'),
  'de', jsonb_build_object('title', '20% Rabatt auf Alles', 'subtitle', 'Frühlings-Sonderangebot - Bis 31. März')
) WHERE id = '2b170d32-258a-42f8-a24d-e1275b08e463';

UPDATE banners SET translations = jsonb_build_object(
  'en', jsonb_build_object('title', '15% Off for New Members', 'subtitle', 'Sign up now and enjoy exclusive benefits'),
  'ko', jsonb_build_object('title', '신규 회원 15% 할인', 'subtitle', '지금 가입하고 특별한 혜택을 받아보세요'),
  'es', jsonb_build_object('title', '15% de Descuento para Nuevos Miembros', 'subtitle', 'Regístrate ahora y disfruta de beneficios exclusivos'),
  'de', jsonb_build_object('title', '15% Rabatt für Neue Mitglieder', 'subtitle', 'Jetzt anmelden und exklusive Vorteile genießen')
) WHERE id = '39f5b637-1d90-4098-9108-58bcea2f3762';

-- Update product translations
UPDATE products SET translations = jsonb_build_object(
  'en', jsonb_build_object('name', 'Rose Velvet Lipstick', 'description', 'Silky smooth formula with natural rose extract. Long-lasting color with moisturizing comfort.'),
  'ko', jsonb_build_object('name', '로즈 벨벳 립스틱', 'description', '천연 장미 추출물이 함유된 실키 스무스 포뮬러. 오래 지속되는 발색력과 촉촉한 사용감을 동시에 느껴보세요.'),
  'es', jsonb_build_object('name', 'Lápiz Labial Rosa Terciopelo', 'description', 'Fórmula sedosa con extracto natural de rosa. Color duradero con confort hidratante.'),
  'de', jsonb_build_object('name', 'Rose Samt Lippenstift', 'description', 'Seidig glatte Formel mit natürlichem Rosenextrakt. Langanhaltende Farbe mit feuchtigkeitsspendendem Komfort.')
) WHERE id = '1972c72d-f6a5-429b-8953-222a5d57e319';

UPDATE products SET translations = jsonb_build_object(
  'en', jsonb_build_object('name', 'Botanical Face Cream', 'description', 'Nourishing cream with eucalyptus and shea butter. Deep hydration for dry skin.'),
  'ko', jsonb_build_object('name', '보태니컬 페이스 크림', 'description', '유칼립투스와 시어버터가 함유된 영양 크림. 건조한 피부에 깊은 수분을 공급합니다.'),
  'es', jsonb_build_object('name', 'Crema Facial Botánica', 'description', 'Crema nutritiva con eucalipto y manteca de karité. Hidratación profunda para piel seca.'),
  'de', jsonb_build_object('name', 'Botanische Gesichtscreme', 'description', 'Pflegende Creme mit Eukalyptus und Sheabutter. Tiefe Feuchtigkeit für trockene Haut.')
) WHERE id = '4c0ffe4a-a518-48a1-874b-c8910b2b7a5b';

UPDATE products SET translations = jsonb_build_object(
  'en', jsonb_build_object('name', 'Fleur de Élégance Perfume', 'description', 'Signature fragrance with floral notes. Subtle and sophisticated scent that lasts all day.'),
  'ko', jsonb_build_object('name', '플뢰르 드 엘레강스 퍼퓸', 'description', '플로럴 노트가 어우러진 시그니처 향수. 은은하면서도 세련된 향이 하루 종일 지속됩니다.'),
  'es', jsonb_build_object('name', 'Perfume Fleur de Élégance', 'description', 'Fragancia exclusiva con notas florales. Aroma sutil y sofisticado que dura todo el día.'),
  'de', jsonb_build_object('name', 'Fleur de Élégance Parfüm', 'description', 'Signaturduft mit floralen Noten. Subtiler und raffinierter Duft, der den ganzen Tag hält.')
) WHERE id = '80cb30d0-8221-45d8-8323-357c15328d81';

UPDATE products SET translations = jsonb_build_object(
  'en', jsonb_build_object('name', 'Luxury Brush Set', 'description', 'Professional rose gold brush set of 12. Soft synthetic bristles for flawless makeup application.'),
  'ko', jsonb_build_object('name', '럭셔리 브러쉬 세트', 'description', '프로페셔널 로즈골드 브러쉬 12종 세트. 부드러운 인조모로 피부 자극 없이 완벽한 메이크업이 가능합니다.'),
  'es', jsonb_build_object('name', 'Set de Brochas de Lujo', 'description', 'Set profesional de 12 brochas en oro rosa. Cerdas sintéticas suaves para un maquillaje impecable.'),
  'de', jsonb_build_object('name', 'Luxus Pinsel-Set', 'description', 'Professionelles Roségold-Pinselset mit 12 Pinseln. Weiche synthetische Borsten für makellose Make-up-Anwendung.')
) WHERE id = 'a1ab18dc-0779-42ab-a249-25cebe0f9921';

UPDATE products SET translations = jsonb_build_object(
  'en', jsonb_build_object('name', 'Autumn Glow Serum', 'description', 'Brightening serum with Vitamin C. High-concentration formula to illuminate dull skin.'),
  'ko', jsonb_build_object('name', '오텀 글로우 세럼', 'description', '비타민C 함유 브라이트닝 세럼. 칙칙한 피부톤을 환하게 밝혀주는 고농축 세럼입니다.'),
  'es', jsonb_build_object('name', 'Sérum Resplandor de Otoño', 'description', 'Sérum iluminador con Vitamina C. Fórmula de alta concentración para piel apagada.'),
  'de', jsonb_build_object('name', 'Herbstglanz Serum', 'description', 'Aufhellendes Serum mit Vitamin C. Hochkonzentrierte Formel für strahlende Haut.')
) WHERE id = '28beda47-cf39-45ce-9b5d-4f54e82cea46';

UPDATE products SET translations = jsonb_build_object(
  'en', jsonb_build_object('name', 'Pink Pearl Highlighter', 'description', 'Luminous pearl finish highlighter. Powder type that adds a natural glow.'),
  'ko', jsonb_build_object('name', '핑크 펄 하이라이터', 'description', '루미너스 펄 피니시 하이라이터. 자연스러운 광채를 더해주는 파우더 타입입니다.'),
  'es', jsonb_build_object('name', 'Iluminador Perla Rosa', 'description', 'Iluminador con acabado perlado luminoso. Tipo polvo que añade un brillo natural.'),
  'de', jsonb_build_object('name', 'Pink Perlen Highlighter', 'description', 'Leuchtender Perlglanz-Highlighter. Puderform für natürlichen Glanz.')
) WHERE id = '67098abb-6bb0-438f-941c-8353d0169e0f';

UPDATE products SET translations = jsonb_build_object(
  'en', jsonb_build_object('name', 'Green Tea Mist', 'description', 'Refreshing green tea facial mist. Convenient hydration anytime, anywhere.'),
  'ko', jsonb_build_object('name', '그린티 미스트', 'description', '상쾌한 녹차 페이셜 미스트. 언제 어디서나 간편하게 수분을 충전할 수 있습니다.'),
  'es', jsonb_build_object('name', 'Bruma de Té Verde', 'description', 'Bruma facial refrescante de té verde. Hidratación conveniente en cualquier momento.'),
  'de', jsonb_build_object('name', 'Grüner Tee Gesichtsspray', 'description', 'Erfrischendes Grüner-Tee-Gesichtsspray. Bequeme Feuchtigkeit jederzeit und überall.')
) WHERE id = '948deb66-33f1-4657-ac21-8f5c26f30f6f';

UPDATE products SET translations = jsonb_build_object(
  'en', jsonb_build_object('name', 'Velvet Blush Duo', 'description', 'Soft matte blush duo. Two warm-toned shades perfect for the autumn season.'),
  'ko', jsonb_build_object('name', '벨벳 블러쉬 듀오', 'description', '소프트 매트 블러쉬 듀오. 가을 시즌에 어울리는 따뜻한 톤의 2가지 컬러가 담겨있습니다.'),
  'es', jsonb_build_object('name', 'Dúo de Rubor Terciopelo', 'description', 'Dúo de rubor mate suave. Dos tonos cálidos perfectos para la temporada de otoño.'),
  'de', jsonb_build_object('name', 'Samt Rouge Duo', 'description', 'Weiches mattes Rouge-Duo. Zwei warme Töne, perfekt für die Herbstsaison.')
) WHERE id = '898bedab-4a48-4442-b8f9-023d58a32a6f';

UPDATE products SET translations = jsonb_build_object(
  'en', jsonb_build_object('name', 'Silk Hair Essence', 'description', 'Silk protein hair essence for damaged hair. Restores softness and shine.'),
  'ko', jsonb_build_object('name', '실크 헤어 에센스', 'description', '손상모를 위한 실크 프로틴 헤어 에센스. 부드럽고 윤기 나는 모발로 가꿔줍니다.'),
  'es', jsonb_build_object('name', 'Esencia Capilar de Seda', 'description', 'Esencia capilar de proteína de seda para cabello dañado. Restaura suavidad y brillo.'),
  'de', jsonb_build_object('name', 'Seiden Haar-Essenz', 'description', 'Seidenprotein-Haaressenz für geschädigtes Haar. Stellt Weichheit und Glanz wieder her.')
) WHERE id = 'b198ff15-27a4-4eda-8300-a54b008eda11';

UPDATE products SET translations = jsonb_build_object(
  'en', jsonb_build_object('name', 'Hyaluronic Acid Toner', 'description', 'High-concentration hyaluronic acid hydrating toner. Deeply replenishes skin moisture.'),
  'ko', jsonb_build_object('name', '히알루론산 토너', 'description', '고농축 히알루론산이 함유된 수분 토너. 피부 깊숙이 수분을 채워줍니다.'),
  'es', jsonb_build_object('name', 'Tónico de Ácido Hialurónico', 'description', 'Tónico hidratante con ácido hialurónico de alta concentración. Repone profundamente la humedad de la piel.'),
  'de', jsonb_build_object('name', 'Hyaluronsäure Toner', 'description', 'Hochkonzentrierter Hyaluronsäure-Feuchtigkeitstoner. Versorgt die Haut tiefenwirksam mit Feuchtigkeit.')
) WHERE id = '9d234173-5e6b-4566-9c3f-dca6157bf3ab';

UPDATE products SET translations = jsonb_build_object(
  'en', jsonb_build_object('name', 'Collagen Body Lotion', 'description', 'Marine collagen high-moisture body lotion. Creates firm and smooth body skin.'),
  'ko', jsonb_build_object('name', '콜라겐 바디 로션', 'description', '마린 콜라겐이 함유된 고보습 바디 로션. 탄력 있고 매끈한 바디 피부를 만들어줍니다.'),
  'es', jsonb_build_object('name', 'Loción Corporal de Colágeno', 'description', 'Loción corporal de alta hidratación con colágeno marino. Piel corporal firme y suave.'),
  'de', jsonb_build_object('name', 'Kollagen Körperlotion', 'description', 'Marine Kollagen Feuchtigkeits-Körperlotion. Für straffe und glatte Körperhaut.')
) WHERE id = 'f8ce6b14-30a9-4c79-b5c1-ffcc4d28c9b8';

UPDATE products SET translations = jsonb_build_object(
  'en', jsonb_build_object('name', 'Multi Vitamin Supplement', 'description', 'Daily multivitamin capsule. Balanced blend of Vitamins A, B, C, D, and E.'),
  'ko', jsonb_build_object('name', '멀티 비타민 영양제', 'description', '하루 한 알로 채우는 멀티비타민. 비타민 A, B, C, D, E가 골고루 담겨있습니다.'),
  'es', jsonb_build_object('name', 'Suplemento Multivitamínico', 'description', 'Cápsula multivitamínica diaria. Mezcla equilibrada de vitaminas A, B, C, D y E.'),
  'de', jsonb_build_object('name', 'Multivitamin Nahrungsergänzung', 'description', 'Tägliche Multivitamin-Kapsel. Ausgewogene Mischung aus Vitamin A, B, C, D und E.')
) WHERE id = '5ee01548-448e-464d-af09-2b07f4311039';
