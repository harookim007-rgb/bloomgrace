import type { Language } from "@/contexts/LanguageContext";

export const SUPPORTED_PRODUCT_LANGUAGES: Language[] = ["en", "es", "de", "fr", "pt", "ja", "ar"];

export const containsHangul = (value?: string | null) => /[가-힣]/.test(value || "");

const clean = (value?: unknown) => (typeof value === "string" ? value.trim() : "");

const productNameFallbacks: Record<string, Partial<Record<Language, string>>> = {
  "rose-velvet-lipstick": {
    en: "Rose Velvet Lipstick", es: "Labial Rose Velvet", de: "Rose Velvet Lippenstift", fr: "Rouge à Lèvres Rose Velours", pt: "Batom Rosa Veludo", ja: "ローズベルベットリップスティック", ar: "أحمر شفاه روز فلفيت",
  },
  "botanical-face-cream": {
    en: "Botanical Face Cream", es: "Crema Facial Botánica", de: "Botanische Gesichtscreme", fr: "Crème Visage Botanique", pt: "Creme Facial Botânico", ja: "ボタニカルフェイスクリーム", ar: "كريم الوجه النباتي",
  },
  "green-tea-mist": {
    en: "Green Tea Mist", es: "Bruma de Té Verde", de: "Grüntee-Gesichtsspray", fr: "Brume au Thé Vert", pt: "Bruma de Chá Verde", ja: "グリーンティーミスト", ar: "بخاخ الشاي الأخضر",
  },
  "velvet-blush-duo": {
    en: "Velvet Blush Duo", es: "Dúo de Rubor Velvet", de: "Velvet Rouge Duo", fr: "Duo Blush Velours", pt: "Duo Blush Veludo", ja: "ベルベットブラッシュデュオ", ar: "ثنائي أحمر الخدود المخملي",
  },
  "silk-hair-essence": {
    en: "Silk Hair Essence", es: "Esencia Capilar de Seda", de: "Seiden-Haaressenz", fr: "Essence Capillaire à la Soie", pt: "Essência Capilar de Seda", ja: "シルクヘアエッセンス", ar: "إيسنس الشعر بالحرير",
  },
  "hyaluronic-toner": {
    en: "Hyaluronic Acid Toner", es: "Tónico de Ácido Hialurónico", de: "Hyaluronsäure-Toner", fr: "Tonique à l’Acide Hyaluronique", pt: "Tônico de Ácido Hialurônico", ja: "ヒアルロン酸トナー", ar: "تونر حمض الهيالورونيك",
  },
  "collagen-body-lotion": {
    en: "Collagen Body Lotion", es: "Loción Corporal de Colágeno", de: "Kollagen-Körperlotion", fr: "Lotion Corps au Collagène", pt: "Loção Corporal de Colágeno", ja: "コラーゲンボディローション", ar: "لوشن الجسم بالكولاجين",
  },
  "luxury-brush-set": {
    en: "Luxury Brush Set", es: "Set de Brochas de Lujo", de: "Luxus-Pinselset", fr: "Set de Pinceaux Luxe", pt: "Kit de Pincéis de Luxo", ja: "ラグジュアリーブラシセット", ar: "مجموعة فرش فاخرة",
  },
  "마데카 21": {
    en: "Madeca Cream", es: "Crema Madeca", de: "Madeca-Creme", fr: "Crème Madeca", pt: "Creme Madeca", ja: "マデカクリーム", ar: "كريم ماديكا",
  },
  "autumn-glow-serum": {
    en: "Autumn Glow Serum", es: "Sérum Brillo de Otoño", de: "Herbstglanz-Serum", fr: "Sérum Éclat d’Automne", pt: "Sérum Brilho de Outono", ja: "オータムグロウセラム", ar: "سيروم إشراقة الخريف",
  },
  "pink-pearl-highlighter": {
    en: "Pink Pearl Highlighter", es: "Iluminador Perla Rosa", de: "Pink Pearl Highlighter", fr: "Enlumineur Perle Rose", pt: "Iluminador Pérola Rosa", ja: "ピンクパールハイライター", ar: "هايلايتر اللؤلؤ الوردي",
  },
  "multi-vitamin-supplement": {
    en: "Multi Vitamin Supplement", es: "Suplemento Multivitamínico", de: "Multivitamin-Nahrungsergänzung", fr: "Complément Multivitaminé", pt: "Suplemento Multivitamínico", ja: "マルチビタミンサプリメント", ar: "مكمل متعدد الفيتامينات",
  },
};

const productNameByKorean: Record<string, Partial<Record<Language, string>>> = {
  "로즈 벨벳 립스틱": productNameFallbacks["rose-velvet-lipstick"],
  "보태니컬 페이스 크림": productNameFallbacks["botanical-face-cream"],
  "그린티 미스트": productNameFallbacks["green-tea-mist"],
  "벨벳 블러쉬 듀오": productNameFallbacks["velvet-blush-duo"],
  "실크 헤어 에센스": productNameFallbacks["silk-hair-essence"],
  "히알루론산 토너": productNameFallbacks["hyaluronic-toner"],
  "콜라겐 바디 로션": productNameFallbacks["collagen-body-lotion"],
  "럭셔리 브러쉬 세트": productNameFallbacks["luxury-brush-set"],
  "마데카 크림": productNameFallbacks["마데카 21"],
  "오텀 글로우 세럼": productNameFallbacks["autumn-glow-serum"],
  "핑크 펄 하이라이터": productNameFallbacks["pink-pearl-highlighter"],
  "멀티 비타민 영양제": productNameFallbacks["multi-vitamin-supplement"],
};

