import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
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
      "Premium cosmetics crafted with nature's finest ingredients",
      "Hydration that defies time, BLOOM & GRACE",
      "Luxurious beauty, BLOOM & GRACE",
    ],
  },
  ko: {
    titles: [
      "피부의 우아함을\n발견하세요",
      "한 방울에 담긴\n시간을 거스르는 수분",
      "스킨케어를\n한 단계 높이세요",
    ],
    subtitles: [
      "자연에서 온 귀한 성분으로 완성하는 프리미엄 화장품",
      "건성을 위한 수분보충, BLOOM & GRACE",
      "고급스러운 아름다움, BLOOM & GRACE",
    ],
  },
  es: {
    titles: [
      "Descubre la Elegancia\nde la Belleza Coreana",
      "Una Gota de\nHidratación Eterna",
      "Eleva Tu\nRutina de Skincare",
    ],
    subtitles: [
      "Cosméticos premium elaborados con los mejores ingredientes",
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
      "Premium-Kosmetik mit den feinsten Inhaltsstoffen der Natur",
      "Feuchtigkeit, die der Zeit trotzt",
      "Luxuriöse Schönheit, BLOOM & GRACE",
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

  const texts = heroTexts[language] || heroTexts.en;

  const slides = banners.length > 0
    ? banners.map((b: any, i: number) => {
        const trans = b.translations?.[language];
        return {
          image: b.image_url || fallbackSlides[i % 3].image,
          title: trans?.title || b.title,
          subtitle: trans?.subtitle || b.subtitle || "",
        };
      })
    : fallbackSlides.map((s, i) => ({
        image: s.image,
        title: texts.titles[i] || texts.titles[0],
        subtitle: texts.subtitles[i] || texts.subtitles[0],
      }));

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => setCurrent(c => (c + 1) % slides.length), 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const slide = slides[current];

  return (
    <section className="relative w-full h-[100vh] min-h-[600px] max-h-[920px] overflow-hidden">
      {slides.map((s, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-[1200ms] ease-in-out"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          <img src={s.image} alt="" className="w-full h-full object-cover" />
          {/* Soft gradient overlay — keeps the pink tones visible */}
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/50 via-foreground/20 to-transparent" />
        </div>
      ))}

      <div className="relative z-10 h-full flex items-center">
        <div className="container px-6 md:px-8 lg:px-12">
          <div className="max-w-xl space-y-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-light text-primary-foreground leading-[1.15] tracking-tight whitespace-pre-line">
              {slide.title}
            </h1>
            {slide.subtitle && (
              <p className="text-sm md:text-base text-primary-foreground/75 font-sans font-light leading-relaxed max-w-md">
                {slide.subtitle}
              </p>
            )}
            <div className="flex flex-wrap gap-3 pt-2">
              <Link to="/products">
                <button className="bg-primary-foreground text-foreground px-8 py-3.5 text-[11px] font-sans font-medium tracking-[0.2em] uppercase hover:bg-primary-foreground/90 transition-colors duration-300 flex items-center gap-2">
                  {t("hero_shop")} <ArrowRight className="h-3.5 w-3.5" />
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
            onClick={() => setCurrent(c => (c - 1 + slides.length) % slides.length)}
            className="w-10 h-10 flex items-center justify-center text-primary-foreground/60 hover:text-primary-foreground transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex gap-2.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`rounded-full transition-all duration-500 ${
                  i === current ? "w-8 h-2 bg-primary-foreground" : "w-2 h-2 bg-primary-foreground/40"
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => setCurrent(c => (c + 1) % slides.length)}
            className="w-10 h-10 flex items-center justify-center text-primary-foreground/60 hover:text-primary-foreground transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </section>
  );
};

export default Hero;
