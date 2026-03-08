import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/hooks/useCart";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, total, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [address, setAddress] = useState({
    name: "", phone: "", address_line1: "", address_line2: "", city: "", postal_code: ""
  });

  const applyCoupon = async () => {
    const { data } = await supabase.from("coupons").select("*").eq("code", couponCode).eq("is_active", true).single();
    if (!data) { toast.error("유효하지 않은 쿠폰입니다."); return; }
    if (data.min_order_amount && total < data.min_order_amount) {
      toast.error(`최소 주문금액 ${data.min_order_amount.toLocaleString()}원 이상이어야 합니다.`); return;
    }
    const disc = data.discount_type === "percentage" ? total * (data.discount_value / 100) : data.discount_value;
    setDiscount(disc);
    toast.success(`쿠폰이 적용되었습니다! ${disc.toLocaleString()}원 할인`);
  };

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || items.length === 0) return;
    setIsProcessing(true);
    try {
      const { data: order, error } = await supabase.from("orders").insert({
        user_id: user.id,
        total: total - discount,
        shipping_address: address,
        payment_method: paymentMethod,
        coupon_code: couponCode || null,
        discount,
        status: "pending"
      }).select().single();

      if (error) throw error;

      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product.name,
        product_image: item.product.image_url,
        price: item.product.price,
        quantity: item.quantity,
      }));
      await supabase.from("order_items").insert(orderItems);
      await clearCart();
      toast.success("주문이 완료되었습니다!");
      navigate("/mypage");
    } catch (err: any) {
      toast.error("주문에 실패했습니다.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!user) return <div className="min-h-screen"><Navigation /><div className="text-center py-32">로그인이 필요합니다.</div><Footer /></div>;
  if (items.length === 0) return <div className="min-h-screen"><Navigation /><div className="text-center py-32">장바구니가 비어있습니다.</div><Footer /></div>;

  return (
    <div className="min-h-screen">
      <Navigation />
      <section className="py-8 px-4">
        <div className="container max-w-4xl">
          <h1 className="text-3xl font-bold mb-8">주문하기</h1>
          <form onSubmit={handleOrder} className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader><CardTitle>배송지 정보</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>수령인</Label><Input required value={address.name} onChange={e => setAddress({...address, name: e.target.value})} /></div>
                    <div><Label>연락처</Label><Input required value={address.phone} onChange={e => setAddress({...address, phone: e.target.value})} /></div>
                  </div>
                  <div><Label>주소</Label><Input required value={address.address_line1} onChange={e => setAddress({...address, address_line1: e.target.value})} /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>상세주소</Label><Input value={address.address_line2} onChange={e => setAddress({...address, address_line2: e.target.value})} /></div>
                    <div><Label>우편번호</Label><Input required value={address.postal_code} onChange={e => setAddress({...address, postal_code: e.target.value})} /></div>
                  </div>
                  <div><Label>도시</Label><Input required value={address.city} onChange={e => setAddress({...address, city: e.target.value})} /></div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>결제 수단</CardTitle></CardHeader>
                <CardContent>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                    <div className="flex items-center space-x-2"><RadioGroupItem value="card" id="card" /><Label htmlFor="card">신용카드</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="bank" id="bank" /><Label htmlFor="bank">계좌이체</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="kakao" id="kakao" /><Label htmlFor="kakao">카카오페이</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="naver" id="naver" /><Label htmlFor="naver">네이버페이</Label></div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>
            <div>
              <Card className="sticky top-24">
                <CardHeader><CardTitle>주문 요약</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="truncate flex-1">{item.product.name} x{item.quantity}</span>
                      <span className="font-medium">{(item.product.price * item.quantity).toLocaleString()}원</span>
                    </div>
                  ))}
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex gap-2">
                      <Input placeholder="쿠폰 코드" value={couponCode} onChange={e => setCouponCode(e.target.value)} />
                      <Button type="button" variant="outline" onClick={applyCoupon}>적용</Button>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-sm text-destructive"><span>할인</span><span>-{discount.toLocaleString()}원</span></div>
                    )}
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>합계</span><span>{(total - discount).toLocaleString()}원</span>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" size="lg" disabled={isProcessing}>
                    {isProcessing ? "처리 중..." : `${(total - discount).toLocaleString()}원 결제하기`}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </form>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Checkout;
