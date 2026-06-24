import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Trophy, Medal, Award, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useLanguage, type Language } from "@/contexts/LanguageContext";

type SkinTypeKey =
  | "dry"
  | "oily"
  | "combination"
  | "sensitive"
  | "dehydrated_oily"
  | "acne_prone";

const SKIN_TYPES: SkinTypeKey[] = [
  "dry",
  "oily",
  "combination",
  "sensitive",
  "dehydrated_oily",
  "acne_prone",
];

const I18N: Record<Language, Record<string, string>> = {
  en: {
    title: "Ranking",
    subtitle: "Most-loved products this week, ranked by real orders.",
    tab_hot: "HOT",
    tab_skin: "BY SKIN TYPE",
    hot_caption: "Weekly Top 30 — across all categories",
    skin_caption: "Top 30 best-sellers for your skin",
    updated: "Updated",
    sold: "sold",
    no_data: "Not enough orders yet for this week's ranking.",
    skin_dry: "Dry",
    skin_oily: "Oily",
    skin_combination: "Combination",
    skin_sensitive: "Sensitive",
    skin_dehydrated_oily: "Dehydrated-Oily",
    skin_acne_prone: "Acne-Prone",
    skin_dry_desc: "Tightness, flakes, rough texture",
    skin_oily_desc: "Excess sebum, shine, visible pores",
    skin_combination_desc: "Oily T-zone, dry cheeks",
    skin_sensitive_desc: "Easily reddens, stings, reacts",
    skin_dehydrated_oily_desc: "Dry inside, oily on the surface",
    skin_acne_prone_desc: "Breakouts, congestion, inflammation",
  },
  es: {
    title: "Ranking",
    subtitle: "Los productos más queridos esta semana, según pedidos reales.",
    tab_hot: "HOT",
    tab_skin: "POR TIPO DE PIEL",
    hot_caption: "Top 30 semanal — todas las categorías",
    skin_caption: "Top 30 para tu tipo de piel",
    updated: "Actualizado",
    sold: "vendidos",
    no_data: "Aún no hay suficientes pedidos para el ranking de esta semana.",
    skin_dry: "Seca",
    skin_oily: "Grasa",
    skin_combination: "Mixta",
    skin_sensitive: "Sensible",
    skin_dehydrated_oily: "Deshidratada-Grasa",
    skin_acne_prone: "Con Acné",
    skin_dry_desc: "Tirantez, descamación, textura áspera",
    skin_oily_desc: "Exceso de sebo, brillo, poros visibles",
    skin_combination_desc: "Zona T grasa, mejillas secas",
    skin_sensitive_desc: "Se enrojece fácilmente, escuece, reacciona",
    skin_dehydrated_oily_desc: "Seca por dentro, grasa por fuera",
    skin_acne_prone_desc: "Granos, congestión, inflamación",
  },
  de: {
    title: "Ranking",
    subtitle: "Die beliebtesten Produkte der Woche – nach echten Bestellungen.",
    tab_hot: "HOT",
    tab_skin: "NACH HAUTTYP",
    hot_caption: "Wöchentliche Top 30 – über alle Kategorien",
    skin_caption: "Top 30 für deinen Hauttyp",
    updated: "Aktualisiert",
    sold: "verkauft",
    no_data: "Noch nicht genug Bestellungen für das Wochen-Ranking.",
    skin_dry: "Trocken",
    skin_oily: "Fettig",
    skin_combination: "Misch",
    skin_sensitive: "Empfindlich",
    skin_dehydrated_oily: "Dehydriert-Fettig",
    skin_acne_prone: "Akne-anfällig",
    skin_dry_desc: "Spannungsgefühl, Schuppen, raue Textur",
    skin_oily_desc: "Überschüssiger Talg, Glanz, sichtbare Poren",
    skin_combination_desc: "Fettige T-Zone, trockene Wangen",
    skin_sensitive_desc: "Wird schnell rot, brennt, reagiert",
    skin_dehydrated_oily_desc: "Innen trocken, außen fettig",
    skin_acne_prone_desc: "Unreinheiten, Verstopfung, Entzündung",
  },
  fr: {
    title: "Classement",
    subtitle: "Les produits les plus aimés cette semaine, basés sur les commandes.",
    tab_hot: "HOT",
    tab_skin: "PAR TYPE DE PEAU",
    hot_caption: "Top 30 hebdomadaire — toutes catégories",
    skin_caption: "Top 30 pour votre type de peau",
    updated: "Mis à jour",
    sold: "vendus",
    no_data: "Pas encore assez de commandes pour le classement de la semaine.",
    skin_dry: "Sèche",
    skin_oily: "Grasse",
    skin_combination: "Mixte",
    skin_sensitive: "Sensible",
    skin_dehydrated_oily: "Déshydratée-Grasse",
    skin_acne_prone: "Acnéique",
    skin_dry_desc: "Tiraillements, desquamation, texture rugueuse",
    skin_oily_desc: "Excès de sébum, brillance, pores visibles",
    skin_combination_desc: "Zone T grasse, joues sèches",
    skin_sensitive_desc: "Rougit facilement, picote, réagit",
    skin_dehydrated_oily_desc: "Sèche à l'intérieur, grasse en surface",
    skin_acne_prone_desc: "Boutons, congestion, inflammation",
  },
  pt: {
    title: "Ranking",
    subtitle: "Os produtos mais amados da semana, com base em pedidos reais.",
    tab_hot: "HOT",
    tab_skin: "POR TIPO DE PELE",
    hot_caption: "Top 30 semanal — todas as categorias",
    skin_caption: "Top 30 para o seu tipo de pele",
    updated: "Atualizado",
    sold: "vendidos",
    no_data: "Ainda não há pedidos suficientes para o ranking desta semana.",
    skin_dry: "Seca",
    skin_oily: "Oleosa",
    skin_combination: "Mista",
    skin_sensitive: "Sensível",
    skin_dehydrated_oily: "Desidratada-Oleosa",
    skin_acne_prone: "Acneica",
    skin_dry_desc: "Repuxa, descamação, textura áspera",
    skin_oily_desc: "Excesso de oleosidade, brilho, poros visíveis",
    skin_combination_desc: "Zona T oleosa, bochechas secas",
    skin_sensitive_desc: "Avermelha fácil, arde, reage",
    skin_dehydrated_oily_desc: "Seca por dentro, oleosa por fora",
    skin_acne_prone_desc: "Espinhas, cravos, inflamação",
  },
  ja: {
    title: "ランキング",
    subtitle: "実際の注文に基づく、今週もっとも愛された商品。",
    tab_hot: "HOT",
    tab_skin: "肌タイプ別",
    hot_caption: "週間TOP30 — 全カテゴリー",
    skin_caption: "あなたの肌タイプ別TOP30",
    updated: "更新日",
    sold: "個販売",
    no_data: "今週のランキングを作成するための注文がまだ不足しています。",
    skin_dry: "乾燥肌",
    skin_oily: "脂性肌",
    skin_combination: "混合肌",
    skin_sensitive: "敏感肌",
    skin_dehydrated_oily: "インナードライ",
    skin_acne_prone: "ニキビ肌",
    skin_dry_desc: "つっぱり、粉吹き、ざらつき",
    skin_oily_desc: "皮脂が多い、テカリ、毛穴の目立ち",
    skin_combination_desc: "Tゾーンはテカり、頬は乾燥",
    skin_sensitive_desc: "赤くなりやすい、刺激に弱い",
    skin_dehydrated_oily_desc: "内側は乾燥、表面はテカり",
    skin_acne_prone_desc: "ニキビ、詰まり、炎症",
  },
  ar: {
    title: "الترتيب",
    subtitle: "المنتجات الأكثر إعجاباً هذا الأسبوع، بناءً على الطلبات الفعلية.",
    tab_hot: "الأكثر رواجاً",
    tab_skin: "حسب نوع البشرة",
    hot_caption: "أفضل 30 أسبوعياً — جميع الفئات",
    skin_caption: "أفضل 30 لنوع بشرتك",
    updated: "تم التحديث",
    sold: "مبيعاً",
    no_data: "لا توجد طلبات كافية بعد لترتيب هذا الأسبوع.",
    skin_dry: "جافة",
    skin_oily: "دهنية",
    skin_combination: "مختلطة",
    skin_sensitive: "حساسة",
    skin_dehydrated_oily: "جافة-دهنية",
    skin_acne_prone: "معرضة لحب الشباب",
    skin_dry_desc: "شد، تقشر، ملمس خشن",
    skin_oily_desc: "زيوت زائدة، لمعان، مسام واضحة",
    skin_combination_desc: "منطقة T دهنية، خدود جافة",
    skin_sensitive_desc: "تحمر بسهولة، تلسع، تتفاعل",
    skin_dehydrated_oily_desc: "جافة من الداخل، دهنية من الخارج",
    skin_acne_prone_desc: "بثور، انسداد، التهاب",
  },
};

