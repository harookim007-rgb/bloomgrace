import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useLanguage } from "@/contexts/LanguageContext";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Heart, ShoppingBag, Star, Minus, Plus } from "lucide-react";
import { toast } from "sonner";

const ProductDetail = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { t, formatPrice, language } = useLanguage();
  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: "", content: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [filterRating, setFilterRating] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      const { data } = await supabase.from("products").select("*, categories(name)").eq("slug", slug).single();
      setProduct(data);
      if (data) fetchReviews(data.id);
      setIsLoading(false);
    };
    fetchProduct();
  }, [slug]);

  const fetchReviews = async (productId: string) => {
    const { data } = await supabase.from("reviews").select("*, profiles(display_name)")
      .eq("product_id", productId).order("created_at", { ascending: false });
    setReviews(data || []);
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !product) return;
    const { error } = await supabase.from("reviews").insert({
      user_id: user.id, product_id: product.id,
      rating: reviewForm.rating, title: reviewForm.title, content: reviewForm.content,
    });
    if (error) {
      toast.error(error.message.includes("duplicate") ? t("pd_already_reviewed") : t("pd_review_fail"));
    } else {
      toast.success(t("pd_review_success"));
      setReviewForm({ rating: 5, title: "", content: "" });
      fetchReviews(product.id);
    }
  };

  const filteredReviews = filterRating > 0 ? reviews.filter(r => r.rating >= filterRating) : reviews;
  const dateFmt = language === "ko" ? "ko-KR" : language === "de" ? "de-DE" : language === "es" ? "es-ES" : "en-US";

  if (isLoading) return <div className="min-h-screen"><Navigation /><div className="flex items-center justify-center py-32">{t("pd_loading")}</div></div>;
  if (!product) return <div className="min-h-screen"><Navigation /><div className="flex items-center justify-center py-32">{t("pd_not_found")}</div></div>;

  const discount = product.original_price ? Math.round((1 - product.price / product.original_price) * 100) : 0;

  return (
    <div className="min-h-screen">
      <Navigation />
      <section className="py-8 px-4 md:px-6 lg:px-8">
        <div className="container max-w-6xl">
          <div className="grid md:grid-cols-2 gap-10">
            <div className="aspect-square rounded-lg overflow-hidden bg-muted/50">
              <img src={product.image_url || "/placeholder.svg"} alt={product.name} className="w-full h-full object-cover" />
            </div>
            <div className="space-y-6">
              {product.brand && <p className="text-sm text-muted-foreground">{product.brand}</p>}
              <h1 className="text-3xl font-bold">{product.name}</h1>
              {product.categories?.name && (
                <span className="inline-block text-xs bg-muted px-3 py-1 rounded-full">{product.categories.name}</span>
              )}
              <div className="flex items-center gap-2">
                <div className="flex">{[1,2,3,4,5].map(s => (
                  <Star key={s} className={`h-5 w-5 ${s <= (product.rating || 0) ? "fill-accent text-accent" : "text-muted"}`} />
                ))}</div>
                <span className="text-sm text-muted-foreground">({product.review_count || 0} {t("pd_reviews")})</span>
              </div>
              <div className="flex items-baseline gap-3">
                {discount > 0 && <span className="text-2xl font-bold text-destructive">-{discount}%</span>}
                <span className="text-3xl font-bold">{formatPrice(product.price)}</span>
                {product.original_price && (
                  <span className="text-lg text-muted-foreground line-through">{formatPrice(product.original_price)}</span>
                )}
              </div>
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
              <p className="text-sm">{product.stock > 0 ? `${t("pd_stock")}: ${product.stock}` : <span className="text-destructive">{t("pd_out_of_stock")}</span>}</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded-md">
                  <Button variant="ghost" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus className="h-4 w-4" /></Button>
                  <span className="w-12 text-center">{quantity}</span>
                  <Button variant="ghost" size="icon" onClick={() => setQuantity(quantity + 1)}><Plus className="h-4 w-4" /></Button>
                </div>
                <Button className="flex-1 gap-2" size="lg" onClick={() => addToCart(product.id, quantity)} disabled={product.stock === 0}>
                  <ShoppingBag className="h-5 w-5" />{t("pd_add_to_cart")}
                </Button>
                <Button variant="outline" size="lg" onClick={() => toggleWishlist(product.id)}>
                  <Heart className={`h-5 w-5 ${isWishlisted(product.id) ? "fill-destructive text-destructive" : ""}`} />
                </Button>
              </div>
            </div>
          </div>
          <div className="mt-16 space-y-8">
            <h2 className="text-2xl font-bold">{t("pd_review_section")} ({reviews.length})</h2>
            <div className="flex gap-2">
              {[0,5,4,3].map(r => (
                <Button key={r} variant={filterRating === r ? "default" : "outline"} size="sm" onClick={() => setFilterRating(r)}>
                  {r === 0 ? t("pd_all") : `${r} ${t("pd_above")}`}
                </Button>
              ))}
            </div>
            {user && (
              <form onSubmit={submitReview} className="space-y-4 p-6 rounded-lg bg-muted/30">
                <h3 className="font-medium">{t("pd_write_review")}</h3>
                <div className="flex gap-1">{[1,2,3,4,5].map(s => (
                  <button key={s} type="button" onClick={() => setReviewForm({ ...reviewForm, rating: s })}>
                    <Star className={`h-6 w-6 ${s <= reviewForm.rating ? "fill-accent text-accent" : "text-muted"}`} />
                  </button>
                ))}</div>
                <Input placeholder={t("pd_review_title")} value={reviewForm.title} onChange={e => setReviewForm({ ...reviewForm, title: e.target.value })} />
                <Textarea placeholder={t("pd_review_content")} value={reviewForm.content} onChange={e => setReviewForm({ ...reviewForm, content: e.target.value })} rows={3} />
                <Button type="submit">{t("pd_submit_review")}</Button>
              </form>
            )}
            <div className="space-y-4">
              {filteredReviews.map(review => (
                <div key={review.id} className="p-4 rounded-lg border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">{[1,2,3,4,5].map(s => (
                      <Star key={s} className={`h-4 w-4 ${s <= review.rating ? "fill-accent text-accent" : "text-muted"}`} />
                    ))}</div>
                    <span className="text-sm text-muted-foreground">{review.profiles?.display_name || t("pd_anonymous")}</span>
                    <span className="text-xs text-muted-foreground">{new Date(review.created_at).toLocaleDateString(dateFmt)}</span>
                  </div>
                  {review.title && <h4 className="font-medium">{review.title}</h4>}
                  {review.content && <p className="text-sm text-muted-foreground mt-1">{review.content}</p>}
                </div>
              ))}
              {filteredReviews.length === 0 && <p className="text-center text-muted-foreground py-8">{t("pd_no_reviews")}</p>}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default ProductDetail;
