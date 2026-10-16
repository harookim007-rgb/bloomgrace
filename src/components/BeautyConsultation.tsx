import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Loader2, RotateCcw, ShoppingBag, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/hooks/useCart";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { getLocalizedBrand, getLocalizedProductName } from "@/lib/productI18n";
import { localizeCategory } from "@/lib/categoryI18n";
import { recommendHair, recommendProducts, type ConsultMatch } from "@/lib/consultation";
import { SKIN_TYPE_IDS, SKIN_ZONES, consultTexts, diagnoseSkin, questionZone, type SkinTypeId } from "@/lib/consultationData";
import { HAIR_PRODUCT_SLUGS, HAIR_STEPS, HAIR_STEP_ORDER, hairTexts, type HairStepKey } from "@/lib/hairConsultData";
import FaceDiagram, { type FigureZone } from "@/components/consultation/FaceDiagram";
import categorySkinImg from "@/assets/category-skin.jpg";
import categoryHairImg from "@/assets/category-hair.jpg";

type Step = "home" | "skinIntro" | "quiz" | "pickSkin" | "skinResult" | "hair" | "hairResult";

const ADD_I18N: Record<string, { add: string; added: string }> = {
  en: { add: "Add to cart", added: "Added" }, es: { add: "Añadir", added: "Añadido" }, de: { add: "In den Warenkorb", added: "Hinzugefügt" },
  fr: { add: "Ajouter", added: "Ajouté" }, pt: { add: "Adicionar", added: "Adicionado" }, ja: { add: "カートに入れる", added: "追加済み" },
};

// Figure focus for each hair step.
const HAIR_FOCUS: Record<HairStepKey, FigureZone> = { product: "lengths", scalp: "scalp", hair: "lengths", concern: "scalp", result: "lengths" };

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[11px] md:text-xs font-sans font-semibold tracking-[0.22em] uppercase text-primary">{children}</p>
);

const Progress = ({ index, total }: { index: number; total: number }) => (
  <div className="flex items-center gap-3">
    <span className="text-xs font-sans font-semibold tabular-nums text-primary">{String(index + 1).padStart(2, "0")}<span className="text-muted-foreground"> / {String(total).padStart(2, "0")}</span></span>
    <div className="flex gap-1.5">
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={`h-1 rounded-full transition-all duration-500 ${i < index ? "w-6 bg-primary/60" : i === index ? "w-10 bg-primary" : "w-6 bg-border"}`} />
      ))}
    </div>
  </div>
);

