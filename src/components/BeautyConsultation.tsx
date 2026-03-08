import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
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
  { id: "oily", label: { en: "Oily Skin", ko: "지성 피부", es: "Piel Grasa", de: "Fettige Haut" }, description: { en: "Shiny T-zone, enlarged pores, frequent breakouts", ko: "T존 번들거림, 모공 확대, 잦은 트러블", es: "Zona T brillante, poros dilatados", de: "Glänzende T-Zone, vergrößerte Poren" } },
  { id: "dry", label: { en: "Dry Skin", ko: "건성 피부", es: "Piel Seca", de: "Trockene Haut" }, description: { en: "Tightness after washing, flaking, rough texture", ko: "세안 후 당김, 각질, 거친 피부결", es: "Tirantez después del lavado, descamación", de: "Spannungsgefühl, Schuppung, raue Textur" } },
  { id: "combination", label: { en: "Combination Skin", ko: "수부지 (복합성)", es: "Piel Mixta", de: "Mischhaut" }, description: { en: "Oily T-zone but dry cheeks", ko: "T존은 기름지고 볼은 건조", es: "Zona T grasa pero mejillas secas", de: "Fettige T-Zone aber trockene Wangen" } },
  { id: "sensitive", label: { en: "Sensitive Skin", ko: "민감성 피부", es: "Piel Sensible", de: "Empfindliche Haut" }, description: { en: "Redness, stinging with new products", ko: "붉은기, 새 제품 사용 시 따가움", es: "Enrojecimiento, ardor con productos nuevos", de: "Rötungen, Stechen bei neuen Produkten" } },
  { id: "acne", label: { en: "Acne-Prone", ko: "여드름성 피부", es: "Piel con Acné", de: "Akne-anfällige Haut" }, description: { en: "Frequent pimples, blackheads, post-acne marks", ko: "잦은 여드름, 블랙헤드, 여드름 자국", es: "Granos frecuentes, puntos negros", de: "Häufige Pickel, Mitesser, Aknenarben" } },
  { id: "aging", label: { en: "Anti-Aging", ko: "노화 피부", es: "Anti-Envejecimiento", de: "Anti-Aging" }, description: { en: "Fine lines, loss of elasticity, dullness", ko: "잔주름, 탄력 저하, 칙칙한 피부톤", es: "Líneas finas, pérdida de elasticidad", de: "Feine Linien, Elastizitätsverlust" } },
];

const bodyConcerns: ConcernOption[] = [
  { id: "body_dry", label: { en: "Dry Body Skin", ko: "바디 건성", es: "Piel Corporal Seca", de: "Trockene Körperhaut" }, description: { en: "Itchy and flaky skin, rough elbows/knees", ko: "가렵고 각질, 팔꿈치/무릎 거침", es: "Piel con picazón y descamación", de: "Juckende und schuppige Haut" } },
  { id: "body_acne", label: { en: "Body Troubles", ko: "바디 트러블", es: "Problemas Corporales", de: "Körperprobleme" }, description: { en: "Back acne, chest breakouts, body bumps", ko: "등 여드름, 가슴 트러블, 닭살", es: "Acné en espalda, brotes en pecho", de: "Rückenakne, Brustausbrüche" } },
  { id: "body_firming", label: { en: "Firming & Tone", ko: "탄력 & 톤업", es: "Firmeza y Tono", de: "Straffung & Tonung" }, description: { en: "Loss of firmness, uneven skin tone", ko: "탄력 저하, 불균일한 피부톤", es: "Pérdida de firmeza, tono desigual", de: "Verlust der Hautfestigkeit" } },
  { id: "body_moisture", label: { en: "Deep Moisture", ko: "집중 보습", es: "Hidratación Profunda", de: "Tiefe Feuchtigkeit" }, description: { en: "Extremely dehydrated, cracking skin", ko: "극도로 건조, 갈라짐", es: "Piel extremadamente deshidratada", de: "Extrem dehydrierte Haut" } },
];

