import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Trophy, Medal, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { useLanguage, type Language } from "@/contexts/LanguageContext";
import { getLocalizedBrand, getLocalizedProductName } from "@/lib/productI18n";

const I18N: Record<Language, Record<string, string>> = {
  en: { title: "Ranking", sold: "sold", no_data: "Not enough orders yet for this ranking.", period_week: "Weekly", period_month: "Monthly" },
  es: { title: "Ranking", sold: "vendidos", no_data: "Aún no hay pedidos suficientes para este ranking.", period_week: "Semanal", period_month: "Mensual" },
  de: { title: "Ranking", sold: "verkauft", no_data: "Noch nicht genug Bestellungen für dieses Ranking.", period_week: "Wöchentlich", period_month: "Monatlich" },
  fr: { title: "Classement", sold: "vendus", no_data: "Pas encore assez de commandes pour ce classement.", period_week: "Hebdomadaire", period_month: "Mensuel" },
  pt: { title: "Ranking", sold: "vendidos", no_data: "Ainda não há pedidos suficientes para este ranking.", period_week: "Semanal", period_month: "Mensal" },
  ja: { title: "ランキング", sold: "個販売", no_data: "このランキングを作成するための注文がまだ不足しています。", period_week: "週間", period_month: "月間" },
  ar: { title: "الترتيب", sold: "مبيعاً", no_data: "لا توجد طلبات كافية بعد لهذا الترتيب.", period_week: "أسبوعي", period_month: "شهري" },
};

const useRankI18n = () => {
  const { language } = useLanguage();
  const dict = I18N[language] || I18N.en;
  return (k: string) => dict[k] || I18N.en[k] || k;
};

type Period = "week" | "month";
const PERIOD_DAYS: Record<Period, number> = { week: 7, month: 30 };

type Product = {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  price: number;
  original_price: number | null;
  image_url: string | null;
  thumbnail_url: string | null;
  is_active: boolean;
  manual_rank: number | null;
  translations?: any;
};

const RankMedal = ({ rank }: { rank: number }) => {
  if (rank === 1) return <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-yellow-500 text-background shadow-md"><Trophy className="h-5 w-5 md:h-6 md:w-6" /></div>;
  if (rank === 2) return <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-gradient-to-br from-slate-200 to-slate-400 text-background shadow-md"><Medal className="h-5 w-5 md:h-6 md:w-6" /></div>;
  if (rank === 3) return <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-gradient-to-br from-orange-300 to-amber-700 text-background shadow-md"><Award className="h-5 w-5 md:h-6 md:w-6" /></div>;
  return <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center text-base md:text-lg font-serif text-muted-foreground tabular-nums">{rank}</div>;
};

const RankingRow = ({ product, rank, salesCount, soldLabel }: { product: Product; rank: number; salesCount: number; soldLabel: string }) => {
  const { language, formatPrice } = useLanguage();
  const translatedName = getLocalizedProductName(product, language);
  const translatedBrand = getLocalizedBrand(product, language);
  const img = product.thumbnail_url || product.image_url || "/placeholder.svg";
  const isTop3 = rank <= 3;
  return (
    <Link
      to={`/products/${product.slug}`}
      className={`group flex items-center gap-3 md:gap-4 py-3 md:py-4 px-2 md:px-4 border-b border-border/60 hover:bg-muted/40 transition-colors ${isTop3 ? "bg-muted/20" : ""}`}
    >
      <RankMedal rank={rank} />
      <div className="relative h-16 w-16 md:h-20 md:w-20 shrink-0 overflow-hidden bg-muted">
        <img src={img} alt={translatedName} className="h-full w-full object-contain transition-transform duration-500" loading="lazy" />
      </div>
      <div className="flex-1 min-w-0">
        {translatedBrand && <div className="text-[10px] md:text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1 truncate">{translatedBrand}</div>}
        <div className="text-sm md:text-base font-serif leading-snug line-clamp-2 group-hover:text-primary transition-colors">{translatedName}</div>
        <div className="mt-1 flex items-center gap-2 text-xs md:text-sm">
          <span className="font-medium">{formatPrice(Number(product.price))}</span>
          {product.original_price && Number(product.original_price) > Number(product.price) && (
            <span className="text-muted-foreground line-through text-[11px] md:text-xs">{formatPrice(Number(product.original_price))}</span>
          )}
        </div>
      </div>
      {salesCount > 0 && (
        <div className="hidden sm:flex flex-col items-end gap-1 text-right">
          <div className="text-[10px] md:text-xs uppercase tracking-wider text-muted-foreground">{soldLabel}</div>
          <div className="text-sm md:text-base font-serif tabular-nums">{salesCount.toLocaleString()}</div>
        </div>
      )}
    </Link>
  );
};

