import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/hooks/useCart";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ReviewPhotoUploader from "@/components/ReviewPhotoUploader";
import { Clock, RotateCcw, Star, PenLine } from "lucide-react";
import { toast } from "sonner";

const REVIEW_I18N: Record<string, { write: string; notice: string; title: string; content: string; submit: string; done: string; success: string; dup: string; fail: string; rating: string; }> = {
  en: { write: "Write a review", notice: "Earn 1,000P when you write a review (usable at checkout).", title: "Title", content: "Share your experience...", submit: "Submit", done: "Reviewed", success: "Review submitted · 1,000P earned!", dup: "You've already reviewed this product.", fail: "Failed to submit review.", rating: "Rating" },
  es: { write: "Escribir reseña", notice: "Gana 1.000P al escribir una reseña (usable al pagar).", title: "Título", content: "Comparte tu experiencia...", submit: "Enviar", done: "Reseñado", success: "¡Reseña enviada · 1.000P ganados!", dup: "Ya has reseñado este producto.", fail: "Error al enviar.", rating: "Calificación" },
  de: { write: "Bewertung schreiben", notice: "Erhalten Sie 1.000P für jede Bewertung (beim Checkout einlösbar).", title: "Titel", content: "Teilen Sie Ihre Erfahrung...", submit: "Senden", done: "Bewertet", success: "Bewertung gesendet · 1.000P erhalten!", dup: "Sie haben dieses Produkt bereits bewertet.", fail: "Senden fehlgeschlagen.", rating: "Bewertung" },
  fr: { write: "Écrire un avis", notice: "Gagnez 1 000P en publiant un avis (utilisable au paiement).", title: "Titre", content: "Partagez votre expérience...", submit: "Envoyer", done: "Avis publié", success: "Avis publié · 1 000P gagnés !", dup: "Vous avez déjà évalué ce produit.", fail: "Échec de l'envoi.", rating: "Note" },
  pt: { write: "Escrever avaliação", notice: "Ganhe 1.000P ao escrever uma avaliação (usável no checkout).", title: "Título", content: "Compartilhe sua experiência...", submit: "Enviar", done: "Avaliado", success: "Avaliação enviada · 1.000P ganhos!", dup: "Você já avaliou este produto.", fail: "Falha ao enviar.", rating: "Avaliação" },
  ja: { write: "レビューを書く", notice: "レビューを書くと1,000Pが貯まります（お支払い時に利用可能）。", title: "タイトル", content: "ご感想をお聞かせください...", submit: "送信", done: "レビュー済み", success: "レビューを送信しました・1,000P獲得！", dup: "この商品はすでにレビュー済みです。", fail: "送信に失敗しました。", rating: "評価" },
  ar: { write: "اكتب تقييماً", notice: "احصل على 1,000 نقطة عند كتابة تقييم (قابلة للاستخدام عند الدفع).", title: "العنوان", content: "شارك تجربتك...", submit: "إرسال", done: "تم التقييم", success: "تم إرسال التقييم · 1,000 نقطة!", dup: "لقد قمت بتقييم هذا المنتج بالفعل.", fail: "فشل الإرسال.", rating: "التقييم" },
};

