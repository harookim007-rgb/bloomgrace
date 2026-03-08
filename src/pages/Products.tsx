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

const Products = () => {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "all");
  const [sort, setSort] = useState("popular");
  const [priceRange, setPriceRange] = useState("all");

  useEffect(() => {
    supabase.from("categories").select("*").order("sort_order").then(({ data }) => setCategories(data || []));
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      let query = supabase.from("products").select("*").eq("is_active", true);
      if (category !== "all") {
        const cat = categories.find(c => c.slug === category);
        if (cat) query = query.eq("category_id", cat.id);
      }
      if (search) query = query.ilike("name", `%${search}%`);
      if (priceRange === "under20000") query = query.lt("price", 20000);
      else if (priceRange === "20000-50000") query = query.gte("price", 20000).lte("price", 50000);
      else if (priceRange === "over50000") query = query.gt("price", 50000);
      if (sort === "popular") query = query.order("review_count", { ascending: false });
      else if (sort === "newest") query = query.order("created_at", { ascending: false });
      else if (sort === "price-low") query = query.order("price", { ascending: true });
      else if (sort === "price-high") query = query.order("price", { ascending: false });
      else if (sort === "rating") query = query.order("rating", { ascending: false });
      const { data } = await query;
      setProducts(data || []);
      setIsLoading(false);
    };
    fetchProducts();
  }, [category, search, sort, priceRange, categories]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams(prev => { prev.set("q", search); return prev; });
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      <section className="py-8 px-4 md:px-6 lg:px-8">
        <div className="container">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{t("products_title")}</h1>
            <p className="text-muted-foreground">{t("products_subtitle")}</p>
          </div>
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder={t("products_search")} className="pl-10" value={search}
                  onChange={e => setSearch(e.target.value)} />
              </div>
              <Button type="submit" variant="outline">{t("products_search_btn")}</Button>
            </form>
            <div className="flex gap-2 flex-wrap">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-[140px]"><SelectValue placeholder={t("products_category")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("products_all")}</SelectItem>
                  {categories.map(c => <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">{t("products_popular")}</SelectItem>
                  <SelectItem value="newest">{t("products_newest")}</SelectItem>
                  <SelectItem value="price-low">{t("products_price_low")}</SelectItem>
                  <SelectItem value="price-high">{t("products_price_high")}</SelectItem>
                  <SelectItem value="rating">{t("products_rating")}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("products_all_prices")}</SelectItem>
                  <SelectItem value="under20000">{t("products_under_20k")}</SelectItem>
                  <SelectItem value="20000-50000">{t("products_20k_50k")}</SelectItem>
                  <SelectItem value="over50000">{t("products_over_50k")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
            <Button variant={category === "all" ? "default" : "outline"} size="sm" onClick={() => setCategory("all")}>
              {t("products_all")}
            </Button>
            {categories.map(c => (
              <Button key={c.id} variant={category === c.slug ? "default" : "outline"} size="sm"
                onClick={() => setCategory(c.slug)} className="whitespace-nowrap">{c.name}</Button>
            ))}
          </div>
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {[...Array(8)].map((_, i) => <div key={i} className="aspect-square rounded-lg bg-muted animate-pulse" />)}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">{t("products_no_results")}</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
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
