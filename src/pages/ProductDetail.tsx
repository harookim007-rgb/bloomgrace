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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { toast } from "sonner";

const ProductDetail = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { t, language } = useLanguage();
  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: "", content: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [filterRating, setFilterRating] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      const { data } = await supabase.from("products").select("*, categories(name, slug)").eq("slug", slug).single();
      setProduct(data);
      if (data) fetchReviews(data.id);
      setIsLoading(false);
    };
    fetchProduct();
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

  if (isLoading) return <div className="min-h-screen"><Navigation /><div className="flex items-center justify-center py-32 text-sm text-muted-foreground">{t("pd_loading")}</div></div>;
  if (!product) return <div className="min-h-screen"><Navigation /><div className="flex items-center justify-center py-32 text-sm text-muted-foreground">{t("pd_not_found")}</div></div>;

  return (
    <div className="min-h-screen">
      <Navigation />
      <section className="py-8 md:py-16 px-4 md:px-6 lg:px-8">
        <div className="container max-w-6xl">
          <ProductView
            product={product}
            onAddToCart={() => addToCart(product.id, 1)}
            onToggleWishlist={() => toggleWishlist(product.id)}
            isWishlisted={isWishlisted(product.id)}
          />

          {/* Reviews */}
          <div className="mt-20 md:mt-28 space-y-8">
            <div className="border-b border-border pb-4">
              <h2 className="text-xl md:text-2xl font-serif font-light">{t("pd_review_section")} ({reviews.length})</h2>
            </div>

            <div className="flex gap-2">
              {[0,5,4,3].map(r => (
                <button
                  key={r}
                  onClick={() => setFilterRating(r)}
                  className={`text-xs font-sans tracking-wider uppercase px-4 py-2 border transition-colors ${
                    filterRating === r ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground"
                  }`}
                >
                  {r === 0 ? t("pd_all") : `${r}+ ★`}
                </button>
              ))}
            </div>

            {user && (
              <form onSubmit={submitReview} className="space-y-4 p-6 border border-border">
                <h3 className="text-sm font-sans font-medium tracking-wider uppercase">{t("pd_write_review")}</h3>
                <div className="flex gap-1">{[1,2,3,4,5].map(s => (
                  <button key={s} type="button" onClick={() => setReviewForm({ ...reviewForm, rating: s })}>
                    <Star className={`h-5 w-5 ${s <= reviewForm.rating ? "fill-accent text-accent" : "text-border"}`} />
                  </button>
                ))}</div>
                <Input placeholder={t("pd_review_title")} className="rounded-none" value={reviewForm.title} onChange={e => setReviewForm({ ...reviewForm, title: e.target.value })} />
                <Textarea placeholder={t("pd_review_content")} className="rounded-none" value={reviewForm.content} onChange={e => setReviewForm({ ...reviewForm, content: e.target.value })} rows={3} />
                <Button type="submit" className="rounded-none text-xs tracking-wider uppercase">{t("pd_submit_review")}</Button>
              </form>
            )}

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
                  {review.content && <p className="text-sm text-muted-foreground font-light">{review.content}</p>}
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
