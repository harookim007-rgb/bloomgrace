import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import FallingPetals from "@/components/FallingPetals";
import BrandLogo from "@/components/BrandLogo";

import heroImg1 from "@/assets/hero-luxury-1.jpg";
import heroImg2 from "@/assets/hero-luxury-2.jpg";
import heroImg3 from "@/assets/hero-luxury-3.jpg";

const fallbackSlides = [
  { image: heroImg1 },
  { image: heroImg2 },
  { image: heroImg3 },
];

const heroTexts: Record<string, { titles: string[]; subtitles: string[] }> = {
  en: {
    titles: [
      "Discover the Elegance\nof Korean Beauty",
      "One Drop of\nTimeless Moisture",
      "Elevate Your\nSkincare Routine",
    ],
    subtitles: [
      "Crafted with nature's finest ingredients",
      "Hydration that defies time, BLOOM & GRACE",
      "Luxurious beauty, BLOOM & GRACE",
    ],
  },
  es: {
    titles: [
      "Descubre la Elegancia\nde la Belleza Coreana",
      "Una Gota de\nHidratación Eterna",
      "Eleva Tu\nRutina de Skincare",
    ],
    subtitles: [
      "Elaborado con los mejores ingredientes de la naturaleza",
      "Hidratación que desafía el tiempo",
      "Belleza lujosa, BLOOM & GRACE",
    ],
  },
  de: {
    titles: [
      "Entdecken Sie die Eleganz\nKoreanischer Schönheit",
      "Ein Tropfen\nZeitloser Feuchtigkeit",
      "Heben Sie Ihre\nHautpflege-Routine an",
    ],
    subtitles: [
      "Mit den feinsten Inhaltsstoffen der Natur gefertigt",
      "Feuchtigkeit, die der Zeit trotzt",
      "Luxuriöse Schönheit, BLOOM & GRACE",
    ],
  },
  fr: {
    titles: [
      "Découvrez l'Élégance\nde la Beauté Coréenne",
      "Une Goutte\nd'Hydratation Intemporelle",
      "Élevez Votre\nRoutine de Soin",
    ],
    subtitles: [
      "Élaboré avec les plus beaux ingrédients de la nature",
      "Une hydratation qui défie le temps",
      "Beauté luxueuse, BLOOM & GRACE",
    ],
  },
  pt: {
    titles: [
      "Descubra a Elegância\nda Beleza Coreana",
      "Uma Gota de\nHidratação Eterna",
      "Eleve Sua\nRotina de Skincare",
    ],
    subtitles: [
      "Elaborado com os melhores ingredientes da natureza",
      "Hidratação que desafia o tempo",
      "Beleza luxuosa, BLOOM & GRACE",
    ],
  },
  ar: {
    titles: [
      "اكتشفي أناقة\nالجمال الكوري",
      "قطرة واحدة من\nالترطيب الخالد",
      "ارتقي بروتين\nالعناية بالبشرة",
    ],
    subtitles: [
      "مصنوع من أجود مكونات الطبيعة",
      "ترطيب يتحدى الزمن",
      "جمال فاخر، BLOOM & GRACE",
    ],
  },
};


const Hero = () => {
  const { t, language } = useLanguage();
  const [banners, setBanners] = useState<any[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    supabase.from("banners").select("*").eq("is_active", true).order("sort_order")
      .then(({ data }) => setBanners(data || []));
  }, []);

  const containsHangul = (v?: string | null) => /[가-힣]/.test(v || "");

  const texts = heroTexts[language] || heroTexts.en;

  const isUsableImage = (url?: string | null) =>
    !!url && url.trim() !== "" && !url.includes("placeholder");

  // Only include banners that already have a clean translation for the current language.
  // Never fall back to a different language — that would look like the site is switching languages.
  const translatedBanners = banners
    .map((b: any, i: number) => {
      const cur = (b.translations || {})?.[language];
      const title = cur?.title && !containsHangul(cur.title) ? cur.title : null;
      const subtitle = cur?.subtitle && !containsHangul(cur.subtitle) ? cur.subtitle : "";
      if (!title) return null;
      return {
        image: isUsableImage(b.image_url) ? b.image_url : fallbackSlides[i % 3].image,
        title,
        subtitle,
      };
    })
    .filter(Boolean) as { image: string; title: string; subtitle: string }[];

  const slides = translatedBanners.length > 0
    ? translatedBanners
    : fallbackSlides.map((s, i) => ({
        image: s.image,
        title: texts.titles[i] || texts.titles[0],
        subtitle: texts.subtitles[i] || texts.subtitles[0],
      }));

  // Reset carousel index when language changes so we don't land on an out-of-range slide
  useEffect(() => { setCurrent(0); }, [language]);

  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (slides.length <= 1 || paused) return;
    const timer = setInterval(() => setCurrent(c => (c + 1) % slides.length), 6000);
    return () => clearInterval(timer);
  }, [slides.length, paused]);

  const slide = slides[current];

  return (
    <section
      className="relative w-full min-h-[400px] md:min-h-[500px] max-h-[920px] overflow-hidden"
      style={{ height: '85dvh' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.map((s, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-[1200ms] ease-in-out"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          <img src={s.image} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--sky-soft))]/85 via-background/65 to-[hsl(var(--primary-soft))]/70" />
        </div>
      ))}



      <FallingPetals count={10} />



      <div className="relative z-10 h-full flex items-center">
        <div className="container px-4 md:px-8 lg:px-12">
          <div className="max-w-2xl space-y-4 md:space-y-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-serif font-bold text-foreground leading-[1.12] whitespace-pre-line drop-shadow-[0_2px_8px_rgba(255,255,255,0.6)]">
              {slide.title}
            </h1>
            {slide.subtitle && (
              <p className="text-base md:text-lg text-foreground font-sans font-semibold leading-relaxed max-w-lg drop-shadow-[0_1px_4px_rgba(255,255,255,0.7)]">
                {slide.subtitle.replace(/,?\s*BLOOM\s*&\s*GRACE/gi, "").replace(/,?\s*Bloom\s*&\s*Grace/gi, "").trim()}
              </p>
            )}
            <div className="flex flex-wrap gap-3 pt-2">
              <Link to="/products">
                <button className="bg-primary text-primary-foreground px-8 md:px-10 py-3.5 md:py-4 text-xs md:text-sm font-sans font-bold tracking-[0.15em] uppercase hover:bg-primary/90 transition-all duration-300 flex items-center gap-2.5 shadow-elegant hover:shadow-luxury rounded-sm min-h-[44px]">
                  {t("hero_shop")} <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Slide indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4">
          <button
            aria-label="Previous slide"
            onClick={() => setCurrent(c => (c - 1 + slides.length) % slides.length)}
            className="w-11 h-11 flex items-center justify-center text-foreground/50 hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <div className="flex gap-2.5">
            {slides.map((_, i) => (
              <button
                key={i}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === current ? "true" : undefined}
                onClick={() => setCurrent(i)}
                className={`rounded-full transition-all duration-500 ${
                  i === current ? "w-10 h-2.5 bg-primary" : "w-2.5 h-2.5 bg-foreground/20"
                }`}
              />
            ))}
          </div>
          <button
            aria-label="Next slide"
            onClick={() => setCurrent(c => (c + 1) % slides.length)}
            className="w-11 h-11 flex items-center justify-center text-foreground/50 hover:text-foreground transition-colors"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      )}
    </section>
  );
};

export default Hero;
