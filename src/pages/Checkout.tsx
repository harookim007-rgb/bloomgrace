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
import { getLocalizedProductName } from "@/lib/productI18n";

const emptyAddress = {
  full_name: "", phone: "", address_line1: "", address_line2: "",
  city: "", state: "", postal_code: "", country: "South Korea", country_code: "KR",
};

type LangKey = "en" | "es" | "de" | "fr" | "pt" | "ja" | "ar";

const CO: Record<LangKey, Record<string, string>> = {
  en: {
    title: "Checkout", subtitle_a: "Payment:", subtitle_b: "Bank Transfer · Order auto-cancels if unpaid within",
    hours: "hours", shipping_info: "Shipping Information", recipient: "Recipient", phone: "Phone",
    country: "Country", country_ph: "Select country", address: "Address", address_ph: "Street + building",
    detail: "Detail Address", detail_ph: "Apt / Suite", city: "City", state: "State / Province",
    postal: "Postal Code", req: "Delivery Request", req_ph: "e.g. Leave at the door",
    bank_section: "Bank Transfer", depositor: "Depositor Name", depositor_ph: "Name of the person paying",
    deposit_to: "Deposit to:", holder: "Account holder:", points_label: "Use Points (Available:",
    use_all: "Use all", summary: "Order Summary", subtotal: "Subtotal", shipping_fee: "Shipping",
    est: "Est.", days: "days", points: "Points", total: "Total", processing: "Processing...",
    submit: "Place Order / Get Payment Info", confirm_title: "Please confirm your shipping address",
    edit: "Edit", confirm: "Confirm · Place Order", login_req: "Please sign in.",
    cart_empty: "Your cart is empty.", err_country: "Please select a shipping country.",
    err_required: "is required.", placed_title: "Order received",
    placed_sub_a: "Please complete payment within", placed_sub_b: "or your order will be cancelled automatically.",
    bank_info: "Bank Transfer Details", bank: "Bank", account: "Account No.", holder_l: "Account Holder",
    business: "Business Name", order_no: "Order No.", subtotal_l: "Subtotal", shipping_l: "Shipping",
    points_used: "Points Used", amount_due: "Amount to Deposit", deadline: "Deadline:",
    to_orders: "View My Orders", continue: "Continue Shopping", copied: "Copied",
    success: "Order placed. Awaiting your deposit.", fail: "Failed to place order.",
  },
  es: {
    title: "Pago", subtitle_a: "Método:", subtitle_b: "Transferencia · La orden se cancela si no se paga en",
    hours: "horas", shipping_info: "Dirección de envío", recipient: "Destinatario", phone: "Teléfono",
    country: "País", country_ph: "Selecciona país", address: "Dirección", address_ph: "Calle + número",
    detail: "Detalle", detail_ph: "Piso / Apto", city: "Ciudad", state: "Estado / Provincia",
    postal: "Código Postal", req: "Solicitud de Entrega", req_ph: "Ej. Dejar en la puerta",
    bank_section: "Transferencia Bancaria", depositor: "Nombre del Depositante",
    depositor_ph: "Quien realiza el pago", deposit_to: "Depositar a:", holder: "Titular:",
    points_label: "Usar Puntos (Disponibles:", use_all: "Usar todo", summary: "Resumen",
    subtotal: "Subtotal", shipping_fee: "Envío", est: "Aprox.", days: "días", points: "Puntos",
    total: "Total", processing: "Procesando...", submit: "Realizar Pedido / Datos de Pago",
    confirm_title: "Confirma tu dirección de envío", edit: "Editar", confirm: "Confirmar · Pedir",
    login_req: "Inicia sesión.", cart_empty: "El carrito está vacío.",
    err_country: "Selecciona un país.", err_required: "es obligatorio.",
    placed_title: "Pedido recibido", placed_sub_a: "Completa el pago en", placed_sub_b: "o se cancelará automáticamente.",
    bank_info: "Datos de Transferencia", bank: "Banco", account: "N.º de cuenta", holder_l: "Titular",
    business: "Empresa", order_no: "N.º de pedido", subtotal_l: "Subtotal", shipping_l: "Envío",
    points_used: "Puntos usados", amount_due: "Importe a transferir", deadline: "Plazo:",
    to_orders: "Ver mis pedidos", continue: "Seguir comprando", copied: "Copiado",
    success: "Pedido realizado. Esperando el depósito.", fail: "Error al realizar el pedido.",
  },
  de: {
    title: "Kasse", subtitle_a: "Zahlung:", subtitle_b: "Banküberweisung · Bestellung wird automatisch storniert, wenn nicht bezahlt innerhalb von",
    hours: "Stunden", shipping_info: "Lieferadresse", recipient: "Empfänger", phone: "Telefon",
    country: "Land", country_ph: "Land wählen", address: "Adresse", address_ph: "Straße + Hausnummer",
    detail: "Zusatz", detail_ph: "Wohnung / Etage", city: "Stadt", state: "Bundesland",
    postal: "PLZ", req: "Lieferhinweis", req_ph: "z. B. Vor die Tür stellen",
    bank_section: "Banküberweisung", depositor: "Einzahlername", depositor_ph: "Name der zahlenden Person",
    deposit_to: "Einzahlung an:", holder: "Kontoinhaber:", points_label: "Punkte verwenden (Verfügbar:",
    use_all: "Alle nutzen", summary: "Zusammenfassung", subtotal: "Zwischensumme", shipping_fee: "Versand",
    est: "ca.", days: "Tage", points: "Punkte", total: "Gesamt", processing: "Verarbeitung...",
    submit: "Bestellen / Zahlungsdaten erhalten", confirm_title: "Bitte Lieferadresse bestätigen",
    edit: "Ändern", confirm: "Bestätigen · Bestellen", login_req: "Bitte anmelden.",
    cart_empty: "Ihr Warenkorb ist leer.", err_country: "Bitte Versandland auswählen.",
    err_required: "ist erforderlich.", placed_title: "Bestellung eingegangen",
    placed_sub_a: "Bitte zahlen Sie innerhalb von", placed_sub_b: "sonst wird die Bestellung storniert.",
    bank_info: "Überweisungsdaten", bank: "Bank", account: "Kontonummer", holder_l: "Kontoinhaber",
    business: "Firma", order_no: "Bestell-Nr.", subtotal_l: "Zwischensumme", shipping_l: "Versand",
    points_used: "Verwendete Punkte", amount_due: "Zu überweisender Betrag", deadline: "Frist:",
    to_orders: "Meine Bestellungen", continue: "Weiter einkaufen", copied: "Kopiert",
    success: "Bestellung aufgegeben. Wir warten auf Ihre Zahlung.", fail: "Bestellung fehlgeschlagen.",
  },
  fr: {
    title: "Paiement", subtitle_a: "Mode :", subtitle_b: "Virement · Commande annulée automatiquement si non payée sous",
    hours: "heures", shipping_info: "Adresse de livraison", recipient: "Destinataire", phone: "Téléphone",
    country: "Pays", country_ph: "Choisir un pays", address: "Adresse", address_ph: "Rue + numéro",
    detail: "Complément", detail_ph: "Appt / Étage", city: "Ville", state: "Région",
    postal: "Code postal", req: "Instructions de livraison", req_ph: "Ex. Laisser devant la porte",
    bank_section: "Virement bancaire", depositor: "Nom du déposant", depositor_ph: "Personne qui paie",
    deposit_to: "Verser à :", holder: "Titulaire :", points_label: "Utiliser des points (Disponibles :",
    use_all: "Tout utiliser", summary: "Récapitulatif", subtotal: "Sous-total", shipping_fee: "Livraison",
    est: "Env.", days: "jours", points: "Points", total: "Total", processing: "Traitement...",
    submit: "Commander / Obtenir les coordonnées", confirm_title: "Veuillez confirmer votre adresse",
    edit: "Modifier", confirm: "Confirmer · Commander", login_req: "Veuillez vous connecter.",
    cart_empty: "Votre panier est vide.", err_country: "Sélectionnez un pays.",
    err_required: "est requis.", placed_title: "Commande reçue",
    placed_sub_a: "Veuillez payer sous", placed_sub_b: "sinon la commande sera annulée.",
    bank_info: "Coordonnées bancaires", bank: "Banque", account: "N° de compte", holder_l: "Titulaire",
    business: "Société", order_no: "N° de commande", subtotal_l: "Sous-total", shipping_l: "Livraison",
    points_used: "Points utilisés", amount_due: "Montant à verser", deadline: "Échéance :",
    to_orders: "Mes commandes", continue: "Continuer mes achats", copied: "Copié",
    success: "Commande passée. En attente du paiement.", fail: "Échec de la commande.",
  },
  pt: {
    title: "Pagamento", subtitle_a: "Método:", subtitle_b: "Transferência · Pedido cancelado automaticamente se não pago em",
    hours: "horas", shipping_info: "Endereço de Entrega", recipient: "Destinatário", phone: "Telefone",
    country: "País", country_ph: "Selecionar país", address: "Endereço", address_ph: "Rua + número",
    detail: "Complemento", detail_ph: "Apt / Andar", city: "Cidade", state: "Estado",
    postal: "CEP", req: "Instruções de Entrega", req_ph: "Ex. Deixar na porta",
    bank_section: "Transferência Bancária", depositor: "Nome do Depositante",
    depositor_ph: "Pessoa que efetua o pagamento", deposit_to: "Depositar para:", holder: "Titular:",
    points_label: "Usar Pontos (Disponíveis:", use_all: "Usar tudo", summary: "Resumo",
    subtotal: "Subtotal", shipping_fee: "Frete", est: "Aprox.", days: "dias", points: "Pontos",
    total: "Total", processing: "Processando...", submit: "Fazer Pedido / Dados de Pagamento",
    confirm_title: "Confirme seu endereço de entrega", edit: "Editar", confirm: "Confirmar · Pedir",
    login_req: "Faça login.", cart_empty: "Carrinho vazio.",
    err_country: "Selecione um país.", err_required: "é obrigatório.",
    placed_title: "Pedido recebido", placed_sub_a: "Conclua o pagamento em",
    placed_sub_b: "ou o pedido será cancelado.",
    bank_info: "Dados Bancários", bank: "Banco", account: "Conta", holder_l: "Titular",
    business: "Empresa", order_no: "N.º do pedido", subtotal_l: "Subtotal", shipping_l: "Frete",
    points_used: "Pontos usados", amount_due: "Valor a depositar", deadline: "Prazo:",
    to_orders: "Meus pedidos", continue: "Continuar comprando", copied: "Copiado",
    success: "Pedido realizado. Aguardando depósito.", fail: "Falha no pedido.",
  },
  ja: {
    title: "ご注文", subtitle_a: "お支払い:", subtitle_b: "銀行振込 · ご入金がない場合、ご注文は自動的にキャンセルされます (期限",
    hours: "時間)", shipping_info: "お届け先情報", recipient: "お受け取り人", phone: "電話番号",
    country: "国", country_ph: "国を選択", address: "住所", address_ph: "番地・建物名",
    detail: "詳細住所", detail_ph: "部屋番号など", city: "市区町村", state: "都道府県",
    postal: "郵便番号", req: "配送のご要望", req_ph: "例: ドア前に置いてください",
    bank_section: "銀行振込", depositor: "お振込人名義", depositor_ph: "実際にお振込される方のお名前",
    deposit_to: "振込先:", holder: "口座名義:", points_label: "ポイントを使う (保有:",
    use_all: "全額使用", summary: "ご注文内容", subtotal: "商品合計", shipping_fee: "送料",
    est: "目安", days: "日", points: "ポイント", total: "合計", processing: "処理中...",
    submit: "注文する / 振込情報を受け取る", confirm_title: "お届け先住所をご確認ください",
    edit: "修正", confirm: "確認・注文する", login_req: "ログインしてください。",
    cart_empty: "カートは空です。", err_country: "配送先の国を選択してください。",
    err_required: "を入力してください。", placed_title: "ご注文を受け付けました",
    placed_sub_a: "以下の口座に", placed_sub_b: "以内にお振込ください。期限を過ぎると自動キャンセルされます。",
    bank_info: "銀行振込情報", bank: "銀行", account: "口座番号", holder_l: "口座名義",
    business: "事業者名", order_no: "注文番号", subtotal_l: "商品合計", shipping_l: "送料",
    points_used: "使用ポイント", amount_due: "お振込金額", deadline: "お振込期限:",
    to_orders: "注文履歴へ", continue: "ショッピングを続ける", copied: "コピーしました",
    success: "ご注文を受け付けました。ご入金をお待ちしています。", fail: "注文に失敗しました。",
  },
  ar: {
    title: "الدفع", subtitle_a: "طريقة الدفع:", subtitle_b: "تحويل بنكي · يُلغى الطلب تلقائياً إذا لم يتم الدفع خلال",
    hours: "ساعة", shipping_info: "عنوان الشحن", recipient: "المستلم", phone: "الهاتف",
    country: "الدولة", country_ph: "اختر الدولة", address: "العنوان", address_ph: "الشارع + رقم المبنى",
    detail: "تفاصيل العنوان", detail_ph: "شقة / طابق", city: "المدينة", state: "المنطقة",
    postal: "الرمز البريدي", req: "تعليمات التوصيل", req_ph: "مثال: اترك أمام الباب",
    bank_section: "تحويل بنكي", depositor: "اسم المودع", depositor_ph: "اسم الشخص الذي يقوم بالدفع",
    deposit_to: "الإيداع إلى:", holder: "صاحب الحساب:", points_label: "استخدام النقاط (المتاح:",
    use_all: "استخدام الكل", summary: "ملخص الطلب", subtotal: "المجموع الفرعي", shipping_fee: "الشحن",
    est: "تقريباً", days: "يوم", points: "النقاط", total: "الإجمالي", processing: "جارٍ المعالجة...",
    submit: "تأكيد الطلب / الحصول على بيانات الدفع", confirm_title: "يرجى تأكيد عنوان الشحن",
    edit: "تعديل", confirm: "تأكيد · إرسال الطلب", login_req: "يرجى تسجيل الدخول.",
    cart_empty: "سلتك فارغة.", err_country: "اختر دولة الشحن.",
    err_required: "مطلوب.", placed_title: "تم استلام الطلب",
    placed_sub_a: "يرجى إتمام الدفع خلال", placed_sub_b: "وإلا سيتم إلغاء الطلب تلقائياً.",
    bank_info: "تفاصيل التحويل البنكي", bank: "البنك", account: "رقم الحساب", holder_l: "صاحب الحساب",
    business: "اسم النشاط التجاري", order_no: "رقم الطلب", subtotal_l: "المجموع الفرعي", shipping_l: "الشحن",
    points_used: "النقاط المستخدمة", amount_due: "المبلغ المطلوب إيداعه", deadline: "الموعد النهائي:",
    to_orders: "طلباتي", continue: "متابعة التسوق", copied: "تم النسخ",
    success: "تم استلام الطلب. في انتظار الدفع.", fail: "فشل في إنشاء الطلب.",
  },
};

