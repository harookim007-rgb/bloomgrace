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
    <section className="py-16 md:py-[120px] px-4 md:px-6 lg:px-8">
      <div className="container">
        <div className="text-center mb-14 md:mb-20 space-y-4">
          <p className="text-xs font-sans font-light tracking-[0.25em] uppercase text-accent">
            {t("featured_tagline")}
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-normal tracking-[0.04em]">{t("featured_title")}</h2>
          <span className="heading-accent" />
          <p className="text-base text-muted-foreground font-light max-w-md mx-auto">{t("featured_subtitle")}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-10">
          {products.map((product, i) => <ProductCard key={product.id} product={product} index={i} />)}
        </div>
        <div className="text-center mt-14">
          <Link
            to="/products"
            className="link-underline inline-flex items-center gap-2 text-xs tracking-[0.15em] uppercase font-sans font-normal text-foreground/60 hover:text-foreground pb-1 transition-colors"
          >
            {t("featured_view_all")} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
