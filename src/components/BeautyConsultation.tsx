import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X, Sparkles, ArrowRight, ArrowLeft, Loader2, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

// ── Beauty knowledge data ──
const categories = ["Skin", "Body", "Hair"] as const;
type Category = typeof categories[number];

const skinSubCategories = ["All", "Toner", "Lotion", "Cream", "Ample", "Pack"] as const;

interface ConcernOption {
  id: string;
  label: Record<string, string>;
  description: Record<string, string>;
}

const skinConcerns: ConcernOption[] = [
  {
    id: "oily",
    label: { en: "Oily Skin", ko: "지성 피부", es: "Piel Grasa", de: "Fettige Haut" },
    description: {
      en: "Shiny T-zone, enlarged pores, frequent breakouts, makeup slides off easily",
      ko: "T존 번들거림, 모공 확대, 잦은 트러블, 화장 무너짐이 잦음",
      es: "Zona T brillante, poros dilatados, brotes frecuentes",
      de: "Glänzende T-Zone, vergrößerte Poren, häufige Ausbrüche",
    },
  },
  {
    id: "dry",
    label: { en: "Dry Skin", ko: "건성 피부", es: "Piel Seca", de: "Trockene Haut" },
    description: {
      en: "Tightness after washing, flaking, rough texture, fine lines appear easily",
      ko: "세안 후 당김, 각질 일어남, 거친 피부결, 잔주름 쉽게 생김",
      es: "Tirantez después del lavado, descamación, textura áspera",
      de: "Spannungsgefühl nach dem Waschen, Schuppung, raue Textur",
    },
  },
  {
    id: "combination",
    label: { en: "Combination Skin", ko: "수부지 (복합성)", es: "Piel Mixta", de: "Mischhaut" },
    description: {
      en: "Oily T-zone but dry cheeks, different needs in different areas, seasonal changes",
      ko: "T존은 기름지고 볼은 건조, 부위별 다른 피부 상태, 환절기 변화 큼",
      es: "Zona T grasa pero mejillas secas, necesidades diferentes por zona",
      de: "Fettige T-Zone aber trockene Wangen, unterschiedliche Bedürfnisse",
    },
  },
  {
    id: "sensitive",
    label: { en: "Sensitive Skin", ko: "민감성 피부", es: "Piel Sensible", de: "Empfindliche Haut" },
    description: {
      en: "Redness, stinging with new products, easily irritated, reactive to weather changes",
      ko: "붉은기, 새 제품 사용 시 따가움, 쉽게 자극받음, 날씨 변화에 민감",
      es: "Enrojecimiento, ardor con productos nuevos, fácilmente irritada",
      de: "Rötungen, Stechen bei neuen Produkten, leicht reizbar",
    },
  },
  {
    id: "acne",
    label: { en: "Acne-Prone", ko: "여드름성 피부", es: "Piel con Acné", de: "Akne-anfällige Haut" },
    description: {
      en: "Frequent pimples, blackheads/whiteheads, post-acne marks, clogged pores",
      ko: "잦은 여드름, 블랙헤드/화이트헤드, 여드름 자국, 모공 막힘",
      es: "Granos frecuentes, puntos negros, marcas post-acné",
      de: "Häufige Pickel, Mitesser, Aknenarben, verstopfte Poren",
    },
  },
  {
    id: "aging",
    label: { en: "Anti-Aging", ko: "노화 피부", es: "Anti-Envejecimiento", de: "Anti-Aging" },
    description: {
      en: "Fine lines and wrinkles, loss of elasticity, dullness, age spots",
      ko: "잔주름과 주름, 탄력 저하, 칙칙한 피부톤, 기미/잡티",
      es: "Líneas finas y arrugas, pérdida de elasticidad, manchas",
      de: "Feine Linien und Falten, Elastizitätsverlust, Altersflecken",
    },
  },
];

