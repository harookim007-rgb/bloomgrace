import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { getLocalizedBrand, getLocalizedProductName } from "@/lib/productI18n";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ArrowRight, ArrowLeft, Loader2, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import categorySkinImg from "@/assets/category-skin.jpg";
import categoryBodyImg from "@/assets/category-body.jpg";
import categoryHairImg from "@/assets/category-hair.jpg";

// ── Beauty knowledge data ──
const categories = ["Skin", "Body", "Hair"] as const;
type Category = (typeof categories)[number];

const skinSubCategories = ["All", "Toner", "Lotion", "Cream", "Ample", "Pack"] as const;

interface ConcernOption {
  id: string;
  label: Record<string, string>;
  description: Record<string, string>;
}

const skinConcerns: ConcernOption[] = [
  {
    id: "oily",
    label: { en: "Oily Skin", es: "Piel Grasa", de: "Fettige Haut" },
    description: {
      en: "Shiny T-zone, enlarged pores, frequent breakouts, makeup slides off easily",
      es: "Zona T brillante, poros dilatados, brotes frecuentes",
      de: "Glänzende T-Zone, vergrößerte Poren, häufige Ausbrüche",
    },
  },
  {
    id: "dry",
    label: { en: "Dry Skin", es: "Piel Seca", de: "Trockene Haut" },
    description: {
      en: "Tightness after washing, flaking, rough texture, fine lines appear easily",
      es: "Tirantez después del lavado, descamación, textura áspera",
      de: "Spannungsgefühl nach dem Waschen, Schuppung, raue Textur",
    },
  },
  {
    id: "combination",
    label: { en: "Combination Skin", es: "Piel Mixta", de: "Mischhaut" },
    description: {
      en: "Oily T-zone but dry cheeks, different needs in different areas, seasonal changes",
      es: "Zona T grasa pero mejillas secas, necesidades diferentes por zona",
      de: "Fettige T-Zone aber trockene Wangen, unterschiedliche Bedürfnisse",
    },
  },
  {
    id: "sensitive",
    label: { en: "Sensitive Skin", es: "Piel Sensible", de: "Empfindliche Haut" },
    description: {
      en: "Redness, stinging with new products, easily irritated, reactive to weather changes",
      es: "Enrojecimiento, ardor con productos nuevos, fácilmente irritada",
      de: "Rötungen, Stechen bei neuen Produkten, leicht reizbar",
    },
  },
  {
    id: "acne",
    label: { en: "Acne-Prone", es: "Piel con Acné", de: "Akne-anfällige Haut" },
    description: {
      en: "Frequent pimples, blackheads/whiteheads, post-acne marks, clogged pores"
      es: "Granos frecuentes, puntos negros, marcas post-acné",
      de: "Häufige Pickel, Mitesser, Aknenarben, verstopfte Poren",
    },
  },
  {
    id: "aging",
    label: { en: "Anti-Aging", es: "Anti-Envejecimiento", de: "Anti-Aging" },
    description: {
      en: "Fine lines and wrinkles, loss of elasticity, dullness, age spots",
      es: "Líneas finas y arrugas, pérdida de elasticidad, manchas",
      de: "Feine Linien und Falten, Elastizitätsverlust, Altersflecken",
    },
  },
];

const bodyConcerns: ConcernOption[] = [
  {
    id: "body_dry",
    label: { en: "Dry Body Skin", es: "Piel Corporal Seca", de: "Trockene Körperhaut" },
    description: {
      en: "Itchy and flaky skin, rough elbows/knees, tightness after shower",
      es: "Piel con picazón y descamación, codos/rodillas ásperos",
      de: "Juckende und schuppige Haut, raue Ellbogen/Knie",
    },
  },
  {
    id: "body_acne",
    label: { en: "Body Troubles", es: "Problemas Corporales", de: "Körperprobleme" },
    description: {
      en: "Back acne, chest breakouts, ingrown hairs, body bumps",
      es: "Acné en espalda, brotes en pecho, vellos encarnados",
      de: "Rückenakne, Brustausbrüche, eingewachsene Haare",
    },
  },
  {
    id: "body_firming",
    label: { en: "Firming & Tone", es: "Firmeza y Tono", de: "Straffung & Tonung" },
    description: {
      en: "Loss of skin firmness, uneven skin tone, cellulite concerns",
      es: "Pérdida de firmeza, tono desigual, preocupaciones de celulitis",
      de: "Verlust der Hautfestigkeit, ungleichmäßiger Hautton, Cellulite",
    },
  },
  {
    id: "body_moisture",
    label: { en: "Deep Moisture", es: "Hidratación Profunda", de: "Tiefe Feuchtigkeit" },
    description: {
      en: "Extremely dehydrated skin, cracking, needs intensive hydration care",
      es: "Piel extremadamente deshidratada, agrietamiento",
      de: "Extrem dehydrierte Haut, Rissbildung, intensive Feuchtigkeitspflege",
    },
  },
];

