import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Hero = () => {
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
      <div className="absolute inset-0 bg-gradient-to-r from-background/96 via-background/85 to-background/40" />
      <div className="absolute top-20 right-10 w-32 h-32 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-20 left-10 w-40 h-40 rounded-full bg-secondary/10 blur-3xl" />

      <div className="container relative z-10 px-4 md:px-6 lg:px-8">
        <div className="max-w-3xl space-y-8">
          <span className="text-sm font-medium tracking-[0.3em] uppercase text-muted-foreground/80">
            Premium Korean Beauty
          </span>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]">
            {banner?.title || "Bloom & Grace"}
          </h1>
          <p className="text-xl text-foreground/70 font-light leading-relaxed max-w-2xl">
            {banner?.subtitle || "한국의 아름다움을 담은 프리미엄 화장품. 자연에서 온 귀한 성분으로 당신의 우아함을 완성합니다."}
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <Link to="/products">
              <Button size="lg" className="shadow-elegant hover:shadow-luxury transition-all duration-500 px-10 py-6 text-base font-medium">
                컬렉션 보기
              </Button>
            </Link>
            <Link to="/#about">
              <Button size="lg" variant="outline" className="border-2 px-10 py-6 text-base font-medium">
                브랜드 스토리
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
