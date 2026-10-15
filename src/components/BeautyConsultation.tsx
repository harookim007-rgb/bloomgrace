import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Check, ChevronRight, Loader2, RotateCcw, ShoppingBag, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/hooks/useCart";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { getLocalizedBrand, getLocalizedProductName } from "@/lib/productI18n";
import { localizeCategory } from "@/lib/categoryI18n";
import { recommendProducts, type ConsultMatch } from "@/lib/consultation";
import {
  LOOK_IDS, LOOK_SWATCHES, SCALP_IDS, SKIN_TYPE_IDS, SKIN_ZONES, consultTexts, diagnoseSkin, questionZone,
  type LookId, type ScalpId, type SkinTypeId,
} from "@/lib/consultationData";
import FaceDiagram from "@/components/consultation/FaceDiagram";
import categorySkinImg from "@/assets/category-skin.jpg";
import categoryHairImg from "@/assets/category-hair.jpg";

type Track = "Skin" | "Makeup" | "Hair";
type Step = "home" | "skinIntro" | "quiz" | "pickSkin" | "look" | "scalp" | "result";

const ADD_I18N: Record<string, { add: string; added: string }> = {
  en: { add: "Add to cart", added: "Added" }, es: { add: "Añadir", added: "Añadido" }, de: { add: "In den Warenkorb", added: "Hinzugefügt" },
  fr: { add: "Ajouter", added: "Ajouté" }, pt: { add: "Adicionar", added: "Adicionado" }, ja: { add: "カートに入れる", added: "追加済み" },
  ar: { add: "أضيفي إلى السلة", added: "تمت الإضافة" },
};

const Swatches = ({ colors, size = "h-6 w-6" }: { colors: string[]; size?: string }) => (
  <span className="flex">
    {colors.map((c, i) => <span key={c} className={`${size} rounded-full border-2 border-background ${i ? "-ml-2" : ""}`} style={{ background: c }} />)}
  </span>
);

const OptionButton = ({ onClick, children }: { onClick: () => void; children: React.ReactNode }) => (
  <button
    type="button"
    onClick={onClick}
    className="group w-full flex items-center gap-3 border border-border bg-background px-4 py-3.5 text-left transition-colors hover:border-primary hover:bg-primary/5"
  >
    <span className="min-w-0 flex-1">{children}</span>
    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary" />
  </button>
);

