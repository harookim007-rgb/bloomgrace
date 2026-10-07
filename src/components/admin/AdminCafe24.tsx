import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { DEFAULT_CAFE24 } from "@/lib/cafe24";
import { ExternalLink, Link2, PackageCheck } from "lucide-react";

interface Cafe24Row {
  id?: string;
  is_enabled: boolean;
  mall_url: string;
  join_url: string;
  login_url: string;
  cart_url: string;
  show_join_prompt: boolean;
}

const empty: Cafe24Row = { ...DEFAULT_CAFE24 };

const AdminCafe24 = () => {
  const [s, setS] = useState<Cafe24Row>(empty);
  const [saving, setSaving] = useState(false);
  const [linked, setLinked] = useState<{ id: string; name: string; cafe24_buy_url: string }[]>([]);

  useEffect(() => {
    supabase.from("cafe24_settings").select("*").maybeSingle().then(({ data }) => {
      if (data) setS({ ...empty, ...(data as object) } as Cafe24Row);
    });
    supabase
      .from("products")
      .select("id, name, cafe24_buy_url")
      .not("cafe24_buy_url", "is", null)
      .order("name")
      .then(({ data }) => setLinked((data || []).filter((r: any) => !!r.cafe24_buy_url)));
  }, []);

  const save = async () => {
    setSaving(true);
    const { id, ...patch } = s;
    const { error } = id
      ? await supabase.from("cafe24_settings").update(patch as any).eq("id", id)
      : await supabase.from("cafe24_settings").insert(patch as any);
    if (error) toast.error(error.message);
    else toast.success("저장되었습니다.");
    setSaving(false);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-serif font-medium">카페24 연동</h1>
        <p className="text-sm text-muted-foreground mt-1">
          상품 보기와 BUY NOW는 이 사이트 디자인을 그대로 쓰고, 주문·결제만 카페24로 넘깁니다.
        </p>
      </div>

      <div className="border border-border rounded p-5 space-y-5">
        <div className="flex items-center gap-3">
          <Switch checked={s.is_enabled} onCheckedChange={(v) => setS({ ...s, is_enabled: v })} />
          <div>
            <Label className="text-sm font-medium">카페24 주문서로 넘기기 사용</Label>
            <p className="text-xs text-muted-foreground">
              끄면 지금처럼 이 사이트에서 주문을 받습니다. (링크를 붙여도 넘어가지 않음)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Switch
            checked={s.show_join_prompt !== false}
            onCheckedChange={(v) => setS({ ...s, show_join_prompt: v })}
          />
          <div>
            <Label className="text-sm font-medium">주문서 앞에서 회원가입 안내</Label>
            <p className="text-xs text-muted-foreground">
              켜면 BUY NOW 후 "회원 가입하고 주문 / 이미 회원 / 가입 없이 계속" 안내를 보여줍니다.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 pt-2 border-t border-border">
          <div className="space-y-1 md:col-span-2">
            <Label>쇼핑몰 주소 (mall_url)</Label>
            <Input
              value={s.mall_url}
              onChange={(e) => setS({ ...s, mall_url: e.target.value })}
              placeholder="https://bloomgrace.cafe24.com"
            />
            <p className="text-[11px] text-muted-foreground">
              가입·로그인 주소를 비워 두면 이 주소로 자동 계산합니다.
            </p>
          </div>
          <div className="space-y-1">
            <Label>회원가입 주소 (join_url)</Label>
            <Input
              value={s.join_url}
              onChange={(e) => setS({ ...s, join_url: e.target.value })}
              placeholder="https://bloomgrace.cafe24.com/member/join.html"
            />
          </div>
          <div className="space-y-1">
            <Label>로그인 주소 (login_url)</Label>
            <Input
              value={s.login_url}
              onChange={(e) => setS({ ...s, login_url: e.target.value })}
              placeholder="https://bloomgrace.cafe24.com/member/login.html"
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label>장바구니 주소 (cart_url) — 나중에 사용</Label>
            <Input
              value={s.cart_url}
              onChange={(e) => setS({ ...s, cart_url: e.target.value })}
              placeholder="https://bloomgrace.cafe24.com/cart"
            />
          </div>
        </div>

        <Button onClick={save} disabled={saving}>
          {saving ? "저장 중..." : "저장"}
        </Button>
      </div>

      <div className="border border-border rounded p-5 space-y-3 text-sm text-muted-foreground leading-relaxed">
        <p className="text-foreground font-medium">카페24 관리자에서 미리 해두실 설정</p>
        <ol className="list-decimal list-inside space-y-1.5">
          <li>
            <strong>원터치 주문서</strong> 적용 + 상품목록 목록표시에 <strong>'바로구매 URL'</strong> 켜기
            → 상품별 주문서 링크가 만들어집니다.
          </li>
          <li>
            쇼핑몰 설정 &gt; 주문 설정 &gt; 주문 정책 설정 &gt; <strong>주문 시 설정 &gt; 구매 제한</strong>을
            <strong> '모두 구매 가능'</strong>으로 → 가입 없이도 주문서 작성 가능.
          </li>
          <li>
            고객관리 &gt; 회원관리 &gt; <strong>회원가입항목 설정</strong>에서 가입 기준을
            <strong> '이메일'</strong>, 인증 수단에 <strong>'이메일 인증'</strong> 추가
            → 해외고객도 휴대폰 본인인증 없이 가입 가능.
          </li>
          <li>해외카드·PayPal 등 <strong>해외결제(PG)</strong>와 <strong>해외배송</strong>은 부가서비스에서 각각 신청.</li>
        </ol>
      </div>

      <div className="border border-border rounded p-5 space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <PackageCheck className="h-4 w-4" /> 링크가 연결된 상품 {linked.length}개
        </div>
        {linked.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            아직 없습니다. 상품 관리 → 상품 편집 → <strong>카페24</strong> 탭에서 바로구매 URL을 붙여넣으세요.
          </p>
        ) : (
          <ul className="space-y-1.5 max-h-64 overflow-y-auto">
            {linked.map((p) => (
              <li key={p.id} className="flex items-center gap-2 text-xs">
                <Link2 className="h-3 w-3 shrink-0 text-primary" />
                <span className="truncate flex-1">{p.name}</span>
                <a
                  href={p.cafe24_buy_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline shrink-0"
                >
                  주문서 <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AdminCafe24;