// One answer in a list: lettered card for the skin quiz.
const AnswerCard = ({ letter, label, onClick }: { letter: string; label: string; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="group w-full flex items-center gap-4 rounded-2xl border border-border/80 bg-background/80 px-4 py-3.5 text-left transition-all duration-200 hover:border-primary hover:bg-primary/5 hover:shadow-[0_6px_20px_-12px_hsl(var(--primary)/0.6)]"
  >
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary/30 text-xs font-semibold text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">{letter}</span>
    <span className="min-w-0 flex-1 text-sm md:text-[15px] leading-snug">{label}</span>
  </button>
);

// Pill choice for the hair steps.
const Pill = ({ label, onClick }: { label: string; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="rounded-full border border-border/80 bg-background/80 px-5 py-3 text-sm md:text-[15px] transition-all duration-200 hover:border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-[0_8px_22px_-12px_hsl(var(--primary)/0.8)]"
  >
    {label}
  </button>
);

const Flow = ({ onLeave }: { onLeave?: () => void }) => {
  const { language, formatPrice, t } = useLanguage();
  const tx = consultTexts(language);
  const ui = tx.ui;
  const ht = hairTexts(language);
  const add = ADD_I18N[language] || ADD_I18N.en;
  const { addToCart } = useCart();

  const [step, setStep] = useState<Step>("home");
  const [answers, setAnswers] = useState<number[]>([]);
  const [skinType, setSkinType] = useState<SkinTypeId>("normal");
  const [hairAnswers, setHairAnswers] = useState<string[]>([]);
  const [matches, setMatches] = useState<ConsultMatch<any>[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState<Set<string>>(new Set());

  const load = async () => {
    setLoading(true);
    const [{ data: prods }, { data: cats }] = await Promise.all([
      supabase.from("products").select("*").eq("is_active", true),
      supabase.from("categories").select("id, slug, parent_id, name, translations"),
    ]);
    setCategories(cats || []);
    setLoading(false);
    return { prods: prods || [], cats: cats || [] };
  };

  const finishSkin = async (id: SkinTypeId) => {
    setSkinType(id);
    setStep("skinResult");
    const { prods, cats } = await load();
    setMatches(recommendProducts(prods, cats, "Skin", id));
  };

  const answerSkin = (choice: number) => {
    const next = [...answers, choice];
    if (next.length < tx.questions.length) setAnswers(next);
    else finishSkin(diagnoseSkin(next));
  };

  const answerHair = async (id: string) => {
    const next = [...hairAnswers, id];
    setHairAnswers(next);
    if (next.length < HAIR_STEP_ORDER.length) return;
    setStep("hairResult");
    const { prods, cats } = await load();
    setMatches(recommendHair(prods, cats, next[0], next.slice(1)));
  };

  const reset = () => { setStep("home"); setAnswers([]); setHairAnswers([]); setMatches([]); };
  const back = () => {
    if (step === "quiz" && answers.length) return setAnswers(answers.slice(0, -1));
    if (step === "hair" && hairAnswers.length) return setHairAnswers(hairAnswers.slice(0, -1));
    if (step === "quiz" || step === "pickSkin" || step === "skinResult") { setAnswers([]); return setStep("skinIntro"); }
    if (step === "hairResult") { setHairAnswers(hairAnswers.slice(0, -1)); return setStep("hair"); }
    reset();
  };

  const legendLabels = { oily: ui.oilyArea, dry: ui.dryArea, sensitive: ui.sensitiveArea, breakouts: ui.breakouts, balanced: ui.balanced };

  // Left panel: the figure for the current step.
  const figure = (() => {
    if (step === "quiz") return <FaceDiagram highlight={{ focus: questionZone(answers.length) }} />;
    if (step === "skinResult") return <FaceDiagram highlight={SKIN_ZONES[skinType]} labels={legendLabels} />;
    if (step === "hair") return <FaceDiagram highlight={{ focus: HAIR_FOCUS[HAIR_STEP_ORDER[hairAnswers.length]] }} />;
    if (step === "hairResult") return <FaceDiagram highlight={{ focus: "lengths", balanced: true }} />;
    if (step === "home") return <FaceDiagram highlight={{ balanced: true }} />;
    return <FaceDiagram highlight={{ oily: ["tzone"], dry: ["cheeks"] }} labels={legendLabels} />;
  })();

  const stepName = (slug: string | null) => {
    const c = categories.find(x => x.slug === slug);
    return c ? localizeCategory(c, t as any, language) : "";
  };

  const results = (title: string, name: string, desc: string, chips?: string[], showRoutine = false) => {
    const steps = [...new Set(matches.map(m => m.type).filter(Boolean) as string[])];
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Eyebrow>{title}</Eyebrow>
          <h3 className="text-3xl md:text-4xl font-serif leading-tight">{name}</h3>
          {desc && <p className="text-sm md:text-base text-muted-foreground">{desc}</p>}
          {chips && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {chips.map(c => <span key={c} className="rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-medium">{c}</span>)}
            </div>
          )}
        </div>
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : matches.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-6 text-center space-y-3">
            <p className="text-sm text-muted-foreground">{ui.none}</p>
            <Link to="/products" onClick={onLeave} className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">{ui.viewAll}<ArrowRight className="h-4 w-4" /></Link>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <Eyebrow>{ui.recommended}</Eyebrow>
              {showRoutine && steps.length > 1 && (
                <p className="text-xs text-muted-foreground">{steps.map((s, i) => <span key={s}>{i > 0 && " → "}{stepName(s)}</span>)}</p>
              )}
            </div>
            <div className="space-y-2.5">
              {matches.map((m, i) => {
                const p = m.product;
                const isAdded = added.has(p.id);
                return (
                  <div key={p.id} className="flex items-center gap-3 rounded-2xl border border-border/80 bg-background p-2.5 pr-3">
                    <Link to={`/products/${p.slug}`} onClick={onLeave} className="shrink-0">
                      <img src={p.thumbnail_url || p.image_url || "/placeholder.svg"} alt={getLocalizedProductName(p, language as any)} className="h-20 w-20 rounded-xl object-cover bg-muted" />
                    </Link>
                    <div className="min-w-0 flex-1">
                      {showRoutine && m.type && <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-primary">{i + 1}. {stepName(m.type)}</p>}
                      <p className="text-[10px] tracking-[0.12em] uppercase text-muted-foreground truncate">{getLocalizedBrand(p, language as any)}</p>
                      <Link to={`/products/${p.slug}`} onClick={onLeave} className="block text-sm font-medium leading-snug line-clamp-2 hover:text-primary">{getLocalizedProductName(p, language as any)}</Link>
                      <p className="text-sm font-semibold mt-0.5">{formatPrice(p.price)}</p>
                    </div>
                    <button
                      type="button"
                      aria-label={isAdded ? add.added : add.add}
                      onClick={async () => { if (await addToCart(p.id)) setAdded(prev => new Set(prev).add(p.id)); }}
                      className={`shrink-0 inline-flex items-center gap-1.5 rounded-full h-10 px-4 text-xs font-semibold transition-colors ${isAdded ? "bg-muted text-foreground" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}
                    >
                      {isAdded ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
                      <span className="hidden sm:inline">{isAdded ? add.added : add.add}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        <button onClick={reset} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <RotateCcw className="h-4 w-4" />{ui.startOver}
        </button>
      </div>
    );
  };

  // Right panel: the question for the current step.
  const content = (() => {
    if (step === "home") {
      const cards = [
        { key: "skin", title: ui.skin, sub: ui.skinSub, img: categorySkinImg, go: () => setStep("skinIntro") },
        { key: "hair", title: ui.hair, sub: ht.sub, img: categoryHairImg, go: () => { setHairAnswers([]); setStep("hair"); } },
      ];
      return (
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-3xl md:text-[40px] font-serif leading-tight">{ui.title}</h3>
            <p className="text-sm md:text-base text-muted-foreground">{ui.ask}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            {cards.map(c => (
              <button key={c.key} onClick={c.go} className="group relative overflow-hidden rounded-2xl text-left aspect-[4/5] bg-muted">
                <img src={c.img} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <span className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
                <span className="absolute inset-x-0 bottom-0 p-4 text-white">
                  <span className="block font-serif text-xl md:text-2xl">{c.title}</span>
                  <span className="mt-1 flex items-end justify-between gap-2 text-xs md:text-sm text-white/85">
                    <span>{c.sub}</span>
                    <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      );
    }
    if (step === "skinIntro") {
      return (
        <div className="space-y-6">
          <div className="space-y-2">
            <Eyebrow>{ui.skin}</Eyebrow>
            <h3 className="text-3xl md:text-4xl font-serif leading-tight">{ui.skinIntro}</h3>
            <p className="text-sm md:text-base text-muted-foreground">{ui.skinIntroSub}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={() => { setAnswers([]); setStep("quiz"); }} className="inline-flex items-center justify-center gap-2 rounded-full h-12 px-8 bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90">
              {ui.start}<ArrowRight className="h-4 w-4" />
            </button>
            <button onClick={() => setStep("pickSkin")} className="rounded-full h-12 px-6 border border-border text-sm hover:border-foreground">{ui.knowType}</button>
          </div>
        </div>
      );
    }
    if (step === "quiz") {
      const i = answers.length;
      const [question, ...options] = tx.questions[i];
      return (
        <div className="space-y-5">
          <Progress index={i} total={tx.questions.length} />
          <h3 className="text-xl md:text-[26px] font-serif leading-snug">{question}</h3>
          <div className="space-y-2">
            {options.map((label, k) => <AnswerCard key={label} letter={String.fromCharCode(65 + k)} label={label} onClick={() => answerSkin(k)} />)}
          </div>
        </div>
      );
    }
    if (step === "pickSkin") {
      return (
        <div className="space-y-5">
          <h3 className="text-2xl md:text-3xl font-serif">{ui.pickType}</h3>
          <div className="grid sm:grid-cols-2 gap-2">
            {SKIN_TYPE_IDS.map(id => (
              <button key={id} onClick={() => finishSkin(id)} className="rounded-2xl border border-border/80 bg-background/80 px-4 py-3 text-left transition-all hover:border-primary hover:bg-primary/5">
                <span className="block text-sm font-medium">{tx.skin[id][0]}</span>
                <span className="block text-xs text-muted-foreground leading-snug">{tx.skin[id][1]}</span>
              </button>
            ))}
          </div>
        </div>
      );
    }
    if (step === "skinResult") return results(ui.yourSkin, tx.skin[skinType][0], tx.skin[skinType][1], undefined, true);
    if (step === "hair") {
      const i = hairAnswers.length;
      const key = HAIR_STEP_ORDER[i];
      const ids: readonly string[] = key === "product" ? HAIR_PRODUCT_SLUGS : HAIR_STEPS[key];
      return (
        <div className="space-y-5">
          {i === 0 && (
            <div className="space-y-1.5 pb-1">
              <Eyebrow>{ui.hair}</Eyebrow>
              <h3 className="text-2xl md:text-3xl font-serif leading-tight">{ht.title}</h3>
              <p className="text-sm text-muted-foreground">{ht.sub}</p>
            </div>
          )}
          <Progress index={i} total={HAIR_STEP_ORDER.length} />
          <h3 className="text-xl md:text-[26px] font-serif leading-snug">{ht.questions[key]}</h3>
          <div className="flex flex-wrap gap-2">
            {ids.map(id => <Pill key={id} label={ht.options[id] || id} onClick={() => answerHair(id)} />)}
          </div>
        </div>
      );
    }
    return results(ht.title, ht.options[hairAnswers[0]] || "", "", hairAnswers.slice(1).map(a => ht.options[a] || a));
  })();

  const stepKey = `${step}-${answers.length}-${hairAnswers.length}`;

  return (
    <div className="grid md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] min-h-[520px]">
      <div className="relative flex flex-col items-center justify-center gap-4 bg-gradient-to-b from-[#fbf1ee] via-[#f8ebe6] to-[#f3e1db] px-6 py-6 md:py-10">
        <span className="pointer-events-none absolute -top-10 -left-10 h-40 w-40 rounded-full bg-white/50 blur-2xl" />
        <span className="pointer-events-none absolute bottom-0 right-0 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
        <div key={`fig-${stepKey}`} className="consult-in relative">{figure}</div>
      </div>
      <div className="relative px-5 py-6 md:px-10 md:py-10 flex flex-col">
        {step !== "home" && (
          <button onClick={back} className="mb-5 self-start inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />{ui.back}
          </button>
        )}
        <div key={stepKey} className="consult-in my-auto">{content}</div>
      </div>
    </div>
  );
};

interface BeautyConsultationProps {
  mode: "modal" | "section";
}

// "Find Your Perfect Match": skin diagnosis or hair match. Shown as a home section and as a
// pop-up opened from the "Make your routine" menu and side tab (event "open-beauty-advisor").
const BeautyConsultation = ({ mode }: BeautyConsultationProps) => {
  const { language } = useLanguage();
  const ui = consultTexts(language).ui;
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState(0);

  useEffect(() => {
    if (mode !== "modal") return;
    const handler = () => { setSession(s => s + 1); setOpen(true); };
    window.addEventListener("open-beauty-advisor", handler);
    return () => window.removeEventListener("open-beauty-advisor", handler);
  }, [mode]);

  if (mode === "modal") {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[95vw] max-w-[980px] max-h-[92dvh] overflow-y-auto overflow-x-hidden p-0 gap-0 rounded-3xl sm:rounded-3xl border-0 shadow-luxury [&>button]:hidden bg-background">
          <button onClick={() => setOpen(false)} aria-label={ui.close} className="absolute top-3 right-3 z-10 h-10 w-10 flex items-center justify-center rounded-full bg-background/80 backdrop-blur text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
          <Flow key={session} onLeave={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <section className="py-14 md:py-24 px-3 md:px-6 lg:px-8">
      <div className="container max-w-5xl px-0">
        <div className="overflow-hidden rounded-3xl border border-border/40 bg-background shadow-elegant">
          <Flow />
        </div>
      </div>
    </section>
  );
};

export default BeautyConsultation;
