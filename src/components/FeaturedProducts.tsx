import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { localizeCategory } from "@/lib/categoryI18n";

interface FeaturedProductsProps {
  source?: "featured" | "new" | "category";
  categoryId?: string;
  limit?: number;
  columns?: number;
  title?: string;
  subtitle?: string;
}

// Product grid for the home page: featured products by default, or the newest / one category.
const FeaturedProducts = ({ source = "featured", categoryId = "", limit = 8, columns = 4, title = "", subtitle = "" }: FeaturedProductsProps) => {
  const { t, language } = useLanguage();
  const [products, setProducts] = useState<any[]>([]);
  const [category, setCategory] = useState<any>(null);

  useEffect(() => {
    let query = supabase.from("products").select("*").eq("is_active", true);
    if (source === "featured") query = query.eq("is_featured", true);
    if (source === "category") {
      if (!categoryId) { setProducts([]); setCategory(null); return; }
      query = query.eq("category_id", categoryId);
      supabase.from("categories").select("*").eq("id", categoryId).maybeSingle().then(({ data }) => setCategory(data));
    }
    query.order("created_at", { ascending: false }).limit(limit).then(({ data }) => setProducts(data || []));
  }, [source, categoryId, limit]);

  const isFeatured = source === "featured";
  const heading = title.trim()
    || (isFeatured ? t("featured_title") : source === "new" ? "New Arrivals" : localizeCategory(category, t, language));
  const description = subtitle.trim() || (isFeatured ? t("featured_subtitle") : "");
  const allLink = source === "category" && category?.slug ? `/products?category=${category.slug}` : "/products";

  return (
    <section className="py-12 md:py-28 px-3 md:px-6 lg:px-8">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 md:mb-16 gap-3 md:gap-4">
          <div className="space-y-2 md:space-y-3 min-w-0">
            {isFeatured && (
              <p className="text-[11px] md:text-sm font-sans font-semibold tracking-[0.18em] md:tracking-[0.2em] uppercase text-primary">
                {t("featured_tagline")}
              </p>
            )}
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-serif break-words">{heading}</h2>
            {description && <p className="text-sm md:text-lg text-muted-foreground max-w-md">{description}</p>}
          </div>
          <Link
            to={allLink}
            className="inline-flex items-center gap-2 text-sm tracking-[0.1em] uppercase font-sans font-semibold text-foreground/70 hover:text-primary border-b-2 border-foreground/20 hover:border-primary pb-1 transition-colors self-start md:self-auto shrink-0"
          >
            {t("featured_view_all")} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className={`grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8 ${columns === 4 ? "xl:grid-cols-4" : ""}`}>
          {products.map(product => <ProductCard key={product.id} product={product} />)}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
