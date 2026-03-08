import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Heart, MapPin, User } from "lucide-react";

const MyPage = () => {
  const { user, signOut } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);

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

  if (!user) return <div className="min-h-screen"><Navigation /><div className="text-center py-32">로그인이 필요합니다.</div><Footer /></div>;

  const statusMap: Record<string, string> = {
    pending: "주문 접수",
    confirmed: "주문 확인",
    shipping: "배송 중",
    delivered: "배송 완료",
    cancelled: "주문 취소",
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      <section className="py-8 px-4">
        <div className="container max-w-5xl">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">마이페이지</h1>
            <Button variant="outline" onClick={signOut}>로그아웃</Button>
          </div>

          <Tabs defaultValue="orders">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="orders" className="gap-2"><Package className="h-4 w-4" />주문내역</TabsTrigger>
              <TabsTrigger value="wishlist" className="gap-2"><Heart className="h-4 w-4" />찜 목록</TabsTrigger>
              <TabsTrigger value="profile" className="gap-2"><User className="h-4 w-4" />내 정보</TabsTrigger>
            </TabsList>

            <TabsContent value="orders" className="space-y-4">
              {orders.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">주문 내역이 없습니다.</div>
              ) : orders.map(order => (
                <Card key={order.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-base">
                        {new Date(order.created_at).toLocaleDateString("ko-KR")} 주문
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
                          <span>{(item.price * item.quantity).toLocaleString()}원</span>
                        </div>
                      ))}
                      <div className="flex justify-between font-bold border-t pt-2">
                        <span>합계</span>
                        <span>{Number(order.total).toLocaleString()}원</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="wishlist">
              {wishlistProducts.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">찜한 상품이 없습니다.</div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {wishlistProducts.map(p => p && <ProductCard key={p.id} product={p} />)}
                </div>
              )}
            </TabsContent>

            <TabsContent value="profile">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div><span className="text-sm text-muted-foreground">이메일</span><p>{user.email}</p></div>
                  <div><span className="text-sm text-muted-foreground">이름</span><p>{profile?.display_name || "-"}</p></div>
                  <div><span className="text-sm text-muted-foreground">연락처</span><p>{profile?.phone || "-"}</p></div>
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