const MP_I18N: Record<string, { points: string; reorder: string; deadline: string; expired: string; expireH: string; expireM: string; autoCancelled: string; reorderToast: (n: number) => string; subtotal: string; shipping: string; statusPending: string; statusConfirmed: string; statusShipping: string; statusDelivered: string; statusCancelled: string; }> = {
  en: { points: "Points", reorder: "Add back to cart", deadline: "Payment deadline", expired: "Expired", expireH: "h", expireM: "m left", autoCancelled: "Auto-cancelled: payment deadline passed.", reorderToast: (n) => `${n} item(s) added to cart.`, subtotal: "Items", shipping: "Shipping", statusPending: "Awaiting payment", statusConfirmed: "Payment confirmed", statusShipping: "Shipping", statusDelivered: "Delivered", statusCancelled: "Cancelled" },
  es: { points: "Puntos", reorder: "Añadir al carrito", deadline: "Fecha límite de pago", expired: "Expirado", expireH: "h", expireM: "m restantes", autoCancelled: "Cancelado automáticamente: fecha límite vencida.", reorderToast: (n) => `${n} artículo(s) añadido(s).`, subtotal: "Artículos", shipping: "Envío", statusPending: "Pago pendiente", statusConfirmed: "Pago confirmado", statusShipping: "En envío", statusDelivered: "Entregado", statusCancelled: "Cancelado" },
  de: { points: "Punkte", reorder: "Wieder in den Warenkorb", deadline: "Zahlungsfrist", expired: "Abgelaufen", expireH: "Std.", expireM: "Min. übrig", autoCancelled: "Automatisch storniert: Zahlungsfrist abgelaufen.", reorderToast: (n) => `${n} Artikel hinzugefügt.`, subtotal: "Artikel", shipping: "Versand", statusPending: "Zahlung ausstehend", statusConfirmed: "Zahlung bestätigt", statusShipping: "Versand", statusDelivered: "Geliefert", statusCancelled: "Storniert" },
  fr: { points: "Points", reorder: "Remettre au panier", deadline: "Date limite de paiement", expired: "Expiré", expireH: "h", expireM: "min restantes", autoCancelled: "Annulé automatiquement.", reorderToast: (n) => `${n} article(s) ajouté(s).`, subtotal: "Articles", shipping: "Livraison", statusPending: "En attente de paiement", statusConfirmed: "Paiement confirmé", statusShipping: "En cours de livraison", statusDelivered: "Livré", statusCancelled: "Annulé" },
  pt: { points: "Pontos", reorder: "Adicionar ao carrinho", deadline: "Prazo de pagamento", expired: "Expirado", expireH: "h", expireM: "min restantes", autoCancelled: "Cancelado automaticamente.", reorderToast: (n) => `${n} item(ns) adicionado(s).`, subtotal: "Itens", shipping: "Frete", statusPending: "Aguardando pagamento", statusConfirmed: "Pagamento confirmado", statusShipping: "Em envio", statusDelivered: "Entregue", statusCancelled: "Cancelado" },
  ja: { points: "ポイント", reorder: "カートに戻す", deadline: "支払期限", expired: "期限切れ", expireH: "時間", expireM: "分", autoCancelled: "支払期限切れのため自動キャンセル。", reorderToast: (n) => `${n}点をカートに追加しました。`, subtotal: "商品", shipping: "送料", statusPending: "入金待ち", statusConfirmed: "入金確認", statusShipping: "配送中", statusDelivered: "配送完了", statusCancelled: "キャンセル" },
  ar: { points: "النقاط", reorder: "إعادة إلى السلة", deadline: "موعد الدفع النهائي", expired: "انتهى", expireH: "س", expireM: "د متبقية", autoCancelled: "تم الإلغاء تلقائياً.", reorderToast: (n) => `تمت إضافة ${n} منتجاً.`, subtotal: "المنتجات", shipping: "الشحن", statusPending: "بانتظار الدفع", statusConfirmed: "تم تأكيد الدفع", statusShipping: "قيد الشحن", statusDelivered: "تم التسليم", statusCancelled: "ملغى" },
};




