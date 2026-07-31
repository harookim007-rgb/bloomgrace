import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, ShoppingCart, Users, Tag, DollarSign, Star, Repeat, UserPlus, Truck, CheckCircle2 } from "lucide-react";

type Range = "1d" | "7d" | "30d" | "90d" | "180d" | "365d";

const RANGES: { value: Range; label: string; days: number }[] = [
  { value: "1d", label: "오늘", days: 1 },
  { value: "7d", label: "7일", days: 7 },
  { value: "30d", label: "30일", days: 30 },
  { value: "90d", label: "3개월", days: 90 },
  { value: "180d", label: "6개월", days: 180 },
  { value: "365d", label: "1년", days: 365 },
];

const AdminDashboard = () => {
  const [range, setRange] = useState<Range>("30d");
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const [o, p, pr, r, c] = await Promise.all([
        supabase.from("orders").select("id, status, total, created_at, user_id, order_items(product_name, quantity, price)"),
        supabase.from("products").select("id, is_active"),
        supabase.from("profiles").select("id, user_id, created_at"),
        supabase.from("reviews").select("id"),
        supabase.from("coupons").select("id, is_active"),
      ]);
      setAllOrders(o.data || []);
      setProducts(p.data || []);
      setProfiles(pr.data || []);
      setReviews(r.data || []);
      setCoupons(c.data || []);
    })();
  }, []);

  const rangeDays = RANGES.find(r => r.value === range)!.days;
  const since = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - rangeDays);
    return d;
  }, [rangeDays]);

  const rangeOrders = useMemo(
    () => allOrders.filter(o => new Date(o.created_at) >= since),
    [allOrders, since]
  );
  const rangeSignups = useMemo(
    () => profiles.filter(p => new Date(p.created_at) >= since),
    [profiles, since]
  );

  // Status counts in range
  const statusCounts = useMemo(() => {
    const c: Record<string, number> = { pending: 0, confirmed: 0, shipping: 0, delivered: 0, cancelled: 0 };
    rangeOrders.forEach(o => { c[o.status] = (c[o.status] || 0) + 1; });
    return c;
  }, [rangeOrders]);

  // Repeat customers (overall + in range)
  const orderCountsByUser = useMemo(() => {
    const m = new Map<string, number>();
    allOrders.forEach(o => m.set(o.user_id, (m.get(o.user_id) || 0) + 1));
    return m;
  }, [allOrders]);
  const repeatCustomers = useMemo(
    () => Array.from(orderCountsByUser.values()).filter(n => n >= 2).length,
    [orderCountsByUser]
  );
  const repeatRate = profiles.length > 0 ? Math.round((repeatCustomers / profiles.length) * 100) : 0;

  // Daily sales for sparkline
  const dailySales = useMemo(() => {
    const buckets: Record<string, { revenue: number; orders: number }> = {};
    for (let i = 0; i < rangeDays; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const k = d.toISOString().slice(0, 10);
      buckets[k] = { revenue: 0, orders: 0 };
    }
    rangeOrders.forEach(o => {
      const k = new Date(o.created_at).toISOString().slice(0, 10);
      if (buckets[k]) { buckets[k].revenue += Number(o.total); buckets[k].orders += 1; }
    });
    return Object.entries(buckets).sort((a, b) => a[0].localeCompare(b[0]));
  }, [rangeOrders, rangeDays]);

  // Top products in range
  const topProducts = useMemo(() => {
    const map: Record<string, { name: string; count: number; revenue: number }> = {};
    rangeOrders.forEach(o => {
      (o.order_items || []).forEach((item: any) => {
        const k = item.product_name;
        if (!map[k]) map[k] = { name: k, count: 0, revenue: 0 };
        map[k].count += item.quantity;
        map[k].revenue += Number(item.price) * item.quantity;
      });
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 7);
  }, [rangeOrders]);

  const totalRevenueAll = allOrders.reduce((s, o) => s + Number(o.total), 0);
  const rangeRevenue = rangeOrders.reduce((s, o) => s + Number(o.total), 0);

  const maxDaily = Math.max(1, ...dailySales.map(([, v]) => v.revenue));

  const statCards = [
    { label: `매출 (${RANGES.find(r => r.value === range)!.label})`, value: `${rangeRevenue.toLocaleString()}원`, sub: `전체 ${totalRevenueAll.toLocaleString()}원`, icon: DollarSign, tint: "text-primary" },
    { label: `주문 (${RANGES.find(r => r.value === range)!.label})`, value: rangeOrders.length, sub: `전체 ${allOrders.length}건`, icon: ShoppingCart, tint: "text-secondary" },
    { label: "신규 가입", value: rangeSignups.length, sub: `누적 ${profiles.length}명`, icon: UserPlus, tint: "text-emerald-600" },
    { label: "재구매 고객", value: repeatCustomers, sub: `재구매율 ${repeatRate}%`, icon: Repeat, tint: "text-rose-500" },
    { label: "상품", value: products.length, sub: `활성 ${products.filter(p => p.is_active).length}`, icon: Package, tint: "text-primary" },
    { label: "리뷰", value: reviews.length, sub: `쿠폰 활성 ${coupons.filter(c => c.is_active).length}`, icon: Star, tint: "text-amber-500" },
  ];

  const stageCards = [
    { key: "pending", label: "신규 주문", icon: ShoppingCart, color: "bg-slate-50 text-slate-700 border-slate-200", dot: "bg-slate-400" },
    { key: "confirmed", label: "주문 확인", icon: CheckCircle2, color: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-500" },
    { key: "shipping", label: "배송 중", icon: Truck, color: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" },
    { key: "delivered", label: "배송 완료", icon: Package, color: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  ];

  return (
    <div>
      <div className="mb-6 flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold font-serif">대시보드</h1>
          <p className="text-sm text-muted-foreground mt-1">쇼핑몰 전체 현황 · 기간을 선택해 통계를 확인하세요</p>
        </div>
        <div className="flex flex-wrap gap-1 p-1 bg-muted/50 rounded-lg">
          {RANGES.map(r => (
            <Button
              key={r.value}
              size="sm"
              variant={range === r.value ? "default" : "ghost"}
              className="h-8 px-3 text-xs"
              onClick={() => setRange(r.value)}
            >
              {r.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Order pipeline cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {stageCards.map(s => (
          <button
            key={s.key}
            type="button"
            onClick={() => navigate(`/admin?tab=orders&status=${s.key}`)}
            className={`text-left rounded-lg border p-4 transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring/50 ${s.color}`}
            aria-label={`${s.label} 주문 목록 보기`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wide">{s.label}</span>
              <s.icon className="h-4 w-4 opacity-70" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold">{statusCounts[s.key] || 0}</span>
              <span className="text-xs opacity-70">건</span>
            </div>
            <div className={`mt-2 h-1 rounded-full ${s.dot} opacity-80`} />
          </button>
        ))}
      </div>


      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {statCards.map(s => (
          <Card key={s.label}>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
                  <p className="text-2xl font-bold mt-1">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
                </div>
                <s.icon className={`h-8 w-8 ${s.tint} opacity-70`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Sales chart */}
        <Card>
          <CardHeader><CardTitle className="text-base">기간별 매출 추이</CardTitle></CardHeader>
          <CardContent>
            {dailySales.length === 0 ? (
              <p className="text-sm text-muted-foreground">데이터가 없습니다.</p>
            ) : (
              <div className="flex items-end gap-0.5 h-40">
                {dailySales.map(([day, v]) => {
                  const h = v.revenue > 0 ? Math.max(4, (v.revenue / maxDaily) * 100) : 2;
                  return (
                    <div
                      key={day}
                      className="flex-1 bg-primary/70 hover:bg-primary rounded-sm transition-colors"
                      style={{ height: `${h}%` }}
                      title={`${day}: ${v.revenue.toLocaleString()}원 · ${v.orders}건`}
                    />
                  );
                })}
              </div>
            )}
            <div className="flex justify-between text-[10px] text-muted-foreground mt-2">
              <span>{dailySales[0]?.[0]}</span>
              <span>{dailySales[dailySales.length - 1]?.[0]}</span>
            </div>
          </CardContent>
        </Card>

        {/* Top products in range */}
        <Card>
          <CardHeader><CardTitle className="text-base">기간별 인기 상품</CardTitle></CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">데이터가 없습니다.</p>
            ) : (
              <div className="space-y-2">
                {topProducts.map((p, i) => {
                  const max = topProducts[0].revenue || 1;
                  return (
                    <div key={p.name}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium truncate"><span className="text-muted-foreground mr-1">#{i + 1}</span>{p.name}</span>
                        <span className="text-muted-foreground">{p.count}개 · {p.revenue.toLocaleString()}원</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${(p.revenue / max) * 100}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
