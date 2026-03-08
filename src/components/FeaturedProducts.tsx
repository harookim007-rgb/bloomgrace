import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const FeaturedProducts = () => {
  const { t } = useLanguage();
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("products").select("*").eq("is_active", true).eq("is_featured", true).limit(8)
      .then(({ data }) => setProducts(data || []));
  }, []);

  return (
    <section className="py-20 md:py-28 px-4 md:px-6 lg:px-8">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 md:mb-16 gap-4">
          <div className="space-y-3">
            <p className="text-xs font-sans font-medium tracking-[0.3em] uppercase text-muted-foreground">
              {t("featured_tagline")}
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-light">{t("featured_title")}</h2>
          </div>
          <Link to="/products">
            <Button variant="ghost" className="text-xs tracking-[0.15em] uppercase gap-2 font-sans rounded-none border-b border-foreground/20 hover:border-foreground px-0 pb-1">
              {t("featured_view_all")} <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
          {products.map(product => <ProductCard key={product.id} product={product} />)}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
