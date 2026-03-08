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

  if (!user) return <div className="min-h-screen"><Navigation /><div className="text-center py-32 text-sm text-muted-foreground">{t("co_login_required")}</div><Footer /></div>;
  if (items.length === 0) return <div className="min-h-screen"><Navigation /><div className="text-center py-32 text-sm text-muted-foreground">{t("co_cart_empty")}</div><Footer /></div>;

  return (
    <div className="min-h-screen">
      <Navigation />
      <section className="py-12 md:py-16 px-4">
        <div className="container max-w-4xl">
          <h1 className="text-2xl md:text-3xl font-serif font-light mb-10">{t("co_title")}</h1>
          <form onSubmit={handleOrder} className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
              {/* Shipping */}
              <div className="space-y-5">
                <h2 className="text-sm font-sans font-medium tracking-[0.15em] uppercase border-b border-border pb-3">{t("co_shipping")}</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1"><Label className="text-xs tracking-wider uppercase">{t("co_recipient")}</Label><Input required className="rounded-none" value={address.name} onChange={e => setAddress({...address, name: e.target.value})} /></div>
                  <div className="space-y-1"><Label className="text-xs tracking-wider uppercase">{t("co_phone")}</Label><Input required className="rounded-none" value={address.phone} onChange={e => setAddress({...address, phone: e.target.value})} /></div>
                </div>
                <div className="space-y-1"><Label className="text-xs tracking-wider uppercase">{t("co_address")}</Label><Input required className="rounded-none" value={address.address_line1} onChange={e => setAddress({...address, address_line1: e.target.value})} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1"><Label className="text-xs tracking-wider uppercase">{t("co_detail_address")}</Label><Input className="rounded-none" value={address.address_line2} onChange={e => setAddress({...address, address_line2: e.target.value})} /></div>
                  <div className="space-y-1"><Label className="text-xs tracking-wider uppercase">{t("co_postal")}</Label><Input required className="rounded-none" value={address.postal_code} onChange={e => setAddress({...address, postal_code: e.target.value})} /></div>
                </div>
                <div className="space-y-1"><Label className="text-xs tracking-wider uppercase">{t("co_city")}</Label><Input required className="rounded-none" value={address.city} onChange={e => setAddress({...address, city: e.target.value})} /></div>
              </div>

              {/* Payment */}
              <div className="space-y-5">
                <h2 className="text-sm font-sans font-medium tracking-[0.15em] uppercase border-b border-border pb-3">{t("co_payment")}</h2>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                  {[
                    { value: "card", label: t("co_card") },
                    { value: "bank", label: t("co_bank") },
                    { value: "kakao", label: t("co_kakao") },
                    { value: "naver", label: t("co_naver") },
                  ].map(pm => (
                    <div key={pm.value} className="flex items-center space-x-3 py-2 border-b border-border/50">
                      <RadioGroupItem value={pm.value} id={pm.value} />
                      <Label htmlFor={pm.value} className="text-sm font-light">{pm.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>

            {/* Summary */}
            <div>
              <div className="sticky top-24 border border-border p-6 space-y-5">
                <h2 className="text-sm font-sans font-medium tracking-[0.15em] uppercase">{t("co_summary")}</h2>
                {items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm font-light">
                    <span className="truncate flex-1 pr-2">{item.product.name} ×{item.quantity}</span>
                    <span>{formatPrice(item.product.price * item.quantity)}</span>
                  </div>
                ))}
                <div className="border-t border-border pt-4 space-y-3">
                  <div className="flex gap-2">
                    <Input placeholder={t("co_coupon")} className="rounded-none text-xs" value={couponCode} onChange={e => setCouponCode(e.target.value)} />
                    <Button type="button" variant="outline" className="rounded-none text-xs" onClick={applyCoupon}>{t("co_apply")}</Button>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-primary"><span>{t("co_discount")}</span><span>-{formatPrice(discount)}</span></div>
                  )}
                  <div className="flex justify-between font-medium text-base border-t border-border pt-3">
                    <span>{t("co_total")}</span><span>{formatPrice(total - discount)}</span>
                  </div>
                </div>
                <Button type="submit" className="w-full rounded-none py-6 text-xs tracking-[0.15em] uppercase" disabled={isProcessing}>
                  {isProcessing ? t("co_processing") : t("co_pay")}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Checkout;
