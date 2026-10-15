import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { PageBlocks } from "@/components/home/HomeBlocks";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import SEO from "@/components/SEO";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { localizeCategory } from "@/lib/categoryI18n";
import { categoryIdsFor, childCategories, topCategories } from "@/lib/categoryTree";
import { PRODUCT_GRID } from "@/lib/productGrid";

const SUB_ALL: Record<string, string> = { en: "All", es: "Todo", de: "Alle", fr: "Tout", pt: "Tudo", ja: "すべて", ar: "الكل" };
import { getLocalizedBrand, getLocalizedProductName } from "@/lib/productI18n";

const Products = () => {
  const { t, language } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefining, setIsRefining] = useState(false);
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "all");
  const [sort, setSort] = useState(searchParams.get("sort") || "popular");
  const saleOnly = searchParams.get("sale") === "1";

  useEffect(() => {
    supabase.from("categories").select("*").order("sort_order").then(({ data }) => setCategories(data || []));
  }, []);

  useEffect(() => {
    // Wait for categories before applying a specific category filter, but
    // do not block the initial "all" fetch on the categories request.
    if (category !== "all" && categories.length === 0) return;

    const fetchProducts = async () => {
      if (products.length === 0) setIsLoading(true);
      else setIsRefining(true);
      let query = supabase.from("products").select("*").eq("is_active", true);
      if (category !== "all") {
        // A top category also shows the products filed under its subcategories.
        const ids = categoryIdsFor(categories, category);
        if (ids.length) query = query.in("category_id", ids);
      }
      // Popular = the admin ranking (랭킹 관리) first, then the most reviewed.
      if (sort === "popular") query = query.order("manual_rank", { ascending: true, nullsFirst: false }).order("review_count", { ascending: false });
      else if (sort === "newest") query = query.order("created_at", { ascending: false });
      else if (sort === "price-low") query = query.order("price", { ascending: true });
      else if (sort === "price-high") query = query.order("price", { ascending: false });
      else if (sort === "rating") query = query.order("rating", { ascending: false });
      const { data } = await query;
      let list = data || [];
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        list = list.filter((p: any) => [
          getLocalizedProductName(p, language),
          getLocalizedBrand(p, language),
          p.name,
          p.brand,
        ].some((v) => String(v || "").toLowerCase().includes(q)));
      }
      if (saleOnly) list = list.filter((p: any) => p.original_price && Number(p.original_price) > Number(p.price));
      setProducts(list);
      setIsLoading(false);
      setIsRefining(false);
    };
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, search, sort, categories, saleOnly, language]);

  const activeTop = useMemo(() => {
    const cat = categories.find(c => c.slug === category);
    if (!cat) return null;
    return cat.parent_id ? categories.find(c => c.id === cat.parent_id) || null : cat;
  }, [categories, category]);
  const subCategories = activeTop ? childCategories(categories, activeTop.id) : [];
  const showTop = category === "all" && sort === "popular" && !search.trim() && !saleOnly && products.length > 3;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams(prev => { prev.set("q", search); return prev; });
  };

  return (
    <div className="min-h-dvh">
      <SEO
        title="Shop All K-Beauty Products | Youthroom"
        description="Browse Youthroom's curated Korean beauty catalog — skincare, makeup, body and hair essentials with worldwide shipping."
        path="/products"
      />
      <Navigation />
      <PageBlocks page="products" part="top" />
      <section className="py-8 md:py-16 px-3 md:px-6 lg:px-8">
        <div className="container">
          {/* Header */}
          <div className="mb-8 md:mb-12">
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-serif font-light">{t("products_title")}</h1>
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-3 md:gap-4 mb-6 md:mb-8 pb-6 md:pb-8 border-b border-border">
            <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder={t("products_search")} className="pl-10 rounded-none border-border text-sm" value={search}
                  onChange={e => setSearch(e.target.value)} />
              </div>
              <Button type="submit" variant="outline" className="rounded-none text-xs tracking-wider uppercase">{t("products_search_btn")}</Button>
            </form>
            <div className="flex gap-2 flex-wrap overflow-x-auto">
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="w-[110px] md:w-[130px] rounded-none text-xs min-h-[44px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">{t("products_popular")}</SelectItem>
                  <SelectItem value="newest">{t("products_newest")}</SelectItem>
                  <SelectItem value="price-low">{t("products_price_low")}</SelectItem>
                  <SelectItem value="price-high">{t("products_price_high")}</SelectItem>
                  <SelectItem value="rating">{t("products_rating")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Category pills */}
          <div className="flex gap-2 overflow-x-auto pb-4 md:pb-6 mb-2 -mx-1 px-1 scrollbar-hide">
            <button
              onClick={() => setCategory("all")}
              className={`text-xs md:text-sm font-sans font-medium whitespace-nowrap px-3 md:px-4 py-2 border transition-colors min-h-[40px] ${
                category === "all" ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground hover:text-foreground hover:border-foreground"
              }`}
            >
              {t("products_all")}
            </button>
            {topCategories(categories).map(c => (
              <button
                key={c.id}
                onClick={() => setCategory(c.slug)}
                className={`text-xs md:text-sm font-sans font-medium whitespace-nowrap px-3 md:px-4 py-2 border transition-colors min-h-[40px] ${
                  category === c.slug || activeTop?.id === c.id ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground hover:text-foreground hover:border-foreground"
                }`}
              >
                {localizeCategory(c, t as any, language)}
              </button>
            ))}
          </div>

          {/* Subcategories of the chosen top category */}
          {activeTop && subCategories.length > 0 && (
            <div className="flex gap-2 overflow-x-auto -mt-2 pb-4 md:pb-6 mb-2 -mx-1 px-1 scrollbar-hide">
              <button
                onClick={() => setCategory(activeTop.slug)}
                className={`text-xs md:text-sm whitespace-nowrap px-3 py-1.5 rounded-full border transition-colors min-h-[36px] ${category === activeTop.slug ? "border-primary text-primary bg-primary/5 font-semibold" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              >
                {SUB_ALL[language] || SUB_ALL.en}
              </button>
              {subCategories.map(c => (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.slug)}
                  className={`text-xs md:text-sm whitespace-nowrap px-3 py-1.5 rounded-full border transition-colors min-h-[36px] ${category === c.slug ? "border-primary text-primary bg-primary/5 font-semibold" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                >
                  {localizeCategory(c, t as any, language)}
                </button>
              ))}
            </div>
          )}

          {/* Grid */}
          {isLoading ? (
            <div className={PRODUCT_GRID}>
              {[...Array(10)].map((_, i) => (
                <div key={i}>
                  <div className="aspect-[3/4] bg-muted animate-pulse mb-4" />
                  <div className="h-3 bg-muted animate-pulse w-2/3 mb-2" />
                  <div className="h-3 bg-muted animate-pulse w-1/3" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground text-sm">{t("products_no_results")}</div>
          ) : (
            <div className={`space-y-10 md:space-y-14 transition-opacity duration-200 ${isRefining ? "opacity-60" : "opacity-100"}`}>
              {/* The Ranking view (all products, popular order) shows its top 3 larger and framed. */}
              {showTop && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-6 sm:gap-6 md:gap-8 pt-3 max-w-5xl">
                  {products.slice(0, 3).map((product, i) => (
                  // On phones TOP 1 takes the full row, TOP 2 and 3 share the next one.
                  <div key={product.id} className={i === 0 ? "col-span-2 sm:col-span-1" : ""}><ProductCard product={product} rank={i + 1} /></div>
                ))}
                </div>
              )}
              <div className={PRODUCT_GRID}>
                {(showTop ? products.slice(3) : products).map(product => <ProductCard key={product.id} product={product} />)}
              </div>
            </div>
          )}
        </div>
      </section>
      <PageBlocks page="products" part="bottom" />
      <Footer />
    </div>
  );
};

export default Products;
