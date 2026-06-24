import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Trophy, Medal, Award, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useLanguage, type Language } from "@/contexts/LanguageContext";

type CategoryKey =
  | "all"
  | "toner"
  | "serum"
  | "ampoule"
  | "cream"
  | "sunscreen"
  | "facial_pack"
  | "cleanser"
  | "hair_care"
  | "body_care"
  | "lip_care";

const CATEGORIES: CategoryKey[] = [
  "all",
  "toner",
  "serum",
  "ampoule",
  "cream",
  "sunscreen",
  "facial_pack",
  "cleanser",
  "hair_care",
  "body_care",
  "lip_care",
];

// Keywords (multi-language / synonym) used to match a product to a category
// by scanning its tags and names. Lowercased substring matching.
const CATEGORY_KEYWORDS: Record<Exclude<CategoryKey, "all">, string[]> = {
  toner: ["toner", "토너", "化粧水", "تونر"],
  serum: ["serum", "세럼", "美容液", "سيروم", "sérum"],
  ampoule: ["ampoule", "ampule", "앰플", "アンプル", "أمبولة"],
  cream: ["cream", "크림", "クリーム", "crema", "creme", "crème", "كريم"],
  sunscreen: ["sunscreen", "sun cream", "sun-cream", "spf", "선크림", "선블록", "日焼け止め", "واقي شمس", "protector solar", "sonnenschutz"],
  facial_pack: ["mask", "pack", "팩", "마스크", "パック", "マスク", "mascarilla", "masque", "ماسك", "قناع"],
  cleanser: ["cleanser", "cleansing", "foam", "wash", "클렌저", "클렌징", "폼", "洗顔", "クレンジング", "limpiador", "nettoyant", "منظف"],
  hair_care: ["shampoo", "conditioner", "hair", "헤어", "샴푸", "린스", "트리트먼트", "ヘア", "シャンプー", "cabello", "cheveux", "شعر"],
  body_care: ["body", "lotion", "바디", "로션", "ボディ", "cuerpo", "corps", "جسم"],
  lip_care: ["lip", "balm", "tint", "립", "lèvre", "labio", "リップ", "شفاه"],
};

const I18N: Record<Language, Record<string, string>> = {
  en: {
    title: "Ranking",
    updated: "Updated",
    sold: "sold",
    no_data: "Not enough orders yet for this ranking.",
    period_week: "Weekly",
    period_month: "Monthly",
    period_all: "All time",
    cat_all: "All",
    cat_toner: "Toner",
    cat_serum: "Serum",
    cat_ampoule: "Ampoule",
    cat_cream: "Cream",
    cat_sunscreen: "Sunscreen",
    cat_facial_pack: "Facial Pack",
    cat_cleanser: "Cleanser",
    cat_hair_care: "Hair Care",
    cat_body_care: "Body Care",
    cat_lip_care: "Lip Care",
  },
  es: {
    title: "Ranking",
    updated: "Actualizado",
    sold: "vendidos",
    no_data: "Aún no hay pedidos suficientes para este ranking.",
    period_week: "Semanal",
    period_month: "Mensual",
    period_all: "Todo",
    cat_all: "Todo",
    cat_toner: "Tónico",
    cat_serum: "Sérum",
    cat_ampoule: "Ampolla",
    cat_cream: "Crema",
    cat_sunscreen: "Protector Solar",
    cat_facial_pack: "Mascarilla",
    cat_cleanser: "Limpiador",
    cat_hair_care: "Cabello",
    cat_body_care: "Cuerpo",
    cat_lip_care: "Labios",
  },
  de: {
    title: "Ranking",
    updated: "Aktualisiert",
    sold: "verkauft",
    no_data: "Noch nicht genug Bestellungen für dieses Ranking.",
    period_week: "Wöchentlich",
    period_month: "Monatlich",
    period_all: "Gesamt",
    cat_all: "Alle",
    cat_toner: "Toner",
    cat_serum: "Serum",
    cat_ampoule: "Ampulle",
    cat_cream: "Creme",
    cat_sunscreen: "Sonnenschutz",
    cat_facial_pack: "Gesichtsmaske",
    cat_cleanser: "Reiniger",
    cat_hair_care: "Haarpflege",
    cat_body_care: "Körperpflege",
    cat_lip_care: "Lippenpflege",
  },
  fr: {
    title: "Classement",
    updated: "Mis à jour",
    sold: "vendus",
    no_data: "Pas encore assez de commandes pour ce classement.",
    period_week: "Hebdomadaire",
    period_month: "Mensuel",
    period_all: "Tout",
    cat_all: "Tout",
    cat_toner: "Tonique",
    cat_serum: "Sérum",
    cat_ampoule: "Ampoule",
    cat_cream: "Crème",
    cat_sunscreen: "Écran Solaire",
    cat_facial_pack: "Masque",
    cat_cleanser: "Nettoyant",
    cat_hair_care: "Cheveux",
    cat_body_care: "Corps",
    cat_lip_care: "Lèvres",
  },
  pt: {
    title: "Ranking",
    updated: "Atualizado",
    sold: "vendidos",
    no_data: "Ainda não há pedidos suficientes para este ranking.",
    period_week: "Semanal",
    period_month: "Mensal",
    period_all: "Todo",
    cat_all: "Todos",
    cat_toner: "Tônico",
    cat_serum: "Sérum",
    cat_ampoule: "Ampola",
    cat_cream: "Creme",
    cat_sunscreen: "Protetor Solar",
    cat_facial_pack: "Máscara Facial",
    cat_cleanser: "Limpador",
    cat_hair_care: "Cabelo",
    cat_body_care: "Corpo",
    cat_lip_care: "Lábios",
  },
  ja: {
    title: "ランキング",
    updated: "更新日",
    sold: "個販売",
    no_data: "このランキングを作成するための注文がまだ不足しています。",
    period_week: "週間",
    period_month: "月間",
    period_all: "全期間",
    cat_all: "すべて",
    cat_toner: "化粧水",
    cat_serum: "美容液",
    cat_ampoule: "アンプル",
    cat_cream: "クリーム",
    cat_sunscreen: "日焼け止め",
    cat_facial_pack: "パック",
    cat_cleanser: "クレンザー",
    cat_hair_care: "ヘアケア",
    cat_body_care: "ボディケア",
    cat_lip_care: "リップケア",
  },
  ar: {
    title: "الترتيب",
    updated: "تم التحديث",
    sold: "مبيعاً",
    no_data: "لا توجد طلبات كافية بعد لهذا الترتيب.",
    period_week: "أسبوعي",
    period_month: "شهري",
    period_all: "كل الوقت",
    cat_all: "الكل",
    cat_toner: "تونر",
    cat_serum: "سيروم",
    cat_ampoule: "أمبولة",
    cat_cream: "كريم",
    cat_sunscreen: "واقي شمس",
    cat_facial_pack: "قناع وجه",
    cat_cleanser: "منظف",
    cat_hair_care: "العناية بالشعر",
    cat_body_care: "العناية بالجسم",
    cat_lip_care: "العناية بالشفاه",
  },
};