const bodyConcerns: ConcernOption[] = [
  {
    id: "body_dry",
    label: { en: "Dry Body Skin", ko: "바디 건성", es: "Piel Corporal Seca", de: "Trockene Körperhaut" },
    description: {
      en: "Itchy and flaky skin, rough elbows/knees, tightness after shower",
      ko: "가렵고 각질 일어남, 팔꿈치/무릎 거침, 샤워 후 당김",
      es: "Piel con picazón y descamación, codos/rodillas ásperos",
      de: "Juckende und schuppige Haut, raue Ellbogen/Knie",
    },
  },
  {
    id: "body_acne",
    label: { en: "Body Troubles", ko: "바디 트러블", es: "Problemas Corporales", de: "Körperprobleme" },
    description: {
      en: "Back acne, chest breakouts, ingrown hairs, body bumps",
      ko: "등 여드름, 가슴 트러블, 인그로운 헤어, 닭살 피부",
      es: "Acné en espalda, brotes en pecho, vellos encarnados",
      de: "Rückenakne, Brustausbrüche, eingewachsene Haare",
    },
  },
  {
    id: "body_firming",
    label: { en: "Firming & Tone", ko: "탄력 & 톤업", es: "Firmeza y Tono", de: "Straffung & Tonung" },
    description: {
      en: "Loss of skin firmness, uneven skin tone, cellulite concerns",
      ko: "피부 탄력 저하, 불균일한 피부톤, 셀룰라이트 고민",
      es: "Pérdida de firmeza, tono desigual, preocupaciones de celulitis",
      de: "Verlust der Hautfestigkeit, ungleichmäßiger Hautton, Cellulite",
    },
  },
  {
    id: "body_moisture",
    label: { en: "Deep Moisture", ko: "집중 보습", es: "Hidratación Profunda", de: "Tiefe Feuchtigkeit" },
    description: {
      en: "Extremely dehydrated skin, cracking, needs intensive hydration care",
      ko: "극도로 건조한 피부, 갈라짐, 집중적인 수분 케어 필요",
      es: "Piel extremadamente deshidratada, agrietamiento",
      de: "Extrem dehydrierte Haut, Rissbildung, intensive Feuchtigkeitspflege",
    },
  },
];

const hairConcerns: ConcernOption[] = [
  {
    id: "hair_dandruff",
    label: { en: "Dandruff", ko: "비듬", es: "Caspa", de: "Schuppen" },
    description: {
      en: "White flakes on shoulders, itchy scalp, dry or oily scalp causing flaking",
      ko: "어깨에 하얀 각질, 두피 가려움, 건성/지성 두피로 인한 각질",
      es: "Escamas blancas en los hombros, cuero cabelludo con picazón",
      de: "Weiße Flocken auf den Schultern, juckende Kopfhaut",
    },
  },
  {
    id: "hair_dry",
    label: { en: "Dry Hair", ko: "건성 모발", es: "Cabello Seco", de: "Trockenes Haar" },
    description: {
      en: "Straw-like texture, frizzy, lacks shine, tangled easily",
      ko: "뻣뻣한 질감, 곱슬곱슬, 윤기 없음, 쉽게 엉킴",
      es: "Textura como paja, encrespado, sin brillo, se enreda fácilmente",
      de: "Strohige Textur, kraus, glanzlos, verknotet leicht",
    },
  },
  {
    id: "hair_oily",
    label: { en: "Oily Scalp", ko: "지성 두피", es: "Cuero Cabelludo Graso", de: "Fettige Kopfhaut" },
    description: {
      en: "Greasy roots by afternoon, flat/limp hair, needs frequent washing",
      ko: "오후면 기름지는 두피, 볼륨 없는 납작한 모발, 잦은 세정 필요",
      es: "Raíces grasas por la tarde, cabello lacio y sin volumen",
      de: "Fettige Ansätze am Nachmittag, plattes Haar, häufiges Waschen nötig",
    },
  },
  {
    id: "hair_damaged",
    label: { en: "Damaged Hair", ko: "손상 모발", es: "Cabello Dañado", de: "Geschädigtes Haar" },
    description: {
      en: "Split ends, breakage, color/heat damage, lacks elasticity",
      ko: "갈라진 끝, 끊어짐, 염색/열 손상, 탄력 없음",
      es: "Puntas abiertas, rotura, daño por color/calor, sin elasticidad",
      de: "Spliss, Bruch, Farb-/Hitzeschäden, mangelnde Elastizität",
    },
  },
  {
    id: "hair_loss",
    label: { en: "Hair Loss", ko: "탈모 고민", es: "Caída del Cabello", de: "Haarausfall" },
    description: {
      en: "Thinning hair, excessive shedding, receding hairline, weak roots",
      ko: "가늘어지는 모발, 과도한 빠짐, 이마선 후퇴, 약한 모근",
      es: "Cabello adelgazado, caída excesiva, línea de cabello retrocediendo",
      de: "Dünner werdendes Haar, übermäßiger Haarausfall, zurückweichender Haaransatz",
    },
  },
];