const hairConcerns: ConcernOption[] = [
  {
    id: "hair_dandruff",
    label: { en: "Dandruff", es: "Caspa", de: "Schuppen" },
    description: {
      en: "White flakes on shoulders, itchy scalp, dry or oily scalp causing flaking",
      es: "Escamas blancas en los hombros, cuero cabelludo con picazón",
      de: "Weiße Flocken auf den Schultern, juckende Kopfhaut",
    },
  },
  {
    id: "hair_dry",
    label: { en: "Dry Hair", es: "Cabello Seco", de: "Trockenes Haar" },
    description: {
      en: "Straw-like texture, frizzy, lacks shine, tangled easily",
      es: "Textura como paja, encrespado, sin brillo, se enreda fácilmente",
      de: "Strohige Textur, kraus, glanzlos, verknotet leicht",
    },
  },
  {
    id: "hair_oily",
    label: { en: "Oily Scalp", es: "Cuero Cabelludo Graso", de: "Fettige Kopfhaut" },
    description: {
      en: "Greasy roots by afternoon, flat/limp hair, needs frequent washing",
      es: "Raíces grasas por la tarde, cabello lacio y sin volumen",
      de: "Fettige Ansätze am Nachmittag, plattes Haar, häufiges Waschen nötig",
    },
  },
  {
    id: "hair_damaged",
    label: { en: "Damaged Hair", es: "Cabello Dañado", de: "Geschädigtes Haar" },
    description: {
      en: "Split ends, breakage, color/heat damage, lacks elasticity",
      es: "Puntas abiertas, rotura, daño por color/calor, sin elasticidad",
      de: "Spliss, Bruch, Farb-/Hitzeschäden, mangelnde Elastizität",
    },
  },
  {
    id: "hair_loss",
    label: { en: "Hair Loss", es: "Caída del Cabello", de: "Haarausfall" },
    description: {
      en: "Thinning hair, excessive shedding, receding hairline, weak roots",
      es: "Cabello adelgazado, caída excesiva, línea de cabello retrocediendo",
      de: "Dünner werdendes Haar, übermäßiger Haarausfall, zurückweichender Haaransatz",
    },
  },
];

