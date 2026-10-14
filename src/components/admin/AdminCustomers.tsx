import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Copy, Mail, Repeat, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { parsePhone } from "@/lib/countryFlag";

const STATUS: Record<string, { label: string; className: string }> = {
  pending: { label: "입금 대기", className: "bg-slate-100 text-slate-700 border border-slate-200" },
  confirmed: { label: "결제 확인", className: "bg-blue-50 text-blue-700 border border-blue-200" },
  shipping: { label: "배송 중", className: "bg-amber-50 text-amber-700 border border-amber-200" },
  delivered: { label: "배송 완료", className: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  cancelled: { label: "주문 취소", className: "bg-rose-50 text-rose-700 border border-rose-200" },
};
const PAYMENT_METHOD: Record<string, string> = { bank_transfer: "무통장 입금" };

const money = (n: unknown) => `$${Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const date = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString("ko-KR") : "-");
const dateTime = (iso?: string | null) => (iso ? new Date(iso).toLocaleString("ko-KR", { dateStyle: "medium", timeStyle: "short" }) : "-");

const copy = (text: string) => {
  navigator.clipboard.writeText(text).then(() => toast.success("복사했습니다."), () => toast.error("복사하지 못했습니다."));
};

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex justify-between gap-4 py-1">
    <span className="text-muted-foreground shrink-0">{label}</span>
    <span className="text-right min-w-0 break-words">{children}</span>
  </div>
);

const AdminCustomers = () => {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<Map<string, { email: string; last_sign_in_at: string | null }>>(new Map());
  const [addresses, setAddresses] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState("all");
  const [productFilter, setProductFilter] = useState("all");
  const [repeatOnly, setRepeatOnly] = useState(false);
  const [detailProfile, setDetailProfile] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const { data, error } = await supabase.functions.invoke("delete-customer", {
        body: { userId: deleteTarget.user_id },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success("고객 계정이 삭제되었습니다.");
      setProfiles(prev => prev.filter(p => p.user_id !== deleteTarget.user_id));
      setDeleteTarget(null);
    } catch (e: any) {
      toast.error("삭제 실패: " + (e?.message || "unknown"));
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const [p, o, pr, acc, ad] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("orders").select("*, order_items(product_name, quantity, price)").order("created_at", { ascending: false }),
      supabase.from("products").select("id, name"),
      supabase.rpc("admin_customer_accounts" as any),
      supabase.from("addresses").select("*").order("created_at", { ascending: false }),
    ]);
    if (acc.error) toast.error("회원 이메일을 불러오지 못했습니다: " + acc.error.message);
    setProfiles(p.data || []);
    setOrders(o.data || []);
    setProducts(pr.data || []);
    setAddresses(ad.data || []);
    setAccounts(new Map(((acc.data as any[]) || []).map(a => [a.user_id, { email: a.email, last_sign_in_at: a.last_sign_in_at }])));
  };

  const emailOf = (p: any) => accounts.get(p.user_id)?.email || "";
  // Phone from the profile, else from the customer's latest saved address or order.
  const phoneOf = (p: any) =>
    p.phone ||
    addresses.find(a => a.user_id === p.user_id && a.phone)?.phone ||
    orders.find(o => o.user_id === p.user_id && o.shipping_address?.phone)?.shipping_address?.phone ||
    "";

  const statsOf = (userId: string) => {
    const userOrders = orders.filter(o => o.user_id === userId);
    const paid = userOrders.filter(o => o.status !== "cancelled");
    return {
      orders: userOrders,
      orderCount: userOrders.length,
      cancelled: userOrders.length - paid.length,
      totalSpent: paid.reduce((s, o) => s + Number(o.total), 0),
      isRepeat: paid.length >= 2,
    };
  };

  const countries = useMemo(() => {
    const map = new Map<string, { dial: string; flag: string; name: string; count: number }>();
    for (const p of profiles) {
      const c = parsePhone(phoneOf(p));
      if (!c) continue;
      const ex = map.get(c.iso);
      if (ex) ex.count++;
      else map.set(c.iso, { dial: c.dial, flag: c.flag, name: c.name, count: 1 });
    }
    return Array.from(map.entries()).map(([iso, v]) => ({ iso, ...v })).sort((a, b) => b.count - a.count);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profiles, addresses, orders]);

  const filtered = profiles.filter(p => {
    if (search) {
      const s = search.toLowerCase();
      const hay = [p.display_name, emailOf(p), phoneOf(p)].map(v => String(v || "").toLowerCase());
      if (!hay.some(v => v.includes(s))) return false;
    }
    if (countryFilter !== "all") {
      const c = parsePhone(phoneOf(p));
      if (!c || c.iso !== countryFilter) return false;
    }
    if (productFilter !== "all") {
      const bought = statsOf(p.user_id).orders.some(o => (o.order_items || []).some((i: any) => i.product_name === productFilter));
      if (!bought) return false;
    }
    if (repeatOnly && !statsOf(p.user_id).isRepeat) return false;
    return true;
  });

  const repeatCount = profiles.filter(p => statsOf(p.user_id).isRepeat).length;

  return (
    <div>
      <div className="mb-6 flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold font-serif">고객 관리</h1>
          <p className="text-sm text-muted-foreground mt-1">
            총 {profiles.length}명 · 재구매 고객 {repeatCount}명 · 국가 {countries.length}곳 · 고객을 누르면 주문·결제 정보를 볼 수 있습니다
          </p>
        </div>
        <Button variant={repeatOnly ? "default" : "outline"} size="sm" onClick={() => setRepeatOnly(v => !v)}>
          <Repeat className="h-3.5 w-3.5 mr-1" /> 재구매 고객만
        </Button>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="이메일, 이름, 전화번호 검색..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={countryFilter} onValueChange={setCountryFilter}>
          <SelectTrigger className="w-[200px]"><SelectValue placeholder="국가" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">모든 국가</SelectItem>
            {countries.map(c => (
              <SelectItem key={c.iso} value={c.iso}>
                <span className="mr-1.5">{c.flag}</span> +{c.dial} {c.name} ({c.count})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={productFilter} onValueChange={setProductFilter}>
          <SelectTrigger className="w-[220px]"><SelectValue placeholder="상품 구매 이력" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">모든 상품</SelectItem>
            {products.map(pr => <SelectItem key={pr.id} value={pr.name}>{pr.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이메일</TableHead>
                <TableHead>이름</TableHead>
                <TableHead>전화번호</TableHead>
                <TableHead>국가</TableHead>
                <TableHead>가입방법</TableHead>
                <TableHead>가입일</TableHead>
                <TableHead>주문 수</TableHead>
                <TableHead>총 결제금액</TableHead>
                <TableHead>유형</TableHead>
                <TableHead className="text-right">관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(p => {
                const stats = statsOf(p.user_id);
                const provider = p.auth_provider || "email";
                const phone = phoneOf(p);
                const country = parsePhone(phone);
                return (
                  <TableRow key={p.id} className="cursor-pointer" onClick={() => setDetailProfile(p)}>
                    <TableCell className="font-medium max-w-[240px] truncate">{emailOf(p) || <span className="text-muted-foreground">-</span>}</TableCell>
                    <TableCell className="whitespace-nowrap">{p.display_name || "이름 없음"}</TableCell>
                    <TableCell className="text-sm whitespace-nowrap">{phone || <span className="text-muted-foreground">-</span>}</TableCell>
                    <TableCell>
                      {country ? <span className="text-base leading-none" title={country.name}>{country.flag}</span> : <span className="text-muted-foreground text-xs">-</span>}
                    </TableCell>
                    <TableCell>
                      <Badge variant={provider === "google" ? "default" : "outline"} className="text-[10px] uppercase">{provider}</Badge>
                    </TableCell>
                    <TableCell className="text-sm whitespace-nowrap">{date(p.created_at)}</TableCell>
                    <TableCell><Badge variant="secondary">{stats.orderCount}건</Badge></TableCell>
                    <TableCell className="font-medium whitespace-nowrap">{money(stats.totalSpent)}</TableCell>
                    <TableCell>
                      {stats.isRepeat ? <Badge className="bg-primary/15 text-primary text-[10px]">재구매</Badge>
                        : stats.orderCount > 0 ? <Badge variant="outline" className="text-[10px]">신규</Badge>
                        : <span className="text-xs text-muted-foreground">-</span>}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="icon" variant="ghost" className="text-destructive hover:text-destructive" title="고객 삭제"
                        onClick={e => { e.stopPropagation(); setDeleteTarget(p); }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={10} className="text-center py-8 text-muted-foreground">고객이 없습니다.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!detailProfile} onOpenChange={open => !open && setDetailProfile(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>고객 상세 정보</DialogTitle></DialogHeader>
          {detailProfile && (() => {
            const stats = statsOf(detailProfile.user_id);
            const email = emailOf(detailProfile);
            const phone = phoneOf(detailProfile);
            const country = parsePhone(phone);
            const savedAddresses = addresses.filter(a => a.user_id === detailProfile.user_id);
            return (
              <div className="space-y-6 text-sm">
                <section className="rounded-lg border border-border p-4 space-y-1">
                  <Row label="이메일">
                    {email ? (
                      <span className="inline-flex items-center gap-1">
                        <a href={`mailto:${email}`} className="font-medium hover:underline break-all">{email}</a>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => copy(email)} title="이메일 복사"><Copy className="h-3.5 w-3.5" /></Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7" asChild title="메일 보내기"><a href={`mailto:${email}`}><Mail className="h-3.5 w-3.5" /></a></Button>
                      </span>
                    ) : "-"}
                  </Row>
                  <Row label="이름">{detailProfile.display_name || "-"}</Row>
                  <Row label="전화번호">{phone || "-"}</Row>
                  <Row label="국가">{country ? `${country.flag} ${country.name}` : "-"}</Row>
                  <Row label="가입방법">{(detailProfile.auth_provider || "email").toUpperCase()}</Row>
                  <Row label="가입일">{dateTime(detailProfile.created_at)}</Row>
                  <Row label="최근 로그인">{dateTime(accounts.get(detailProfile.user_id)?.last_sign_in_at)}</Row>
                  <Row label="보유 포인트">{Number(detailProfile.points || 0).toLocaleString()}P</Row>
                </section>

                <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    ["주문 수", `${stats.orderCount}건`],
                    ["총 결제금액", money(stats.totalSpent)],
                    ["평균 주문금액", money(stats.orderCount - stats.cancelled ? stats.totalSpent / (stats.orderCount - stats.cancelled) : 0)],
                    ["취소", `${stats.cancelled}건`],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-lg border border-border p-3">
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="text-base font-semibold tabular-nums mt-0.5">{value}</p>
                    </div>
                  ))}
                </section>

                <section>
                  <h3 className="font-semibold mb-2">주문 · 결제 내역 ({stats.orderCount}건)</h3>
                  {stats.orderCount === 0 ? (
                    <p className="text-muted-foreground rounded-lg border border-dashed border-border p-4 text-center">주문 내역이 없습니다.</p>
                  ) : (
                    <div className="space-y-3">
                      {stats.orders.map(o => {
                        const st = STATUS[o.status] || STATUS.pending;
                        const a: any = o.shipping_address || {};
                        return (
                          <article key={o.id} className="rounded-lg border border-border">
                            <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/40 px-4 py-2.5">
                              <span className="font-medium">#{o.id.slice(0, 8)} <span className="text-muted-foreground font-normal">· {dateTime(o.created_at)}</span></span>
                              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${st.className}`}>{st.label}</span>
                            </header>
                            <div className="grid md:grid-cols-2 gap-x-6 gap-y-4 p-4">
                              <div>
                                <p className="text-xs font-semibold text-muted-foreground mb-1.5">주문 상품</p>
                                <ul className="space-y-1">
                                  {(o.order_items || []).map((it: any, i: number) => (
                                    <li key={i} className="flex justify-between gap-3">
                                      <span className="min-w-0 break-words">{it.product_name} <span className="text-muted-foreground">× {it.quantity}</span></span>
                                      <span className="shrink-0 tabular-nums">{money(Number(it.price) * it.quantity)}</span>
                                    </li>
                                  ))}
                                </ul>
                                <p className="text-xs font-semibold text-muted-foreground mt-4 mb-1.5">배송지</p>
                                <p>{a.full_name || a.name || "-"} · {a.phone || "-"}</p>
                                <p className="text-muted-foreground">
                                  {[a.address_line1, a.address_line2].filter(Boolean).join(" ")}, {[a.city, a.state, a.postal_code].filter(Boolean).join(" ")} {a.country ? `(${a.country})` : ""}
                                </p>
                                {a.delivery_request && <p className="text-muted-foreground mt-1">요청사항: {a.delivery_request}</p>}
                                {(o.tracking_number || o.tracking_carrier) && (
                                  <p className="mt-1">송장: {o.tracking_carrier} {o.tracking_number}</p>
                                )}
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-muted-foreground mb-1.5">결제 정보</p>
                                <Row label="결제수단">{PAYMENT_METHOD[o.payment_method] || o.payment_method || "-"}</Row>
                                <Row label="입금자명">{o.depositor_name || "-"}</Row>
                                {o.status === "pending" && <Row label="입금 기한">{dateTime(o.payment_deadline)}</Row>}
                                <Row label="상품 금액">{money(o.subtotal)}</Row>
                                <Row label="배송비">{money(o.shipping_fee)}</Row>
                                {Number(o.discount) > 0 && <Row label={`쿠폰${o.coupon_code ? ` (${o.coupon_code})` : ""}`}>-{money(o.discount)}</Row>}
                                {Number(o.points_used) > 0 && <Row label="포인트 사용">-{money(o.points_used)}</Row>}
                                <div className="border-t border-border mt-1 pt-1">
                                  <Row label="결제 금액"><span className="font-semibold">{money(o.total)}</span></Row>
                                </div>
                                {o.cancel_reason && <p className="text-rose-700 mt-1">취소 사유: {o.cancel_reason}</p>}
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </section>

                {savedAddresses.length > 0 && (
                  <section>
                    <h3 className="font-semibold mb-2">저장된 배송지 ({savedAddresses.length}곳)</h3>
                    <div className="space-y-2">
                      {savedAddresses.map(a => (
                        <div key={a.id} className="rounded-lg bg-muted/50 p-3">
                          <p>{a.full_name || a.name} · {a.phone}</p>
                          <p className="text-muted-foreground text-xs mt-0.5">
                            {a.address_line1} {a.address_line2 || ""}, {a.city} {a.postal_code} {a.country ? `(${a.country})` : ""}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={o => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>고객을 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.display_name || "이 고객"}의 계정과 개인정보(주소, 장바구니, 위시리스트, 리뷰, 포인트)가 영구 삭제됩니다.
              주문 내역은 통계를 위해 보존됩니다. 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>취소</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => { e.preventDefault(); confirmDelete(); }}
              disabled={deleting}
            >
              {deleting ? "삭제 중..." : "삭제"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminCustomers;
