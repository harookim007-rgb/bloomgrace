import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, Truck, Package, CheckCircle, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";

const statusMap: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "주문 접수", color: "bg-muted text-muted-foreground", icon: Clock },
  confirmed: { label: "주문 확인", color: "bg-primary/10 text-primary", icon: CheckCircle },
  shipping: { label: "배송 중", color: "bg-secondary/10 text-secondary", icon: Truck },
  delivered: { label: "배송 완료", color: "bg-secondary/20 text-secondary", icon: Package },
  cancelled: { label: "주문 취소", color: "bg-destructive/10 text-destructive", icon: XCircle },
};

const AdminOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [detailOrder, setDetailOrder] = useState<any>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*, order_items(*), profiles!orders_user_id_fkey(display_name)")
      .order("created_at", { ascending: false });
    setOrders(data || []);
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("orders").update({ status }).eq("id", id);
    toast.success("주문 상태가 업데이트되었습니다.");
    fetchData();
  };

  const viewDetail = (order: any) => {
    setDetailOrder(order);
    setDetailOpen(true);
  };

  const filtered = orders.filter(o => {
    if (filterStatus !== "all" && o.status !== filterStatus) return false;
    if (search) {
      const s = search.toLowerCase();
      const name = o.profiles?.display_name?.toLowerCase() || "";
      const items = (o.order_items || []).map((i: any) => i.product_name.toLowerCase()).join(" ");
      if (!name.includes(s) && !items.includes(s) && !o.id.includes(s)) return false;
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

      {/* Status summary */}
      <div className="flex flex-wrap gap-3 mb-6">
        {Object.entries(statusMap).map(([key, val]) => (
          <button
            key={key}
            onClick={() => setFilterStatus(filterStatus === key ? "all" : key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === key ? val.color + " ring-2 ring-ring" : "bg-muted/50 text-muted-foreground hover:bg-muted"
            }`}
          >
            <val.icon className="h-4 w-4" />
            {val.label} ({statusCounts[key] || 0})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="고객명, 상품명, 주문 ID 검색..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>주문일</TableHead>
                <TableHead>주문번호</TableHead>
                <TableHead>고객</TableHead>
                <TableHead>상품</TableHead>
                <TableHead>금액</TableHead>
                <TableHead>결제</TableHead>
                <TableHead>상태</TableHead>
                <TableHead className="text-right">관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(o => {
                const st = statusMap[o.status] || statusMap.pending;
                return (
                  <TableRow key={o.id}>
                    <TableCell className="text-sm">{new Date(o.created_at).toLocaleDateString("ko-KR")}</TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">{o.id.slice(0, 8)}...</TableCell>
                    <TableCell className="text-sm font-medium">{o.profiles?.display_name || "알 수 없음"}</TableCell>
                    <TableCell className="text-sm max-w-[200px] truncate">
                      {o.order_items?.[0]?.product_name || "-"}
                      {(o.order_items?.length || 0) > 1 && <span className="text-muted-foreground"> 외 {o.order_items.length - 1}건</span>}
                    </TableCell>
                    <TableCell className="font-medium">{Number(o.total).toLocaleString()}원</TableCell>
                    <TableCell className="text-sm">{o.payment_method || "-"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={`${st.color} text-xs`}>{st.label}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => viewDetail(o)} title="상세"><Eye className="h-4 w-4" /></Button>
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

      {/* Order Detail Dialog */}
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
    </div>
  );
};

export default AdminOrders;
