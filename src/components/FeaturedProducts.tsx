import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const FeaturedProducts = () => {
  const { t } = useLanguage();
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("products").select("*").eq("is_active", true).eq("is_featured", true).limit(8)
      .then(({ data }) => setProducts(data || []));
  }, []);

  return (
    <section className="py-20 px-4 md:px-6 lg:px-8 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden">
      {/* Floral decorative accents */}
      <div className="absolute top-0 left-0 text-primary/5 text-[12rem] select-none pointer-events-none font-serif -translate-x-1/3 -translate-y-1/4">❁</div>
      <div className="absolute bottom-0 right-0 text-secondary/5 text-[10rem] select-none pointer-events-none font-serif translate-x-1/4 translate-y-1/4">✿</div>

      <div className="container relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-sm font-medium tracking-[0.3em] uppercase text-muted-foreground/70">
            {t("featured_tagline")}
          </span>
          <h2 className="text-4xl md:text-5xl font-bold">{t("featured_title")}</h2>
          <p className="text-lg text-muted-foreground">{t("featured_subtitle")}</p>
          <div className="w-20 h-0.5 bg-gradient-to-r from-primary via-accent to-secondary mx-auto mt-4" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map(product => <ProductCard key={product.id} product={product} />)}
        </div>
        <div className="text-center mt-12">
          <Link to="/products">
            <Button variant="outline" size="lg" className="px-10">{t("featured_view_all")}</Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
