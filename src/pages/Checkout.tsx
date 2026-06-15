import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/hooks/useCart";
import { useLanguage } from "@/contexts/LanguageContext";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Copy, Wallet, Clock } from "lucide-react";
import { toast } from "sonner";

const emptyAddress = {
  full_name: "", phone: "", address_line1: "", address_line2: "",
  city: "", state: "", postal_code: "", country: "South Korea", country_code: "KR",
};

const Checkout = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const isBuyNow = params.get("buyNow") === "1";
  const { user } = useAuth();
  const { items: cartItems, total: cartTotal, clearCart } = useCart();
  const { formatPrice, language } = useLanguage();
  const [isProcessing, setIsProcessing] = useState(false);
  const [address, setAddress] = useState(emptyAddress);
  const [deliveryRequest, setDeliveryRequest] = useState("");
  const [depositor, setDepositor] = useState("");
  const [rates, setRates] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [pointsToUse, setPointsToUse] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [completed, setCompleted] = useState<any>(null);

  const buyNowItem = useMemo(() => {
    if (!isBuyNow) return null;
    try { return JSON.parse(sessionStorage.getItem("buyNow") || "null"); } catch { return null; }
  }, [isBuyNow]);

  const items = buyNowItem
    ? [{
        id: "buy-now",
        product_id: buyNowItem.product_id,
        quantity: buyNowItem.quantity || 1,
        product: {
          id: buyNowItem.product_id, name: buyNowItem.product_name,
          price: buyNowItem.price, image_url: buyNowItem.product_image,
          stock: buyNowItem.stock, original_price: null,
        },
      }]
    : cartItems;
  const subtotal = buyNowItem ? buyNowItem.price * (buyNowItem.quantity || 1) : cartTotal;

  // Load rates, payment settings, profile, last address
  useEffect(() => {
    supabase.from("shipping_rates").select("*").eq("is_active", true).order("sort_order")
      .then(({ data }) => setRates(data || []));
    supabase.from("payment_settings").select("*").maybeSingle()
      .then(({ data }) => setSettings(data));
  }, []);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => setProfile(data));
    supabase.from("addresses").select("*").eq("user_id", user.id)
      .order("created_at", { ascending: false }).limit(1).maybeSingle()
      .then(({ data }: any) => {
        if (data) setAddress(a => ({
          ...a,
          full_name: data.full_name || data.name || "",
          phone: data.phone || "",
          address_line1: data.address_line1 || "",
          address_line2: data.address_line2 || "",
          city: data.city || "",
          state: data.state || "",
          postal_code: data.postal_code || "",
          country: data.country || a.country,
          country_code: a.country_code,
        }));
      });
  }, [user]);

  // Match address.country with rates by name
  useEffect(() => {
    if (!rates.length) return;
    const match = rates.find(r => r.country_name.toLowerCase() === (address.country || "").toLowerCase());
    if (match && match.country_code !== address.country_code) {
      setAddress(a => ({ ...a, country_code: match.country_code }));
    } else if (!match && rates[0] && !address.country_code) {
      setAddress(a => ({ ...a, country_code: rates[0].country_code, country: rates[0].country_name }));
    }
  }, [rates, address.country]);

  const currentRate = rates.find(r => r.country_code === address.country_code);
  const shippingFee = Number(currentRate?.fee || 0);
  const maxPoints = Math.min(profile?.points || 0, subtotal);
  const pointsApplied = Math.max(0, Math.min(pointsToUse || 0, maxPoints));
  const total = Math.max(0, subtotal + shippingFee - pointsApplied);
  const deadlineHours = settings?.payment_deadline_hours || 48;

  const validate = () => {
    const req: [string, string][] = [
      [address.full_name, "이름"], [address.phone, "전화번호"],
      [address.address_line1, "주소"], [address.city, "도시"],
      [address.postal_code, "우편번호"], [address.country, "국가"],
      [depositor, "입금자명"],
    ];
    for (const [v, l] of req) if (!v?.trim()) { toast.error(`${l}를 입력해주세요.`); return false; }
    if (!currentRate) { toast.error("배송 가능 국가를 선택해주세요."); return false; }
    return true;
  };

  const placeOrder = async () => {
    if (!user || !items.length) return;
    setIsProcessing(true);
    try {
      const deadline = new Date(Date.now() + deadlineHours * 60 * 60 * 1000).toISOString();
      const shipping_address = {
        ...address, country: currentRate?.country_name || address.country,
        delivery_request: deliveryRequest,
      };
      const { data: order, error } = await supabase.from("orders").insert({
        user_id: user.id,
        total, subtotal, shipping_fee: shippingFee,
        shipping_country: currentRate?.country_code,
        shipping_address, payment_method: "bank_transfer",
        depositor_name: depositor, payment_deadline: deadline,
        points_used: pointsApplied, status: "pending",
      } as any).select().single();
      if (error) throw error;

      const orderItems = items.map(it => ({
        order_id: order.id, product_id: it.product_id,
        product_name: it.product.name, product_image: it.product.image_url,
        price: it.product.price, quantity: it.quantity,
      }));
      await supabase.from("order_items").insert(orderItems);

      // deduct points
      if (pointsApplied > 0) {
        await supabase.from("profiles").update({ points: (profile?.points || 0) - pointsApplied } as any).eq("user_id", user.id);
        await supabase.from("point_transactions").insert({
          user_id: user.id, amount: -pointsApplied, reason: "order_payment", order_id: order.id,
        } as any);
      }

      // save address
      await supabase.from("addresses").insert({
        user_id: user.id, full_name: address.full_name, name: address.full_name,
        phone: address.phone, address_line1: address.address_line1, address_line2: address.address_line2,
        city: address.city, state: address.state, postal_code: address.postal_code,
        country: currentRate?.country_name || address.country,
      } as any).then(() => {}, () => {});

      if (buyNowItem) sessionStorage.removeItem("buyNow"); else await clearCart();

      setCompleted({ order, deadline });
      toast.success("주문이 접수되었습니다. 입금을 기다리고 있습니다.");
    } catch (err: any) {
      toast.error(err?.message || "주문 실패");
    } finally {
      setIsProcessing(false);
      setConfirmOpen(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setConfirmOpen(true);
  };

  if (!user) return <div className="min-h-screen"><Navigation /><div className="text-center py-32 text-sm text-muted-foreground">로그인이 필요합니다.</div><Footer /></div>;
  if (items.length === 0 && !completed) return <div className="min-h-screen"><Navigation /><div className="text-center py-32 text-sm text-muted-foreground">장바구니가 비어있습니다.</div><Footer /></div>;

  // Completed view: show bank account info
  if (completed) {
    const ord = completed.order;
    return (
      <div className="min-h-screen">
        <Navigation />
        <section className="py-12 md:py-20 px-4">
          <div className="container max-w-2xl">
            <h1 className="text-2xl md:text-3xl font-serif font-light mb-2">주문이 접수되었습니다</h1>
            <p className="text-sm text-muted-foreground mb-8">아래 계좌로 <strong>{deadlineHours}시간 이내</strong> 입금해주세요. 기한이 지나면 주문은 자동으로 취소됩니다.</p>

            <div className="border-2 border-foreground p-6 space-y-5 bg-card">
              <div className="flex items-center gap-2 text-xs tracking-[0.18em] uppercase font-sans font-bold"><Wallet className="h-4 w-4" /> 무통장 입금 정보</div>
              <div className="space-y-3 text-sm">
                <Row label="은행" value={settings?.bank_name} />
                <Row label="계좌번호" value={settings?.account_number} copyable />
                <Row label="예금주" value={settings?.account_holder} />
                <Row label="사업자명" value={settings?.business_name} />
                <Row label="입금자명" value={depositor} />
                <Row label="주문번호" value={ord.id.slice(0, 8).toUpperCase()} />
              </div>
              <div className="border-t border-border pt-4 space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">상품 합계</span><span>{formatPrice(Number(ord.subtotal))}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">배송비</span><span>{formatPrice(Number(ord.shipping_fee))}</span></div>
                {Number(ord.points_used) > 0 && <div className="flex justify-between text-primary"><span>포인트 사용</span><span>-{formatPrice(Number(ord.points_used))}</span></div>}
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-border"><span>입금하실 금액</span><span>{formatPrice(Number(ord.total))}</span></div>
              </div>
              <div className="flex items-start gap-2 text-xs text-muted-foreground border-t border-border pt-3">
                <Clock className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span>입금 기한: {new Date(completed.deadline).toLocaleString("ko-KR")}</span>
              </div>
              {settings?.instructions && <p className="text-xs text-muted-foreground border-t border-border pt-3 whitespace-pre-line">{settings.instructions}</p>}
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="flex-1 rounded-none" onClick={() => navigate("/mypage")}>주문 내역으로</Button>
              <Button className="flex-1 rounded-none" onClick={() => navigate("/products")}>쇼핑 계속하기</Button>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <section className="py-12 md:py-16 px-4">
        <div className="container max-w-4xl">
          <h1 className="text-2xl md:text-3xl font-serif font-light mb-2">결제 / 주문</h1>
          <p className="text-sm text-muted-foreground mb-8">결제 방법: <strong>무통장 입금</strong> · 주문 후 {deadlineHours}시간 내 미입금 시 자동 취소됩니다.</p>

          <form onSubmit={onSubmit} className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
              <div className="space-y-5">
                <h2 className="text-sm font-sans font-medium tracking-[0.15em] uppercase border-b border-border pb-3">배송지 정보</h2>
                <div className="space-y-1"><Label className="text-xs tracking-wider uppercase">받는 분 *</Label><Input required className="rounded-none" value={address.full_name} onChange={e => setAddress({ ...address, full_name: e.target.value })} /></div>
                <div className="space-y-1"><Label className="text-xs tracking-wider uppercase">전화번호 *</Label><Input required className="rounded-none" value={address.phone} onChange={e => setAddress({ ...address, phone: e.target.value })} placeholder="+82 10 1234 5678" /></div>
                <div className="space-y-1">
                  <Label className="text-xs tracking-wider uppercase">국가 *</Label>
                  <Select value={address.country_code} onValueChange={v => {
                    const r = rates.find(r => r.country_code === v);
                    setAddress({ ...address, country_code: v, country: r?.country_name || address.country });
                  }}>
                    <SelectTrigger className="rounded-none h-10"><SelectValue placeholder="국가 선택" /></SelectTrigger>
                    <SelectContent>{rates.map(r => <SelectItem key={r.country_code} value={r.country_code}>{r.country_name} · {formatPrice(Number(r.fee))} · {r.min_days}-{r.max_days}일</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1"><Label className="text-xs tracking-wider uppercase">주소 *</Label><Input required className="rounded-none" value={address.address_line1} onChange={e => setAddress({ ...address, address_line1: e.target.value })} placeholder="도로명 + 건물번호" /></div>
                <div className="space-y-1"><Label className="text-xs tracking-wider uppercase">상세주소</Label><Input className="rounded-none" value={address.address_line2} onChange={e => setAddress({ ...address, address_line2: e.target.value })} placeholder="동/호수" /></div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1"><Label className="text-xs uppercase">도시 *</Label><Input required className="rounded-none" value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })} /></div>
                  <div className="space-y-1"><Label className="text-xs uppercase">시/도</Label><Input className="rounded-none" value={address.state} onChange={e => setAddress({ ...address, state: e.target.value })} /></div>
                  <div className="space-y-1"><Label className="text-xs uppercase">우편번호 *</Label><Input required className="rounded-none" value={address.postal_code} onChange={e => setAddress({ ...address, postal_code: e.target.value })} /></div>
                </div>
                <div className="space-y-1 pt-2">
                  <Label className="text-xs tracking-wider uppercase">배송 요청사항</Label>
                  <Textarea className="rounded-none" rows={3} value={deliveryRequest} onChange={e => setDeliveryRequest(e.target.value)} placeholder="예: 부재 시 문 앞에 놓아주세요" />
                </div>
              </div>

              <div className="space-y-5">
                <h2 className="text-sm font-sans font-medium tracking-[0.15em] uppercase border-b border-border pb-3">무통장 입금</h2>
                <div className="space-y-1"><Label className="text-xs tracking-wider uppercase">입금자명 *</Label><Input required className="rounded-none" value={depositor} onChange={e => setDepositor(e.target.value)} placeholder="실제 입금하실 분의 성함" /></div>
                {settings && (
                  <div className="text-xs text-muted-foreground bg-muted/50 p-3 border border-border space-y-0.5">
                    <div>입금 계좌: <strong>{settings.bank_name} {settings.account_number}</strong></div>
                    <div>예금주: <strong>{settings.account_holder}</strong></div>
                  </div>
                )}
                {(profile?.points || 0) > 0 && (
                  <div className="space-y-1 pt-2 border-t border-border">
                    <Label className="text-xs tracking-wider uppercase">포인트 사용 (보유: {(profile?.points || 0).toLocaleString()}P)</Label>
                    <div className="flex gap-2">
                      <Input type="number" min={0} max={maxPoints} className="rounded-none" value={pointsToUse} onChange={e => setPointsToUse(Number(e.target.value) || 0)} />
                      <Button type="button" variant="outline" className="rounded-none" onClick={() => setPointsToUse(maxPoints)}>전액 사용</Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="sticky top-24 border border-border p-6 space-y-4">
                <h2 className="text-sm font-sans font-medium tracking-[0.15em] uppercase">주문 요약</h2>
                {items.map(it => (
                  <div key={it.id} className="flex justify-between text-sm font-light">
                    <span className="truncate flex-1 pr-2">{it.product.name} ×{it.quantity}</span>
                    <span>{formatPrice(it.product.price * it.quantity)}</span>
                  </div>
                ))}
                <div className="border-t border-border pt-3 space-y-1.5 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">상품 합계</span><span>{formatPrice(subtotal)}</span></div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">배송비 {currentRate && `(${currentRate.country_name})`}</span>
                    <span>{formatPrice(shippingFee)}</span>
                  </div>
                  {currentRate && <div className="text-[11px] text-muted-foreground text-right">예상 {currentRate.min_days}-{currentRate.max_days}일</div>}
                  {pointsApplied > 0 && <div className="flex justify-between text-primary"><span>포인트</span><span>-{formatPrice(pointsApplied)}</span></div>}
                  <div className="flex justify-between font-bold text-base pt-2 border-t border-border"><span>최종 결제금액</span><span>{formatPrice(total)}</span></div>
                </div>
                <Button type="submit" className="w-full rounded-none py-6 text-xs tracking-[0.15em] uppercase" disabled={isProcessing}>
                  {isProcessing ? "처리 중..." : "주문 / 입금정보 받기"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </section>
      <Footer />

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>배송 주소를 확인해주세요</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="text-sm text-foreground/80 space-y-1 pt-2">
                <div><strong>{address.full_name}</strong> · {address.phone}</div>
                <div>{address.address_line1} {address.address_line2}</div>
                <div>{address.city} {address.state} {address.postal_code}</div>
                <div>{currentRate?.country_name || address.country}</div>
                <div className="pt-3 border-t border-border mt-3">
                  결제금액: <strong>{formatPrice(total)}</strong> (배송비 {formatPrice(shippingFee)} 포함)
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>수정</AlertDialogCancel>
            <AlertDialogAction onClick={placeOrder} disabled={isProcessing}>{isProcessing ? "처리 중..." : "확인 · 주문하기"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

const Row = ({ label, value, copyable }: { label: string; value?: string; copyable?: boolean }) => (
  <div className="flex justify-between items-center">
    <span className="text-muted-foreground">{label}</span>
    <div className="flex items-center gap-2">
      <span className="font-medium">{value || "-"}</span>
      {copyable && value && (
        <button type="button" onClick={() => { navigator.clipboard.writeText(value); toast.success("복사되었습니다"); }}
          className="text-muted-foreground hover:text-foreground"><Copy className="h-3.5 w-3.5" /></button>
      )}
    </div>
  </div>
);

export default Checkout;
