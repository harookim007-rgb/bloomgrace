import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { localizeCategory } from "@/lib/categoryI18n";
import { categoryIdsFor } from "@/lib/categoryTree";

// Products per row on wide screens; smaller screens use fewer.
const GRID: Record<number, string> = {
  4: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-8 md:gap-x-5 md:gap-y-10",
  5: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-3 gap-y-8 md:gap-x-5 md:gap-y-10",
  6: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-x-3 gap-y-8 md:gap-x-4 md:gap-y-10",
};

interface FeaturedProductsProps {
  source?: "featured" | "new" | "category" | "ranking";
  categoryId?: string;
  limit?: number;
  columns?: number;
  title?: string;
  subtitle?: string;
}

// Product grid for the home page: featured products by default, or the newest / one category.
const FeaturedProducts = ({ source = "featured", categoryId = "", limit = 10, columns = 5, title = "", subtitle = "" }: FeaturedProductsProps) => {
  const gridClass = GRID[columns] || GRID[5];
  const { t, language } = useLanguage();
  const [products, setProducts] = useState<any[]>([]);
  const [category, setCategory] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      let query = supabase.from("products").select("*").eq("is_active", true);
      if (source === "featured") query = query.eq("is_featured", true);
      if (source === "category") {
        if (!categoryId) { setProducts([]); setCategory(null); return; }
        // A top category also includes its subcategories.
        const { data: cats } = await supabase.from("categories").select("*");
        const cat = (cats || []).find(c => c.id === categoryId) || null;
        setCategory(cat);
        query = query.in("category_id", cat ? categoryIdsFor(cats || [], cat.slug) : [categoryId]);
      }
      query = source === "ranking"
        ? query.order("manual_rank", { ascending: true, nullsFirst: false }).order("review_count", { ascending: false })
        : query.order("created_at", { ascending: false });
      const { data } = await query.limit(limit);
      setProducts(data || []);
    };
    load();
  }, [source, categoryId, limit]);

  const isFeatured = source === "featured";
  const heading = title.trim()
    || (isFeatured ? t("featured_title") : source === "new" ? "New Arrivals" : source === "ranking" ? "Best Ranking" : localizeCategory(category, t, language));
  const description = subtitle.trim() || (isFeatured ? t("featured_subtitle") : "");
  const allLink = source === "category" && category?.slug ? `/products?category=${category.slug}` : source === "new" ? "/products?sort=newest" : "/products";

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
        {source === "ranking" && products.length > 3 ? (
          <div className="space-y-10 md:space-y-14">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-6 sm:gap-6 md:gap-8 pt-3 max-w-5xl">
              {products.slice(0, 3).map((product, i) => (
                  // On phones TOP 1 takes the full row, TOP 2 and 3 share the next one.
                  <div key={product.id} className={i === 0 ? "col-span-2 sm:col-span-1" : ""}><ProductCard product={product} rank={i + 1} /></div>
                ))}
            </div>
            <div className={gridClass}>{products.slice(3).map(product => <ProductCard key={product.id} product={product} />)}</div>
          </div>
        ) : (
          <div className={gridClass}>{products.map(product => <ProductCard key={product.id} product={product} />)}</div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;
