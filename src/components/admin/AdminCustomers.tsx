import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Search, Eye } from "lucide-react";

const AdminCustomers = () => {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [detailProfile, setDetailProfile] = useState<any>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const [p, o] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("orders").select("user_id, total, status, created_at, order_items(product_name, quantity, price)"),
    ]);
    setProfiles(p.data || []);
    setOrders(o.data || []);
  };

  const getCustomerStats = (userId: string) => {
    const userOrders = orders.filter(o => o.user_id === userId);
    return {
      orderCount: userOrders.length,
      totalSpent: userOrders.reduce((s, o) => s + Number(o.total), 0),
      lastOrder: userOrders.length > 0 ? userOrders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0] : null,
    };
  };

  const viewDetail = (profile: any) => {
    setDetailProfile(profile);
    setDetailOpen(true);
  };

  const filtered = profiles.filter(p => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (p.display_name?.toLowerCase() || "").includes(s) || (p.phone || "").includes(s);
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-serif">고객 관리</h1>
        <p className="text-sm text-muted-foreground mt-1">총 {profiles.length}명의 고객</p>
      </div>

      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="고객명, 전화번호 검색..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>고객명</TableHead>
                <TableHead>가입방법</TableHead>
                <TableHead>전화번호</TableHead>
                <TableHead>가입일</TableHead>
                <TableHead>주문 수</TableHead>
                <TableHead>총 구매금액</TableHead>
                <TableHead>최근 주문</TableHead>
                <TableHead className="text-right">상세</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(p => {
                const stats = getCustomerStats(p.user_id);
                const provider = p.auth_provider || "email";
                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.display_name || "이름 없음"}</TableCell>
                    <TableCell>
                      <Badge variant={provider === "google" ? "default" : "outline"} className="text-[10px] uppercase">
                        {provider}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {p.phone || "-"}
                      {p.phone_verified && <span className="ml-1 text-green-600 text-xs">✓</span>}
                    </TableCell>
                    <TableCell className="text-sm">{new Date(p.created_at).toLocaleDateString("ko-KR")}</TableCell>
                    <TableCell><Badge variant="secondary">{stats.orderCount}건</Badge></TableCell>
                    <TableCell className="font-medium">{stats.totalSpent.toLocaleString()}원</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {stats.lastOrder ? new Date(stats.lastOrder.created_at).toLocaleDateString("ko-KR") : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="icon" variant="ghost" onClick={() => viewDetail(p)}><Eye className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">고객이 없습니다.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>고객 상세 정보</DialogTitle></DialogHeader>
          {detailProfile && (() => {
            const stats = getCustomerStats(detailProfile.user_id);
            const userOrders = orders.filter(o => o.user_id === detailProfile.user_id).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            return (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">이름:</span> {detailProfile.display_name || "-"}</div>
                  <div><span className="text-muted-foreground">전화:</span> {detailProfile.phone || "-"}</div>
                  <div><span className="text-muted-foreground">가입일:</span> {new Date(detailProfile.created_at).toLocaleDateString("ko-KR")}</div>
                  <div><span className="text-muted-foreground">총 주문:</span> {stats.orderCount}건</div>
                  <div className="col-span-2"><span className="text-muted-foreground">총 구매금액:</span> <span className="font-bold">{stats.totalSpent.toLocaleString()}원</span></div>
                </div>
                <div>
                  <p className="font-medium text-sm mb-2">주문 내역</p>
                  {userOrders.length === 0 ? (
                    <p className="text-sm text-muted-foreground">주문 내역이 없습니다.</p>
                  ) : (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {userOrders.map(o => (
                        <div key={o.created_at} className="p-3 bg-muted/50 rounded-lg text-sm">
                          <div className="flex justify-between">
                            <span>{new Date(o.created_at).toLocaleDateString("ko-KR")}</span>
                            <span className="font-medium">{Number(o.total).toLocaleString()}원</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {(o.order_items || []).map((i: any) => i.product_name).join(", ")}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCustomers;
