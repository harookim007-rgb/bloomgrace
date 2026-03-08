import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Heart, User } from "lucide-react";

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

  if (!user) return <div className="min-h-screen"><Navigation /><div className="text-center py-32">{t("mp_login_required")}</div><Footer /></div>;

  const statusMap: Record<string, string> = {
    pending: t("status_pending"), confirmed: t("status_confirmed"),
    shipping: t("status_shipping"), delivered: t("status_delivered"), cancelled: t("status_cancelled"),
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      <section className="py-8 px-4">
        <div className="container max-w-5xl">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">{t("mp_title")}</h1>
            <Button variant="outline" onClick={signOut}>{t("mp_logout")}</Button>
          </div>
          <Tabs defaultValue="orders">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="orders" className="gap-2"><Package className="h-4 w-4" />{t("mp_orders")}</TabsTrigger>
              <TabsTrigger value="wishlist" className="gap-2"><Heart className="h-4 w-4" />{t("mp_wishlist")}</TabsTrigger>
              <TabsTrigger value="profile" className="gap-2"><User className="h-4 w-4" />{t("mp_profile")}</TabsTrigger>
            </TabsList>
            <TabsContent value="orders" className="space-y-4">
              {orders.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">{t("mp_no_orders")}</div>
              ) : orders.map(order => (
                <Card key={order.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-base">
                        {new Date(order.created_at).toLocaleDateString(dateFmt)} {t("mp_order_date")}
                      </CardTitle>
                      <span className="text-sm px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
                        {statusMap[order.status] || order.status}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {order.order_items?.map((item: any) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span>{item.product_name} x{item.quantity}</span>
                          <span>{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between font-bold border-t pt-2">
                        <span>{t("mp_subtotal")}</span>
                        <span>{formatPrice(Number(order.total))}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
            <TabsContent value="wishlist">
              {wishlistProducts.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">{t("mp_no_wishlist")}</div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {wishlistProducts.map(p => p && <ProductCard key={p.id} product={p} />)}
                </div>
              )}
            </TabsContent>
            <TabsContent value="profile">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div><span className="text-sm text-muted-foreground">{t("mp_email")}</span><p>{user.email}</p></div>
                  <div><span className="text-sm text-muted-foreground">{t("mp_name")}</span><p>{profile?.display_name || "-"}</p></div>
                  <div><span className="text-sm text-muted-foreground">{t("mp_phone")}</span><p>{profile?.phone || "-"}</p></div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default MyPage;
