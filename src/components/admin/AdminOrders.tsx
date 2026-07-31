import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Search, Eye, Truck, Package, CheckCircle, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { parsePhone } from "@/lib/countryFlag";

const statusMap: Record<string, { label: string; color: string; dot: string; icon: React.ElementType; step: number }> = {
  pending:   { label: "주문 접수", color: "bg-slate-100 text-slate-700 border border-slate-200", dot: "bg-slate-400", icon: Clock, step: 1 },
  confirmed: { label: "주문 확인", color: "bg-blue-50 text-blue-700 border border-blue-200", dot: "bg-blue-500", icon: CheckCircle, step: 2 },
  shipping:  { label: "배송 중", color: "bg-amber-50 text-amber-700 border border-amber-200", dot: "bg-amber-500", icon: Truck, step: 3 },
  delivered: { label: "배송 완료", color: "bg-emerald-50 text-emerald-700 border border-emerald-200", dot: "bg-emerald-500", icon: Package, step: 4 },
  cancelled: { label: "주문 취소", color: "bg-rose-50 text-rose-700 border border-rose-200", dot: "bg-rose-500", icon: XCircle, step: 0 },
};

const STAGES = ["pending", "confirmed", "shipping", "delivered"];

const StatusStepper = ({ status }: { status: string }) => {
  if (status === "cancelled") {
    return <Badge className="bg-rose-50 text-rose-700 border border-rose-200 text-xs">취소됨</Badge>;
  }
  const currentStep = statusMap[status]?.step || 1;
  return (
    <div className="flex items-center gap-1">
      {STAGES.map((s, i) => {
        const reached = i + 1 <= currentStep;
        const meta = statusMap[s];
        return (
          <div key={s} className="flex items-center gap-1">
            <span
              className={`h-2 w-2 rounded-full ${reached ? meta.dot : "bg-muted"}`}
              title={meta.label}
            />
            {i < STAGES.length - 1 && (
              <span className={`h-px w-3 ${i + 1 < currentStep ? meta.dot : "bg-muted"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

const AdminOrders = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState(searchParams.get("status") || "all");
  const [filterProduct, setFilterProduct] = useState("all");
  const [search, setSearch] = useState("");
  const [detailOrder, setDetailOrder] = useState<any>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [trackingOpen, setTrackingOpen] = useState(false);
  const [trackingOrder, setTrackingOrder] = useState<any>(null);
  const [trackingForm, setTrackingForm] = useState({ tracking_number: "", tracking_carrier: "", tracking_url: "" });
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    const s = searchParams.get("status");
    if (s && s !== filterStatus) setFilterStatus(s);
  }, [searchParams]);

  const applyStatusFilter = (next: string) => {
    setFilterStatus(next);
    const p = new URLSearchParams(searchParams);
    if (next === "all") p.delete("status"); else p.set("status", next);
    setSearchParams(p, { replace: true });
  };

  const fetchData = async () => {
    const [o, p] = await Promise.all([
      supabase
        .from("orders")
        .select("*, order_items(*)")
        .order("created_at", { ascending: false }),
      supabase.from("products").select("id, name"),
    ]);
    if (o.error) toast.error("주문을 불러오지 못했습니다: " + o.error.message);

    const rows = o.data || [];
    const userIds = Array.from(new Set(rows.map((r: any) => r.user_id).filter(Boolean)));
    let profileMap = new Map<string, any>();
    if (userIds.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("user_id, display_name, phone")
        .in("user_id", userIds);
      profileMap = new Map((profs || []).map((pf: any) => [pf.user_id, pf]));
    }
    setOrders(rows.map((r: any) => ({ ...r, profiles: profileMap.get(r.user_id) || null })));
    setProducts(p.data || []);
  };

  const notifyCustomer = async (orderId: string, type: "payment_confirmed" | "shipping_started" | "delivered") => {
    const { data, error } = await supabase.functions.invoke("order-status-email", { body: { orderId, type } });
    if (error || data?.error) {
      toast.warning("상태는 변경됐지만 고객 이메일 발송에 실패했습니다.");
      return;
    }
    toast.success("고객에게 안내 이메일을 발송했습니다.");
  };

  const updateStatus = async (id: string, status: string, notify = false) => {
    setBusyId(id);
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) {
      toast.error("상태 변경 실패: " + error.message);
      setBusyId(null);
      return;
    }
    toast.success("주문 상태가 업데이트되었습니다.");
    if (notify) {
      const map: Record<string, "payment_confirmed" | "shipping_started" | "delivered"> = {
        confirmed: "payment_confirmed",
        shipping: "shipping_started",
        delivered: "delivered",
      };
      if (map[status]) await notifyCustomer(id, map[status]);
    }
    setBusyId(null);
    fetchData();
  };


  const openTracking = (o: any) => {
    setTrackingOrder(o);
    setTrackingForm({
      tracking_number: o.tracking_number || "",
      tracking_carrier: o.tracking_carrier || "",
      tracking_url: o.tracking_url || "",
    });
    setTrackingOpen(true);
  };

  const saveTracking = async () => {
    if (!trackingOrder) return;
    const payload: any = {
      tracking_number: trackingForm.tracking_number || null,
      tracking_carrier: trackingForm.tracking_carrier || null,
      tracking_url: trackingForm.tracking_url || null,
    };
    // If saving a tracking number, advance status to shipping (unless already delivered/cancelled)
    if (trackingForm.tracking_number && !["delivered", "cancelled"].includes(trackingOrder.status)) {
      payload.status = "shipping";
    }
    const { error } = await supabase.from("orders").update(payload).eq("id", trackingOrder.id);
    if (error) {
      toast.error("저장 실패: " + error.message);
      return;
    }
    toast.success("배송 트래킹이 등록되었습니다.");
    setTrackingOpen(false);
    fetchData();
  };

  const filtered = orders.filter(o => {
    if (filterStatus !== "all" && o.status !== filterStatus) return false;
    if (filterProduct !== "all" && !(o.order_items || []).some((i: any) => i.product_name === filterProduct)) return false;
    if (search) {
      const s = search.toLowerCase();
      const name = o.profiles?.display_name?.toLowerCase() || "";
      const items = (o.order_items || []).map((i: any) => i.product_name.toLowerCase()).join(" ");
      const tracking = (o.tracking_number || "").toLowerCase();
      if (!name.includes(s) && !items.includes(s) && !o.id.includes(s) && !tracking.includes(s)) return false;
    }
    return true;
  });

  const statusCounts = orders.reduce((acc: Record<string, number>, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-serif">주문 관리</h1>
        <p className="text-sm text-muted-foreground mt-1">총 {orders.length}건의 주문</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        {Object.entries(statusMap).map(([key, val]) => (
          <button
            key={key}
            onClick={() => setFilterStatus(filterStatus === key ? "all" : key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === key ? val.color + " ring-2 ring-ring/40" : "bg-muted/50 text-muted-foreground hover:bg-muted"
            }`}
          >
            <val.icon className="h-4 w-4" />
            {val.label} ({statusCounts[key] || 0})
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="고객명, 상품명, 주문 ID, 송장번호 검색..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={filterProduct} onValueChange={setFilterProduct}>
          <SelectTrigger className="w-[220px]"><SelectValue placeholder="상품별 조회" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">모든 상품</SelectItem>
            {products.map(p => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>주문일</TableHead>
                <TableHead>주문번호</TableHead>
                <TableHead>고객</TableHead>
                <TableHead>상품</TableHead>
                <TableHead>금액</TableHead>
                <TableHead>배송 진행</TableHead>
                <TableHead>송장</TableHead>
                <TableHead className="text-right">관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(o => {
                const st = statusMap[o.status] || statusMap.pending;
                const country = parsePhone(o.profiles?.phone);
                return (
                  <TableRow key={o.id}>
                    <TableCell className="text-sm whitespace-nowrap">{new Date(o.created_at).toLocaleDateString("ko-KR")}</TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">{o.id.slice(0, 8)}</TableCell>
                    <TableCell className="text-sm font-medium">
                      <span className="inline-flex items-center gap-1.5">
                        {country && <span className="text-base leading-none">{country.flag}</span>}
                        {o.profiles?.display_name || "알 수 없음"}
                      </span>
                    </TableCell>
                    <TableCell
                      className="text-sm max-w-[200px] truncate"
                      title={(o.order_items || []).map((it: any) => it.product_name).filter(Boolean).join(", ")}
                    >
                      {o.order_items?.[0]?.product_name || "-"}
                      {(o.order_items?.length || 0) > 1 && <span className="text-muted-foreground"> 외 {o.order_items.length - 1}건</span>}
                    </TableCell>
                    <TableCell className="font-medium whitespace-nowrap">{Number(o.total).toLocaleString()}원</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge className={`${st.color} text-[10px]`}>{st.label}</Badge>
                        <StatusStepper status={o.status} />
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">
                      {o.tracking_number ? (
                        <div>
                          <div className="font-mono">{o.tracking_number}</div>
                          <div className="text-muted-foreground">{o.tracking_carrier || "-"}</div>
                        </div>
                      ) : <span className="text-muted-foreground">미등록</span>}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => { setDetailOrder(o); setDetailOpen(true); }} title="상세"><Eye className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => openTracking(o)} title="송장 등록"><Truck className="h-4 w-4" /></Button>
                        <Select value={o.status} onValueChange={v => updateStatus(o.id, v)}>
                          <SelectTrigger className="w-[110px] h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {Object.entries(statusMap).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">주문이 없습니다.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>주문 상세</DialogTitle></DialogHeader>
          {detailOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">주문번호:</span> <span className="font-mono text-xs">{detailOrder.id}</span></div>
                <div><span className="text-muted-foreground">주문일:</span> {new Date(detailOrder.created_at).toLocaleString("ko-KR")}</div>
                <div><span className="text-muted-foreground">고객:</span> {detailOrder.profiles?.display_name || "-"}</div>
                <div><span className="text-muted-foreground">결제:</span> {detailOrder.payment_method || "-"}</div>
                {detailOrder.coupon_code && <div><span className="text-muted-foreground">쿠폰:</span> {detailOrder.coupon_code}</div>}
                {detailOrder.discount > 0 && <div><span className="text-muted-foreground">할인:</span> -{Number(detailOrder.discount).toLocaleString()}원</div>}
              </div>

              <div className="p-3 rounded-lg border border-border">
                <p className="font-medium mb-2 text-sm">배송 진행 상황</p>
                <div className="flex items-center gap-2">
                  <Badge className={`${(statusMap[detailOrder.status] || statusMap.pending).color}`}>
                    {(statusMap[detailOrder.status] || statusMap.pending).label}
                  </Badge>
                  <StatusStepper status={detailOrder.status} />
                </div>
                {detailOrder.tracking_number && (
                  <div className="mt-3 text-sm space-y-1">
                    <p><span className="text-muted-foreground">택배사:</span> {detailOrder.tracking_carrier || "-"}</p>
                    <p><span className="text-muted-foreground">송장번호:</span> <span className="font-mono">{detailOrder.tracking_number}</span></p>
                    {detailOrder.tracking_url && (
                      <a href={detailOrder.tracking_url} target="_blank" rel="noreferrer" className="text-primary underline text-xs">배송 조회 링크</a>
                    )}
                  </div>
                )}
              </div>

              {detailOrder.shipping_address && (
                <div className="p-3 bg-muted/50 rounded-lg text-sm">
                  <p className="font-medium mb-1">배송지</p>
                  <p>{(detailOrder.shipping_address as any)?.name} · {(detailOrder.shipping_address as any)?.phone}</p>
                  <p>{(detailOrder.shipping_address as any)?.address_line1} {(detailOrder.shipping_address as any)?.address_line2}</p>
                  <p>{(detailOrder.shipping_address as any)?.city} {(detailOrder.shipping_address as any)?.postal_code}</p>
                </div>
              )}
              <div>
                <p className="font-medium mb-2 text-sm">주문 상품</p>
                {(detailOrder.order_items || []).map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-medium">{item.product_name}</p>
                      <p className="text-xs text-muted-foreground">수량: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium">{(Number(item.price) * item.quantity).toLocaleString()}원</p>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center pt-2 font-bold">
                <span>총 결제금액</span>
                <span>{Number(detailOrder.total).toLocaleString()}원</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Tracking Dialog */}
      <Dialog open={trackingOpen} onOpenChange={setTrackingOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>배송 트래킹 등록</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">택배사</Label>
              <Input
                value={trackingForm.tracking_carrier}
                onChange={e => setTrackingForm(f => ({ ...f, tracking_carrier: e.target.value }))}
                placeholder="CJ 대한통운, DHL, FedEx 등"
              />
            </div>
            <div>
              <Label className="text-xs">송장번호</Label>
              <Input
                value={trackingForm.tracking_number}
                onChange={e => setTrackingForm(f => ({ ...f, tracking_number: e.target.value }))}
                placeholder="1234567890"
              />
            </div>
            <div>
              <Label className="text-xs">배송 조회 링크 (선택)</Label>
              <Input
                value={trackingForm.tracking_url}
                onChange={e => setTrackingForm(f => ({ ...f, tracking_url: e.target.value }))}
                placeholder="https://..."
              />
            </div>
            <p className="text-xs text-muted-foreground">송장번호를 등록하면 주문 상태가 자동으로 "배송 중"으로 변경됩니다.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTrackingOpen(false)}>취소</Button>
            <Button onClick={saveTracking}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrders;
