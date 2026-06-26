import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { localizeCategory } from "@/lib/categoryI18n";
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
  const [priceRange, setPriceRange] = useState("all");
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
        const cat = categories.find(c => c.slug === category);
        if (cat) query = query.eq("category_id", cat.id);
      }
      if (priceRange === "under20000") query = query.lt("price", 20000);
      else if (priceRange === "20000-50000") query = query.gte("price", 20000).lte("price", 50000);
      else if (priceRange === "over50000") query = query.gt("price", 50000);
      if (sort === "popular") query = query.order("review_count", { ascending: false });
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
  }, [category, search, sort, priceRange, categories, saleOnly, language]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams(prev => { prev.set("q", search); return prev; });
  };

  return (
    <div className="min-h-dvh">
      <Navigation />
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
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-[120px] md:w-[140px] rounded-none text-xs min-h-[44px]"><SelectValue placeholder={t("products_category")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("products_all")}</SelectItem>
                  {categories.map(c => <SelectItem key={c.id} value={c.slug}>{localizeCategory(c, t)}</SelectItem>)}
                </SelectContent>
              </Select>
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
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger className="w-[120px] md:w-[150px] rounded-none text-xs min-h-[44px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("products_all_prices")}</SelectItem>
                  <SelectItem value="under20000">{t("products_under_20k")}</SelectItem>
                  <SelectItem value="20000-50000">{t("products_20k_50k")}</SelectItem>
                  <SelectItem value="over50000">{t("products_over_50k")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Category pills */}
          <div className="flex gap-2 overflow-x-auto pb-4 md:pb-6 mb-2 -mx-1 px-1 scrollbar-hide">
            <button
              onClick={() => setCategory("all")}
              className={`text-[11px] md:text-xs font-sans tracking-[0.12em] md:tracking-[0.15em] uppercase whitespace-nowrap px-3 md:px-4 py-2 border transition-colors min-h-[40px] ${
                category === "all" ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground hover:text-foreground hover:border-foreground"
              }`}
            >
              {t("products_all")}
            </button>
            {categories.map(c => (
              <button
                key={c.id}
                onClick={() => setCategory(c.slug)}
                className={`text-[11px] md:text-xs font-sans tracking-[0.12em] md:tracking-[0.15em] uppercase whitespace-nowrap px-3 md:px-4 py-2 border transition-colors min-h-[40px] ${
                  category === c.slug ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground hover:text-foreground hover:border-foreground"
                }`}
              >
                {localizeCategory(c, t)}
              </button>
            ))}
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 lg:gap-8">
              {[...Array(8)].map((_, i) => (
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
            <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 lg:gap-8 transition-opacity duration-200 ${isRefining ? "opacity-60" : "opacity-100"}`}>
              {products.map(product => <ProductCard key={product.id} product={product} />)}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Products;