// The question-and-answer flow, shared by the home section and the pop-up.
const Flow = ({ onLeave }: { onLeave?: () => void }) => {
  const { language, formatPrice, t } = useLanguage();
  const tx = consultTexts(language);
  const ui = tx.ui;
  const add = ADD_I18N[language] || ADD_I18N.en;
  const { addToCart } = useCart();

  const [step, setStep] = useState<Step>("home");
  const [track, setTrack] = useState<Track>("Skin");
  const [answers, setAnswers] = useState<number[]>([]);
  const [resultId, setResultId] = useState<string>("");
  const [matches, setMatches] = useState<ConsultMatch<any>[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState<Set<string>>(new Set());

  const reset = () => { setStep("home"); setAnswers([]); setResultId(""); setMatches([]); };

  const showResult = async (t: Track, id: string) => {
    setTrack(t);
    setResultId(id);
    setStep("result");
    setLoading(true);
    const [{ data: prods }, { data: cats }] = await Promise.all([
      supabase.from("products").select("*").eq("is_active", true),
      supabase.from("categories").select("id, slug, parent_id, name, translations"),
    ]);
    setCategories(cats || []);
    setMatches(recommendProducts(prods || [], cats || [], t, id));
    setLoading(false);
  };

  const answer = (choice: number) => {
    const next = [...answers, choice];
    if (next.length < tx.questions.length) setAnswers(next);
    else showResult("Skin", diagnoseSkin(next));
  };

  const back = () => {
    if (step === "quiz" && answers.length > 0) { setAnswers(answers.slice(0, -1)); return; }
    if (step === "quiz" || step === "pickSkin") { setStep("skinIntro"); setAnswers([]); return; }
    if (step === "result") { setStep(track === "Skin" ? "skinIntro" : track === "Makeup" ? "look" : "scalp"); setAnswers([]); return; }
    reset();
  };

  const header = (title: string, sub?: string) => (
    <div className="text-center space-y-2 mb-6 md:mb-8">
      <h3 className="text-2xl md:text-3xl font-serif font-medium leading-snug">{title}</h3>
      {sub && <p className="text-sm md:text-base text-muted-foreground">{sub}</p>}
    </div>
  );

  const backLink = step !== "home" && (
    <button onClick={back} className="mb-5 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
      <ArrowLeft className="h-4 w-4" />{ui.back}
    </button>
  );

  if (step === "home") {
    const cards: { track: Track; title: string; sub: string; visual: React.ReactNode; go: () => void }[] = [
      { track: "Skin", title: ui.skin, sub: ui.skinSub, visual: <img src={categorySkinImg} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />, go: () => { setTrack("Skin"); setStep("skinIntro"); } },
      { track: "Makeup", title: ui.makeup, sub: ui.makeupSub, visual: <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-[#f8e1e4] via-[#f3d3cf] to-[#e8c4b8]"><Swatches colors={LOOK_SWATCHES.romantic.concat(LOOK_SWATCHES.soft_glam[1])} size="h-10 w-10 md:h-12 md:w-12" /></div>, go: () => { setTrack("Makeup"); setStep("look"); } },
      { track: "Hair", title: ui.hair, sub: ui.hairSub, visual: <img src={categoryHairImg} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />, go: () => { setTrack("Hair"); setStep("scalp"); } },
    ];
    return (
      <div>
        {header(ui.ask)}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-5">
          {cards.map(c => (
            <button key={c.track} onClick={c.go} className="group text-left border border-border bg-card hover:border-primary transition-colors">
              <div className="aspect-[4/3] overflow-hidden bg-muted">{c.visual}</div>
              <div className="p-4 space-y-1">
                <p className="font-serif text-lg md:text-xl">{c.title}</p>
                <p className="text-xs md:text-sm text-muted-foreground">{c.sub}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (step === "skinIntro") {
    return (
      <div>
        {backLink}
        <div className="flex flex-col items-center text-center gap-5">
          <FaceDiagram highlight={{ oily: ["tzone"], dry: ["cheeks"] }} labels={{ oily: ui.oilyArea, dry: ui.dryArea, sensitive: ui.sensitiveArea, breakouts: ui.breakouts, balanced: ui.balanced }} />
          {header(ui.skinIntro, ui.skinIntroSub)}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto -mt-2">
            <button onClick={() => { setAnswers([]); setStep("quiz"); }} className="min-h-[48px] px-10 bg-primary text-primary-foreground text-sm font-sans font-semibold tracking-[0.12em] uppercase hover:bg-primary/90">
              {ui.start}
            </button>
            <button onClick={() => setStep("pickSkin")} className="min-h-[48px] px-6 border border-border text-sm hover:border-foreground">
              {ui.knowType}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === "quiz") {
    const i = answers.length;
    const [question, ...options] = tx.questions[i];
    return (
      <div>
        {backLink}
        <div className="grid md:grid-cols-[200px_1fr] gap-6 md:gap-10 items-center">
          <FaceDiagram highlight={{ focus: questionZone(i) }} className="order-first" />
          <div>
            <p className="text-xs font-sans font-semibold tracking-[0.15em] uppercase text-primary mb-2">{ui.question} {i + 1} {ui.of} {tx.questions.length}</p>
            <div className="h-1 bg-muted mb-5"><div className="h-full bg-primary transition-all duration-300" style={{ width: `${(i / tx.questions.length) * 100}%` }} /></div>
            <h3 className="text-lg md:text-2xl font-serif leading-snug mb-5">{question}</h3>
            <div className="space-y-2">
              {options.map((label, k) => <OptionButton key={label} onClick={() => answer(k)}><span className="text-sm md:text-base">{label}</span></OptionButton>)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === "pickSkin") {
    return (
      <div>
        {backLink}
        {header(ui.pickType)}
        <div className="grid sm:grid-cols-2 gap-2">
          {SKIN_TYPE_IDS.map(id => (
            <OptionButton key={id} onClick={() => showResult("Skin", id)}>
              <span className="block text-sm md:text-base font-medium">{tx.skin[id][0]}</span>
              <span className="block text-xs text-muted-foreground">{tx.skin[id][1]}</span>
            </OptionButton>
          ))}
        </div>
      </div>
    );
  }

  if (step === "look") {
    return (
      <div>
        {backLink}
        {header(ui.lookAsk)}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {LOOK_IDS.map(id => (
            <button key={id} onClick={() => showResult("Makeup", id)} className="group text-left border border-border bg-card p-4 hover:border-primary transition-colors space-y-3">
              <div className="h-16 md:h-20 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${LOOK_SWATCHES[id][0]}, ${LOOK_SWATCHES[id][1]})` }}>
                <Swatches colors={LOOK_SWATCHES[id]} />
              </div>
              <div>
                <p className="text-sm md:text-base font-medium">{tx.looks[id][0]}</p>
                <p className="text-xs text-muted-foreground leading-snug">{tx.looks[id][1]}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (step === "scalp") {
    return (
      <div>
        {backLink}
        {header(ui.scalpAsk)}
        <div className="grid sm:grid-cols-2 gap-2">
          {SCALP_IDS.map(id => (
            <OptionButton key={id} onClick={() => showResult("Hair", id)}>
              <span className="block text-sm md:text-base font-medium">{tx.scalp[id][0]}</span>
              <span className="block text-xs text-muted-foreground">{tx.scalp[id][1]}</span>
            </OptionButton>
          ))}
        </div>
      </div>
    );
  }

  // Result
  const [name, desc] = track === "Skin" ? tx.skin[resultId as SkinTypeId] : track === "Makeup" ? tx.looks[resultId as LookId] : tx.scalp[resultId as ScalpId];
  const label = track === "Skin" ? ui.yourSkin : track === "Makeup" ? ui.yourLook : ui.yourScalp;
  const stepName = (slug: string | null) => {
    const c = categories.find(x => x.slug === slug);
    return c ? localizeCategory(c, t as any, language) : "";
  };
  const steps = [...new Set(matches.map(m => m.type).filter(Boolean) as string[])];

  return (
    <div>
      {backLink}
      <div className="grid md:grid-cols-[200px_1fr] gap-6 md:gap-10 items-center border-b border-border pb-6 md:pb-8 mb-6 md:mb-8">
        {track === "Skin"
          ? <FaceDiagram highlight={SKIN_ZONES[resultId as SkinTypeId]} labels={{ oily: ui.oilyArea, dry: ui.dryArea, sensitive: ui.sensitiveArea, breakouts: ui.breakouts, balanced: ui.balanced }} />
          : track === "Makeup"
            ? <div className="flex justify-center"><Swatches colors={LOOK_SWATCHES[resultId as LookId]} size="h-14 w-14" /></div>
            : <div className="flex justify-center"><img src={categoryHairImg} alt="" className="h-32 w-32 rounded-full object-cover" /></div>}
        <div className="text-center md:text-left space-y-2">
          <p className="text-xs font-sans font-semibold tracking-[0.15em] uppercase text-primary">{label}</p>
          <h3 className="text-2xl md:text-3xl font-serif">{name}</h3>
          <p className="text-sm md:text-base text-muted-foreground">{desc}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : matches.length === 0 ? (
        <div className="text-center space-y-3 py-6">
          <p className="text-sm text-muted-foreground">{ui.none}</p>
          <Link to="/products" onClick={onLeave} className="inline-block text-sm underline underline-offset-4 hover:text-primary">{ui.viewAll}</Link>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-xs font-sans font-semibold tracking-[0.15em] uppercase text-primary">{ui.recommended}</p>
          {steps.length > 1 && (
            <p className="text-xs text-muted-foreground">
              {ui.routine}: {steps.map((s, i) => <span key={s}>{i > 0 && " → "}<span className="text-foreground font-medium">{stepName(s)}</span></span>)}
            </p>
          )}
          <div className="grid sm:grid-cols-2 gap-3">
            {matches.map((m, i) => {
              const p = m.product;
              const isAdded = added.has(p.id);
              return (
                <div key={p.id} className="flex gap-3 border border-border bg-card p-3">
                  <Link to={`/products/${p.slug}`} onClick={onLeave} className="shrink-0">
                    <img src={p.thumbnail_url || p.image_url || "/placeholder.svg"} alt={getLocalizedProductName(p, language as any)} className="h-24 w-24 object-cover bg-muted" />
                  </Link>
                  <div className="min-w-0 flex-1 flex flex-col">
                    {m.type && steps.length > 0 && (
                      <p className="text-[10px] font-sans font-semibold tracking-[0.12em] uppercase text-primary">
                        {track !== "Hair" && `${i + 1}. `}{stepName(m.type)}
                      </p>
                    )}
                    <p className="text-[10px] tracking-[0.12em] uppercase text-muted-foreground truncate">{getLocalizedBrand(p, language as any)}</p>
                    <Link to={`/products/${p.slug}`} onClick={onLeave} className="text-sm font-medium leading-snug line-clamp-2 hover:text-primary">{getLocalizedProductName(p, language as any)}</Link>
                    <div className="mt-auto pt-2 flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold">{formatPrice(p.price)}</span>
                      <button
                        type="button"
                        onClick={async () => { if (await addToCart(p.id)) setAdded(prev => new Set(prev).add(p.id)); }}
                        className={`inline-flex items-center gap-1.5 min-h-[34px] px-3 text-[11px] font-sans font-semibold tracking-[0.06em] uppercase transition-colors ${isAdded ? "bg-muted text-foreground" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}
                      >
                        {isAdded ? <Check className="h-3.5 w-3.5" /> : <ShoppingBag className="h-3.5 w-3.5" />}
                        {isAdded ? add.added : add.add}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-8 flex justify-center">
        <button onClick={reset} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <RotateCcw className="h-4 w-4" />{ui.startOver}
        </button>
      </div>
    </div>
  );
};

interface BeautyConsultationProps {
  mode: "modal" | "section";
}

// "Find Your Perfect Match": shown as a home section, and as a pop-up opened from the
// "Make your routine" menu and side tab (event "open-beauty-advisor").
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
        <DialogContent className="w-[95vw] max-w-[860px] max-h-[90dvh] overflow-y-auto p-0 gap-0 rounded-none border border-primary/15 shadow-luxury [&>button]:hidden bg-background">
          <div className="relative px-6 md:px-12 pt-10 pb-2 text-center">
            <button onClick={() => setOpen(false)} aria-label={ui.close} className="absolute top-4 right-4 h-10 w-10 flex items-center justify-center text-muted-foreground hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
            <p className="text-xs md:text-sm tracking-[0.25em] uppercase text-primary font-sans font-semibold">{ui.title}</p>
          </div>
          <div className="px-5 md:px-12 pt-4 pb-10">
            <Flow key={session} onLeave={() => setOpen(false)} />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <section className="py-14 md:py-24 px-3 md:px-6 lg:px-8 bg-muted/20">
      <div className="container max-w-5xl px-0">
        <p className="text-center text-xs md:text-sm font-sans font-bold tracking-[0.2em] uppercase text-primary mb-6 md:mb-8">{ui.title}</p>
        <div className="bg-background border border-border/40 p-5 md:p-12 shadow-elegant">
          <Flow />
        </div>
      </div>
    </section>
  );
};

export default BeautyConsultation;
