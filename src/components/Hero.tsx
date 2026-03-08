import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Hero = () => {
  const { t } = useLanguage();
  const [banners, setBanners] = useState<any[]>([]);
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    supabase.from("banners").select("*").eq("is_active", true).order("sort_order").then(({ data }) => setBanners(data || []));
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => setCurrentBanner(c => (c + 1) % banners.length), 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const banner = banners[currentBanner];

  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary-soft/30 via-background to-secondary-soft/20">
      {/* Floral decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-background/96 via-background/85 to-background/40" />
      <div className="absolute top-10 right-16 w-40 h-40 rounded-full bg-primary/8 blur-3xl animate-pulse" />
      <div className="absolute bottom-16 left-10 w-48 h-48 rounded-full bg-secondary/8 blur-3xl" />
      <div className="absolute top-1/4 left-1/3 w-24 h-24 rounded-full bg-accent/10 blur-2xl" />
      {/* Petal-like shapes */}
      <div className="absolute top-20 right-1/4 text-primary/10 text-8xl select-none pointer-events-none font-serif">✿</div>
      <div className="absolute bottom-32 left-1/5 text-secondary/10 text-6xl select-none pointer-events-none font-serif rotate-12">❀</div>
      <div className="absolute top-1/2 right-10 text-accent/10 text-7xl select-none pointer-events-none font-serif -rotate-12">✾</div>

      <div className="container relative z-10 px-4 md:px-6 lg:px-8">
        <div className="max-w-3xl space-y-8">
          <span className="text-sm font-medium tracking-[0.3em] uppercase text-muted-foreground/80">
            {t("hero_tagline")}
          </span>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]">
            {banner?.title || t("hero_title")}
          </h1>
          <p className="text-xl text-foreground/70 font-light leading-relaxed max-w-2xl">
            {banner?.subtitle || t("hero_subtitle")}
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <Link to="/products">
              <Button size="lg" className="shadow-elegant hover:shadow-luxury transition-all duration-500 px-10 py-6 text-base font-medium">
                🌷 {t("hero_shop")}
              </Button>
            </Link>
            <Link to="/#about">
              <Button size="lg" variant="outline" className="border-2 px-10 py-6 text-base font-medium">
                {t("hero_story")}
              </Button>
            </Link>
          </div>
          {banners.length > 1 && (
            <div className="flex items-center gap-3 pt-4">
              <button onClick={() => setCurrentBanner(c => (c - 1 + banners.length) % banners.length)}
                className="w-8 h-8 rounded-full bg-card/50 flex items-center justify-center hover:bg-card transition-colors">
                <ChevronLeft className="h-4 w-4" />
              </button>
              {banners.map((_, i) => (
                <button key={i} onClick={() => setCurrentBanner(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === currentBanner ? "bg-primary w-6" : "bg-muted-foreground/30"}`} />
              ))}
              <button onClick={() => setCurrentBanner(c => (c + 1) % banners.length)}
                className="w-8 h-8 rounded-full bg-card/50 flex items-center justify-center hover:bg-card transition-colors">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Hero;
