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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";

const deliveryLabel: Record<string, string> = {
  en: "Delivery Request", ko: "배송 요청사항", es: "Solicitud de Entrega", de: "Lieferanweisung",
};
const deliveryPh: Record<string, string> = {
  en: "e.g. Leave at the door if absent",
  ko: "예: 부재 시 문 앞에 놓아주세요",
  es: "Ej.: Dejar en la puerta si no hay nadie",
  de: "z. B. Bei Abwesenheit vor die Tür legen",
};

const emptyAddress = {
  full_name: "", phone: "", address_line1: "", address_line2: "",
  city: "", state: "", postal_code: "", country: "South Korea",
};

const Checkout = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const isBuyNow = params.get("buyNow") === "1";
  const { user } = useAuth();
  const { items: cartItems, total: cartTotal, clearCart } = useCart();
  const { t, formatPrice, language } = useLanguage();
  const [isProcessing, setIsProcessing] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [address, setAddress] = useState(emptyAddress);
  const [deliveryRequest, setDeliveryRequest] = useState("");

  const buyNowItem = useMemo(() => {
    if (!isBuyNow) return null;
    try {
      const raw = sessionStorage.getItem("buyNow");
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }, [isBuyNow]);

  // Items + total depending on mode
  const items = buyNowItem
    ? [{
        id: "buy-now",
        product_id: buyNowItem.product_id,
        quantity: buyNowItem.quantity || 1,
        product: {
          id: buyNowItem.product_id,
          name: buyNowItem.product_name,
          price: buyNowItem.price,
          image_url: buyNowItem.product_image,
          stock: buyNowItem.stock,
          original_price: null,
        },
      }]
    : cartItems;
  const total = buyNowItem
    ? buyNowItem.price * (buyNowItem.quantity || 1)
    : cartTotal;

  // Load last shipping address for logged-in user
  useEffect(() => {
    if (!user) return;
    supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setAddress({
            full_name: data.full_name || data.name || "",
            phone: data.phone || "",
            address_line1: data.address_line1 || "",
            address_line2: data.address_line2 || "",
            city: data.city || "",
            state: data.state || "",
            postal_code: data.postal_code || "",
            country: data.country || "South Korea",
          });
        }
      });
  }, [user]);

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

  const validate = () => {
    const required: [string, string][] = [
      [address.full_name, "Full Name"],
      [address.address_line1, "Address Line 1"],
      [address.city, "City"],
      [address.state, "State / Province / Region"],
      [address.postal_code, "ZIP / Postal Code"],
      [address.country, "Country"],
      [address.phone, "Phone Number"],
    ];
    for (const [v, label] of required) {
      if (!v?.trim()) { toast.error(`${label} 를 입력해주세요.`); return false; }
    }
    return true;
  };

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || items.length === 0) return;
    if (!validate()) return;
    setIsProcessing(true);
    try {
      const shipping_address = { ...address, delivery_request: deliveryRequest };
      const { data: order, error } = await supabase.from("orders").insert({
        user_id: user.id,
        total: total - discount,
        shipping_address,
        payment_method: paymentMethod,
        coupon_code: couponCode || null,
        discount,
        status: "pending",
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

      // Save address for next time
      await supabase.from("addresses").insert({
        user_id: user.id,
        full_name: address.full_name,
        name: address.full_name,
        phone: address.phone,
        address_line1: address.address_line1,
        address_line2: address.address_line2,
        city: address.city,
        state: address.state,
        postal_code: address.postal_code,
        country: address.country,
      } as any).then(() => {}, () => {});

      if (buyNowItem) {
        sessionStorage.removeItem("buyNow");
      } else {
        await clearCart();
      }
      toast.success(t("co_order_success"));
      navigate("/mypage");
    } catch (err: any) {
      toast.error(err?.message || t("co_order_fail"));
    } finally {
      setIsProcessing(false);
    }
  };

  if (!user) return <div className="min-h-screen"><Navigation /><div className="text-center py-32 text-sm text-muted-foreground">{t("co_login_required")}</div><Footer /></div>;
  if (items.length === 0) return <div className="min-h-screen"><Navigation /><div className="text-center py-32 text-sm text-muted-foreground">{t("co_cart_empty")}</div><Footer /></div>;

  return (
    <div className="min-h-screen">
      <Navigation />
      <section className="py-12 md:py-16 px-4">
        <div className="container max-w-4xl">
          <h1 className="text-2xl md:text-3xl font-serif font-light mb-10">{t("co_title")}{buyNowItem && <span className="ml-3 text-sm font-sans tracking-widest uppercase text-primary">Buy Now</span>}</h1>
          <form onSubmit={handleOrder} className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
              {/* Shipping */}
              <div className="space-y-5">
                <h2 className="text-sm font-sans font-medium tracking-[0.15em] uppercase border-b border-border pb-3">{t("co_shipping")}</h2>
                <div className="space-y-1"><Label className="text-xs tracking-wider uppercase">Full Name *</Label><Input required className="rounded-none" value={address.full_name} onChange={e => setAddress({...address, full_name: e.target.value})} placeholder="As on passport / card" /></div>
                <div className="space-y-1"><Label className="text-xs tracking-wider uppercase">Phone Number *</Label><Input required className="rounded-none" value={address.phone} onChange={e => setAddress({...address, phone: e.target.value})} placeholder="+82 10 1234 5678" /></div>
                <div className="space-y-1"><Label className="text-xs tracking-wider uppercase">Address Line 1 *</Label><Input required className="rounded-none" value={address.address_line1} onChange={e => setAddress({...address, address_line1: e.target.value})} placeholder="Street + Building No." /></div>
                <div className="space-y-1"><Label className="text-xs tracking-wider uppercase">Address Line 2</Label><Input className="rounded-none" value={address.address_line2} onChange={e => setAddress({...address, address_line2: e.target.value})} placeholder="Apt / Suite / Unit" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1"><Label className="text-xs tracking-wider uppercase">City *</Label><Input required className="rounded-none" value={address.city} onChange={e => setAddress({...address, city: e.target.value})} placeholder="Seoul" /></div>
                  <div className="space-y-1"><Label className="text-xs tracking-wider uppercase">State / Province *</Label><Input required className="rounded-none" value={address.state} onChange={e => setAddress({...address, state: e.target.value})} placeholder="Gyeonggi-do" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1"><Label className="text-xs tracking-wider uppercase">ZIP / Postal Code *</Label><Input required inputMode="numeric" pattern="[0-9]*" className="rounded-none" value={address.postal_code} onChange={e => setAddress({...address, postal_code: e.target.value})} placeholder="12345" /></div>
                  <div className="space-y-1"><Label className="text-xs tracking-wider uppercase">Country *</Label><Input required className="rounded-none" value={address.country} onChange={e => setAddress({...address, country: e.target.value})} placeholder="South Korea" /></div>
                </div>

                <div className="space-y-1 pt-2">
                  <Label className="text-xs tracking-wider uppercase">{deliveryLabel[language] || deliveryLabel.en}</Label>
                  <Textarea className="rounded-none" rows={3} value={deliveryRequest} onChange={e => setDeliveryRequest(e.target.value)} placeholder={deliveryPh[language] || deliveryPh.en} />
                </div>
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
                  {!buyNowItem && (
                    <div className="flex gap-2">
                      <Input placeholder={t("co_coupon")} className="rounded-none text-xs" value={couponCode} onChange={e => setCouponCode(e.target.value)} />
                      <Button type="button" variant="outline" className="rounded-none text-xs" onClick={applyCoupon}>{t("co_apply")}</Button>
                    </div>
                  )}
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