type RankItem = { product: Product; salesCount: number };

const Ranking = () => {
  const tr = useRankI18n();
  const [period, setPeriod] = useState<Period>("week");
  const [items, setItems] = useState<RankItem[]>([]);
  const [loading, setLoading] = useState(true);
  const periods: Period[] = ["week", "month"];

  useEffect(() => {
    let alive = true;
    const load = async () => {
      setLoading(true);
      // 1. Top selling
      const { data: salesResp } = await supabase.functions.invoke("top-selling-products", {
        body: { p_skin_type: null, p_days: PERIOD_DAYS[period], p_limit: 100 },
      });
      const salesData = (salesResp as any)?.data ?? [];
      // 2. Manually pinned products (always shown)
      const { data: pinnedData } = await supabase
        .from("products")
        .select("id,name,slug,brand,price,original_price,image_url,thumbnail_url,is_active,manual_rank,translations")
        .eq("is_active", true)
        .not("manual_rank", "is", null)
        .order("manual_rank", { ascending: true });

      const salesArr = (salesData as any[]) || [];
      const salesIds = salesArr.map((r) => r.product_id);
      const salesMap: Record<string, number> = {};
      salesArr.forEach((r) => (salesMap[r.product_id] = Number(r.sales_count)));

      let salesProducts: Product[] = [];
      if (salesIds.length) {
        const { data } = await supabase
          .from("products")
          .select("id,name,slug,brand,price,original_price,image_url,thumbnail_url,is_active,manual_rank,translations")
          .in("id", salesIds)
          .eq("is_active", true);
        salesProducts = (data || []) as Product[];
      }

      if (!alive) return;

      const byId: Record<string, Product> = {};
      (pinnedData || []).forEach((p: any) => (byId[p.id] = p));
      salesProducts.forEach((p) => { if (!byId[p.id]) byId[p.id] = p; });

      const pinned = (pinnedData || []) as Product[];
      const pinnedIds = new Set(pinned.map((p) => p.id));

      const pinnedItems: RankItem[] = pinned.map((p) => ({
        product: p, salesCount: salesMap[p.id] || 0,
      }));

      const salesItems: RankItem[] = salesArr
        .filter((r) => byId[r.product_id] && !pinnedIds.has(r.product_id))
        .map((r) => ({ product: byId[r.product_id], salesCount: Number(r.sales_count) }));

      const final = [...pinnedItems, ...salesItems].slice(0, 30);
      setItems(final);
      setLoading(false);
    };
    load();
    return () => { alive = false; };
  }, [period]);

  const visible = useMemo(() => items.map((it, i) => ({ ...it, rank: i + 1 })), [items]);

  return (
    <div className="min-h-dvh" data-ranking-page="sales-only">
      <Navigation />
      <section className="py-8 md:py-16 px-3 md:px-6 lg:px-8">
        <div className="container max-w-4xl">
          <div className="mb-8 md:mb-12 text-center">
            <h1 className="text-3xl md:text-5xl font-serif font-light">{tr("title")}</h1>
          </div>

          <div className="flex justify-center mb-6 md:mb-8">
            <div className="inline-flex border border-border rounded-full p-1 bg-background/40 backdrop-blur-sm">
              {periods.map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-5 md:px-7 py-2 text-xs md:text-sm tracking-wider rounded-full transition-colors min-h-[36px] ${
                    period === p ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tr(`period_${p}`)}
                </button>
              ))}
            </div>
          </div>

          <div className="border border-border bg-background/40 backdrop-blur-sm">
            {loading ? (
              <div className="divide-y divide-border">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 py-4 px-4">
                    <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
                    <div className="h-20 w-20 bg-muted animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-1/3 bg-muted animate-pulse" />
                      <div className="h-3 w-2/3 bg-muted animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : visible.length === 0 ? (
              <div className="py-20 text-center text-muted-foreground text-sm">{tr("no_data")}</div>
            ) : (
              visible.map((r) => (
                <RankingRow key={r.product.id} rank={r.rank} salesCount={r.salesCount} product={r.product} soldLabel={tr("sold")} />
              ))
            )}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Ranking;