const MyPage = () => {
  const { user, signOut } = useAuth();
  const { t, formatPrice, language } = useLanguage();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(new Set());
  const [reviewTarget, setReviewTarget] = useState<{ product_id: string; product_name: string } | null>(null);
  const [reviewForm, setReviewForm] = useState<{ rating: number; title: string; content: string; image_urls: string[] }>({ rating: 5, title: "", content: "", image_urls: [] });
  const [submittingReview, setSubmittingReview] = useState(false);
  const dateFmt = language === "de" ? "de-DE" : language === "es" ? "es-ES" : language === "fr" ? "fr-FR" : language === "pt" ? "pt-BR" : language === "ar" ? "ar-SA" : language === "ja" ? "ja-JP" : "en-US";
  const L = MP_I18N[language] || MP_I18N.en;
  const R = REVIEW_I18N[language] || REVIEW_I18N.en;

  const fetchData = async () => {
    if (!user) return;
    const [ordersRes, wishRes, profileRes, reviewsRes] = await Promise.all([
      supabase.from("orders").select("*, order_items(*)").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("wishlists").select("product_id, products(*)").eq("user_id", user.id),
      supabase.from("profiles").select("*").eq("user_id", user.id).single(),
      supabase.from("reviews").select("product_id").eq("user_id", user.id),
    ]);
    setOrders(ordersRes.data || []);
    setWishlistProducts((wishRes.data || []).map((w: any) => w.products));
    setProfile(profileRes.data);
    setReviewedIds(new Set((reviewsRes.data || []).map((r: any) => r.product_id)));
  };
  useEffect(() => { fetchData(); /* eslint-disable-next-line */ }, [user]);

  if (!user) return <div className="min-h-screen"><Navigation /><div className="text-center py-32 text-sm text-muted-foreground">{t("mp_login_required")}</div><Footer /></div>;

  const statusMap: Record<string, string> = {
    pending: L.statusPending, confirmed: L.statusConfirmed,
    shipping: L.statusShipping, delivered: L.statusDelivered, cancelled: L.statusCancelled,
  };

  const reorderAll = async (order: any) => {
    let ok = 0;
    for (const it of order.order_items || []) {
      const r = await addToCart(it.product_id, it.quantity, { silent: true });
      if (r) ok++;
    }
    if (ok > 0) { toast.success(L.reorderToast(ok)); navigate("/checkout"); }
  };

  const deadlineText = (iso?: string) => {
    if (!iso) return "";
    const ms = new Date(iso).getTime() - Date.now();
    if (ms <= 0) return L.expired;
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    return `${h}${L.expireH} ${m}${L.expireM}`;
  };

  const openReview = (item: any) => {
    setReviewTarget({ product_id: item.product_id, product_name: item.product_name });
    setReviewForm({ rating: 5, title: "", content: "", image_urls: [] });
  };

  const submitReview = async () => {
    if (!user || !reviewTarget) return;
    setSubmittingReview(true);
    const { error } = await supabase.from("reviews").insert({
      user_id: user.id, product_id: reviewTarget.product_id,
      rating: reviewForm.rating, title: reviewForm.title, content: reviewForm.content,
      image_urls: reviewForm.image_urls,
    } as any);
    setSubmittingReview(false);
    if (error) {
      toast.error(error.message.includes("duplicate") ? R.dup : R.fail);
    } else {
      toast.success(R.success);
      setReviewTarget(null);
      fetchData();
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      <section className="py-12 md:py-16 px-4">
        <div className="container max-w-5xl">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl md:text-3xl font-serif font-light">{t("mp_title")}</h1>
            <Button variant="ghost" onClick={signOut} className="text-xs tracking-wider uppercase text-muted-foreground">{t("mp_logout")}</Button>
          </div>
          {profile && (
            <div className="mb-10 inline-flex items-center gap-3 px-4 py-2 border border-border bg-primary-soft/30 text-sm">
              <span className="text-muted-foreground">{L.points}</span>
              <strong className="text-primary">{(profile.points || 0).toLocaleString()} P</strong>
            </div>
          )}

          <Tabs defaultValue="orders">
            <TabsList className="grid w-full grid-cols-3 mb-10 rounded-none bg-muted/50 h-auto">
              <TabsTrigger value="orders" className="rounded-none text-xs tracking-wider uppercase py-3">{t("mp_orders")}</TabsTrigger>
              <TabsTrigger value="wishlist" className="rounded-none text-xs tracking-wider uppercase py-3">{t("mp_wishlist")}</TabsTrigger>
              <TabsTrigger value="profile" className="rounded-none text-xs tracking-wider uppercase py-3">{t("mp_profile")}</TabsTrigger>
            </TabsList>

            <TabsContent value="orders" className="space-y-0">
              {orders.length === 0 ? (
                <div className="text-center py-20 text-sm text-muted-foreground">{t("mp_no_orders")}</div>
              ) : orders.map(order => {
                const isCancelled = order.status === "cancelled";
                const isPendingBank = order.status === "pending" && order.payment_method === "bank_transfer";
                return (
                  <div key={order.id} className={`py-6 border-b border-border transition-opacity ${isCancelled ? "opacity-50" : ""}`}>
                    <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
                      <span className="text-sm font-sans">
                        {new Date(order.created_at).toLocaleDateString(dateFmt)}
                        <span className="ml-3 text-xs text-muted-foreground">#{order.id.slice(0,8).toUpperCase()}</span>
                      </span>
                      <span className={`text-xs tracking-wider uppercase px-3 py-1 ${isCancelled ? "bg-destructive/10 text-destructive line-through" : "bg-muted"}`}>
                        {statusMap[order.status] || order.status}
                      </span>
                    </div>
                    {isPendingBank && order.payment_deadline && (
                      <div className="mb-3 text-xs text-primary flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" /> {L.deadline}: {new Date(order.payment_deadline).toLocaleString(dateFmt)} ({deadlineText(order.payment_deadline)})
                      </div>
                    )}
                    {isCancelled && order.cancel_reason === "payment_timeout" && (
                      <div className="mb-3 text-xs text-destructive">{L.autoCancelled}</div>
                    )}
                    <div className="space-y-2">
                      {order.order_items?.map((item: any) => {
                        const canReview = order.status === "delivered";
                        const reviewed = reviewedIds.has(item.product_id);
                        return (
                          <div key={item.id} className="flex justify-between items-center gap-3 text-sm font-light flex-wrap">
                            <span className={`flex-1 min-w-0 ${isCancelled ? "line-through" : ""}`}>{item.product_name} ×{item.quantity}</span>
                            <div className="flex items-center gap-2">
                              <span>{formatPrice(item.price * item.quantity)}</span>
                              {canReview && (
                                reviewed ? (
                                  <span className="text-[10px] tracking-wider uppercase px-2 py-1 border border-border text-muted-foreground inline-flex items-center gap-1"><Star className="h-3 w-3 fill-accent text-accent" />{R.done}</span>
                                ) : (
                                  <Button size="sm" variant="outline" className="rounded-none h-7 text-[10px] tracking-wider uppercase gap-1" onClick={() => openReview(item)}>
                                    <PenLine className="h-3 w-3" />{R.write}
                                  </Button>
                                )
                              )}
                            </div>
                          </div>
                        );
                      })}
                      <div className="flex justify-between font-medium text-sm pt-3 border-t border-border/50">
                        <span>{t("mp_subtotal")}</span>
                        <span>{formatPrice(Number(order.total))}</span>
                      </div>
                      {Number(order.shipping_fee) > 0 && (
                        <div className="text-xs text-muted-foreground text-right">{L.subtotal} {formatPrice(Number(order.subtotal || 0))} + {L.shipping} {formatPrice(Number(order.shipping_fee))}</div>
                      )}
                    </div>
                    {isCancelled && (
                      <Button size="sm" variant="outline" className="mt-3 rounded-none gap-1.5" onClick={() => reorderAll(order)}>
                        <RotateCcw className="h-3.5 w-3.5" /> {L.reorder}
                      </Button>
                    )}
                  </div>
                );
              })}
            </TabsContent>

            <TabsContent value="wishlist">
              {wishlistProducts.length === 0 ? (
                <div className="text-center py-20 text-sm text-muted-foreground">{t("mp_no_wishlist")}</div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                  {wishlistProducts.map(p => p && <ProductCard key={p.id} product={p} />)}
                </div>
              )}
            </TabsContent>

            <TabsContent value="profile">
              <div className="max-w-md space-y-6 py-4">
                {[
                  { label: t("mp_email"), value: user.email },
                  { label: t("mp_name"), value: profile?.display_name || "—" },
                  { label: t("mp_phone"), value: profile?.phone || "—" },
                  { label: L.points, value: `${(profile?.points || 0).toLocaleString()} P` },
                ].map((item, i) => (
                  <div key={i} className="pb-4 border-b border-border">
                    <p className="text-xs font-sans tracking-wider uppercase text-muted-foreground mb-1">{item.label}</p>
                    <p className="text-sm">{item.value}</p>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default MyPage;
