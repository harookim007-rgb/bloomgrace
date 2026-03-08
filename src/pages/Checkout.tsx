import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/hooks/useCart";
import { useLanguage } from "@/contexts/LanguageContext";
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
  const { t, formatPrice } = useLanguage();
  const [isProcessing, setIsProcessing] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [address, setAddress] = useState({ name: "", phone: "", address_line1: "", address_line2: "", city: "", postal_code: "" });

  const applyCoupon = async () => {
    const { data } = await supabase.from("coupons").select("*").eq("code", couponCode).eq("is_active", true).single();
    if (!data) { toast.error(t("co_invalid_coupon")); return; }
    if (data.min_order_amount && total < data.min_order_amount) {
      toast.error(`${t("co_min_order")} ${formatPrice(data.min_order_amount)}`); return;
    }
    const disc = data.discount_type === "percentage" ? total * (data.discount_value / 100) : data.discount_value;
    setDiscount(disc);
    toast.success(`${t("co_coupon_applied")} ${formatPrice(disc)} ${t("co_discount_amount")}`);
  };

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || items.length === 0) return;
    setIsProcessing(true);
    try {
      const { data: order, error } = await supabase.from("orders").insert({
        user_id: user.id, total: total - discount, shipping_address: address,
        payment_method: paymentMethod, coupon_code: couponCode || null, discount, status: "pending"
      }).select().single();
      if (error) throw error;
      const orderItems = items.map(item => ({
        order_id: order.id, product_id: item.product_id, product_name: item.product.name,
        product_image: item.product.image_url, price: item.product.price, quantity: item.quantity,
      }));
      await supabase.from("order_items").insert(orderItems);
      await clearCart();
      toast.success(t("co_order_success"));
      navigate("/mypage");
    } catch { toast.error(t("co_order_fail")); }
    finally { setIsProcessing(false); }
  };

  if (!user) return <div className="min-h-screen"><Navigation /><div className="text-center py-32">{t("co_login_required")}</div><Footer /></div>;
  if (items.length === 0) return <div className="min-h-screen"><Navigation /><div className="text-center py-32">{t("co_cart_empty")}</div><Footer /></div>;

  return (
    <div className="min-h-screen">
      <Navigation />
      <section className="py-8 px-4">
        <div className="container max-w-4xl">
          <h1 className="text-3xl font-bold mb-8">{t("co_title")}</h1>
          <form onSubmit={handleOrder} className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader><CardTitle>{t("co_shipping")}</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>{t("co_recipient")}</Label><Input required value={address.name} onChange={e => setAddress({...address, name: e.target.value})} /></div>
                    <div><Label>{t("co_phone")}</Label><Input required value={address.phone} onChange={e => setAddress({...address, phone: e.target.value})} /></div>
                  </div>
                  <div><Label>{t("co_address")}</Label><Input required value={address.address_line1} onChange={e => setAddress({...address, address_line1: e.target.value})} /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>{t("co_detail_address")}</Label><Input value={address.address_line2} onChange={e => setAddress({...address, address_line2: e.target.value})} /></div>
                    <div><Label>{t("co_postal")}</Label><Input required value={address.postal_code} onChange={e => setAddress({...address, postal_code: e.target.value})} /></div>
                  </div>
                  <div><Label>{t("co_city")}</Label><Input required value={address.city} onChange={e => setAddress({...address, city: e.target.value})} /></div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>{t("co_payment")}</CardTitle></CardHeader>
                <CardContent>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                    <div className="flex items-center space-x-2"><RadioGroupItem value="card" id="card" /><Label htmlFor="card">{t("co_card")}</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="bank" id="bank" /><Label htmlFor="bank">{t("co_bank")}</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="kakao" id="kakao" /><Label htmlFor="kakao">{t("co_kakao")}</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="naver" id="naver" /><Label htmlFor="naver">{t("co_naver")}</Label></div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>
            <div>
              <Card className="sticky top-24">
                <CardHeader><CardTitle>{t("co_summary")}</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="truncate flex-1">{item.product.name} x{item.quantity}</span>
                      <span className="font-medium">{formatPrice(item.product.price * item.quantity)}</span>
                    </div>
                  ))}
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex gap-2">
                      <Input placeholder={t("co_coupon")} value={couponCode} onChange={e => setCouponCode(e.target.value)} />
                      <Button type="button" variant="outline" onClick={applyCoupon}>{t("co_apply")}</Button>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-sm text-destructive"><span>{t("co_discount")}</span><span>-{formatPrice(discount)}</span></div>
                    )}
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>{t("co_total")}</span><span>{formatPrice(total - discount)}</span>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" size="lg" disabled={isProcessing}>
                    {isProcessing ? t("co_processing") : `${formatPrice(total - discount)} ${t("co_pay")}`}
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
