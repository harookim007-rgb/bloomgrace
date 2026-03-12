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
    <section className="py-12 md:py-28 px-3 md:px-6 lg:px-8">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 md:mb-16 gap-3 md:gap-4">
          <div className="space-y-2 md:space-y-3">
            <p className="text-[11px] md:text-sm font-sans font-semibold tracking-[0.18em] md:tracking-[0.2em] uppercase text-primary">
              {t("featured_tagline")}
            </p>
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-serif">{t("featured_title")}</h2>
            <p className="text-sm md:text-lg text-muted-foreground max-w-md">{t("featured_subtitle")}</p>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-sm tracking-[0.1em] uppercase font-sans font-semibold text-foreground/70 hover:text-primary border-b-2 border-foreground/20 hover:border-primary pb-1 transition-colors self-start md:self-auto"
          >
            {t("featured_view_all")} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-8">
          {products.map(product => <ProductCard key={product.id} product={product} />)}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