const getConcerns = (cat: Category) => {
  if (cat === "Skin") return skinConcerns;
  if (cat === "Body") return bodyConcerns;
  return hairConcerns;
};

// ── Translations for consultation UI ──
const cTexts = {
  en: {
    modalTitle: "Find Your Perfect Match",
    modalSubtitle: "Let our AI beauty expert analyze your needs and recommend the perfect products for you",
    sectionTitle: "Personalized Beauty",
    sectionSubtitle: "AI-Powered Consultation",
    sectionDesc: "Discover products perfectly matched to your unique skin, body, and hair needs",
    startBtn: "Start Consultation",
    step1: "Choose Your Category",
    step2: "Select Your Concern",
    step3: "Filter by Product Type",
    analyzing: "Analyzing your beauty profile...",
    yourType: "Your Type Analysis",
    recommended: "Recommended Products",
    routine: "Your Routine Order",
    tips: "Expert Tips",
    viewProduct: "View Product",
    startOver: "Start Over",
    noProducts: "No specific products matched, but here are our expert recommendations:",
    back: "Back",
    next: "Get Recommendations",
  },
  ko: {
    modalTitle: "나에게 맞는 제품 찾기",
    modalSubtitle: "AI 뷰티 전문가가 당신의 피부를 분석하고 완벽한 제품을 추천해드립니다",
    sectionTitle: "맞춤형 뷰티",
    sectionSubtitle: "AI 맞춤 상담",
    sectionDesc: "당신만의 피부, 바디, 헤어 고민에 완벽하게 맞는 제품을 발견하세요",
    startBtn: "상담 시작",
    step1: "카테고리 선택",
    step2: "고민 유형 선택",
    step3: "제품 유형 필터",
    analyzing: "뷰티 프로필을 분석하고 있습니다...",
    yourType: "타입 분석 결과",
    recommended: "추천 제품",
    routine: "사용 순서",
    tips: "전문가 팁",
    viewProduct: "제품 보기",
    startOver: "다시 시작",
    noProducts: "정확히 일치하는 제품은 없지만, 전문가 추천입니다:",
    back: "뒤로",
    next: "추천받기",
  },
  es: {
    modalTitle: "Encuentra Tu Combinación Perfecta",
    modalSubtitle: "Nuestro experto AI analizará tus necesidades y te recomendará los productos perfectos",
    sectionTitle: "Belleza Personalizada",
    sectionSubtitle: "Consulta con IA",
    sectionDesc: "Descubre productos perfectamente adaptados a tus necesidades únicas",
    startBtn: "Iniciar Consulta",
    step1: "Elige Tu Categoría",
    step2: "Selecciona Tu Preocupación",
    step3: "Filtrar por Tipo de Producto",
    analyzing: "Analizando tu perfil de belleza...",
    yourType: "Análisis de Tu Tipo",
    recommended: "Productos Recomendados",
    routine: "Tu Orden de Rutina",
    tips: "Consejos de Expertos",
    viewProduct: "Ver Producto",
    startOver: "Empezar de Nuevo",
    noProducts: "No hay productos específicos, pero aquí están nuestras recomendaciones:",
    back: "Volver",
    next: "Obtener Recomendaciones",
  },
  de: {
    modalTitle: "Finde Dein Perfektes Match",
    modalSubtitle: "Unser KI-Beauty-Experte analysiert Ihre Bedürfnisse und empfiehlt die perfekten Produkte",
    sectionTitle: "Personalisierte Schönheit",
    sectionSubtitle: "KI-gestützte Beratung",
    sectionDesc: "Entdecken Sie perfekt auf Ihre Bedürfnisse abgestimmte Produkte",
    startBtn: "Beratung starten",
    step1: "Wählen Sie Ihre Kategorie",
    step2: "Wählen Sie Ihr Anliegen",
    step3: "Nach Produkttyp filtern",
    analyzing: "Ihr Beauty-Profil wird analysiert...",
    yourType: "Ihre Typ-Analyse",
    recommended: "Empfohlene Produkte",
    routine: "Ihre Routine-Reihenfolge",
    tips: "Expertentipps",
    viewProduct: "Produkt ansehen",
    startOver: "Neu starten",
    noProducts: "Keine spezifischen Produkte, aber hier sind unsere Empfehlungen:",
    back: "Zurück",
    next: "Empfehlungen erhalten",
  },
};