const useRankI18n = () => {
  const { language } = useLanguage();
  const dict = I18N[language] || I18N.en;
  return (k: string) => dict[k] || I18N.en[k] || k;
};

type Period = "week" | "month" | "all";
const PERIOD_DAYS: Record<Period, number> = { week: 7, month: 30, all: 3650 };

type RankRow = { product_id: string; sales_count: number; rank: number };
type Product = {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  price: number;
  original_price: number | null;
  image_url: string | null;
  thumbnail_url: string | null;
  rating: number | null;
  review_count: number | null;
  tags: string[] | null;
  is_active: boolean;
  translations?: any;
};

const matchesCategory = (product: Product, cat: CategoryKey): boolean => {
  if (cat === "all") return true;
  const keywords = CATEGORY_KEYWORDS[cat];
  if (!keywords) return false;
  const haystack: string[] = [];
  (product.tags || []).forEach((t) => t && haystack.push(t));
  if (product.name) haystack.push(product.name);
  if (product.translations && typeof product.translations === "object") {
    Object.values(product.translations).forEach((v: any) => {
      if (v?.name) haystack.push(String(v.name));
    });
  }
  const blob = haystack.join(" ").toLowerCase();
  return keywords.some((k) => blob.includes(k.toLowerCase()));
};

const RankMedal = ({ rank }: { rank: number }) => {
  if (rank === 1)
    return (
      <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-yellow-500 text-background shadow-md">
        <Trophy className="h-5 w-5 md:h-6 md:w-6" />
      </div>
    );
  if (rank === 2)
    return (
      <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-gradient-to-br from-slate-200 to-slate-400 text-background shadow-md">
        <Medal className="h-5 w-5 md:h-6 md:w-6" />
      </div>
    );
  if (rank === 3)
    return (
      <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-gradient-to-br from-orange-300 to-amber-700 text-background shadow-md">
        <Award className="h-5 w-5 md:h-6 md:w-6" />
      </div>
    );
  return (
    <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center text-base md:text-lg font-serif text-muted-foreground tabular-nums">
      {rank}
    </div>
  );
};