const Checkout = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const isBuyNow = params.get("buyNow") === "1";
  const { user } = useAuth();
  const { items: cartItems, total: cartTotal, clearCart } = useCart();
  const { formatPrice, language } = useLanguage();
  const t = CO[(language as LangKey)] || CO.en;
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
          brand: buyNowItem.product_brand || null,
          translations: buyNowItem.product_translations || null,
        },
      }]
    : cartItems;
  const subtotal = buyNowItem ? buyNowItem.price * (buyNowItem.quantity || 1) : cartTotal;

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
      [address.full_name, t.recipient], [address.phone, t.phone],
      [address.address_line1, t.address], [address.city, t.city],
      [address.postal_code, t.postal], [address.country, t.country],
      [depositor, t.depositor],
    ];
    for (const [v, l] of req) if (!v?.trim()) { toast.error(`${l} ${t.err_required}`); return false; }
    if (!currentRate) { toast.error(t.err_country); return false; }
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
        product_name: getLocalizedProductName(it.product, language as LangKey), product_image: it.product.image_url,
        price: it.product.price, quantity: it.quantity,
      }));
      await supabase.from("order_items").insert(orderItems);

      if (pointsApplied > 0) {
        await supabase.from("profiles").update({ points: (profile?.points || 0) - pointsApplied } as any).eq("user_id", user.id);
        await supabase.from("point_transactions").insert({
          user_id: user.id, amount: -pointsApplied, reason: "order_payment", order_id: order.id,
        } as any);
      }

      await supabase.from("addresses").insert({
        user_id: user.id, full_name: address.full_name, name: address.full_name,
        phone: address.phone, address_line1: address.address_line1, address_line2: address.address_line2,
        city: address.city, state: address.state, postal_code: address.postal_code,
        country: currentRate?.country_name || address.country,
      } as any).then(() => {}, () => {});

      if (buyNowItem) sessionStorage.removeItem("buyNow"); else await clearCart();

      setCompleted({ order, deadline });
      toast.success(t.success);
    } catch (err: any) {
      toast.error(err?.message || t.fail);
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

  if (!user) return <div className="min-h-dvh"><Navigation /><div className="text-center py-32 text-sm text-muted-foreground">{t.login_req}</div><Footer /></div>;
  if (items.length === 0 && !completed) return <div className="min-h-dvh"><Navigation /><div className="text-center py-32 text-sm text-muted-foreground">{t.cart_empty}</div><Footer /></div>;

  if (completed) {
    const ord = completed.order;
    return (
      <div className="min-h-dvh">
        <Navigation />
        <section className="py-12 md:py-20 px-4">
          <div className="container max-w-2xl">
            <h1 className="text-2xl md:text-3xl font-serif font-light mb-2">{t.placed_title}</h1>
            <p className="text-sm text-muted-foreground mb-8">{t.placed_sub_a} <strong>{deadlineHours}{language === "ja" ? "時間" : language === "ar" ? " ساعة" : " " + t.hours}</strong> {t.placed_sub_b}</p>

            <div className="border-2 border-foreground p-6 space-y-5 bg-card">
              <div className="flex items-center gap-2 text-xs tracking-[0.18em] uppercase font-sans font-bold"><Wallet className="h-4 w-4" /> {t.bank_info}</div>
              <div className="space-y-3 text-sm">
                <Row label={t.bank} value={settings?.bank_name} />
                <Row label={t.account} value={settings?.account_number} copyable copiedMsg={t.copied} />
                <Row label={t.holder_l} value={settings?.account_holder} />
                <Row label={t.business} value={settings?.business_name} />
                <Row label={t.depositor} value={depositor} />
                <Row label={t.order_no} value={ord.id.slice(0, 8).toUpperCase()} />
              </div>
              <div className="border-t border-border pt-4 space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">{t.subtotal_l}</span><span>{formatPrice(Number(ord.subtotal))}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{t.shipping_l}</span><span>{formatPrice(Number(ord.shipping_fee))}</span></div>
                {Number(ord.points_used) > 0 && <div className="flex justify-between text-primary"><span>{t.points_used}</span><span>-{formatPrice(Number(ord.points_used))}</span></div>}
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-border"><span>{t.amount_due}</span><span>{formatPrice(Number(ord.total))}</span></div>
              </div>
              <div className="flex items-start gap-2 text-xs text-muted-foreground border-t border-border pt-3">
                <Clock className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span>{t.deadline} {new Date(completed.deadline).toLocaleString(language)}</span>
              </div>
              {settings?.instructions && <p className="text-xs text-muted-foreground border-t border-border pt-3 whitespace-pre-line">{settings.instructions}</p>}
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="flex-1 rounded-none" onClick={() => navigate("/mypage")}>{t.to_orders}</Button>
              <Button className="flex-1 rounded-none" onClick={() => navigate("/products")}>{t.continue}</Button>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-dvh">
      <Navigation />
      <section className="py-12 md:py-16 px-4">
        <div className="container max-w-4xl">
          <h1 className="text-2xl md:text-3xl font-serif font-light mb-2">{t.title}</h1>
          <p className="text-sm text-muted-foreground mb-8">{t.subtitle_a} <strong>{t.bank_section}</strong> · {t.subtitle_b} {deadlineHours} {t.hours}.</p>

          <form onSubmit={onSubmit} className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
              <div className="space-y-5">
                <h2 className="text-sm font-sans font-medium tracking-[0.15em] uppercase border-b border-border pb-3">{t.shipping_info}</h2>
                <div className="space-y-1"><Label className="text-xs tracking-wider uppercase">{t.recipient} *</Label><Input required className="rounded-none" value={address.full_name} onChange={e => setAddress({ ...address, full_name: e.target.value })} /></div>
                <div className="space-y-1"><Label className="text-xs tracking-wider uppercase">{t.phone} *</Label><Input required className="rounded-none" value={address.phone} onChange={e => setAddress({ ...address, phone: e.target.value })} placeholder="+82 10 1234 5678" /></div>
                <div className="space-y-1">
                  <Label className="text-xs tracking-wider uppercase">{t.country} *</Label>
                  <Select value={address.country_code} onValueChange={v => {
                    const r = rates.find(r => r.country_code === v);
                    setAddress({ ...address, country_code: v, country: r?.country_name || address.country });
                  }}>
                    <SelectTrigger className="rounded-none h-10"><SelectValue placeholder={t.country_ph} /></SelectTrigger>
                    <SelectContent>{rates.map(r => <SelectItem key={r.country_code} value={r.country_code}>{r.country_name} · {formatPrice(Number(r.fee))} · {r.min_days}-{r.max_days} {t.days}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1"><Label className="text-xs tracking-wider uppercase">{t.address} *</Label><Input required className="rounded-none" value={address.address_line1} onChange={e => setAddress({ ...address, address_line1: e.target.value })} placeholder={t.address_ph} /></div>
                <div className="space-y-1"><Label className="text-xs tracking-wider uppercase">{t.detail}</Label><Input className="rounded-none" value={address.address_line2} onChange={e => setAddress({ ...address, address_line2: e.target.value })} placeholder={t.detail_ph} /></div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1"><Label className="text-xs uppercase">{t.city} *</Label><Input required className="rounded-none" value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })} /></div>
                  <div className="space-y-1"><Label className="text-xs uppercase">{t.state}</Label><Input className="rounded-none" value={address.state} onChange={e => setAddress({ ...address, state: e.target.value })} /></div>
                  <div className="space-y-1"><Label className="text-xs uppercase">{t.postal} *</Label><Input required className="rounded-none" value={address.postal_code} onChange={e => setAddress({ ...address, postal_code: e.target.value })} /></div>
                </div>
                <div className="space-y-1 pt-2">
                  <Label className="text-xs tracking-wider uppercase">{t.req}</Label>
                  <Textarea className="rounded-none" rows={3} value={deliveryRequest} onChange={e => setDeliveryRequest(e.target.value)} placeholder={t.req_ph} />
                </div>
              </div>

              <div className="space-y-5">
                <h2 className="text-sm font-sans font-medium tracking-[0.15em] uppercase border-b border-border pb-3">{t.bank_section}</h2>
                <div className="space-y-1"><Label className="text-xs tracking-wider uppercase">{t.depositor} *</Label><Input required className="rounded-none" value={depositor} onChange={e => setDepositor(e.target.value)} placeholder={t.depositor_ph} /></div>
                {settings && (
                  <div className="text-xs text-muted-foreground bg-muted/50 p-3 border border-border space-y-0.5">
                    <div>{t.deposit_to} <strong>{settings.bank_name} {settings.account_number}</strong></div>
                    <div>{t.holder} <strong>{settings.account_holder}</strong></div>
                  </div>
                )}
                {(profile?.points || 0) > 0 && (
                  <div className="space-y-1 pt-2 border-t border-border">
                    <Label className="text-xs tracking-wider uppercase">{t.points_label} {(profile?.points || 0).toLocaleString()}P)</Label>
                    <div className="flex gap-2">
                      <Input type="number" min={0} max={maxPoints} className="rounded-none" value={pointsToUse} onChange={e => setPointsToUse(Number(e.target.value) || 0)} />
                      <Button type="button" variant="outline" className="rounded-none" onClick={() => setPointsToUse(maxPoints)}>{t.use_all}</Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="sticky top-24 border border-border p-6 space-y-4">
                <h2 className="text-sm font-sans font-medium tracking-[0.15em] uppercase">{t.summary}</h2>
                {items.map(it => (
                  <div key={it.id} className="flex justify-between text-sm font-light">
                    <span className="truncate flex-1 pr-2">{getLocalizedProductName(it.product, language as LangKey)} ×{it.quantity}</span>
                    <span>{formatPrice(it.product.price * it.quantity)}</span>
                  </div>
                ))}
                <div className="border-t border-border pt-3 space-y-1.5 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">{t.subtotal}</span><span>{formatPrice(subtotal)}</span></div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t.shipping_fee} {currentRate && `(${currentRate.country_name})`}</span>
                    <span>{formatPrice(shippingFee)}</span>
                  </div>
                  {currentRate && <div className="text-[11px] text-muted-foreground text-right">{t.est} {currentRate.min_days}-{currentRate.max_days} {t.days}</div>}
                  {pointsApplied > 0 && <div className="flex justify-between text-primary"><span>{t.points}</span><span>-{formatPrice(pointsApplied)}</span></div>}
                  <div className="flex justify-between font-bold text-base pt-2 border-t border-border"><span>{t.total}</span><span>{formatPrice(total)}</span></div>
                </div>
                <Button type="submit" className="w-full rounded-none py-6 text-xs tracking-[0.15em] uppercase" disabled={isProcessing}>
                  {isProcessing ? t.processing : t.submit}
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
            <AlertDialogTitle>{t.confirm_title}</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="text-sm text-foreground/80 space-y-1 pt-2">
                <div><strong>{address.full_name}</strong> · {address.phone}</div>
                <div>{address.address_line1} {address.address_line2}</div>
                <div>{address.city} {address.state} {address.postal_code}</div>
                <div>{currentRate?.country_name || address.country}</div>
                <div className="pt-3 border-t border-border mt-3">
                  {t.total}: <strong>{formatPrice(total)}</strong> ({t.shipping_fee} {formatPrice(shippingFee)})
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.edit}</AlertDialogCancel>
            <AlertDialogAction onClick={placeOrder} disabled={isProcessing}>{isProcessing ? t.processing : t.confirm}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

const Row = ({ label, value, copyable, copiedMsg }: { label: string; value?: string; copyable?: boolean; copiedMsg?: string }) => (
  <div className="flex justify-between items-center">
    <span className="text-muted-foreground">{label}</span>
    <div className="flex items-center gap-2">
      <span className="font-medium">{value || "-"}</span>
      {copyable && value && (
        <button type="button" onClick={() => { navigator.clipboard.writeText(value); toast.success(copiedMsg || "Copied"); }}
          className="text-muted-foreground hover:text-foreground"><Copy className="h-3.5 w-3.5" /></button>
      )}
    </div>
  </div>
);

export default Checkout;
