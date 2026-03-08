import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

const MyPage = () => {
  const { user, signOut } = useAuth();
  const { t, formatPrice, language } = useLanguage();
  const [orders, setOrders] = useState<any[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const dateFmt = language === "ko" ? "ko-KR" : language === "de" ? "de-DE" : language === "es" ? "es-ES" : "en-US";

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const [ordersRes, wishRes, profileRes] = await Promise.all([
        supabase.from("orders").select("*, order_items(*)").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("wishlists").select("product_id, products(*)").eq("user_id", user.id),
        supabase.from("profiles").select("*").eq("user_id", user.id).single(),
      ]);
      setOrders(ordersRes.data || []);
      setWishlistProducts((wishRes.data || []).map((w: any) => w.products));
      setProfile(profileRes.data);
    };
    fetchData();
  }, [user]);

  if (!user) return <div className="min-h-screen"><Navigation /><div className="text-center py-32 text-sm text-muted-foreground">{t("mp_login_required")}</div><Footer /></div>;

  const statusMap: Record<string, string> = {
    pending: t("status_pending"), confirmed: t("status_confirmed"),
    shipping: t("status_shipping"), delivered: t("status_delivered"), cancelled: t("status_cancelled"),
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      <section className="py-12 md:py-16 px-4">
        <div className="container max-w-5xl">
          <div className="flex items-center justify-between mb-10">
            <h1 className="text-2xl md:text-3xl font-serif font-light">{t("mp_title")}</h1>
            <Button variant="ghost" onClick={signOut} className="text-xs tracking-wider uppercase text-muted-foreground">{t("mp_logout")}</Button>
          </div>

          <Tabs defaultValue="orders">
            <TabsList className="grid w-full grid-cols-3 mb-10 rounded-none bg-muted/50 h-auto">
              <TabsTrigger value="orders" className="rounded-none text-xs tracking-wider uppercase py-3">{t("mp_orders")}</TabsTrigger>
              <TabsTrigger value="wishlist" className="rounded-none text-xs tracking-wider uppercase py-3">{t("mp_wishlist")}</TabsTrigger>
              <TabsTrigger value="profile" className="rounded-none text-xs tracking-wider uppercase py-3">{t("mp_profile")}</TabsTrigger>
            </TabsList>

            <TabsContent value="orders" className="space-y-0">
              {orders.length === 0 ? (
                <div className="text-center py-20 text-sm text-muted-foreground">{t("mp_no_orders")}</div>
              ) : orders.map(order => (
                <div key={order.id} className="py-6 border-b border-border">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-sans">
                      {new Date(order.created_at).toLocaleDateString(dateFmt)}
                    </span>
                    <span className="text-xs tracking-wider uppercase px-3 py-1 bg-muted">
                      {statusMap[order.status] || order.status}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {order.order_items?.map((item: any) => (
                      <div key={item.id} className="flex justify-between text-sm font-light">
                        <span>{item.product_name} ×{item.quantity}</span>
                        <span>{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between font-medium text-sm pt-3 border-t border-border/50">
                      <span>{t("mp_subtotal")}</span>
                      <span>{formatPrice(Number(order.total))}</span>
                    </div>
                  </div>
                </div>
              ))}
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
