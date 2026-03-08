import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Copy } from "lucide-react";
import { toast } from "sonner";

const emptyForm = {
  code: "", description: "", discount_type: "percentage", discount_value: "",
  min_order_amount: "0", max_uses: "", starts_at: "", expires_at: "", is_active: true,
};

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const { data } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
    setCoupons(data || []);
  };

  const save = async () => {
    if (!form.code || !form.discount_value) { toast.error("코드와 할인 값을 입력하세요."); return; }
    const payload = {
      code: form.code.toUpperCase(),
      description: form.description || null,
      discount_type: form.discount_type,
      discount_value: parseFloat(form.discount_value) || 0,
      min_order_amount: parseFloat(form.min_order_amount) || 0,
      max_uses: form.max_uses ? parseInt(form.max_uses) : null,
      starts_at: form.starts_at || null,
      expires_at: form.expires_at || null,
      is_active: form.is_active,
    };

    if (editingId) {
      const { error } = await supabase.from("coupons").update(payload).eq("id", editingId);
      if (error) { toast.error(error.message); return; }
      toast.success("쿠폰이 수정되었습니다.");
    } else {
      const { error } = await supabase.from("coupons").insert(payload);
      if (error) { toast.error(error.message); return; }
      toast.success("쿠폰이 생성되었습니다.");
    }
    setForm(emptyForm); setEditingId(null); setDialogOpen(false);
    fetchData();
  };

  const edit = (c: any) => {
    setForm({
      code: c.code, description: c.description || "", discount_type: c.discount_type,
      discount_value: String(c.discount_value), min_order_amount: String(c.min_order_amount || 0),
      max_uses: c.max_uses ? String(c.max_uses) : "", starts_at: c.starts_at?.slice(0, 16) || "",
      expires_at: c.expires_at?.slice(0, 16) || "", is_active: c.is_active,
    });
    setEditingId(c.id); setDialogOpen(true);
  };

  const remove = async (id: string) => {
    if (!confirm("삭제하시겠습니까?")) return;
    await supabase.from("coupons").delete().eq("id", id);
    toast.success("삭제되었습니다."); fetchData();
  };

  const toggleActive = async (id: string, active: boolean) => {
    await supabase.from("coupons").update({ is_active: active }).eq("id", id);
    fetchData();
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("쿠폰 코드가 복사되었습니다.");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-serif">쿠폰 & 이벤트</h1>
          <p className="text-sm text-muted-foreground mt-1">총 {coupons.length}개 · 활성 {coupons.filter(c=>c.is_active).length}개</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={() => { setForm(emptyForm); setEditingId(null); }}><Plus className="h-4 w-4" />쿠폰 추가</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editingId ? "쿠폰 수정" : "새 쿠폰 등록"}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>쿠폰 코드 *</Label><Input value={form.code} onChange={e => setForm({...form, code: e.target.value})} placeholder="WELCOME15" className="uppercase" /></div>
              <div><Label>설명</Label><Input value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="신규 가입 15% 할인" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>할인 유형</Label>
                  <Select value={form.discount_type} onValueChange={v => setForm({...form, discount_type: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">퍼센트 (%)</SelectItem>
                      <SelectItem value="fixed">정액 (원)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>할인 값 *</Label><Input type="number" value={form.discount_value} onChange={e => setForm({...form, discount_value: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>최소 주문금액</Label><Input type="number" value={form.min_order_amount} onChange={e => setForm({...form, min_order_amount: e.target.value})} /></div>
                <div><Label>최대 사용 횟수</Label><Input type="number" value={form.max_uses} onChange={e => setForm({...form, max_uses: e.target.value})} placeholder="무제한" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>시작일</Label><Input type="datetime-local" value={form.starts_at} onChange={e => setForm({...form, starts_at: e.target.value})} /></div>
                <div><Label>종료일</Label><Input type="datetime-local" value={form.expires_at} onChange={e => setForm({...form, expires_at: e.target.value})} /></div>
              </div>
              <div className="flex items-center gap-2"><Switch checked={form.is_active} onCheckedChange={v => setForm({...form, is_active: v})} /><Label>활성화</Label></div>
              <Button className="w-full" onClick={save}>{editingId ? "수정" : "등록"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>쿠폰 코드</TableHead>
                <TableHead>설명</TableHead>
                <TableHead>할인</TableHead>
                <TableHead>최소 금액</TableHead>
                <TableHead>사용/최대</TableHead>
                <TableHead>기간</TableHead>
                <TableHead>상태</TableHead>
                <TableHead className="text-right">관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map(c => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm">{c.code}</span>
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => copyCode(c.code)}><Copy className="h-3 w-3" /></Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{c.description || "-"}</TableCell>
                  <TableCell className="font-medium">{c.discount_type === "percentage" ? `${c.discount_value}%` : `${Number(c.discount_value).toLocaleString()}원`}</TableCell>
                  <TableCell className="text-sm">{Number(c.min_order_amount || 0).toLocaleString()}원</TableCell>
                  <TableCell className="text-sm">{c.used_count || 0}/{c.max_uses || "∞"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {c.starts_at ? new Date(c.starts_at).toLocaleDateString("ko-KR") : "~"}
                    {" ~ "}
                    {c.expires_at ? new Date(c.expires_at).toLocaleDateString("ko-KR") : ""}
                  </TableCell>
                  <TableCell>
                    <Switch checked={c.is_active} onCheckedChange={v => toggleActive(c.id, v)} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="icon" variant="ghost" onClick={() => edit(c)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" className="text-destructive" onClick={() => remove(c.id)}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
              {coupons.length === 0 && (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">쿠폰이 없습니다.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCoupons;