const CONCERN_I18N: Record<string, { label: Record<string, string>; description: Record<string, string> }> = {
  oily: {
    label: { fr: "Peau grasse", pt: "Pele oleosa", ja: "脂性肌", ar: "بشرة دهنية" },
    description: { fr: "Zone T brillante, pores dilatés, imperfections fréquentes", pt: "Zona T brilhante, poros dilatados, acne frequente", ja: "Tゾーンのテカリ、毛穴の目立ち、繰り返す肌荒れ", ar: "لمعان في منطقة T، مسام واسعة، وظهور شوائب متكرر" },
  },
  dry: {
    label: { fr: "Peau sèche", pt: "Pele seca", ja: "乾燥肌", ar: "بشرة جافة" },
    description: { fr: "Tiraillement après le lavage, desquamation, texture rugueuse", pt: "Repuxamento após lavar, descamação e textura áspera", ja: "洗顔後のつっぱり、カサつき、ざらつきが気になる肌", ar: "شد بعد الغسل، تقشر وملمس خشن" },
  },
  combination: {
    label: { fr: "Peau mixte", pt: "Pele mista", ja: "混合肌", ar: "بشرة مختلطة" },
    description: { fr: "Zone T grasse et joues sèches, besoins différents selon les zones", pt: "Zona T oleosa e bochechas secas, necessidades diferentes por área", ja: "Tゾーンは皮脂が多く頬は乾燥しやすい肌", ar: "منطقة T دهنية والخدود جافة مع احتياجات مختلفة" },
  },
  sensitive: {
    label: { fr: "Peau sensible", pt: "Pele sensível", ja: "敏感肌", ar: "بشرة حساسة" },
    description: { fr: "Rougeurs, picotements avec de nouveaux produits, facilement irritée", pt: "Vermelhidão, ardor com novos produtos e irritação fácil", ja: "赤みや刺激を受けやすく、環境変化に敏感な肌", ar: "احمرار ولسع مع المنتجات الجديدة وسهولة التهيج" },
  },
  acne: {
    label: { fr: "Peau à imperfections", pt: "Pele acneica", ja: "ニキビ肌", ar: "بشرة معرضة للحبوب" },
    description: { fr: "Boutons fréquents, points noirs/blancs, marques post-acné", pt: "Espinhas frequentes, cravos e marcas pós-acne", ja: "ニキビ、黒ずみ、白ニキビ、ニキビ跡が気になる肌", ar: "حبوب متكررة، رؤوس سوداء/بيضاء وآثار حب الشباب" },
  },
  aging: {
    label: { fr: "Anti-âge", pt: "Anti-idade", ja: "エイジングケア", ar: "مقاومة علامات التقدم" },
    description: { fr: "Rides, perte de fermeté, teint terne et taches", pt: "Linhas finas, perda de firmeza, opacidade e manchas", ja: "小じわ、ハリ不足、くすみ、シミが気になる肌", ar: "خطوط دقيقة، فقدان المرونة، بهتان وبقع" },
  },
  body_dry: {
    label: { fr: "Corps sec", pt: "Pele corporal seca", ja: "ボディ乾燥", ar: "جفاف الجسم" },
    description: { fr: "Peau qui démange et pèle, coudes/genoux rugueux", pt: "Coceira, descamação e cotovelos/joelhos ásperos", ja: "かゆみや粉ふき、ひじ・ひざのざらつき", ar: "حكة وتقشر وخشونة في المرفقين والركبتين" },
  },
  body_acne: {
    label: { fr: "Imperfections corps", pt: "Problemas corporais", ja: "ボディトラブル", ar: "مشاكل الجسم" },
    description: { fr: "Acné du dos, imperfections poitrine, poils incarnés", pt: "Acne nas costas/peito, pelos encravados e bolinhas", ja: "背中・胸のニキビ、埋没毛、ざらつき", ar: "حبوب الظهر والصدر، شعر نامٍ تحت الجلد ونتوءات" },
  },
  body_firming: {
    label: { fr: "Fermeté & éclat", pt: "Firmeza e tom", ja: "ハリ・トーンアップ", ar: "شد وتوحيد اللون" },
    description: { fr: "Perte de fermeté, teint irrégulier, cellulite", pt: "Perda de firmeza, tom irregular e celulite", ja: "ハリ不足、色ムラ、ボディラインの悩み", ar: "فقدان التماسك، تفاوت اللون ومخاوف السيلوليت" },
  },
  body_moisture: {
    label: { fr: "Hydratation intense", pt: "Hidratação profunda", ja: "集中保湿", ar: "ترطيب عميق" },
    description: { fr: "Peau très déshydratée, gerçures, besoin de soin intensif", pt: "Pele muito desidratada, rachaduras e necessidade de cuidado intenso", ja: "極度の乾燥、ひび割れ、集中保湿が必要な肌", ar: "جفاف شديد وتشقق وحاجة لعناية ترطيب مكثفة" },
  },
  hair_dandruff: {
    label: { fr: "Pellicules", pt: "Caspa", ja: "フケ", ar: "قشرة" },
    description: { fr: "Pellicules visibles, cuir chevelu qui démange", pt: "Flocos brancos nos ombros e couro cabeludo com coceira", ja: "肩に落ちるフケ、頭皮のかゆみ", ar: "قشور بيضاء على الكتفين وحكة في فروة الرأس" },
  },
  hair_dry: {
    label: { fr: "Cheveux secs", pt: "Cabelo seco", ja: "乾燥毛", ar: "شعر جاف" },
    description: { fr: "Texture rêche, frisottis, manque de brillance", pt: "Textura áspera, frizz, falta de brilho e embaraço", ja: "パサつき、広がり、ツヤ不足、絡まりやすさ", ar: "ملمس خشن، هيشان، قلة لمعان وتشابك" },
  },
  hair_oily: {
    label: { fr: "Cuir chevelu gras", pt: "Couro cabeludo oleoso", ja: "脂性頭皮", ar: "فروة دهنية" },
    description: { fr: "Racines grasses, cheveux plats, lavages fréquents", pt: "Raiz oleosa à tarde, cabelo sem volume e lavagem frequente", ja: "夕方のベタつき、ボリューム不足、頻繁な洗髪", ar: "جذور دهنية بعد الظهر وشعر مسطح وحاجة لغسل متكرر" },
  },
  hair_damaged: {
    label: { fr: "Cheveux abîmés", pt: "Cabelo danificado", ja: "ダメージヘア", ar: "شعر متضرر" },
    description: { fr: "Fourches, casse, dommages couleur/chaleur", pt: "Pontas duplas, quebra e danos por coloração/calor", ja: "枝毛、切れ毛、カラー・熱ダメージ", ar: "تقصف، تكسر، تلف من الصبغة أو الحرارة" },
  },
  hair_loss: {
    label: { fr: "Chute de cheveux", pt: "Queda de cabelo", ja: "抜け毛ケア", ar: "تساقط الشعر" },
    description: { fr: "Cheveux clairsemés, chute excessive, racines faibles", pt: "Afinamento, queda excessiva e raízes frágeis", ja: "髪の細り、抜け毛、弱った根元", ar: "ترقق الشعر، تساقط زائد وجذور ضعيفة" },
  },
};

const SUBCAT_I18N: Record<string, Record<string, string>> = {
  All: { en: "All", es: "Todo", de: "Alle", fr: "Tout", pt: "Todos", ja: "すべて", ar: "الكل" },
  Toner: { en: "Toner", es: "Tónico", de: "Toner", fr: "Tonique", pt: "Tônico", ja: "トナー", ar: "تونر" },
  Lotion: { en: "Lotion", es: "Loción", de: "Lotion", fr: "Lotion", pt: "Loção", ja: "ローション", ar: "لوشن" },
  Cream: { en: "Cream", es: "Crema", de: "Creme", fr: "Crème", pt: "Creme", ja: "クリーム", ar: "كريم" },
  Ample: { en: "Ampoule", es: "Ampolla", de: "Ampulle", fr: "Ampoule", pt: "Ampola", ja: "アンプル", ar: "أمبول" },
  Pack: { en: "Pack", es: "Mascarilla", de: "Maske", fr: "Masque", pt: "Máscara", ja: "パック", ar: "ماسك" },
};

const getConcerns = (cat: Category) => {
  if (cat === "Skin") return skinConcerns;
  if (cat === "Body") return bodyConcerns;
  return hairConcerns;
};

const categoryImages: Record<Category, string> = {
  Skin: categorySkinImg,
  Body: categoryBodyImg,
  Hair: categoryHairImg,
};

