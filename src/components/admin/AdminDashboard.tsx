import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  AlertTriangle, ArrowRight, Banknote, ChevronRight, MessageSquare, Minus, PackageX,
  RefreshCw, ShoppingCart, TrendingDown, TrendingUp, Truck, UserPlus, Wallet,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Range = "7d" | "30d" | "90d" | "365d";
const RANGES: { value: Range; label: string; days: number }[] = [
  { value: "7d", label: "7일", days: 7 },
  { value: "30d", label: "30일", days: 30 },
  { value: "90d", label: "3개월", days: 90 },
  { value: "365d", label: "1년", days: 365 },
];

const STATUS: Record<string, { label: string; className: string }> = {
  pending: { label: "입금 대기", className: "bg-slate-100 text-slate-700 border border-slate-200" },
  confirmed: { label: "결제 완료", className: "bg-blue-50 text-blue-700 border border-blue-200" },
  shipping: { label: "배송 중", className: "bg-amber-50 text-amber-700 border border-amber-200" },
  delivered: { label: "배송 완료", className: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  cancelled: { label: "취소", className: "bg-rose-50 text-rose-700 border border-rose-200" },
};

const LOW_STOCK = 5;
const money = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const dayKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const startOfDay = (offsetDays = 0) => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offsetDays);
  return d;
};
const timeAgo = (iso: string) => {
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return "방금";
  if (min < 60) return `${min}분 전`;
  if (min < 1440) return `${Math.floor(min / 60)}시간 전`;
  if (min < 43200) return `${Math.floor(min / 1440)}일 전`;
  return new Date(iso).toLocaleDateString("ko-KR");
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [range, setRange] = useState<Range>("30d");
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState<string[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);

  const load = async () => {
    setLoading(true);
    const [o, p, pr, q] = await Promise.all([
      supabase.from("orders").select("id, status, total, created_at, user_id, shipping_address, order_items(product_name, quantity, price)").order("created_at", { ascending: false }),
      supabase.from("products").select("id, name, stock, is_active"),
      supabase.from("profiles").select("id, user_id, display_name, auth_provider, created_at").order("created_at", { ascending: false }),
      supabase.from("inquiries").select("id, name, message, status, created_at").order("created_at", { ascending: false }),
    ]);
    setOrders(o.data || []);
    setProducts(p.data || []);
    setProfiles(pr.data || []);
    setInquiries(q.data || []);
    setFailed([o.error && "주문", p.error && "상품", pr.error && "회원", q.error && "문의"].filter(Boolean) as string[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const go = (tab: string, extra = "") => navigate(`/admin?tab=${tab}${extra}`);

  // Cancelled orders are not sales.
  const paidOrders = useMemo(() => orders.filter(o => o.status !== "cancelled"), [orders]);

  const today = useMemo(() => {
    const t0 = startOfDay(), y0 = startOfDay(-1);
    const inDay = (iso: string, from: Date, to?: Date) => new Date(iso) >= from && (!to || new Date(iso) < to);
    const sum = (list: any[]) => list.reduce((s, o) => s + Number(o.total), 0);
    const tOrders = paidOrders.filter(o => inDay(o.created_at, t0));
    const yOrders = paidOrders.filter(o => inDay(o.created_at, y0, t0));
    return {
      revenue: sum(tOrders), revenuePrev: sum(yOrders),
      orders: tOrders.length, ordersPrev: yOrders.length,
      signups: profiles.filter(p => inDay(p.created_at, t0)).length,
      signupsPrev: profiles.filter(p => inDay(p.created_at, y0, t0)).length,
    };
  }, [paidOrders, profiles]);

  const count = (status: string) => orders.filter(o => o.status === status).length;
  const pendingInquiries = inquiries.filter(q => (q.status || "pending") === "pending");
  const active = products.filter(p => p.is_active);
  const soldOut = active.filter(p => Number(p.stock) <= 0);
  const lowStock = active.filter(p => Number(p.stock) > 0 && Number(p.stock) <= LOW_STOCK);

  const tasks = [
    { icon: Banknote, label: "입금 확인 대기", hint: "입금을 확인하고 주문을 확정하세요", n: count("pending"), onClick: () => go("orders", "&status=pending") },
    { icon: Truck, label: "발송 준비", hint: "송장을 등록하고 배송을 시작하세요", n: count("confirmed"), onClick: () => go("orders", "&status=confirmed") },
    { icon: MessageSquare, label: "미답변 문의", hint: "고객 문의에 답변하세요", n: pendingInquiries.length, onClick: () => go("inquiries") },
    { icon: PackageX, label: "품절 상품", hint: "판매 중인데 재고가 0인 상품", n: soldOut.length, onClick: () => go("products") },
    { icon: AlertTriangle, label: `재고 ${LOW_STOCK}개 이하`, hint: "곧 품절될 수 있는 상품", n: lowStock.length, onClick: () => go("products") },
  ];
  const openTasks = tasks.reduce((s, t) => s + t.n, 0);

  const days = RANGES.find(r => r.value === range)!.days;
  const rangeStats = useMemo(() => {
    const since = startOfDay(-(days - 1));
    const list = paidOrders.filter(o => new Date(o.created_at) >= since);
    const revenue = list.reduce((s, o) => s + Number(o.total), 0);

    const buckets = new Map<string, { revenue: number; orders: number }>();
    for (let i = 0; i < days; i++) {
      const d = new Date(since);
      d.setDate(d.getDate() + i);
      buckets.set(dayKey(d), { revenue: 0, orders: 0 });
    }
    list.forEach(o => {
      const b = buckets.get(dayKey(new Date(o.created_at)));
      if (b) { b.revenue += Number(o.total); b.orders += 1; }
    });

    const byProduct = new Map<string, { name: string; count: number; revenue: number }>();
    list.forEach(o => (o.order_items || []).forEach((it: any) => {
      const cur = byProduct.get(it.product_name) || { name: it.product_name, count: 0, revenue: 0 };
      cur.count += it.quantity;
      cur.revenue += Number(it.price) * it.quantity;
      byProduct.set(it.product_name, cur);
    }));

    const buyers = new Map<string, number>();
    paidOrders.forEach(o => buyers.set(o.user_id, (buyers.get(o.user_id) || 0) + 1));
    const repeat = [...buyers.values()].filter(n => n >= 2).length;

    return {
      revenue,
      orders: list.length,
      average: list.length ? revenue / list.length : 0,
      signups: profiles.filter(p => new Date(p.created_at) >= since).length,
      repeatRate: buyers.size ? Math.round((repeat / buyers.size) * 100) : 0,
      chart: [...buckets.entries()].map(([day, v]) => ({ day, label: `${Number(day.slice(5, 7))}/${Number(day.slice(8))}`, ...v })),
      top: [...byProduct.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5),
    };
  }, [paidOrders, profiles, days]);

  const nameOf = (o: any) => o.shipping_address?.full_name || o.shipping_address?.name || profiles.find(p => p.user_id === o.user_id)?.display_name || "고객";

  const todayCards = [
    { label: "오늘 매출", value: money(today.revenue), prev: `어제 ${money(today.revenuePrev)}`, diff: today.revenue - today.revenuePrev, icon: Wallet, chip: "bg-indigo-50 text-indigo-600", onClick: () => go("orders") },
    { label: "오늘 주문", value: `${today.orders}건`, prev: `어제 ${today.ordersPrev}건`, diff: today.orders - today.ordersPrev, icon: ShoppingCart, chip: "bg-sky-50 text-sky-600", onClick: () => go("orders") },
    { label: "오늘 신규 가입", value: `${today.signups}명`, prev: `어제 ${today.signupsPrev}명`, diff: today.signups - today.signupsPrev, icon: UserPlus, chip: "bg-emerald-50 text-emerald-600", onClick: () => go("customers") },
    { label: "미답변 문의", value: `${pendingInquiries.length}건`, prev: `전체 문의 ${inquiries.length}건`, diff: null as number | null, icon: MessageSquare, chip: "bg-amber-50 text-amber-600", onClick: () => go("inquiries") },
  ];

  const rangeLabel = RANGES.find(r => r.value === range)!.label;
  const summary = [
    { label: "매출", value: money(rangeStats.revenue) },
    { label: "주문", value: `${rangeStats.orders}건` },
    { label: "평균 주문 금액", value: money(rangeStats.average) },
    { label: "신규 가입", value: `${rangeStats.signups}명` },
    { label: "재구매 고객 비율", value: `${rangeStats.repeatRate}%` },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold font-serif">대시보드</h1>
          <p className="text-sm text-muted-foreground mt-1 truncate">
            {new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric", weekday: "long" })}
            {user?.email ? ` · ${user.email}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />새로고침
          </Button>
        </div>
      </div>

      {failed.length > 0 && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          <p>{failed.join(", ")} 데이터를 불러오지 못했습니다. 아래 숫자가 실제보다 적게 보일 수 있습니다. 새로고침을 눌러 다시 시도하세요.</p>
        </div>
      )}

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
        {todayCards.map(c => (
          <button
            key={c.label}
            onClick={c.onClick}
            className="text-left rounded-lg border bg-card p-4 md:p-5 transition-shadow hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm text-muted-foreground font-medium truncate">{c.label}</span>
              <span className={`h-9 w-9 shrink-0 rounded-lg flex items-center justify-center ${c.chip}`}><c.icon className="h-[18px] w-[18px]" /></span>
            </div>
            <p className="mt-3 text-2xl md:text-[28px] font-bold tabular-nums leading-tight truncate">{loading ? "–" : c.value}</p>
            <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
              {c.diff !== null && (
                <span className={`inline-flex items-center gap-0.5 font-semibold shrink-0 ${c.diff > 0 ? "text-emerald-600" : c.diff < 0 ? "text-rose-600" : "text-muted-foreground"}`}>
                  {c.diff > 0 ? <TrendingUp className="h-3.5 w-3.5" /> : c.diff < 0 ? <TrendingDown className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
                  {c.diff > 0 ? "증가" : c.diff < 0 ? "감소" : "동일"}
                </span>
              )}
              <span className="truncate">{c.prev}</span>
            </p>
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between gap-2">
              지금 처리할 일
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums ${openTasks > 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{openTasks}건</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="divide-y divide-border">
              {tasks.map(t => (
                <li key={t.label}>
                  <button
                    onClick={t.onClick}
                    className="w-full flex items-center gap-3 py-3 text-left rounded-md hover:bg-muted/60 px-2 -mx-2 transition-colors"
                  >
                    <t.icon className={`h-5 w-5 shrink-0 ${t.n > 0 ? "text-primary" : "text-muted-foreground/50"}`} />
                    <span className="min-w-0 flex-1">
                      <span className={`block text-sm font-medium truncate ${t.n > 0 ? "" : "text-muted-foreground"}`}>{t.label}</span>
                      <span className="block text-xs text-muted-foreground truncate">{t.n > 0 ? t.hint : "처리할 건이 없습니다"}</span>
                    </span>
                    <span className={`text-base font-bold tabular-nums ${t.n > 0 ? "" : "text-muted-foreground/60"}`}>{t.n}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle className="text-base">매출 추이 <span className="text-muted-foreground font-normal">· 최근 {rangeLabel}</span></CardTitle>
              <div className="flex gap-1 p-1 bg-muted/50 rounded-lg">
                {RANGES.map(r => (
                  <Button key={r.value} size="sm" variant={range === r.value ? "default" : "ghost"} className="h-8 px-3 text-xs" onClick={() => setRange(r.value)}>
                    {r.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <dl className="grid grid-cols-2 sm:grid-cols-5 gap-x-4 gap-y-3 mb-4">
              {summary.map(s => (
                <div key={s.label} className="min-w-0">
                  <dt className="text-xs text-muted-foreground truncate">{s.label}</dt>
                  <dd className="text-base font-semibold tabular-nums truncate">{s.value}</dd>
                </div>
              ))}
            </dl>
            {rangeStats.orders === 0 ? (
              <div className="h-56 flex flex-col items-center justify-center gap-1 rounded-md border border-dashed border-border text-sm text-muted-foreground">
                <p>이 기간에 주문이 없습니다</p>
                <p className="text-xs">주문이 들어오면 여기에 일별 매출이 표시됩니다</p>
              </div>
            ) : (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={rangeStats.chart} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={28} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis width={56} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={v => `$${Number(v).toLocaleString("en-US")}`} />
                    <Tooltip
                      cursor={{ stroke: "hsl(var(--muted-foreground))", strokeWidth: 1 }}
                      content={({ active, payload }) => {
                        const d = active && payload?.[0]?.payload;
                        if (!d) return null;
                        return (
                          <div className="rounded-md border border-border bg-popover px-3 py-2 text-xs shadow-md">
                            <p className="font-medium text-popover-foreground">{d.day}</p>
                            <p className="text-muted-foreground mt-1">매출 <span className="font-semibold text-popover-foreground tabular-nums">{money(d.revenue)}</span></p>
                            <p className="text-muted-foreground">주문 <span className="font-semibold text-popover-foreground tabular-nums">{d.orders}건</span></p>
                          </div>
                        );
                      }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#revenueFill)" activeDot={{ r: 4, strokeWidth: 2, stroke: "hsl(var(--card))" }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-2">취소된 주문은 매출에서 제외됩니다</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between gap-2 space-y-0">
            <CardTitle className="text-base">최근 주문</CardTitle>
            <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => go("orders")}>전체 보기<ArrowRight className="h-3.5 w-3.5" /></Button>
          </CardHeader>
          <CardContent className="pt-0">
            {orders.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">아직 주문이 없습니다</p>
            ) : (
              <ul className="divide-y divide-border">
                {orders.slice(0, 6).map(o => {
                  const st = STATUS[o.status] || STATUS.pending;
                  const first = o.order_items?.[0]?.product_name;
                  const more = (o.order_items?.length || 0) - 1;
                  return (
                    <li key={o.id}>
                      <button onClick={() => go("orders", `&status=${o.status}`)} className="w-full flex items-center gap-3 py-2.5 text-left rounded-md hover:bg-muted/60 px-2 -mx-2 transition-colors">
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-medium truncate">{nameOf(o)} <span className="text-muted-foreground font-normal">· #{o.id.slice(0, 8).toUpperCase()}</span></span>
                          <span className="block text-xs text-muted-foreground truncate">{first ? `${first}${more > 0 ? ` 외 ${more}건` : ""}` : "상품 정보 없음"} · {timeAgo(o.created_at)}</span>
                        </span>
                        <span className="text-sm font-semibold tabular-nums shrink-0">{money(Number(o.total))}</span>
                        <span className={`${st.className} rounded-full px-2 py-0.5 text-[11px] font-semibold shrink-0`}>{st.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between gap-2 space-y-0">
            <CardTitle className="text-base">최근 가입 회원 <span className="text-muted-foreground font-normal">· 전체 {profiles.length}명</span></CardTitle>
            <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => go("customers")}>전체 보기<ArrowRight className="h-3.5 w-3.5" /></Button>
          </CardHeader>
          <CardContent className="pt-0">
            {profiles.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">아직 가입한 회원이 없습니다</p>
            ) : (
              <ul className="divide-y divide-border">
                {profiles.slice(0, 6).map(p => {
                  const n = paidOrders.filter(o => o.user_id === p.user_id).length;
                  return (
                    <li key={p.id}>
                      <button onClick={() => go("customers")} className="w-full flex items-center gap-3 py-2.5 text-left rounded-md hover:bg-muted/60 px-2 -mx-2 transition-colors">
                        <span className="h-8 w-8 shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                          {(p.display_name || "?").slice(0, 1).toUpperCase()}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-medium truncate">{p.display_name || "이름 없음"}</span>
                          <span className="block text-xs text-muted-foreground truncate">{p.auth_provider === "google" ? "구글 가입" : "이메일 가입"} · {timeAgo(p.created_at)}</span>
                        </span>
                        <span className="text-xs text-muted-foreground shrink-0">{n > 0 ? `주문 ${n}건` : "주문 없음"}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">인기 상품 <span className="text-muted-foreground font-normal">· 최근 {rangeLabel}</span></CardTitle></CardHeader>
          <CardContent className="pt-0">
            {rangeStats.top.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">이 기간에 판매된 상품이 없습니다</p>
            ) : (
              <ol className="space-y-3">
                {rangeStats.top.map((p, i) => (
                  <li key={p.name}>
                    <div className="flex items-baseline justify-between gap-3 text-sm mb-1.5">
                      <span className="min-w-0 truncate font-medium"><span className="text-muted-foreground mr-1.5 tabular-nums">{i + 1}</span>{p.name}</span>
                      <span className="shrink-0 text-muted-foreground tabular-nums">{p.count}개 · {money(p.revenue)}</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${(p.revenue / (rangeStats.top[0].revenue || 1)) * 100}%` }} />
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between gap-2 space-y-0">
            <CardTitle className="text-base">재고 확인 필요 <span className="text-muted-foreground font-normal">· 판매 중 {active.length}개</span></CardTitle>
            <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => go("products")}>상품 관리<ArrowRight className="h-3.5 w-3.5" /></Button>
          </CardHeader>
          <CardContent className="pt-0">
            {soldOut.length + lowStock.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">재고가 부족한 상품이 없습니다</p>
            ) : (
              <ul className="divide-y divide-border">
                {[...soldOut, ...lowStock].slice(0, 6).map(p => (
                  <li key={p.id}>
                    <button onClick={() => navigate(`/admin/products/${p.id}/edit`)} className="w-full flex items-center gap-3 py-2.5 text-left rounded-md hover:bg-muted/60 px-2 -mx-2 transition-colors">
                      <span className="min-w-0 flex-1 text-sm font-medium truncate">{p.name}</span>
                      {Number(p.stock) <= 0
                        ? <span className="shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-rose-700"><PackageX className="h-3.5 w-3.5" />품절</span>
                        : <span className="shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-amber-700"><AlertTriangle className="h-3.5 w-3.5" />{p.stock}개 남음</span>}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
