import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Settings {
  id?: string;
  bank_name: string;
  account_number: string;
  account_holder: string;
  business_name: string;
  business_number: string;
  payment_deadline_hours: number;
  instructions: string;
}

const empty: Settings = {
  bank_name: "", account_number: "", account_holder: "",
  business_name: "", business_number: "", payment_deadline_hours: 48, instructions: "",
};

const AdminPayment = () => {
  const [s, setS] = useState<Settings>(empty);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from("payment_settings").select("*").maybeSingle().then(({ data }) => {
      if (data) setS({ ...empty, ...(data as any) });
    });
  }, []);

  const save = async () => {
    setSaving(true);
    const { id, ...patch } = s;
    const { error } = id
      ? await supabase.from("payment_settings").update(patch as any).eq("id", id)
      : await supabase.from("payment_settings").insert(patch as any);
    if (error) toast.error(error.message); else toast.success("저장되었습니다.");
    setSaving(false);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-serif font-medium">결제 / 무통장 입금 설정</h1>
        <p className="text-sm text-muted-foreground mt-1">고객 결제 페이지에 표시될 입금 계좌와 사업자 정보를 관리합니다.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-1"><Label>은행명</Label><Input value={s.bank_name} onChange={e => setS({ ...s, bank_name: e.target.value })} /></div>
        <div className="space-y-1"><Label>계좌번호</Label><Input value={s.account_number} onChange={e => setS({ ...s, account_number: e.target.value })} /></div>
        <div className="space-y-1"><Label>예금주</Label><Input value={s.account_holder} onChange={e => setS({ ...s, account_holder: e.target.value })} /></div>
        <div className="space-y-1"><Label>사업자명</Label><Input value={s.business_name} onChange={e => setS({ ...s, business_name: e.target.value })} /></div>
        <div className="space-y-1"><Label>사업자번호</Label><Input value={s.business_number} onChange={e => setS({ ...s, business_number: e.target.value })} /></div>
        <div className="space-y-1"><Label>입금 기한 (시간) — 기본 48시간</Label><Input type="number" value={s.payment_deadline_hours} onChange={e => setS({ ...s, payment_deadline_hours: Number(e.target.value) })} /></div>
      </div>
      <div className="space-y-1">
        <Label>고객 안내문 (선택)</Label>
        <Textarea rows={4} value={s.instructions} onChange={e => setS({ ...s, instructions: e.target.value })} placeholder="예) 입금 시 주문번호 또는 입금자명을 정확히 입력해주세요." />
      </div>

      <Button onClick={save} disabled={saving}>{saving ? "저장 중..." : "저장"}</Button>

      <div className="text-xs text-muted-foreground border border-border rounded p-3 leading-relaxed">
        ℹ️ 입금 기한이 지난 무통장 주문은 자동으로 <strong>취소 상태</strong>로 전환됩니다(주문은 삭제되지 않음).
      </div>
    </div>
  );
};

export default AdminPayment;