// ── Translations ──
const cTexts: Record<string, Record<string, string>> = {
  en: {
    modalTitle: "Personalized Beauty",
    modalSubtitle: "Discover products perfectly matched to your unique skin, body, and hair needs",
    sectionTitle: "Personalized Beauty",
    sectionSubtitle: "Personalize Your Routine",
    sectionDesc: "Discover products perfectly matched to your unique skin, body, and hair needs",
    step1: "Choose Your Type",
    step1Sub: "Select a category to get AI-powered product recommendations",
    step2: "Select Your Concern",
    step3: "Filter by Product Type",
    analyzing: "Crafting your personalized routine",
    yourType: "Your Analysis",
    recommended: "Recommended For You",
    routine: "Your Routine Order",
    tips: "Expert Tips",
    viewProduct: "View",
    startOver: "Start Over",
    back: "Back",
    next: "Get My Recommendations",
    dontShowToday: "Don't show today",
    close: "Close",
    aiAdvisor: "AI Beauty Advisor",
    skin: "Skin",
    body: "Body",
    hair: "Hair",
    skinDesc: "Face care & skincare routine",
    bodyDesc: "Body care & hydration",
    hairDesc: "Hair & scalp treatments",
    skinLong: "Discover your skin type and get a personalized skincare routine with products perfectly suited for you.",
    bodyLong: "Find the right body care products to address your specific concerns and achieve healthy, radiant skin.",
    hairLong: "Identify your hair and scalp type to get expert recommendations for healthier, more beautiful hair.",
  },
  es: {
    modalTitle: "Recomendaciones con IA",
    modalSubtitle: "Nuestro asesor de belleza IA te recomendará productos perfectos para ti",
    sectionTitle: "Belleza Personalizada",
    sectionSubtitle: "Recomendaciones IA",
    sectionDesc: "Descubre productos perfectamente adaptados a tus necesidades únicas",
    step1: "Elige Tu Tipo",
    step1Sub: "Selecciona una categoría para obtener recomendaciones con IA",
    step2: "Selecciona Tu Preocupación",
    step3: "Filtrar por Tipo",
    analyzing: "Creando tu rutina personalizada",
    yourType: "Tu Análisis",
    recommended: "Recomendados Para Ti",
    routine: "Tu Rutina",
    tips: "Consejos",
    viewProduct: "Ver",
    startOver: "Empezar de Nuevo",
    back: "Volver",
    next: "Obtener Recomendaciones",
    dontShowToday: "No mostrar hoy",
    close: "Cerrar",
    aiAdvisor: "Asesor de Belleza IA",
    skin: "Piel",
    body: "Cuerpo",
    hair: "Cabello",
    skinDesc: "Cuidado facial y rutina de skincare",
    bodyDesc: "Cuidado corporal e hidratación",
    hairDesc: "Tratamientos capilares y cuero cabelludo",
    skinLong: "Descubre tu tipo de piel y obtén una rutina personalizada con productos perfectos para ti.",
    bodyLong: "Encuentra los productos corporales adecuados para tus preocupaciones específicas.",
    hairLong: "Identifica tu tipo de cabello y cuero cabelludo para obtener recomendaciones expertas.",
  },
  de: {
    modalTitle: "KI-gestützte Empfehlungen",
    modalSubtitle: "Unser KI-Beauty-Berater empfiehlt perfekt auf Sie abgestimmte Produkte",
    sectionTitle: "Personalisierte Schönheit",
    sectionSubtitle: "KI-Empfehlungen",
    sectionDesc: "Entdecken Sie perfekt auf Ihre Bedürfnisse abgestimmte Produkte",
    step1: "Wählen Sie Ihren Typ",
    step1Sub: "Wählen Sie eine Kategorie für KI-gestützte Produktempfehlungen",
    step2: "Anliegen Wählen",
    step3: "Nach Produkttyp Filtern",
    analyzing: "Ihre persönliche Routine wird erstellt",
    yourType: "Ihre Analyse",
    recommended: "Für Sie Empfohlen",
    routine: "Ihre Routine",
    tips: "Expertentipps",
    viewProduct: "Ansehen",
    startOver: "Neu starten",
    back: "Zurück",
    next: "Empfehlungen erhalten",
    dontShowToday: "Heute nicht mehr anzeigen",
    close: "Schließen",
    aiAdvisor: "KI-Beauty-Berater",
    skin: "Haut",
    body: "Körper",
    hair: "Haar",
    skinDesc: "Gesichtspflege & Hautpflege-Routine",
    bodyDesc: "Körperpflege & Feuchtigkeit",
    hairDesc: "Haar- & Kopfhautbehandlungen",
    skinLong: "Entdecken Sie Ihren Hauttyp und erhalten Sie eine personalisierte Hautpflege-Routine.",
    bodyLong: "Finden Sie die richtigen Körperpflegeprodukte für Ihre spezifischen Anliegen.",
    hairLong: "Identifizieren Sie Ihren Haar- und Kopfhauttyp für fachkundige Empfehlungen.",
  },
  fr: {
    modalTitle: "Recommandations IA", modalSubtitle: "Notre conseiller beauté IA vous recommande les produits les plus adaptés",
    sectionTitle: "Beauté Personnalisée", sectionSubtitle: "Personnalisez Votre Routine", sectionDesc: "Découvrez les produits parfaitement adaptés à votre peau, corps et cheveux",
    step1: "Choisissez Votre Type", step1Sub: "Sélectionnez une catégorie pour obtenir des recommandations IA", step2: "Choisissez Votre Préoccupation", step3: "Filtrer par Type de Produit",
    analyzing: "Création de votre routine personnalisée", yourType: "Votre Analyse", recommended: "Recommandé Pour Vous", routine: "Ordre de Votre Routine", tips: "Conseils d’Expert", viewProduct: "Voir", startOver: "Recommencer", back: "Retour", next: "Obtenir mes Recommandations", dontShowToday: "Ne plus afficher aujourd’hui", close: "Fermer", aiAdvisor: "Conseiller Beauté IA",
    skin: "Peau", body: "Corps", hair: "Cheveux", skinDesc: "Soin visage & routine skincare", bodyDesc: "Soin corps & hydratation", hairDesc: "Soin cheveux & cuir chevelu", skinLong: "Découvrez votre type de peau et recevez une routine personnalisée.", bodyLong: "Trouvez les soins corps adaptés à vos besoins.", hairLong: "Identifiez votre type de cheveux et cuir chevelu pour des recommandations expertes.",
  },
  pt: {
    modalTitle: "Recomendações com IA", modalSubtitle: "Nosso consultor de beleza IA recomenda produtos perfeitos para você",
    sectionTitle: "Beleza Personalizada", sectionSubtitle: "Personalize Sua Rotina", sectionDesc: "Descubra produtos ideais para sua pele, corpo e cabelo",
    step1: "Escolha Seu Tipo", step1Sub: "Selecione uma categoria para receber recomendações com IA", step2: "Selecione Sua Preocupação", step3: "Filtrar por Tipo de Produto",
    analyzing: "Criando sua rotina personalizada", yourType: "Sua Análise", recommended: "Recomendado Para Você", routine: "Ordem da Rotina", tips: "Dicas de Especialista", viewProduct: "Ver", startOver: "Recomeçar", back: "Voltar", next: "Receber Recomendações", dontShowToday: "Não mostrar hoje", close: "Fechar", aiAdvisor: "Consultor de Beleza IA",
    skin: "Pele", body: "Corpo", hair: "Cabelo", skinDesc: "Cuidados faciais & skincare", bodyDesc: "Cuidados corporais & hidratação", hairDesc: "Tratamentos para cabelo & couro cabeludo", skinLong: "Descubra seu tipo de pele e receba uma rotina personalizada.", bodyLong: "Encontre produtos corporais certos para suas necessidades.", hairLong: "Identifique seu cabelo e couro cabeludo para recomendações de especialista.",
  },
  ja: {
    modalTitle: "AIパーソナル診断", modalSubtitle: "AIビューティーアドバイザーがあなたに合う商品をおすすめします",
    sectionTitle: "パーソナルビューティー", sectionSubtitle: "あなたのルーティンを作る", sectionDesc: "肌・ボディ・髪の悩みに合う商品を見つけましょう",
    step1: "タイプを選択", step1Sub: "カテゴリーを選ぶとAIがおすすめ商品を提案します", step2: "悩みを選択", step3: "商品タイプで絞り込み",
    analyzing: "あなた専用のルーティンを作成中", yourType: "診断結果", recommended: "おすすめ商品", routine: "使用順序", tips: "専門家のヒント", viewProduct: "見る", startOver: "最初から", back: "戻る", next: "おすすめを見る", dontShowToday: "今日は表示しない", close: "閉じる", aiAdvisor: "AIビューティーアドバイザー",
    skin: "スキン", body: "ボディ", hair: "ヘア", skinDesc: "フェイスケア＆スキンケアルーティン", bodyDesc: "ボディケア＆保湿", hairDesc: "ヘア＆頭皮ケア", skinLong: "肌タイプを診断し、あなたに合うスキンケアルーティンを提案します。", bodyLong: "ボディの悩みに合うケア商品を見つけましょう。", hairLong: "髪と頭皮タイプに合う専門的なおすすめを受け取れます。",
  },
  ar: {
    modalTitle: "توصيات ذكية", modalSubtitle: "مستشار الجمال بالذكاء الاصطناعي يرشح المنتجات الأنسب لك",
    sectionTitle: "جمالك المخصص", sectionSubtitle: "اصنعي روتينك", sectionDesc: "اكتشفي منتجات مناسبة لبشرتك وجسمك وشعرك",
    step1: "اختاري النوع", step1Sub: "اختاري فئة للحصول على توصيات مدعومة بالذكاء الاصطناعي", step2: "اختاري المشكلة", step3: "فلترة حسب نوع المنتج",
    analyzing: "يتم إعداد روتينك المخصص", yourType: "تحليلك", recommended: "موصى به لك", routine: "ترتيب الروتين", tips: "نصائح الخبراء", viewProduct: "عرض", startOver: "ابدأ من جديد", back: "رجوع", next: "احصل على التوصيات", dontShowToday: "لا تظهر اليوم", close: "إغلاق", aiAdvisor: "مستشار الجمال الذكي",
    skin: "البشرة", body: "الجسم", hair: "الشعر", skinDesc: "العناية بالوجه وروتين البشرة", bodyDesc: "العناية بالجسم والترطيب", hairDesc: "علاجات الشعر وفروة الرأس", skinLong: "اكتشفي نوع بشرتك واحصلي على روتين مخصص.", bodyLong: "اعثري على منتجات الجسم المناسبة لاحتياجاتك.", hairLong: "حددي نوع شعرك وفروة رأسك لتوصيات خبيرة.",
  },
};

