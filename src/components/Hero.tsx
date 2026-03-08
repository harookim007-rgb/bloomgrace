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
  { image: heroImg1, title: "", subtitle: "" },
  { image: heroImg2, title: "", subtitle: "" },
  { image: heroImg3, title: "", subtitle: "" },
];

const Hero = () => {
  const { t } = useLanguage();
  const [banners, setBanners] = useState<any[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    supabase.from("banners").select("*").eq("is_active", true).order("sort_order")
      .then(({ data }) => setBanners(data || []));
  }, []);

  const slides = banners.length > 0
    ? banners.map((b, i) => ({
        image: b.image_url || fallbackSlides[i % 3].image,
        title: b.title,
        subtitle: b.subtitle || "",
      }))
    : fallbackSlides.map((s, i) => ({
        ...s,
        title: i === 0 ? t("hero_title") : i === 1 ? "Discover Your Glow" : "Premium Skincare",
        subtitle: i === 0 ? t("hero_subtitle") : "",
      }));

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => setCurrent(c => (c + 1) % slides.length), 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const slide = slides[current];

  return (
    <section className="relative w-full h-[100vh] min-h-[600px] max-h-[900px] overflow-hidden">
      {/* Background image with transition */}
      {slides.map((s, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          <img
            src={s.image}
            alt=""
            className="w-full h-full object-cover"
          />
          {/* Gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/60 via-foreground/30 to-transparent" />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container px-6 md:px-8 lg:px-12">
          <div className="max-w-xl space-y-6 animate-fade-in">
            <p className="text-sm md:text-base font-sans font-light tracking-[0.35em] uppercase text-primary-foreground/70">
              {t("hero_tagline")}
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-light text-primary-foreground leading-[1.1] tracking-tight">
              {slide.title || t("hero_title")}
            </h1>
            {slide.subtitle && (
              <p className="text-base md:text-lg text-primary-foreground/80 font-light leading-relaxed max-w-md">
                {slide.subtitle}
              </p>
            )}
            <div className="flex flex-wrap gap-4 pt-4">
              <Link to="/products">
                <Button
                  size="lg"
                  className="bg-primary-foreground text-foreground hover:bg-primary-foreground/90 rounded-none px-8 py-6 text-sm font-sans font-medium tracking-wider uppercase gap-2"
                >
                  {t("hero_shop")} <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/#about">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary-foreground/50 text-primary-foreground hover:bg-primary-foreground/10 rounded-none px-8 py-6 text-sm font-sans font-medium tracking-wider uppercase"
                >
                  {t("hero_story")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation dots & arrows */}
      {slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4">
          <button
            onClick={() => setCurrent(c => (c - 1 + slides.length) % slides.length)}
            className="w-10 h-10 flex items-center justify-center text-primary-foreground/70 hover:text-primary-foreground transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-0.5 transition-all duration-500 ${
                  i === current ? "w-8 bg-primary-foreground" : "w-4 bg-primary-foreground/40"
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => setCurrent(c => (c + 1) % slides.length)}
            className="w-10 h-10 flex items-center justify-center text-primary-foreground/70 hover:text-primary-foreground transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </section>
  );
};

export default Hero;