const RankingRow = ({
  product,
  rank,
  salesCount,
  soldLabel,
}: {
  product: Product;
  rank: number;
  salesCount: number;
  soldLabel: string;
}) => {
  const { language, formatPrice } = useLanguage();
  const translatedName = product.translations?.[language]?.name || product.name;
  const img = product.thumbnail_url || product.image_url || "/placeholder.svg";
  const isTop3 = rank <= 3;

  return (
    <Link
      to={`/products/${product.slug}`}
      className={`group flex items-center gap-3 md:gap-4 py-3 md:py-4 px-2 md:px-4 border-b border-border/60 hover:bg-muted/40 transition-colors ${
        isTop3 ? "bg-muted/20" : ""
      }`}
    >
      <RankMedal rank={rank} />
      <div className="relative h-16 w-16 md:h-20 md:w-20 shrink-0 overflow-hidden bg-muted">
        <img
          src={img}
          alt={translatedName}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </div>
      <div className="flex-1 min-w-0">
        {product.brand && (
          <div className="text-[10px] md:text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1 truncate">
            {product.brand}
          </div>
        )}
        <div className="text-sm md:text-base font-serif leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {translatedName}
        </div>
        <div className="mt-1 flex items-center gap-2 text-xs md:text-sm">
          <span className="font-medium">{formatPrice(Number(product.price))}</span>
          {product.original_price && Number(product.original_price) > Number(product.price) && (
            <span className="text-muted-foreground line-through text-[11px] md:text-xs">
              {formatPrice(Number(product.original_price))}
            </span>
          )}
        </div>
      </div>
      <div className="hidden sm:flex flex-col items-end gap-1 text-right">
        <div className="text-[10px] md:text-xs uppercase tracking-wider text-muted-foreground">
          {soldLabel}
        </div>
        <div className="text-sm md:text-base font-serif tabular-nums">
          {salesCount.toLocaleString()}
        </div>
      </div>
    </Link>
  );
};

const Ranking = () => {
  const tr = useRankI18n();
  const [period, setPeriod] = useState<Period>("week");
  const [category, setCategory] = useState<CategoryKey>("all");
  const [rows, setRows] = useState<RankRow[]>([]);
  const [productsById, setProductsById] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(true);

  const updatedLabel = useMemo(() => new Date().toLocaleDateString(), []);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase.rpc("get_top_selling_products", {
        p_skin_type: null,
        p_days: PERIOD_DAYS[period],
        p_limit: 500,
      });
      if (!alive) return;
      if (error || !data) {
        setRows([]);
        setProductsById({});
        setLoading(false);
        return;
      }
      const ranked: RankRow[] = (data as any[]).map((r) => ({
        product_id: r.product_id,
        sales_count: Number(r.sales_count),
        rank: Number(r.rank),
      }));
      const ids = ranked.map((r) => r.product_id);
      if (ids.length === 0) {
        setRows([]);
        setProductsById({});
        setLoading(false);
        return;
      }
      const { data: prods } = await supabase
        .from("products")
        .select("id,name,slug,brand,price,original_price,image_url,thumbnail_url,rating,review_count,tags,is_active,translations")
        .in("id", ids)
        .eq("is_active", true);
      if (!alive) return;
      const map: Record<string, Product> = {};
      (prods || []).forEach((p: any) => (map[p.id] = p));
      setRows(ranked);
      setProductsById(map);
      setLoading(false);
    };
    load();
    return () => {
      alive = false;
    };
  }, [period]);

  // Filter, then re-rank within filtered set, take top 30
  const visible = useMemo(() => {
    const filtered = rows
      .filter((r) => {
        const p = productsById[r.product_id];
        return p && p.is_active && matchesCategory(p, category);
      })
      .slice(0, 30);
    return filtered.map((r, i) => ({ ...r, rank: i + 1 }));
  }, [rows, productsById, category]);

  return (
    <div className="min-h-dvh">
      <Navigation />
      <section className="py-8 md:py-16 px-3 md:px-6 lg:px-8">
        <div className="container max-w-4xl">
          {/* Header */}
          <div className="mb-8 md:mb-12 text-center">
            <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-[0.25em] text-primary mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{tr("updated")} · {updatedLabel}</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-serif font-light">
              {tr("title")}
            </h1>
          </div>

          {/* Period toggle */}
          <div className="flex justify-center mb-5 md:mb-6">
            <div className="inline-flex border border-border rounded-full p-1 bg-background/40 backdrop-blur-sm">
              {(["week", "month", "all"] as Period[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-4 md:px-6 py-2 text-xs md:text-sm tracking-wider rounded-full transition-colors min-h-[36px] ${
                    period === p
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tr(`period_${p}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Category pills */}
          <div className="mb-6 md:mb-8">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1 justify-start md:justify-center">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-xs md:text-sm tracking-wider border transition-colors min-h-[40px] ${
                    category === c
                      ? "bg-foreground text-background border-foreground"
                      : "border-border text-muted-foreground hover:text-foreground hover:border-foreground"
                  }`}
                >
                  {tr(`cat_${c}`)}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
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
              <div className="py-20 text-center text-muted-foreground text-sm">
                {tr("no_data")}
              </div>
            ) : (
              visible.map((r) => (
                <RankingRow
                  key={r.product_id}
                  rank={r.rank}
                  salesCount={r.sales_count}
                  product={productsById[r.product_id]}
                  soldLabel={tr("sold")}
                />
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
