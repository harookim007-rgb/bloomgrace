import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import FallingPetals from "@/components/FallingPetals";
import BrandLogo from "@/components/BrandLogo";
import HangulWatermark from "@/components/HangulWatermark";
import sakuraCorner from "@/assets/sakura-bg-corner.png";
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
          title: trans?.title || b.translations?.en?.title || b.title,
          subtitle: trans?.subtitle || b.translations?.en?.subtitle || b.subtitle || "",
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
    <section className="relative w-full min-h-[400px] md:min-h-[500px] max-h-[920px] overflow-hidden" style={{ height: '85dvh' }}>
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

      <img
        src={sakuraCorner}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute top-0 right-0 w-[42%] max-w-[520px] opacity-60 mix-blend-multiply select-none -scale-x-100"
      />
      <img
        src={sakuraCorner}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 w-[32%] max-w-[380px] opacity-45 mix-blend-multiply select-none rotate-180"
      />

      <FallingPetals count={26} />


      <div className="relative z-10 h-full flex items-center">
        <div className="container px-4 md:px-8 lg:px-12">
          <div className="max-w-2xl space-y-4 md:space-y-6">
            <div className="pb-2">
              <BrandLogo size="md" showTagline={true} asLink={false} className="items-start" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-serif font-bold text-foreground leading-[1.12] whitespace-pre-line">
              {slide.title}
            </h1>
            {slide.subtitle && (
              <p className="text-base md:text-lg text-foreground/75 font-sans font-medium leading-relaxed max-w-lg">
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
            onClick={() => setCurrent(c => (c - 1 + slides.length) % slides.length)}
            className="w-11 h-11 flex items-center justify-center text-foreground/50 hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <div className="flex gap-2.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`rounded-full transition-all duration-500 ${
                  i === current ? "w-10 h-2.5 bg-primary" : "w-2.5 h-2.5 bg-foreground/20"
                }`}
              />
            ))}
          </div>
          <button
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