const brandFallbacks: Record<string, Partial<Record<Language, string>>> = {
  "bloom & grace": {
    en: "Bloom & Grace", es: "Bloom & Grace", de: "Bloom & Grace", fr: "Bloom & Grace", pt: "Bloom & Grace", ja: "ブルーム＆グレース", ar: "بلوم آند غريس",
  },
  "마데카 21": {
    en: "Madeca 21", es: "Madeca 21", de: "Madeca 21", fr: "Madeca 21", pt: "Madeca 21", ja: "マデカ21", ar: "ماديكا 21",
  },
};

const benefitLabels: Record<string, Partial<Record<Language, string>>> = {
  "보습": { en: "Hydration", es: "Hidratación", de: "Feuchtigkeit", fr: "Hydratation", pt: "Hidratação", ja: "保湿", ar: "ترطيب" },
  "미백": { en: "Brightening", es: "Luminosidad", de: "Aufhellung", fr: "Éclat", pt: "Clareamento", ja: "ブライトニング", ar: "تفتيح" },
  "주름개선": { en: "Anti-wrinkle", es: "Antiarrugas", de: "Anti-Falten", fr: "Anti-rides", pt: "Antirrugas", ja: "シワ改善", ar: "مضاد للتجاعيد" },
  "진정": { en: "Soothing", es: "Calmante", de: "Beruhigend", fr: "Apaisant", pt: "Calmante", ja: "鎮静", ar: "تهدئة" },
  "탄력": { en: "Firming", es: "Firmeza", de: "Straffung", fr: "Fermeté", pt: "Firmeza", ja: "ハリ", ar: "شد البشرة" },
  "트러블케어": { en: "Blemish Care", es: "Imperfecciones", de: "Unreinheiten", fr: "Imperfections", pt: "Controle de acne", ja: "トラブルケア", ar: "العناية بالحبوب" },
  "자외선차단": { en: "UV Protection", es: "Protección UV", de: "UV-Schutz", fr: "Protection UV", pt: "Proteção UV", ja: "UVカット", ar: "حماية من الشمس" },
  "모공케어": { en: "Pore Care", es: "Poros", de: "Porenpflege", fr: "Pores", pt: "Poros", ja: "毛穴ケア", ar: "العناية بالمسام" },
  "각질케어": { en: "Exfoliation", es: "Exfoliación", de: "Peeling", fr: "Exfoliation", pt: "Esfoliação", ja: "角質ケア", ar: "تقشير" },
  "영양": { en: "Nourishing", es: "Nutrición", de: "Nährend", fr: "Nutrition", pt: "Nutrição", ja: "栄養", ar: "تغذية" },
};

export const getLocalizedProductName = (product: any, language: Language): string => {
  const translated = clean(product?.translations?.[language]?.name);
  if (translated && !containsHangul(translated)) return translated;
  const bySlug = clean(product?.slug) ? productNameFallbacks[product.slug]?.[language] : "";
  if (bySlug) return bySlug;
  const byName = productNameByKorean[clean(product?.name)]?.[language];
  if (byName) return byName;
  const english = clean(product?.translations?.en?.name);
  if (english && !containsHangul(english)) return english;
  return clean(product?.name);
};

export const getLocalizedBrand = (product: any, language: Language): string => {
  const translated = clean(product?.translations?.[language]?.brand);
  const raw = clean(product?.brand);
  const fallback = brandFallbacks[raw.toLowerCase()]?.[language] || brandFallbacks[raw]?.[language];
  // If the DB translation simply repeats the source brand, prefer our localized
  // storefront label for languages where the brand is intentionally localized.
  if (fallback && language !== "en" && (!translated || translated.toLowerCase() === raw.toLowerCase())) return fallback;
  if (translated && !containsHangul(translated)) return translated;
  if (fallback) return fallback;
  const english = clean(product?.translations?.en?.brand);
  if (english && !containsHangul(english)) return english;
  return raw;
};

export const getLocalizedDescription = (product: any, language: Language): string => {
  const translated = clean(product?.translations?.[language]?.description);
  if (translated && (language === "ja" || language === "ar" || !containsHangul(translated))) return translated;
  const english = clean(product?.translations?.en?.description);
  if (english && !containsHangul(english)) return english;
  return clean(product?.description);
};

export const getLocalizedBenefit = (benefit: string, language: Language): string => {
  return benefitLabels[benefit]?.[language] || benefit;
};

export const productUi = (language: Language) => ({
  new: { en: "NEW", es: "NUEVO", de: "NEU", fr: "NOUVEAU", pt: "NOVO", ja: "新商品", ar: "جديد" }[language] || "NEW",
  best: { en: "BEST", es: "TOP", de: "BEST", fr: "BEST", pt: "TOP", ja: "人気", ar: "الأفضل" }[language] || "BEST",
  buyNow: { en: "Buy Now", es: "Comprar ahora", de: "Jetzt kaufen", fr: "Acheter", pt: "Comprar agora", ja: "今すぐ購入", ar: "اشترِ الآن" }[language] || "Buy Now",
  keyBenefits: { en: "Key Benefits", es: "Beneficios", de: "Vorteile", fr: "Bénéfices", pt: "Benefícios", ja: "主な効果", ar: "الفوائد الرئيسية" }[language] || "Key Benefits",
  related: { en: "You may also like", es: "También te puede gustar", de: "Das könnte Ihnen gefallen", fr: "Vous aimerez aussi", pt: "Você também pode gostar", ja: "おすすめ商品", ar: "قد يعجبك أيضاً" }[language] || "You may also like",
  outOfStock: { en: "Out of Stock", es: "Agotado", de: "Ausverkauft", fr: "Épuisé", pt: "Esgotado", ja: "在庫切れ", ar: "نفد المخزون" }[language] || "Out of Stock",
});