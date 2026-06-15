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
import { Clock, RotateCcw } from "lucide-react";
import { toast } from "sonner";

const MyPage = () => {
  const { user, signOut } = useAuth();
  const { t, formatPrice, language } = useLanguage();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const dateFmt = language === "ko" ? "ko-KR" : language === "de" ? "de-DE" : language === "es" ? "es-ES" : "en-US";

  const fetchData = async () => {
    if (!user) return;
    const [ordersRes, wishRes, profileRes] = await Promise.all([
      supabase.from("orders").select("*, order_items(*)").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("wishlists").select("product_id, products(*)").eq("user_id", user.id),
      supabase.from("profiles").select("*").eq("user_id", user.id).single(),
    ]);
    setOrders(ordersRes.data || []);
    setWishlistProducts((wishRes.data || []).map((w: any) => w.products));
    setProfile(profileRes.data);
  };
  useEffect(() => { fetchData(); /* eslint-disable-next-line */ }, [user]);

  if (!user) return <div className="min-h-screen"><Navigation /><div className="text-center py-32 text-sm text-muted-foreground">{t("mp_login_required")}</div><Footer /></div>;

  const statusMap: Record<string, string> = {
    pending: "입금 대기", confirmed: "입금 확인",
    shipping: "배송 중", delivered: "배송 완료", cancelled: "취소됨",
  };

  const reorderAll = async (order: any) => {
    let ok = 0;
    for (const it of order.order_items || []) {
      const r = await addToCart(it.product_id, it.quantity, { silent: true });
      if (r) ok++;
    }
    if (ok > 0) { toast.success(`${ok}개 상품을 장바구니에 담았습니다.`); navigate("/checkout"); }
  };

  const deadlineText = (iso?: string) => {
    if (!iso) return "";
    const ms = new Date(iso).getTime() - Date.now();
    if (ms <= 0) return "기한 만료";
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    return `${h}시간 ${m}분 남음`;
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
              <span className="text-muted-foreground">보유 포인트</span>
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
                        <Clock className="h-3.5 w-3.5" /> 입금 기한: {new Date(order.payment_deadline).toLocaleString(dateFmt)} ({deadlineText(order.payment_deadline)})
                      </div>
                    )}
                    {isCancelled && order.cancel_reason === "payment_timeout" && (
                      <div className="mb-3 text-xs text-destructive">입금 기한 초과로 자동 취소되었습니다.</div>
                    )}
                    <div className="space-y-2">
                      {order.order_items?.map((item: any) => (
                        <div key={item.id} className="flex justify-between text-sm font-light">
                          <span className={isCancelled ? "line-through" : ""}>{item.product_name} ×{item.quantity}</span>
                          <span>{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between font-medium text-sm pt-3 border-t border-border/50">
                        <span>{t("mp_subtotal")}</span>
                        <span>{formatPrice(Number(order.total))}</span>
                      </div>
                      {Number(order.shipping_fee) > 0 && (
                        <div className="text-xs text-muted-foreground text-right">상품 {formatPrice(Number(order.subtotal || 0))} + 배송 {formatPrice(Number(order.shipping_fee))}</div>
                      )}
                    </div>
                    {isCancelled && (
                      <Button size="sm" variant="outline" className="mt-3 rounded-none gap-1.5" onClick={() => reorderAll(order)}>
                        <RotateCcw className="h-3.5 w-3.5" /> 다시 장바구니에 담기
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
                  { label: "포인트", value: `${(profile?.points || 0).toLocaleString()} P` },
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
