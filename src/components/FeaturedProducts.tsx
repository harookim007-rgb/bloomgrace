import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
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
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-14 md:mb-16 gap-4">
          <div className="space-y-3">
            <p className="text-xs font-sans font-medium tracking-[0.35em] uppercase text-primary">
              {t("featured_tagline")}
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-light">{t("featured_title")}</h2>
            <p className="text-base text-muted-foreground font-light max-w-md">{t("featured_subtitle")}</p>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-[11px] tracking-[0.15em] uppercase font-sans text-foreground/60 hover:text-foreground border-b border-foreground/20 hover:border-foreground pb-1 transition-colors self-start md:self-auto"
          >
            {t("featured_view_all")} <ArrowRight className="h-3 w-3" />
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
