import { useDesign } from "@/hooks/useDesign";
import { useLanguage } from "@/contexts/LanguageContext";
import SupportMessenger from "@/components/support/SupportMessenger";
import { consultTexts } from "@/lib/consultationData";


const bookmarkTexts: Record<string, { line1: string; line2: string; title: string; subtitle: string; hover: string; cats: string[] }> = {
  en: { line1: "MAKE YOUR", line2: "ROUTINE", title: "Personalized Beauty", subtitle: "Personalize Your Routine", hover: "Personalize your beauty routine with our beauty advisor. Discover products perfectly matched to your skin, body & hair.", cats: ["Skin", "Body", "Hair"] },
  es: { line1: "CREA TU", line2: "RUTINA", title: "Belleza Personalizada", subtitle: "Personaliza Tu Rutina", hover: "Personaliza tu rutina de belleza con nuestro asesor de belleza. Descubre productos perfectos para ti.", cats: ["Piel", "Cuerpo", "Cabello"] },
  de: { line1: "DEINE", line2: "ROUTINE", title: "Personalisierte Schönheit", subtitle: "Deine Routine", hover: "Personalisieren Sie Ihre Beauty-Routine mit unserem Beauty-Berater. Entdecken Sie perfekt abgestimmte Produkte.", cats: ["Haut", "Körper", "Haar"] },
  fr: { line1: "VOTRE", line2: "ROUTINE", title: "Beauté Personnalisée", subtitle: "Personnalisez Votre Routine", hover: "Personnalisez votre routine beauté avec notre conseiller beauté. Découvrez des produits faits pour vous.", cats: ["Peau", "Corps", "Cheveux"] },
  pt: { line1: "SUA", line2: "ROTINA", title: "Beleza Personalizada", subtitle: "Personalize Sua Rotina", hover: "Personalize sua rotina de beleza com nosso consultor de beleza. Descubra produtos perfeitos para você.", cats: ["Pele", "Corpo", "Cabelo"] },
  ja: { line1: "あなたの", line2: "ルーティン", title: "パーソナルビューティー", subtitle: "あなたのルーティンを作る", hover: "ビューティーアドバイザーが肌・ボディ・髪に合う商品を提案します。", cats: ["スキン", "ボディ", "ヘア"] },
  ar: { line1: "اصنعي", line2: "روتينك", title: "جمالك المخصص", subtitle: "اصنعي روتينك", hover: "خصصي روتين جمالك مع مستشار الجمال واكتشفي المنتجات المناسبة لك.", cats: ["البشرة", "الجسم", "الشعر"] },
};

const FloatingButtons = () => {
  const { language } = useLanguage();
  const bt = bookmarkTexts[language] || bookmarkTexts.en;
  const ui = consultTexts(language).ui;
  const { header } = useDesign();

  const handleOpenAI = () => {
    window.dispatchEvent(new Event("open-beauty-advisor"));
  };


  if (!header.floating) return null;

  return (
    <>
      {/* AI Bookmark Tab — hidden on very small screens, sticky right edge */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50 hidden sm:block">
        <button
          onClick={handleOpenAI}
          className="group relative flex items-center"
          aria-label="Personalize Your Routine"
        >
          {/* Speech bubble shown on hover */}
          <span className="pointer-events-none absolute right-full top-1/2 mr-3 -translate-y-1/2 whitespace-nowrap rounded-full border-[1.5px] border-primary bg-white px-4 py-2 text-sm font-sans font-semibold tracking-wide text-primary shadow-[0_8px_24px_-6px_hsl(var(--primary)/0.35)] opacity-0 translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
            {ui.title}
            <span aria-hidden="true" className="absolute top-1/2 -right-[7px] h-3 w-3 -translate-y-1/2 rotate-45 border-r-[1.5px] border-t-[1.5px] border-primary bg-white" />
          </span>
          <div
            className="relative border border-primary/15 bg-primary-soft text-primary pl-4 pr-3 py-10 flex flex-col items-center gap-3 shadow-luxury transition-all duration-500 group-hover:pl-5 group-hover:pr-4 group-hover:bg-primary-soft/80"
            style={{ borderRadius: "8px 0 0 8px" }}
          >
            <span className="text-xs font-sans font-bold tracking-[0.18em] uppercase leading-tight text-center">{bt.line1}</span>
            <span className="text-xs font-sans font-bold tracking-[0.18em] uppercase text-center">{bt.line2}</span>
          </div>
        </button>
      </div>

      {/* Right — Customer Messenger */}
      <SupportMessenger />
    </>
  );
};

export default FloatingButtons;