// ── Component ──
interface BeautyConsultationProps {
  mode: "modal" | "section";
}

const BeautyConsultation = ({ mode }: BeautyConsultationProps) => {
  const { language } = useLanguage();
  const ct = cTexts[language] || cTexts.en;

  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(0); // 0=category, 1=concern, 2=subcat(skin only), 3=loading, 4=results
  const [category, setCategory] = useState<Category | null>(null);
  const [concern, setConcern] = useState<string | null>(null);
  const [subCategory, setSubCategory] = useState<string>("All");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);

  // Show modal on first visit
  useEffect(() => {
    if (mode === "modal") {
      const visited = sessionStorage.getItem("bloom-consulted");
      if (!visited) {
        const timer = setTimeout(() => setShowModal(true), 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [mode]);

  const reset = () => {
    setStep(0);
    setCategory(null);
    setConcern(null);
    setSubCategory("All");
    setResult(null);
  };

  const handleGetRecommendation = async () => {
    setStep(3);
    setLoading(true);
    sessionStorage.setItem("bloom-consulted", "true");

    try {
      // Fetch products
      const { data: prods } = await supabase.from("products").select("*").eq("is_active", true);
      setProducts(prods || []);

      const concernData = getConcerns(category!).find(c => c.id === concern);

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

  const concerns = category ? getConcerns(category) : [];

  const renderContent = () => (
    <div className="space-y-6">
      {/* Step 0: Category Selection */}
      {step === 0 && (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <p className="text-xs font-sans tracking-[0.3em] uppercase text-muted-foreground">{ct.step1}</p>
          </div>
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => { setCategory(cat); setStep(1); }}
                className="group relative p-6 md:p-8 border border-border rounded-sm hover:border-primary/50 transition-all duration-300 text-center"
              >
                <div className="text-2xl md:text-3xl mb-3">
                  {cat === "Skin" ? "🧴" : cat === "Body" ? "🧖" : "💇"}
                </div>
                <p className="text-sm md:text-base font-serif font-medium">{cat}</p>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-0 group-hover:w-8 h-px bg-primary transition-all duration-300" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 1: Concern Selection */}
      {step === 1 && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <button onClick={() => { setStep(0); setConcern(null); }} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-3 w-3" /> {ct.back}
            </button>
            <p className="text-xs font-sans tracking-[0.3em] uppercase text-muted-foreground">{ct.step2}</p>
            <div className="w-12" />
          </div>
          <div className="space-y-2">
            {concerns.map(c => (
              <button
                key={c.id}
                onClick={() => {
                  setConcern(c.id);
                  if (category === "Skin") setStep(2);
                  else { setStep(2); /* skip to get rec for body/hair */ }
                }}
                className={`w-full text-left p-4 border rounded-sm transition-all duration-200 hover:border-primary/50 ${
                  concern === c.id ? "border-primary bg-primary/5" : "border-border"
                }`}
              >
                <p className="text-sm font-medium font-serif mb-1">{c.label[language] || c.label.en}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{c.description[language] || c.description.en}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Sub-category (Skin) or Confirm (Body/Hair) */}
      {step === 2 && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <button onClick={() => setStep(1)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-3 w-3" /> {ct.back}
            </button>
            <p className="text-xs font-sans tracking-[0.3em] uppercase text-muted-foreground">
              {category === "Skin" ? ct.step3 : ct.step2}
            </p>
            <div className="w-12" />
          </div>

          {category === "Skin" ? (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 justify-center">
                {skinSubCategories.map(sub => (
                  <button
                    key={sub}
                    onClick={() => setSubCategory(sub)}
                    className={`px-4 py-2 text-xs tracking-wider uppercase border rounded-sm transition-all ${
                      subCategory === sub
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-foreground/70 hover:border-primary/50"
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
              <Button
                onClick={handleGetRecommendation}
                className="w-full rounded-none py-5 text-xs tracking-wider uppercase gap-2"
              >
                <Sparkles className="h-3.5 w-3.5" /> {ct.next}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">
                  {getConcerns(category!).find(c => c.id === concern)?.label[language] || ""}
                </p>
              </div>
              <Button
                onClick={handleGetRecommendation}
                className="w-full rounded-none py-5 text-xs tracking-wider uppercase gap-2"
              >
                <Sparkles className="h-3.5 w-3.5" /> {ct.next}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Loading */}
      {step === 3 && (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground font-sans">{ct.analyzing}</p>
        </div>
      )}

      {/* Step 4: Results */}
      {step === 4 && result && (
        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-1">
          {/* Type Analysis */}
          <div className="space-y-2">
            <p className="text-xs font-sans tracking-[0.2em] uppercase text-primary font-medium">{ct.yourType}</p>
            <p className="text-sm leading-relaxed text-foreground/80">{result.typeExplanation}</p>
          </div>

          {/* Routine Order (Skin only) */}
          {result.routineOrder && result.routineOrder.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-sans tracking-[0.2em] uppercase text-primary font-medium">{ct.routine}</p>
              <div className="space-y-1.5">
                {result.routineOrder.map((step: string, i: number) => (
                  <div key={i} className="flex items-start gap-3 p-2.5 bg-muted/50 rounded-sm">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary text-xs flex items-center justify-center rounded-full font-medium">
                      {i + 1}
                    </span>
                    <p className="text-xs leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Products */}
          {result.recommendations && result.recommendations.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-sans tracking-[0.2em] uppercase text-primary font-medium">{ct.recommended}</p>
              <div className="space-y-2">
                {result.recommendations.map((rec: any, i: number) => {
                  const matchedProduct = rec.productId ? products.find(p => p.id === rec.productId) : null;
                  return (
                    <div key={i} className="border border-border rounded-sm p-3 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium font-serif">{rec.productName}</p>
                          {rec.step && <p className="text-[10px] text-primary uppercase tracking-wider">{rec.step}</p>}
                        </div>
                        {matchedProduct && (
                          <Link
                            to={`/products/${matchedProduct.slug}`}
                            onClick={() => setShowModal(false)}
                            className="flex-shrink-0"
                          >
                            <Button variant="outline" size="sm" className="rounded-none text-[10px] tracking-wider uppercase gap-1 h-7">
                              {ct.viewProduct} <ChevronRight className="h-3 w-3" />
                            </Button>
                          </Link>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{rec.reason}</p>
                      {rec.usageTip && (
                        <p className="text-xs text-foreground/60 italic">💡 {rec.usageTip}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tips */}
          {result.generalTips && result.generalTips.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-sans tracking-[0.2em] uppercase text-primary font-medium">{ct.tips}</p>
              <ul className="space-y-1.5">
                {result.generalTips.map((tip: string, i: number) => (
                  <li key={i} className="text-xs text-foreground/70 leading-relaxed flex items-start gap-2">
                    <span className="text-primary mt-0.5">✦</span> {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Button onClick={reset} variant="outline" className="w-full rounded-none text-xs tracking-wider uppercase">
            {ct.startOver}
          </Button>
        </div>
      )}
    </div>
  );

  // ── Modal mode ──
  if (mode === "modal") {
    return (
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-[500px] p-0 gap-0 rounded-none border-none overflow-hidden">
          <div className="p-6 pb-0">
            <div className="text-center space-y-2 mb-6">
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h2 className="text-xl font-serif font-light">{ct.modalTitle}</h2>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">{ct.modalSubtitle}</p>
            </div>
          </div>
          <div className="p-6 pt-0">
            {renderContent()}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // ── Section mode (embedded on homepage) ──
  return (
    <section className="py-20 md:py-28 px-4 md:px-6 lg:px-8 bg-muted/30">
      <div className="container max-w-4xl">
        <div className="text-center space-y-3 mb-12">
          <p className="text-xs font-sans font-medium tracking-[0.3em] uppercase text-muted-foreground">
            {ct.sectionSubtitle}
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-light">{ct.sectionTitle}</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">{ct.sectionDesc}</p>
        </div>

        <div className="bg-background border border-border p-6 md:p-10 shadow-soft">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Sparkles className="h-4 w-4 text-primary" />
            <p className="text-xs tracking-[0.2em] uppercase text-primary font-medium">AI Beauty Advisor</p>
          </div>
          {renderContent()}
        </div>
      </div>
    </section>
  );
};

export default BeautyConsultation;