const hairConcerns: ConcernOption[] = [
  { id: "hair_dandruff", label: { en: "Dandruff", ko: "비듬", es: "Caspa", de: "Schuppen" }, description: { en: "White flakes, itchy scalp", ko: "하얀 각질, 두피 가려움", es: "Escamas blancas, picazón", de: "Weiße Flocken, juckende Kopfhaut" } },
  { id: "hair_dry", label: { en: "Dry Hair", ko: "건성 모발", es: "Cabello Seco", de: "Trockenes Haar" }, description: { en: "Straw-like texture, frizzy, lacks shine", ko: "뻣뻣한 질감, 윤기 없음", es: "Textura como paja, sin brillo", de: "Strohige Textur, glanzlos" } },
  { id: "hair_oily", label: { en: "Oily Scalp", ko: "지성 두피", es: "Cuero Cabelludo Graso", de: "Fettige Kopfhaut" }, description: { en: "Greasy roots, flat hair", ko: "기름지는 두피, 납작한 모발", es: "Raíces grasas, sin volumen", de: "Fettige Ansätze, plattes Haar" } },
  { id: "hair_damaged", label: { en: "Damaged Hair", ko: "손상 모발", es: "Cabello Dañado", de: "Geschädigtes Haar" }, description: { en: "Split ends, breakage, color damage", ko: "갈라진 끝, 끊어짐, 염색 손상", es: "Puntas abiertas, rotura", de: "Spliss, Bruch, Farbschäden" } },
  { id: "hair_loss", label: { en: "Hair Loss", ko: "탈모 고민", es: "Caída del Cabello", de: "Haarausfall" }, description: { en: "Thinning hair, excessive shedding", ko: "가늘어지는 모발, 과도한 빠짐", es: "Cabello adelgazado, caída excesiva", de: "Dünner werdendes Haar" } },
];

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
    skin: "Skin", body: "Body", hair: "Hair",
    skinDesc: "Face care & skincare routine",
    bodyDesc: "Body care & hydration",
    hairDesc: "Hair & scalp treatments",
  },
  ko: {
    modalTitle: "AI 맞춤 추천",
    modalSubtitle: "AI 뷰티 어드바이저가 당신에게 딱 맞는 제품을 추천합니다",
    sectionTitle: "맞춤형 뷰티",
    sectionSubtitle: "AI 맞춤 추천",
    sectionDesc: "당신만의 피부, 바디, 헤어 고민에 완벽하게 맞는 제품을 발견하세요",
    step1: "타입을 선택하세요",
    step1Sub: "AI가 맞춤 제품을 추천해 드립니다",
    step2: "고민 유형 선택",
    step3: "제품 유형 필터",
    analyzing: "맞춤 루틴을 설계하고 있습니다",
    yourType: "분석 결과",
    recommended: "맞춤 추천 제품",
    routine: "사용 순서",
    tips: "전문가 팁",
    viewProduct: "보기",
    startOver: "다시 시작",
    back: "뒤로",
    next: "추천받기",
    dontShowToday: "오늘 하루 보지 않기",
    skin: "Skin", body: "Body", hair: "Hair",
    skinDesc: "페이스 케어 & 스킨케어 루틴",
    bodyDesc: "바디 케어 & 보습",
    hairDesc: "헤어 & 두피 관리",
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
    skin: "Skin", body: "Body", hair: "Hair",
    skinDesc: "Cuidado facial y rutina de skincare",
    bodyDesc: "Cuidado corporal e hidratación",
    hairDesc: "Tratamientos capilares",
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
    skin: "Skin", body: "Body", hair: "Hair",
    skinDesc: "Gesichtspflege & Hautpflege-Routine",
    bodyDesc: "Körperpflege & Feuchtigkeit",
    hairDesc: "Haar- & Kopfhautbehandlungen",
  },
};

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
      if (!visited) {
        const timer = setTimeout(() => setShowModal(true), 3000);
        return () => clearTimeout(timer);
      }
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

  useEffect(() => {
    const handler = () => { reset(); setShowModal(true); };
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

  const concerns = category ? getConcerns(category) : [];

  const categoryMeta: Record<Category, { descKey: string }> = {
    Skin: { descKey: "skinDesc" },
    Body: { descKey: "bodyDesc" },
    Hair: { descKey: "hairDesc" },
  };

  const renderContent = () => (
    <div className="space-y-6">
      {/* Step 0: Category */}
      {step === 0 && (
        <div className="space-y-8">
          <div className="text-center space-y-3">
            <p className="text-[10px] font-sans font-light tracking-[0.25em] uppercase text-accent">Personalize Your Routine</p>
            <h3 className="text-2xl md:text-3xl font-serif font-normal tracking-wide">{ct.step1}</h3>
            <p className="text-sm text-muted-foreground font-light">{ct.step1Sub}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => { setCategory(cat); setStep(1); }}
                className="group relative overflow-hidden border border-border/30 hover:border-accent/40 transition-all duration-500"
              >
                <div className="aspect-[3/4] overflow-hidden">
                  <img src={categoryImages[cat]} alt={cat} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                </div>
                <div className="p-4 text-center border-t border-border/20">
                  <h4 className="text-base font-serif font-normal tracking-wide mb-1">{ct[`${cat.toLowerCase()}` as keyof typeof ct] || cat}</h4>
                  <p className="text-xs text-muted-foreground font-light">{ct[categoryMeta[cat].descKey]}</p>
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
            <button onClick={() => { setStep(0); setConcern(null); }} className="link-underline flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors tracking-[0.15em] uppercase font-light">
              <ArrowLeft className="h-3 w-3" /> {ct.back}
            </button>
            <p className="text-[10px] font-sans tracking-[0.2em] uppercase text-muted-foreground font-light">{ct.step2}</p>
            <div className="w-14" />
          </div>

          <div className="relative h-24 md:h-32 overflow-hidden">
            <img src={categoryImages[category!]} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-foreground/50 flex items-center justify-center">
              <div className="text-center">
                <h4 className="text-xl font-serif font-normal text-primary-foreground tracking-wide">{category}</h4>
                <p className="text-[9px] text-primary-foreground/50 tracking-[0.2em] uppercase mt-1 font-light">{ct[categoryMeta[category!].descKey]}</p>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            {concerns.map((c) => (
              <button
                key={c.id}
                onClick={() => { setConcern(c.id); setStep(2); }}
                className="w-full text-left p-4 border border-border/30 hover:border-accent/30 transition-all duration-300 group"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-serif font-normal tracking-wide">{c.label[language] || c.label.en}</p>
                    <p className="text-xs text-muted-foreground font-light leading-relaxed">{c.description[language] || c.description.en}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-border group-hover:text-accent transition-colors flex-shrink-0 ml-3" />
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
            <button onClick={() => setStep(1)} className="flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors tracking-[0.15em] uppercase font-light">
              <ArrowLeft className="h-3 w-3" /> {ct.back}
            </button>
            <p className="text-[10px] font-sans tracking-[0.2em] uppercase text-muted-foreground font-light">{category === "Skin" ? ct.step3 : ct.step2}</p>
            <div className="w-14" />
          </div>

          {category === "Skin" ? (
            <div className="space-y-6">
              <div className="text-center py-4 border border-border/20">
                <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-1 font-light">{category}</p>
                <p className="text-base font-serif font-normal">{getConcerns(category!).find((c) => c.id === concern)?.label[language] || ""}</p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {skinSubCategories.map((sub) => (
                  <button
                    key={sub}
                    onClick={() => setSubCategory(sub)}
                    className={`px-5 py-3 text-xs font-light tracking-[0.12em] uppercase border transition-all duration-300 ${
                      subCategory === sub
                        ? "border-foreground bg-foreground text-primary-foreground"
                        : "border-border/40 text-muted-foreground hover:border-accent/40"
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
              <button
                onClick={handleGetRecommendation}
                className="w-full py-4 bg-foreground text-primary-foreground text-xs font-light tracking-[0.15em] uppercase font-sans hover:bg-foreground/90 transition-colors duration-300 flex items-center justify-center gap-2"
              >
                {ct.next} <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center py-6 border border-border/20">
                <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-1 font-light">{category}</p>
                <p className="text-sm font-serif font-normal">{getConcerns(category!).find((c) => c.id === concern)?.label[language] || ""}</p>
              </div>
              <button
                onClick={handleGetRecommendation}
                className="w-full py-4 bg-foreground text-primary-foreground text-xs font-light tracking-[0.15em] uppercase font-sans hover:bg-foreground/90 transition-colors duration-300 flex items-center justify-center gap-2"
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
            <div className="w-16 h-16 border border-accent/20 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-accent" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <p className="text-base font-serif font-normal">{ct.analyzing}</p>
            <p className="text-[9px] text-muted-foreground tracking-[0.3em] uppercase font-light">AI Beauty Advisor</p>
          </div>
        </div>
      )}

      {/* Step 4: Results */}
      {step === 4 && result && (
        <div className="space-y-8 max-h-[55dvh] overflow-y-auto pr-1" style={{ WebkitOverflowScrolling: 'touch' as any }}>
          <div className="space-y-3 border-b border-border/20 pb-6">
            <p className="text-[10px] font-sans tracking-[0.2em] uppercase text-accent font-light">{ct.yourType}</p>
            <p className="text-sm leading-relaxed text-foreground/80 font-light">{result.typeExplanation}</p>
          </div>

          {result.routineOrder && result.routineOrder.length > 0 && (
            <div className="space-y-4">
              <p className="text-[10px] font-sans tracking-[0.2em] uppercase text-accent font-light">{ct.routine}</p>
              <div className="space-y-1.5">
                {result.routineOrder.map((s: string, i: number) => (
                  <div key={i} className="flex items-start gap-4 p-3 border border-border/15">
                    <span className="flex-shrink-0 w-6 h-6 border border-accent/20 text-accent text-[9px] flex items-center justify-center font-sans font-light">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="text-xs leading-relaxed pt-0.5 font-light">{s}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.recommendations && result.recommendations.length > 0 && (
            <div className="space-y-4">
              <p className="text-[10px] font-sans tracking-[0.2em] uppercase text-accent font-light">{ct.recommended}</p>
              <div className="space-y-2">
                {result.recommendations.map((rec: any, i: number) => {
                  const matchedProduct = rec.productId ? products.find((p) => p.id === rec.productId) : null;
                  return (
                    <div key={i} className="border border-border/20 overflow-hidden">
                      <div className="flex gap-0">
                        {matchedProduct?.image_url && (
                          <Link to={`/products/${matchedProduct.slug}`} onClick={() => setShowModal(false)} className="flex-shrink-0">
                            <div className="w-20 h-20 md:w-24 md:h-24">
                              <img src={matchedProduct.image_url} alt={rec.productName} className="w-full h-full object-cover" />
                            </div>
                          </Link>
                        )}
                        <div className="flex-1 p-3 md:p-4 space-y-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-0.5">
                              <p className="text-sm font-serif font-normal leading-tight">{rec.productName}</p>
                              {rec.step && <p className="text-[8px] text-accent tracking-[0.15em] uppercase font-light">{rec.step}</p>}
                            </div>
                            {matchedProduct && (
                              <Link to={`/products/${matchedProduct.slug}`} onClick={() => setShowModal(false)} className="flex-shrink-0">
                                <span className="text-[9px] tracking-[0.1em] uppercase text-accent hover:text-foreground transition-colors border-b border-accent/30 pb-px font-light">
                                  {ct.viewProduct}
                                </span>
                              </Link>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2 font-light">{rec.reason}</p>
                          {matchedProduct && (
                            <p className="text-xs font-sans font-light text-muted-foreground">{formatPrice(matchedProduct.price)}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {result.generalTips && result.generalTips.length > 0 && (
            <div className="space-y-3">
              <p className="text-[10px] font-sans tracking-[0.2em] uppercase text-accent font-light">{ct.tips}</p>
              <div className="space-y-2">
                {result.generalTips.map((tip: string, i: number) => (
                  <div key={i} className="flex items-start gap-3 text-xs text-muted-foreground leading-relaxed font-light">
                    <span className="flex-shrink-0 w-1 h-1 bg-accent mt-1.5" />
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={reset}
            className="w-full py-3 border border-border/30 text-[10px] tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors duration-300 font-light"
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
        <DialogContent className="w-[95vw] max-w-[760px] max-h-[90dvh] overflow-y-auto p-0 gap-0 rounded-none border border-border/30 shadow-luxury [&>button]:hidden bg-background">
          <div className="relative px-8 md:px-12 pt-12 pb-8">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 text-muted-foreground/30 hover:text-foreground transition-colors text-[9px] tracking-[0.2em] uppercase font-light"
            >
              Close
            </button>
            <div className="text-center space-y-4">
              <p className="text-[10px] tracking-[0.25em] uppercase text-accent font-sans font-light">Personalize Your Routine</p>
              <h2 className="text-2xl md:text-3xl font-serif font-normal leading-tight tracking-wide">{ct.modalTitle}</h2>
              <span className="heading-accent" />
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xl mx-auto font-light">{ct.modalSubtitle}</p>
            </div>
          </div>
          <div className="px-8 md:px-12 pb-8">{renderContent()}</div>
          <div className="border-t border-border/20 px-8 py-4 flex justify-center">
            <button onClick={handleDontShowToday} className="text-xs text-muted-foreground/50 hover:text-foreground transition-colors tracking-[0.08em] font-light">
              {ct.dontShowToday}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // ── Section mode ──
  return (
    <section className="py-16 md:py-[120px] px-4 md:px-6 lg:px-8">
      <div className="container max-w-5xl">
        <div className="text-center space-y-3 mb-14">
          <p className="text-[10px] font-sans font-light tracking-[0.25em] uppercase text-accent">{ct.sectionSubtitle}</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-normal tracking-[0.04em]">{ct.sectionTitle}</h2>
          <span className="heading-accent" />
          <p className="text-sm text-muted-foreground max-w-xl mx-auto font-light">{ct.sectionDesc}</p>
        </div>

        <div className="border border-border/30 p-8 md:p-12">
          {renderContent()}
        </div>
      </div>
    </section>
  );
};

export default BeautyConsultation;
