// The hair part of "Find Your Perfect Match": five quick steps in every storefront language.
// Step 1 picks a Hair Care subcategory (slugs below); steps 2-5 pick tags that admins set per
// product in 상품 편집 > 뷰티 상담 추천.

export const HAIR_PRODUCT_SLUGS = ["shampoo", "treatment", "scalp-care", "styling", "hair-oil"] as const;
export const HAIR_STEPS = {
  scalp: ["oily_scalp", "dry_scalp", "normal_scalp", "sensitive_scalp", "combination_scalp"],
  hair: ["straight", "wavy", "curly", "coily", "fine", "thick"],
  concern: ["damage", "frizz", "volume", "dandruff", "hair_loss", "color_care"],
  result: ["smooth", "voluminous", "defined_curls", "natural_styling"],
} as const;
export type HairStepKey = "product" | keyof typeof HAIR_STEPS;
export const HAIR_STEP_ORDER: HairStepKey[] = ["product", "scalp", "hair", "concern", "result"];

type HairText = {
  title: string; sub: string; start: string;
  questions: Record<HairStepKey, string>;
  options: Record<string, string>; // option id -> label
};

export const HAIR_TEXTS: Record<string, HairText> = {
  en: {
    title: "Find Your Perfect Hair Match", sub: "Find the products made for your hair and scalp.", start: "Let's begin",
    questions: { product: "What are you looking for?", scalp: "What's your scalp type?", hair: "What's your hair type?", concern: "What's your main concern?", result: "What result do you want?" },
    options: {
      shampoo: "Shampoo", treatment: "Treatment", "scalp-care": "Scalp Care", styling: "Styling", "hair-oil": "Hair Oil",
      oily_scalp: "Oily", dry_scalp: "Dry", normal_scalp: "Normal", sensitive_scalp: "Sensitive", combination_scalp: "Combination",
      straight: "Straight", wavy: "Wavy", curly: "Curly", coily: "Coily", fine: "Fine", thick: "Thick",
      damage: "Damage", frizz: "Frizz", volume: "Volume", dandruff: "Dandruff", hair_loss: "Hair Loss", color_care: "Color Care",
      smooth: "Smooth", voluminous: "Voluminous", defined_curls: "Defined Curls", natural_styling: "Natural Styling",
    },
  },
  es: {
    title: "Encuentra tu match capilar perfecto", sub: "Encuentra los productos hechos para tu cabello y cuero cabelludo.", start: "Empezar",
    questions: { product: "¿Qué estás buscando?", scalp: "¿Cómo es tu cuero cabelludo?", hair: "¿Cómo es tu cabello?", concern: "¿Cuál es tu principal preocupación?", result: "¿Qué resultado quieres?" },
    options: {
      shampoo: "Champú", treatment: "Tratamiento", "scalp-care": "Cuidado del cuero cabelludo", styling: "Peinado", "hair-oil": "Aceite capilar",
      oily_scalp: "Graso", dry_scalp: "Seco", normal_scalp: "Normal", sensitive_scalp: "Sensible", combination_scalp: "Mixto",
      straight: "Liso", wavy: "Ondulado", curly: "Rizado", coily: "Muy rizado", fine: "Fino", thick: "Grueso",
      damage: "Daño", frizz: "Encrespamiento", volume: "Volumen", dandruff: "Caspa", hair_loss: "Caída", color_care: "Cuidado del color",
      smooth: "Liso y suave", voluminous: "Con volumen", defined_curls: "Rizos definidos", natural_styling: "Peinado natural",
    },
  },
  de: {
    title: "Finde dein perfektes Haar-Match", sub: "Finde die Produkte für dein Haar und deine Kopfhaut.", start: "Los geht's",
    questions: { product: "Wonach suchst du?", scalp: "Wie ist deine Kopfhaut?", hair: "Wie ist dein Haar?", concern: "Was ist dein größtes Anliegen?", result: "Welches Ergebnis wünschst du dir?" },
    options: {
      shampoo: "Shampoo", treatment: "Kur", "scalp-care": "Kopfhautpflege", styling: "Styling", "hair-oil": "Haaröl",
      oily_scalp: "Fettig", dry_scalp: "Trocken", normal_scalp: "Normal", sensitive_scalp: "Empfindlich", combination_scalp: "Misch",
      straight: "Glatt", wavy: "Wellig", curly: "Lockig", coily: "Kraus", fine: "Fein", thick: "Kräftig",
      damage: "Schäden", frizz: "Frizz", volume: "Volumen", dandruff: "Schuppen", hair_loss: "Haarausfall", color_care: "Farbpflege",
      smooth: "Geschmeidig", voluminous: "Voluminös", defined_curls: "Definierte Locken", natural_styling: "Natürliches Styling",
    },
  },
  fr: {
    title: "Trouvez votre match capillaire parfait", sub: "Trouvez les produits faits pour vos cheveux et votre cuir chevelu.", start: "Commencer",
    questions: { product: "Que recherchez-vous ?", scalp: "Quel est votre type de cuir chevelu ?", hair: "Quel est votre type de cheveux ?", concern: "Quelle est votre préoccupation principale ?", result: "Quel résultat souhaitez-vous ?" },
    options: {
      shampoo: "Shampooing", treatment: "Soin", "scalp-care": "Soin du cuir chevelu", styling: "Coiffant", "hair-oil": "Huile capillaire",
      oily_scalp: "Gras", dry_scalp: "Sec", normal_scalp: "Normal", sensitive_scalp: "Sensible", combination_scalp: "Mixte",
      straight: "Raides", wavy: "Ondulés", curly: "Bouclés", coily: "Crépus", fine: "Fins", thick: "Épais",
      damage: "Abîmés", frizz: "Frisottis", volume: "Volume", dandruff: "Pellicules", hair_loss: "Chute", color_care: "Couleur",
      smooth: "Lisses", voluminous: "Volumineux", defined_curls: "Boucles définies", natural_styling: "Coiffage naturel",
    },
  },
  pt: {
    title: "Encontre o match perfeito para o seu cabelo", sub: "Encontre os produtos feitos para seu cabelo e couro cabeludo.", start: "Começar",
    questions: { product: "O que você procura?", scalp: "Qual é o seu tipo de couro cabeludo?", hair: "Qual é o seu tipo de cabelo?", concern: "Qual é a sua principal preocupação?", result: "Qual resultado você quer?" },
    options: {
      shampoo: "Shampoo", treatment: "Tratamento", "scalp-care": "Cuidado do couro cabeludo", styling: "Finalização", "hair-oil": "Óleo capilar",
      oily_scalp: "Oleoso", dry_scalp: "Seco", normal_scalp: "Normal", sensitive_scalp: "Sensível", combination_scalp: "Misto",
      straight: "Liso", wavy: "Ondulado", curly: "Cacheado", coily: "Crespo", fine: "Fino", thick: "Grosso",
      damage: "Danos", frizz: "Frizz", volume: "Volume", dandruff: "Caspa", hair_loss: "Queda", color_care: "Cuidado da cor",
      smooth: "Liso e macio", voluminous: "Com volume", defined_curls: "Cachos definidos", natural_styling: "Finalização natural",
    },
  },
  ja: {
    title: "あなたにぴったりのヘアケアを見つけよう", sub: "髪と頭皮に合うアイテムを見つけましょう。", start: "はじめる",
    questions: { product: "何をお探しですか？", scalp: "頭皮タイプは？", hair: "髪質は？", concern: "いちばんの悩みは？", result: "どんな仕上がりにしたいですか？" },
    options: {
      shampoo: "シャンプー", treatment: "トリートメント", "scalp-care": "頭皮ケア", styling: "スタイリング", "hair-oil": "ヘアオイル",
      oily_scalp: "脂性", dry_scalp: "乾燥", normal_scalp: "普通", sensitive_scalp: "敏感", combination_scalp: "混合",
      straight: "ストレート", wavy: "ウェーブ", curly: "カール", coily: "強いくせ毛", fine: "細い髪", thick: "太い髪",
      damage: "ダメージ", frizz: "うねり・広がり", volume: "ボリューム不足", dandruff: "フケ", hair_loss: "抜け毛", color_care: "カラーケア",
      smooth: "さらさら", voluminous: "ふんわり", defined_curls: "まとまるカール", natural_styling: "自然なスタイリング",
    },
  },
};

export const hairTexts = (language: string) => HAIR_TEXTS[language] || HAIR_TEXTS.en;
