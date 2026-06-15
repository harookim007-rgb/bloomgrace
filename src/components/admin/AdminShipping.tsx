import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

interface Rate {
  id?: string;
  country_code: string;
  country_name: string;
  fee: number;
  min_days: number;
  max_days: number;
  is_active: boolean;
  sort_order: number;
}

const empty: Rate = { country_code: "", country_name: "", fee: 0, min_days: 3, max_days: 7, is_active: true, sort_order: 99 };

const AdminShipping = () => {
  const [rates, setRates] = useState<Rate[]>([]);
  const [draft, setDraft] = useState<Rate>(empty);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("shipping_rates").select("*").order("sort_order");
    setRates((data as any) || []);
  };
  useEffect(() => { load(); }, []);

  const save = async (r: Rate) => {
    setLoading(true);
    if (r.id) {
      const { id, ...patch } = r;
      const { error } = await supabase.from("shipping_rates").update(patch as any).eq("id", id);
      if (error) toast.error(error.message); else toast.success("저장됨");
    } else {
      const { error } = await supabase.from("shipping_rates").insert(r as any);
      if (error) toast.error(error.message); else { toast.success("추가됨"); setDraft(empty); }
    }
    setLoading(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("삭제하시겠습니까?")) return;
    await supabase.from("shipping_rates").delete().eq("id", id);
    load();
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-serif font-medium">배송비 관리</h1>
        <p className="text-sm text-muted-foreground mt-1">나라별 배송비와 예상 배송 기간을 관리합니다. 고객 상품 상세 페이지·결제 페이지에 즉시 반영됩니다.</p>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted text-xs uppercase tracking-wider">
            <tr>
              <th className="text-left p-3">국가코드</th>
              <th className="text-left p-3">국가명</th>
              <th className="text-left p-3">배송비(₩)</th>
              <th className="text-left p-3">최소일</th>
              <th className="text-left p-3">최대일</th>
              <th className="text-left p-3">순서</th>
              <th className="text-left p-3">활성</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rates.map((r, idx) => (
              <tr key={r.id} className="border-t border-border">
                <td className="p-2"><Input value={r.country_code} onChange={e => setRates(rs => rs.map((x, i) => i === idx ? { ...x, country_code: e.target.value.toUpperCase() } : x))} className="h-8" /></td>
                <td className="p-2"><Input value={r.country_name} onChange={e => setRates(rs => rs.map((x, i) => i === idx ? { ...x, country_name: e.target.value } : x))} className="h-8" /></td>
                <td className="p-2"><Input type="number" value={r.fee} onChange={e => setRates(rs => rs.map((x, i) => i === idx ? { ...x, fee: Number(e.target.value) } : x))} className="h-8 w-28" /></td>
                <td className="p-2"><Input type="number" value={r.min_days} onChange={e => setRates(rs => rs.map((x, i) => i === idx ? { ...x, min_days: Number(e.target.value) } : x))} className="h-8 w-20" /></td>
                <td className="p-2"><Input type="number" value={r.max_days} onChange={e => setRates(rs => rs.map((x, i) => i === idx ? { ...x, max_days: Number(e.target.value) } : x))} className="h-8 w-20" /></td>
                <td className="p-2"><Input type="number" value={r.sort_order} onChange={e => setRates(rs => rs.map((x, i) => i === idx ? { ...x, sort_order: Number(e.target.value) } : x))} className="h-8 w-20" /></td>
                <td className="p-2"><Switch checked={r.is_active} onCheckedChange={v => setRates(rs => rs.map((x, i) => i === idx ? { ...x, is_active: v } : x))} /></td>
                <td className="p-2 text-right whitespace-nowrap">
                  <Button size="sm" variant="outline" onClick={() => save(r)} disabled={loading}>저장</Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(r.id!)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2"><Plus className="h-4 w-4" /> 새 국가 추가</h3>
        <div className="grid grid-cols-2 md:grid-cols-7 gap-3 items-end">
          <div className="space-y-1"><Label className="text-xs">국가코드</Label><Input value={draft.country_code} onChange={e => setDraft({ ...draft, country_code: e.target.value.toUpperCase() })} placeholder="FR" /></div>
          <div className="space-y-1 col-span-2"><Label className="text-xs">국가명</Label><Input value={draft.country_name} onChange={e => setDraft({ ...draft, country_name: e.target.value })} placeholder="France" /></div>
          <div className="space-y-1"><Label className="text-xs">배송비</Label><Input type="number" value={draft.fee} onChange={e => setDraft({ ...draft, fee: Number(e.target.value) })} /></div>
          <div className="space-y-1"><Label className="text-xs">최소일</Label><Input type="number" value={draft.min_days} onChange={e => setDraft({ ...draft, min_days: Number(e.target.value) })} /></div>
          <div className="space-y-1"><Label className="text-xs">최대일</Label><Input type="number" value={draft.max_days} onChange={e => setDraft({ ...draft, max_days: Number(e.target.value) })} /></div>
          <Button onClick={() => save(draft)} disabled={loading || !draft.country_code || !draft.country_name}>추가</Button>
        </div>
      </div>
    </div>
  );
};

export default AdminShipping;