const useRankI18n = () => {
  const { language } = useLanguage();
  const dict = I18N[language] || I18N.en;
  return (k: string) => dict[k] || I18N.en[k] || k;
};

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
  translations?: any;
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
  row,
  soldLabel,
}: {
  product: Product;
  row: RankRow;
  soldLabel: string;
}) => {
  const { language, formatPrice } = useLanguage();
  const translatedName = product.translations?.[language]?.name || product.name;
  const img = product.thumbnail_url || product.image_url || "/placeholder.svg";
  const isTop3 = row.rank <= 3;

  return (
    <Link
      to={`/products/${product.slug}`}
      className={`group flex items-center gap-3 md:gap-4 py-3 md:py-4 px-2 md:px-4 border-b border-border/60 hover:bg-muted/40 transition-colors ${
        isTop3 ? "bg-muted/20" : ""
      }`}
    >
      <RankMedal rank={row.rank} />
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
          {row.sales_count.toLocaleString()}
        </div>
      </div>
    </Link>
  );
};

const Ranking = () => {
  const tr = useRankI18n();
  const [tab, setTab] = useState<"hot" | "skin">("hot");
  const [skinType, setSkinType] = useState<SkinTypeKey>("dry");
  const [rows, setRows] = useState<RankRow[]>([]);
  const [productsById, setProductsById] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(true);

  const updatedLabel = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString();
  }, []);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      setLoading(true);
      const skinArg = tab === "skin" ? skinType : null;
      const { data, error } = await supabase.rpc("get_top_selling_products", {
        p_skin_type: skinArg,
        p_days: 7,
        p_limit: 30,
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
      setRows(ranked);
      const ids = ranked.map((r) => r.product_id);
      if (ids.length === 0) {
        setProductsById({});
        setLoading(false);
        return;
      }
      const { data: prods } = await supabase
        .from("products")
        .select("id,name,slug,brand,price,original_price,image_url,thumbnail_url,rating,review_count,translations")
        .in("id", ids);
      if (!alive) return;
      const map: Record<string, Product> = {};
      (prods || []).forEach((p: any) => (map[p.id] = p));
      setProductsById(map);
      setLoading(false);
    };
    load();
    return () => {
      alive = false;
    };
  }, [tab, skinType]);

  const orderedRows = rows.filter((r) => productsById[r.product_id]);

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
            <h1 className="text-3xl md:text-5xl font-serif font-light mb-3">
              {tr("title")}
            </h1>
            <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
              {tr("subtitle")}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center mb-6 md:mb-8 border-b border-border">
            {(["hot", "skin"] as const).map((k) => (
              <button
                key={k}
                onClick={() => setTab(k)}
                className={`relative px-6 md:px-10 py-3 md:py-4 text-xs md:text-sm tracking-[0.2em] uppercase transition-colors min-h-[44px] ${
                  tab === k ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {k === "hot" ? tr("tab_hot") : tr("tab_skin")}
                {tab === k && (
                  <span className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-foreground" />
                )}
              </button>
            ))}
          </div>

          {/* Skin type pills */}
          {tab === "skin" && (
            <div className="mb-6 md:mb-8">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
                {SKIN_TYPES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSkinType(s)}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-xs md:text-sm tracking-wider border transition-colors min-h-[40px] ${
                      skinType === s
                        ? "bg-foreground text-background border-foreground"
                        : "border-border text-muted-foreground hover:text-foreground hover:border-foreground"
                    }`}
                  >
                    {tr(`skin_${s}`)}
                  </button>
                ))}
              </div>
              <p className="text-center text-xs md:text-sm text-muted-foreground mt-3 italic">
                {tr(`skin_${skinType}_desc`)}
              </p>
            </div>
          )}

          {/* Caption */}
          <div className="text-center text-[11px] md:text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4 md:mb-6">
            {tab === "hot" ? tr("hot_caption") : tr("skin_caption")}
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
            ) : orderedRows.length === 0 ? (
              <div className="py-20 text-center text-muted-foreground text-sm">
                {tr("no_data")}
              </div>
            ) : (
              orderedRows.map((r) => (
                <RankingRow
                  key={r.product_id}
                  row={r}
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
