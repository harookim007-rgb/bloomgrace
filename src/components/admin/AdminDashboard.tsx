import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, Users, Tag, TrendingUp, DollarSign, Eye, Star } from "lucide-react";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0, activeProducts: 0,
    totalOrders: 0, pendingOrders: 0,
    totalRevenue: 0, monthlyRevenue: 0,
    totalCustomers: 0, totalReviews: 0,
    totalCoupons: 0, activeCoupons: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const [products, orders, profiles, reviews, coupons] = await Promise.all([
      supabase.from("products").select("id, is_active, price"),
      supabase.from("orders").select("id, status, total, created_at, order_items(product_name, quantity, price), user_id"),
      supabase.from("profiles").select("id"),
      supabase.from("reviews").select("id"),
      supabase.from("coupons").select("id, is_active"),
    ]);

    const allOrders = orders.data || [];
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyOrders = allOrders.filter(o => new Date(o.created_at) >= monthStart);

    setStats({
      totalProducts: (products.data || []).length,
      activeProducts: (products.data || []).filter(p => p.is_active).length,
      totalOrders: allOrders.length,
      pendingOrders: allOrders.filter(o => o.status === "pending" || o.status === "confirmed").length,
      totalRevenue: allOrders.reduce((s, o) => s + Number(o.total), 0),
      monthlyRevenue: monthlyOrders.reduce((s, o) => s + Number(o.total), 0),
      totalCustomers: (profiles.data || []).length,
      totalReviews: (reviews.data || []).length,
      totalCoupons: (coupons.data || []).length,
      activeCoupons: (coupons.data || []).filter(c => c.is_active).length,
    });

    setRecentOrders(allOrders.slice(0, 5));

    // Top products by order count
    const productCount: Record<string, { name: string; count: number; revenue: number }> = {};
    allOrders.forEach(o => {
      (o.order_items || []).forEach((item: any) => {
        if (!productCount[item.product_name]) productCount[item.product_name] = { name: item.product_name, count: 0, revenue: 0 };
        productCount[item.product_name].count += item.quantity;
        productCount[item.product_name].revenue += Number(item.price) * item.quantity;
      });
    });
    setTopProducts(Object.values(productCount).sort((a, b) => b.revenue - a.revenue).slice(0, 5));
  };

  const statusMap: Record<string, string> = {
    pending: "주문 접수", confirmed: "주문 확인", shipping: "배송 중", delivered: "배송 완료", cancelled: "취소"
  };

  const statCards = [
    { label: "총 상품", value: stats.totalProducts, sub: `활성 ${stats.activeProducts}`, icon: Package, color: "text-primary" },
    { label: "총 주문", value: stats.totalOrders, sub: `처리 대기 ${stats.pendingOrders}`, icon: ShoppingCart, color: "text-secondary" },
    { label: "총 매출", value: `${stats.totalRevenue.toLocaleString()}원`, sub: `이번 달 ${stats.monthlyRevenue.toLocaleString()}원`, icon: DollarSign, color: "text-accent" },
    { label: "고객 수", value: stats.totalCustomers, sub: `리뷰 ${stats.totalReviews}건`, icon: Users, color: "text-primary" },
    { label: "쿠폰", value: stats.totalCoupons, sub: `활성 ${stats.activeCoupons}`, icon: Tag, color: "text-secondary" },
    { label: "리뷰", value: stats.totalReviews, sub: "전체 리뷰", icon: Star, color: "text-accent" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-serif">대시보드</h1>
        <p className="text-sm text-muted-foreground mt-1">쇼핑몰 전체 현황을 한눈에 확인하세요</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {statCards.map(s => (
          <Card key={s.label}>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
                  <p className="text-2xl font-bold mt-1">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
                </div>
                <s.icon className={`h-8 w-8 ${s.color} opacity-70`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader><CardTitle className="text-base">최근 주문</CardTitle></CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground">주문이 없습니다.</p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map(o => (
                  <div key={o.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="text-sm font-medium">
                        {o.order_items?.[0]?.product_name || "상품"}
                        {(o.order_items?.length || 0) > 1 && ` 외 ${o.order_items.length - 1}건`}
                      </p>
                      <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString("ko-KR")}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{Number(o.total).toLocaleString()}원</p>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{statusMap[o.status] || o.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader><CardTitle className="text-base">인기 상품 (매출 기준)</CardTitle></CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">데이터가 없습니다.</p>
            ) : (
              <div className="space-y-3">
                {topProducts.map((p, i) => (
                  <div key={p.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-muted-foreground">#{i + 1}</span>
                      <div>
                        <p className="text-sm font-medium">{p.name}</p>
                        <p className="text-xs text-muted-foreground">판매 {p.count}개</p>
                      </div>
                    </div>
                    <p className="text-sm font-bold">{p.revenue.toLocaleString()}원</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
