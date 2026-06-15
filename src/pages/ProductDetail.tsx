import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useLanguage } from "@/contexts/LanguageContext";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ProductView from "@/components/ProductView";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart, adding } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { t, language } = useLanguage();
  const [product, setProduct] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterRating, setFilterRating] = useState(0);

  const loadProduct = async () => {
    const { data } = await supabase.from("products").select("*, categories(name, slug)").eq("slug", slug).single();
    setProduct(data);
    if (data) {
      fetchReviews(data.id);
      if (data.related_product_ids?.length) {
        const { data: rel } = await supabase
          .from("products")
          .select("id, name, slug, price, original_price, image_url, stock")
          .in("id", data.related_product_ids)
          .eq("is_active", true);
        setRelated(rel || []);
      } else {
        setRelated([]);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadProduct();
    // Realtime sync: refetch when this product is updated by admin
    const ch = supabase
      .channel(`product-${slug}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "products" }, (payload: any) => {
        if (payload.new?.slug === slug || payload.old?.slug === slug) loadProduct();
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const fetchReviews = async (productId: string) => {
    const { data } = await supabase
      .from("reviews")
      .select("*, profiles(display_name)")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });
    setReviews(data || []);
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !product) return;
    const { error } = await supabase.from("reviews").insert({
      user_id: user.id, product_id: product.id,
      rating: reviewForm.rating, title: reviewForm.title, content: reviewForm.content,
      image_urls: reviewForm.image_urls,
    } as any);
    if (error) {
      toast.error(error.message.includes("duplicate") ? t("pd_already_reviewed") : t("pd_review_fail"));
    } else {
      toast.success(t("pd_review_success") + " · 1000P 적립!");
      setReviewForm({ rating: 5, title: "", content: "", image_urls: [] });
      fetchReviews(product.id);
    }
  };

  const filteredReviews = filterRating > 0 ? reviews.filter(r => r.rating >= filterRating) : reviews;
  const dateFmt = language === "de" ? "de-DE" : language === "es" ? "es-ES" : language === "fr" ? "fr-FR" : language === "pt" ? "pt-BR" : language === "ar" ? "ar-SA" : "en-US";

  if (isLoading) return <div className="min-h-screen"><Navigation /><div className="flex items-center justify-center py-32 text-sm text-muted-foreground">{t("pd_loading")}</div></div>;
  if (!product) return <div className="min-h-screen"><Navigation /><div className="flex items-center justify-center py-32 text-sm text-muted-foreground">{t("pd_not_found")}</div></div>;

  return (
    <div className="min-h-screen">
      <Navigation />
      <section className="py-8 md:py-16 px-4 md:px-6 lg:px-8">
        <div className="container max-w-6xl">
          <ProductView
            product={product}
            isAddingToCart={adding}
            onAddToCart={async (qty) => {
              const ok = await addToCart(product.id, qty);
              if (ok) navigate("/checkout");
            }}
            onBuyNow={(qty) => {
              sessionStorage.setItem("buyNow", JSON.stringify({
                product_id: product.id,
                product_name: product.name,
                product_image: product.image_url,
                price: product.price,
                stock: product.stock,
                quantity: qty,
              }));
              navigate("/checkout?buyNow=1");
            }}
            onToggleWishlist={() => toggleWishlist(product.id)}
            isWishlisted={isWishlisted(product.id)}
          />

          {/* Related products */}
          {related.length > 0 && (
            <div className="mt-20 md:mt-28">
              <div className="border-b border-border pb-4 mb-8">
                <h2 className="text-xl md:text-2xl font-serif font-light">함께 보면 좋은 상품</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {related.map((r) => (
                  <div key={r.id} className="group">
                    <button
                      onClick={() => navigate(`/product/${r.slug}`)}
                      className="block w-full aspect-square overflow-hidden bg-muted/30 mb-3"
                    >
                      <img
                        src={r.image_url || "/placeholder.svg"}
                        alt={r.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </button>
                    <button onClick={() => navigate(`/product/${r.slug}`)} className="text-left w-full">
                      <p className="text-sm font-serif line-clamp-2">{r.name}</p>
                      <p className="text-sm font-sans mt-1">{Number(r.price).toLocaleString()}원</p>
                    </button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full rounded-none mt-2 text-[10px] tracking-[0.15em] uppercase"
                      disabled={r.stock <= 0 || adding}
                      onClick={async () => {
                        const ok = await addToCart(r.id, 1, { silent: false });
                        if (ok) navigate("/checkout");
                      }}
                    >
                      {r.stock <= 0 ? "품절" : "장바구니"}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}


          {/* Reviews */}
          <div className="mt-20 md:mt-28 space-y-8">
            <div className="border-b border-border pb-4">
              <h2 className="text-xl md:text-2xl font-serif font-light">{t("pd_review_section")} ({reviews.length})</h2>
            </div>

            <div className="flex gap-2 flex-wrap">
              {[0,5,4,3,2,1].map(r => (
                <button
                  key={r}
                  onClick={() => setFilterRating(r)}
                  className={`text-xs font-sans tracking-wider uppercase px-4 py-2 border transition-colors ${
                    filterRating === r ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground"
                  }`}
                >
                  {r === 0 ? t("pd_all") : `${r}★ ${t("pd_above")}`}
                </button>
              ))}
            </div>


            <div className="p-4 border border-border bg-muted/30 text-xs text-muted-foreground text-center">
              {{
                en: "Reviews can only be written from My Page after your order is delivered.",
                es: "Las reseñas solo se pueden escribir desde Mi Página después de la entrega.",
                de: "Bewertungen können nur nach Lieferung über Mein Konto verfasst werden.",
                fr: "Les avis ne peuvent être rédigés que depuis Mon Compte après la livraison.",
                pt: "As avaliações só podem ser escritas em Minha Conta após a entrega.",
                ja: "レビューは配送完了後、マイページから作成できます。",
                ar: "يمكن كتابة التقييمات فقط من حسابي بعد استلام الطلب.",
              }[language]}
            </div>

            <div className="space-y-0">
              {filteredReviews.map(review => (
                <div key={review.id} className="py-6 border-b border-border">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex">{[1,2,3,4,5].map(s => (
                      <Star key={s} className={`h-3.5 w-3.5 ${s <= review.rating ? "fill-accent text-accent" : "text-border"}`} />
                    ))}</div>
                    <span className="text-xs text-muted-foreground">{review.profiles?.display_name || t("pd_anonymous")}</span>
                    <span className="text-xs text-muted-foreground/60">{new Date(review.created_at).toLocaleDateString(dateFmt)}</span>
                  </div>
                  {review.title && <h4 className="text-sm font-medium mb-1">{review.title}</h4>}
                  {review.content && <p className="text-sm text-muted-foreground font-light whitespace-pre-line">{review.content}</p>}
                  {Array.isArray(review.image_urls) && review.image_urls.length > 0 && (
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {review.image_urls.map((u: string, i: number) => (
                        <a key={i} href={u} target="_blank" rel="noreferrer" className="block w-24 h-24 border border-border">
                          <img src={u} alt="review" loading="lazy" className="w-full h-full object-cover" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {filteredReviews.length === 0 && <p className="text-center text-muted-foreground py-12 text-sm">{t("pd_no_reviews")}</p>}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default ProductDetail;
