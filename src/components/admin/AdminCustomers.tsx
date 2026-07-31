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
import { Search, Eye, Repeat, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { parsePhone } from "@/lib/countryFlag";


const AdminCustomers = () => {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState("all");
  const [productFilter, setProductFilter] = useState("all");
  const [repeatOnly, setRepeatOnly] = useState(false);
  const [detailProfile, setDetailProfile] = useState<any>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const [p, o, pr] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("orders").select("user_id, total, status, created_at, shipping_address, order_items(product_name, quantity, price)"),
      supabase.from("products").select("id, name"),
    ]);
    setProfiles(p.data || []);
    setOrders(o.data || []);
    setProducts(pr.data || []);
  };

  const getCustomerStats = (userId: string) => {
    const userOrders = orders.filter(o => o.user_id === userId);
    return {
      orderCount: userOrders.length,
      totalSpent: userOrders.reduce((s, o) => s + Number(o.total), 0),
      lastOrder: userOrders.length > 0 ? userOrders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0] : null,
      isRepeat: userOrders.length >= 2,
    };
  };

  // Build unique country list from phones
  const countries = useMemo(() => {
    const map = new Map<string, { dial: string; flag: string; name: string; count: number }>();
    for (const p of profiles) {
      const c = parsePhone(p.phone);
      if (!c) continue;
      const k = c.iso;
      const ex = map.get(k);
      if (ex) ex.count++;
      else map.set(k, { dial: c.dial, flag: c.flag, name: c.name, count: 1 });
    }
    return Array.from(map.entries()).map(([iso, v]) => ({ iso, ...v })).sort((a, b) => b.count - a.count);
  }, [profiles]);

  const viewDetail = (profile: any) => {
    setDetailProfile(profile);
    setDetailOpen(true);
  };

  const filtered = profiles.filter(p => {
    if (search) {
      const s = search.toLowerCase();
      if (!((p.display_name?.toLowerCase() || "").includes(s) || (p.phone || "").includes(s))) return false;
    }
    if (countryFilter !== "all") {
      const c = parsePhone(p.phone);
      if (!c || c.iso !== countryFilter) return false;
    }
    if (productFilter !== "all") {
      const userOrders = orders.filter(o => o.user_id === p.user_id);
      const bought = userOrders.some(o => (o.order_items || []).some((i: any) => i.product_name === productFilter));
      if (!bought) return false;
    }
    if (repeatOnly) {
      const userOrders = orders.filter(o => o.user_id === p.user_id);
      if (userOrders.length < 2) return false;
    }
    return true;
  });

  const repeatCount = profiles.filter(p => orders.filter(o => o.user_id === p.user_id).length >= 2).length;

  return (
    <div>
      <div className="mb-6 flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold font-serif">고객 관리</h1>
          <p className="text-sm text-muted-foreground mt-1">
            총 {profiles.length}명 · 재구매 고객 {repeatCount}명 · 국가 {countries.length}곳
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={repeatOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setRepeatOnly(v => !v)}
          >
            <Repeat className="h-3.5 w-3.5 mr-1" /> 재구매 고객만
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="고객명, 전화번호 검색..." value={search} onChange={e => setSearch(e.target.value)} />
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
            {products.map(pr => (
              <SelectItem key={pr.id} value={pr.name}>{pr.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>고객명</TableHead>
                <TableHead>국가</TableHead>
                <TableHead>가입방법</TableHead>
                <TableHead>전화번호</TableHead>
                <TableHead>가입일</TableHead>
                <TableHead>주문 수</TableHead>
                <TableHead>총 구매금액</TableHead>
                <TableHead>유형</TableHead>
                <TableHead className="text-right">상세</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(p => {
                const stats = getCustomerStats(p.user_id);
                const provider = p.auth_provider || "email";
                const country = parsePhone(p.phone);
                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.display_name || "이름 없음"}</TableCell>
                    <TableCell>
                      {country ? (
                        <span className="inline-flex items-center gap-1.5 text-sm">
                          <span className="text-base leading-none">{country.flag}</span>
                          <span className="text-muted-foreground text-xs">+{country.dial}</span>
                        </span>
                      ) : <span className="text-muted-foreground text-xs">-</span>}
                    </TableCell>
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
                    <TableCell>
                      {stats.isRepeat ? (
                        <Badge className="bg-primary/15 text-primary text-[10px]">재구매</Badge>
                      ) : stats.orderCount > 0 ? (
                        <Badge variant="outline" className="text-[10px]">신규</Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => viewDetail(p)} title="상세"><Eye className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteTarget(p)} title="고객 삭제">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>

                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">고객이 없습니다.</TableCell></TableRow>
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
            const country = parsePhone(detailProfile.phone);
            const userOrders = orders.filter(o => o.user_id === detailProfile.user_id).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            const addresses = Array.from(new Map(
              userOrders.filter(o => o.shipping_address).map(o => {
                const a: any = o.shipping_address;
                const key = `${a?.address_line1}|${a?.city}|${a?.postal_code}`;
                return [key, a];
              })
            ).values());
            return (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">이름:</span> {detailProfile.display_name || "-"}</div>
                  <div><span className="text-muted-foreground">국가:</span> {country ? `${country.flag} ${country.name}` : "-"}</div>
                  <div><span className="text-muted-foreground">전화:</span> {detailProfile.phone || "-"}</div>
                  <div><span className="text-muted-foreground">가입일:</span> {new Date(detailProfile.created_at).toLocaleDateString("ko-KR")}</div>
                  <div><span className="text-muted-foreground">총 주문:</span> {stats.orderCount}건 {stats.isRepeat && <Badge className="ml-1 text-[10px] bg-primary/15 text-primary">재구매</Badge>}</div>
                  <div className="col-span-2"><span className="text-muted-foreground">총 구매금액:</span> <span className="font-bold">{stats.totalSpent.toLocaleString()}원</span></div>
                </div>

                {addresses.length > 0 && (
                  <div>
                    <p className="font-medium text-sm mb-2">배송 주소 ({addresses.length}곳)</p>
                    <div className="space-y-2">
                      {addresses.map((a: any, i) => (
                        <div key={i} className="p-3 bg-muted/50 rounded-lg text-sm">
                          <p>{a?.name} · {a?.phone}</p>
                          <p className="text-muted-foreground text-xs mt-0.5">
                            {a?.address_line1} {a?.address_line2 || ""}, {a?.city} {a?.postal_code}
                            {a?.country && ` (${a.country})`}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <p className="font-medium text-sm mb-2">주문 내역</p>
                  {userOrders.length === 0 ? (
                    <p className="text-sm text-muted-foreground">주문 내역이 없습니다.</p>
                  ) : (
                    <div className="space-y-2 max-h-[280px] overflow-y-auto">
                      {userOrders.map((o, idx) => (
                        <div key={idx} className="p-3 bg-muted/50 rounded-lg text-sm">
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