// ── Component ──
interface BeautyConsultationProps {
  mode: "modal" | "section";
}

const BeautyConsultation = ({ mode }: BeautyConsultationProps) => {
  const { language, formatPrice } = useLanguage();
  const ct = cTexts[language] || cTexts.en;

  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState<Category | null>(null);
  const [concern, setConcern] = useState<string | null>(null);
  const [subCategory, setSubCategory] = useState<string>("All");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    if (mode === "modal") {
      const dismissed = localStorage.getItem("beauty-modal-dismiss-date");
      const today = new Date().toDateString();
      if (dismissed === today) return;
      const visited = sessionStorage.getItem("bloom-consulted");
      if (!visited) return;
    }
  }, [mode]);

  const handleDontShowToday = () => {
    localStorage.setItem("beauty-modal-dismiss-date", new Date().toDateString());
    setShowModal(false);
  };

  const reset = () => {
    setStep(0);
    setCategory(null);
    setConcern(null);
    setSubCategory("All");
    setResult(null);
  };

  // Public open method for floating button
  useEffect(() => {
    const handler = () => {
      reset();
      setShowModal(true);
    };
    window.addEventListener("open-beauty-advisor", handler);
    return () => window.removeEventListener("open-beauty-advisor", handler);
  }, []);

  const handleGetRecommendation = async () => {
    setStep(3);
    setLoading(true);
    sessionStorage.setItem("bloom-consulted", "true");

    try {
      const { data: prods } = await supabase.from("products").select("*").eq("is_active", true);
      setProducts(prods || []);

      const concernData = getConcerns(category!).find((c) => c.id === concern);

      const { data, error } = await supabase.functions.invoke("beauty-recommend", {
        body: {
          category,
          skinType: concernData?.label.en || concern,
          subCategory: category === "Skin" ? subCategory : null,
          products: prods || [],
          language,
        },
      });

      if (error) throw error;
      setResult(data);
      setStep(4);
    } catch (err) {
      console.error("Recommendation error:", err);
      setResult({
        typeExplanation: "We couldn't generate recommendations at this time. Please try again.",
        recommendations: [],
        routineOrder: [],
        generalTips: [],
      });
      setStep(4);
    } finally {
      setLoading(false);
    }
  };

  const localizedConcernLabel = (c: ConcernOption) => CONCERN_I18N[c.id]?.label?.[language] || c.label[language] || c.label.en;
  const localizedConcernDescription = (c: ConcernOption) => CONCERN_I18N[c.id]?.description?.[language] || c.description[language] || c.description.en;
  const localizedCategory = (cat: Category) => ct[cat.toLowerCase()] || cat;
  const localizedSubCategory = (sub: string) => SUBCAT_I18N[sub]?.[language] || sub;

  const concerns = category ? getConcerns(category) : [];

  const categoryMeta: Record<Category, { descKey: string; longKey: string }> = {
    Skin: { descKey: "skinDesc", longKey: "skinLong" },
    Body: { descKey: "bodyDesc", longKey: "bodyLong" },
    Hair: { descKey: "hairDesc", longKey: "hairLong" },
  };

  const renderContent = () => (
    <div className="space-y-6">
      {/* Step 0: Category — Large visual cards */}
      {step === 0 && (
        <div className="space-y-8">
          <div className="text-center space-y-3">
            <p className="text-sm font-sans tracking-[0.15em] uppercase text-primary font-bold">{ct.sectionSubtitle}</p>
            <h3 className="text-2xl md:text-4xl font-serif font-bold">{ct.step1}</h3>
            <p className="text-base md:text-lg text-foreground/80 font-medium">{ct.step1Sub}</p>
          </div>
          <div className="grid grid-cols-3 gap-2 md:gap-4 items-stretch">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setCategory(cat);
                  setStep(1);
                }}
                className="group flex flex-col h-full overflow-hidden bg-card border border-border/40 hover:border-primary/50 hover:shadow-elegant transition-all duration-500 text-left"
              >
                <div className="relative aspect-square w-full overflow-hidden bg-muted">
                  <img
                    src={categoryImages[cat]}
                    alt={cat}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="flex-1 flex flex-col justify-center px-1.5 py-2.5 md:px-4 md:py-4 text-center border-t border-border/20 min-h-[78px] md:min-h-[96px]">
                  <h4 className="text-[13px] md:text-xl font-serif font-bold leading-tight mb-1">{localizedCategory(cat)}</h4>
                  <p className="text-[10px] md:text-sm leading-tight text-foreground/75 font-medium">{ct[categoryMeta[cat].descKey]}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 1: Concern */}
      {step === 1 && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <button
              onClick={() => { setStep(0); setConcern(null); }}
              className="flex items-center gap-1.5 text-sm text-foreground/85 hover:text-foreground transition-colors tracking-wide uppercase"
            >
              <ArrowLeft className="h-3 w-3" /> {ct.back}
            </button>
            <p className="text-sm font-sans tracking-[0.18em] uppercase text-foreground/85">{ct.step2}</p>
            <div className="w-14" />
          </div>

          {/* Category header with image */}
          <div className="relative h-28 md:h-36 overflow-hidden mb-4">
            <img src={categoryImages[category!]} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-background/45 flex items-center justify-center backdrop-blur-[1px]">
              <div className="text-center">
                <h4 className="text-2xl font-serif font-light text-foreground">{localizedCategory(category!)}</h4>
                <p className="text-[12px] text-foreground/85 tracking-[0.2em] uppercase mt-1">{ct[categoryMeta[category!].descKey]}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {concerns.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setConcern(c.id);
                  if (category === "Skin") setStep(2);
                  else setStep(2);
                }}
                className="w-full text-left p-4 md:p-5 border border-border/40 bg-card hover:border-primary/30 hover:bg-primary/[0.02] transition-all duration-300 group"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1.5">
                    <p className="text-lg font-serif font-bold">{localizedConcernLabel(c)}</p>
                     <p className="text-base text-foreground/85 leading-relaxed">{localizedConcernDescription(c)}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary transition-colors flex-shrink-0 ml-3" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Sub-category or Confirm */}
      {step === 2 && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <button onClick={() => setStep(1)} className="flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors tracking-wider uppercase">
              <ArrowLeft className="h-3 w-3" /> {ct.back}
            </button>
            <p className="text-[13px] font-sans tracking-[0.25em] uppercase text-muted-foreground">{category === "Skin" ? ct.step3 : ct.step2}</p>
            <div className="w-14" />
          </div>

          {category === "Skin" ? (
            <div className="space-y-6">
              <div className="text-center py-4 border border-border/30 bg-muted/20">
                <p className="text-xs tracking-[0.12em] uppercase text-foreground/85 mb-1.5">{localizedCategory(category!)}</p>
                <p className="text-lg font-serif font-semibold">{(() => { const c = getConcerns(category!).find((x) => x.id === concern); return c ? localizedConcernLabel(c) : ""; })()}</p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {skinSubCategories.map((sub) => (
                  <button
                    key={sub}
                    onClick={() => setSubCategory(sub)}
                    className={`px-5 py-3 text-sm font-medium tracking-[0.1em] uppercase border transition-all duration-300 ${
                      subCategory === sub
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border/60 text-foreground/85 hover:border-primary/40 hover:text-primary"
                    }`}
                  >
                    {localizedSubCategory(sub)}
                  </button>
                ))}
              </div>
              <button
                onClick={handleGetRecommendation}
                className="w-full py-4 bg-primary text-primary-foreground text-sm font-semibold tracking-[0.12em] uppercase font-sans hover:bg-primary/90 transition-colors duration-300 flex items-center justify-center gap-2"
              >
                {ct.next} <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center py-6 border border-border/30 bg-muted/20">
                <p className="text-[12px] tracking-[0.15em] uppercase text-muted-foreground mb-1">{localizedCategory(category!)}</p>
                <p className="text-sm font-serif">{(() => { const c = getConcerns(category!).find((x) => x.id === concern); return c ? localizedConcernLabel(c) : ""; })()}</p>
              </div>
              <button
                onClick={handleGetRecommendation}
                className="w-full py-4 bg-primary text-primary-foreground text-sm font-semibold tracking-[0.12em] uppercase font-sans hover:bg-primary/90 transition-colors duration-300 flex items-center justify-center gap-2"
              >
                {ct.next} <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Loading */}
      {step === 3 && (
        <div className="flex flex-col items-center justify-center py-20 space-y-6">
          <div className="relative">
            <div className="w-20 h-20 border border-primary/20 rounded-full flex items-center justify-center">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
            </div>
            <div className="absolute inset-0 w-20 h-20 border border-primary/10 rounded-full animate-ping" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-base font-serif">{ct.analyzing}</p>
            <p className="text-[12px] text-muted-foreground tracking-[0.3em] uppercase">{ct.aiAdvisor}</p>
          </div>
        </div>
      )}

      {/* Step 4: Results */}
      {step === 4 && result && (
        <div className="space-y-8 max-h-[55dvh] overflow-y-auto pr-1 -webkit-overflow-scrolling-touch">
          {/* Type Analysis */}
          <div className="space-y-3 border-b border-border/30 pb-6">
            <p className="text-xs font-sans tracking-[0.18em] uppercase text-primary font-semibold">{ct.yourType}</p>
            <p className="text-base leading-relaxed text-foreground/85">{result.typeExplanation}</p>
          </div>

          {/* Routine Order */}
          {result.routineOrder && result.routineOrder.length > 0 && (
            <div className="space-y-4">
              <p className="text-xs font-sans tracking-[0.18em] uppercase text-primary font-semibold">{ct.routine}</p>
              <div className="space-y-2">
                {result.routineOrder.map((s: string, i: number) => (
                  <div key={i} className="flex items-start gap-4 p-3 bg-muted/30">
                    <span className="flex-shrink-0 w-7 h-7 border border-primary/20 text-primary text-[12px] flex items-center justify-center font-sans font-medium">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="text-xs leading-relaxed pt-1">{s}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Products */}
          {result.recommendations && result.recommendations.length > 0 && (
            <div className="space-y-4">
              <p className="text-xs font-sans tracking-[0.18em] uppercase text-primary font-semibold">{ct.recommended}</p>
              <div className="space-y-3">
                {result.recommendations.map((rec: any, i: number) => {
                  const matchedProduct = rec.productId ? products.find((p) => p.id === rec.productId) : null;
                  const displayName = matchedProduct ? getLocalizedProductName(matchedProduct, language) : rec.productName;
                  const displayBrand = matchedProduct ? getLocalizedBrand(matchedProduct, language) : "";
                  return (
                    <div key={i} className="border border-border/30 bg-card overflow-hidden">
                      <div className="flex gap-0">
                        {matchedProduct?.image_url && (
                          <Link to={`/products/${matchedProduct.slug}`} onClick={() => setShowModal(false)} className="flex-shrink-0">
                            <div className="w-20 h-20 md:w-24 md:h-24 bg-muted/50">
                              <img src={matchedProduct.image_url} alt={rec.productName} className="w-full h-full object-cover" />
                            </div>
                          </Link>
                        )}
                        <div className="flex-1 p-3 md:p-4 space-y-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-0.5">
                              {displayBrand && <p className="text-[9px] text-muted-foreground tracking-[0.15em] uppercase">{displayBrand}</p>}
                              <p className="text-sm font-serif font-medium leading-tight">{displayName}</p>
                              {rec.step && <p className="text-[9px] text-primary tracking-[0.15em] uppercase">{rec.step}</p>}
                            </div>
                            {matchedProduct && (
                              <Link to={`/products/${matchedProduct.slug}`} onClick={() => setShowModal(false)} className="flex-shrink-0">
                                <span className="text-[12px] tracking-[0.1em] uppercase text-primary hover:text-foreground transition-colors border-b border-primary/30 hover:border-foreground/30 pb-px">
                                  {ct.viewProduct}
                                </span>
                              </Link>
                            )}
                          </div>
                          <p className="text-[13px] text-muted-foreground leading-relaxed line-clamp-2">{rec.reason}</p>
                          {matchedProduct && (
                            <p className="text-xs font-sans font-medium text-foreground/85">{formatPrice(matchedProduct.price)}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tips */}
          {result.generalTips && result.generalTips.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-sans tracking-[0.18em] uppercase text-primary font-semibold">{ct.tips}</p>
              <div className="space-y-2">
                {result.generalTips.map((tip: string, i: number) => (
                  <div key={i} className="flex items-start gap-3 text-xs text-foreground/85 leading-relaxed">
                    <span className="flex-shrink-0 w-1 h-1 rounded-full bg-primary mt-1.5" />
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={reset}
            className="w-full py-3 border border-border/40 text-[13px] tracking-[0.2em] uppercase text-foreground/85 hover:text-foreground hover:border-foreground/30 transition-colors duration-300"
          >
            {ct.startOver}
          </button>
        </div>
      )}
    </div>
  );

  // ── Modal mode ──
  if (mode === "modal") {
    return (
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="w-[95vw] max-w-[800px] max-h-[90dvh] overflow-y-auto p-0 gap-0 rounded-none border border-primary/15 shadow-luxury [&>button]:hidden bg-background">
          {/* Header */}
          <div className="relative px-8 md:px-12 pt-12 pb-8 bg-gradient-to-b from-primary/8 to-transparent">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 text-muted-foreground hover:text-foreground transition-colors text-[12px] tracking-[0.2em] uppercase"
            >
              {ct.close}
            </button>
            <div className="text-center space-y-4">
              <p className="text-sm tracking-[0.25em] uppercase text-primary font-sans font-semibold">{ct.sectionSubtitle}</p>
              <h2 className="text-3xl md:text-4xl font-serif font-medium leading-tight">{ct.modalTitle}</h2>
              <p className="text-base md:text-lg text-foreground/75 leading-relaxed max-w-2xl mx-auto font-normal">{ct.modalSubtitle}</p>
            </div>
          </div>
          {/* Content */}
          <div className="px-8 md:px-12 pb-8">{renderContent()}</div>
          {/* Don't show today */}
          <div className="border-t border-primary/10 px-8 py-4 flex justify-center bg-primary/3">
            <button onClick={handleDontShowToday} className="text-sm text-foreground/85 hover:text-foreground transition-colors tracking-[0.06em] font-medium">
              {ct.dontShowToday}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // ── Section mode ──
  return (
    <section className="py-14 md:py-28 px-3 md:px-6 lg:px-8 bg-muted/20">
      <div className="container max-w-5xl px-0">
        <div className="text-center space-y-3 mb-10 md:mb-14 px-2">
          <p className="text-sm font-sans font-bold tracking-[0.15em] uppercase text-primary">{ct.sectionSubtitle}</p>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold">{ct.sectionTitle}</h2>
          <p className="text-base md:text-lg text-foreground/80 max-w-xl mx-auto font-medium">{ct.sectionDesc}</p>
        </div>

        <div className="bg-background border border-border/30 p-4 md:p-12 shadow-elegant">
          {renderContent()}
        </div>
      </div>
    </section>
  );
};

export default BeautyConsultation;
