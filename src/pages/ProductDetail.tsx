import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
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
      user_id: user.id,
      product_id: product.id,
      rating: reviewForm.rating,
      title: reviewForm.title,
      content: reviewForm.content,
    });
    if (error) {
      toast.error(error.message.includes("duplicate") ? "이미 리뷰를 작성하셨습니다." : "리뷰 작성에 실패했습니다.");
    } else {
      toast.success("리뷰가 등록되었습니다!");
      setReviewForm({ rating: 5, title: "", content: "" });
      fetchReviews(product.id);
    }
  };

  const filteredReviews = filterRating > 0 ? reviews.filter(r => r.rating >= filterRating) : reviews;

  if (isLoading) return <div className="min-h-screen"><Navigation /><div className="flex items-center justify-center py-32">로딩 중...</div></div>;
  if (!product) return <div className="min-h-screen"><Navigation /><div className="flex items-center justify-center py-32">상품을 찾을 수 없습니다.</div></div>;

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
                <div className="flex">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} className={`h-5 w-5 ${s <= (product.rating || 0) ? "fill-accent text-accent" : "text-muted"}`} />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">({product.review_count || 0}개 리뷰)</span>
              </div>
              <div className="flex items-baseline gap-3">
                {discount > 0 && <span className="text-2xl font-bold text-destructive">-{discount}%</span>}
                <span className="text-3xl font-bold">{product.price.toLocaleString()}원</span>
                {product.original_price && (
                  <span className="text-lg text-muted-foreground line-through">{product.original_price.toLocaleString()}원</span>
                )}
              </div>
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
              <p className="text-sm">{product.stock > 0 ? `재고: ${product.stock}개` : <span className="text-destructive">품절</span>}</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded-md">
                  <Button variant="ghost" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus className="h-4 w-4" /></Button>
                  <span className="w-12 text-center">{quantity}</span>
                  <Button variant="ghost" size="icon" onClick={() => setQuantity(quantity + 1)}><Plus className="h-4 w-4" /></Button>
                </div>
                <Button className="flex-1 gap-2" size="lg" onClick={() => addToCart(product.id, quantity)} disabled={product.stock === 0}>
                  <ShoppingBag className="h-5 w-5" />장바구니 담기
                </Button>
                <Button variant="outline" size="lg" onClick={() => toggleWishlist(product.id)}>
                  <Heart className={`h-5 w-5 ${isWishlisted(product.id) ? "fill-destructive text-destructive" : ""}`} />
                </Button>
              </div>
            </div>
          </div>

          {/* Reviews */}
          <div className="mt-16 space-y-8">
            <h2 className="text-2xl font-bold">리뷰 ({reviews.length})</h2>
            <div className="flex gap-2">
              {[0,5,4,3].map(r => (
                <Button key={r} variant={filterRating === r ? "default" : "outline"} size="sm"
                  onClick={() => setFilterRating(r)}>
                  {r === 0 ? "전체" : `${r}점 이상`}
                </Button>
              ))}
            </div>
            {user && (
              <form onSubmit={submitReview} className="space-y-4 p-6 rounded-lg bg-muted/30">
                <h3 className="font-medium">리뷰 작성</h3>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(s => (
                    <button key={s} type="button" onClick={() => setReviewForm({ ...reviewForm, rating: s })}>
                      <Star className={`h-6 w-6 ${s <= reviewForm.rating ? "fill-accent text-accent" : "text-muted"}`} />
                    </button>
                  ))}
                </div>
                <Input placeholder="제목" value={reviewForm.title} onChange={e => setReviewForm({ ...reviewForm, title: e.target.value })} />
                <Textarea placeholder="리뷰를 작성해주세요" value={reviewForm.content} onChange={e => setReviewForm({ ...reviewForm, content: e.target.value })} rows={3} />
                <Button type="submit">리뷰 등록</Button>
              </form>
            )}
            <div className="space-y-4">
              {filteredReviews.map(review => (
                <div key={review.id} className="p-4 rounded-lg border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">{[1,2,3,4,5].map(s => (
                      <Star key={s} className={`h-4 w-4 ${s <= review.rating ? "fill-accent text-accent" : "text-muted"}`} />
                    ))}</div>
                    <span className="text-sm text-muted-foreground">{review.profiles?.display_name || "익명"}</span>
                    <span className="text-xs text-muted-foreground">{new Date(review.created_at).toLocaleDateString("ko-KR")}</span>
                  </div>
                  {review.title && <h4 className="font-medium">{review.title}</h4>}
                  {review.content && <p className="text-sm text-muted-foreground mt-1">{review.content}</p>}
                </div>
              ))}
              {filteredReviews.length === 0 && <p className="text-center text-muted-foreground py-8">아직 리뷰가 없습니다.</p>}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default ProductDetail;
