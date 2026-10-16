import { useEffect, useMemo, useState } from "react";
import Navigation from "@/components/Navigation";
import { PageBlocks } from "@/components/home/HomeBlocks";
import Footer from "@/components/Footer";
import FloatingButtons from "@/components/FloatingButtons";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, MessageCircle } from "lucide-react";
import { useLanguage, type Language } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { requireLogin } from "@/components/LoginDialog";
import { supportTexts, SUPPORT_CATEGORIES, type SupportCategory } from "@/components/support/supportTexts";
import { SUPPORT_EMAIL } from "@/lib/shop";
import { toast } from "sonner";

const EXTRA: Record<Language, {
  type: string; order: string; noOrder: string; product: string; allProducts: string; name: string;
  emailTitle: string; emailNote: string; chatTitle: string; chatNote: string; chatBtn: string; pickType: string;
}> = {
  en: { type: "Inquiry type", order: "Order (optional)", noOrder: "Not about an order", product: "Product (optional)", allProducts: "The whole order", name: "Name", emailTitle: "Email", emailNote: "We reply to every inquiry by email.", chatTitle: "Live chat", chatNote: "You can also ask us from the chat button at the bottom right.", chatBtn: "Open chat", pickType: "Please choose an inquiry type." },
  es: { type: "Tipo de consulta", order: "Pedido (opcional)", noOrder: "No es sobre un pedido", product: "Producto (opcional)", allProducts: "Todo el pedido", name: "Nombre", emailTitle: "Email", emailNote: "Respondemos a todas las consultas por email.", chatTitle: "Chat", chatNote: "También puedes escribirnos desde el botón de chat abajo a la derecha.", chatBtn: "Abrir chat", pickType: "Elige un tipo de consulta." },
  de: { type: "Art der Anfrage", order: "Bestellung (optional)", noOrder: "Betrifft keine Bestellung", product: "Produkt (optional)", allProducts: "Die ganze Bestellung", name: "Name", emailTitle: "E-Mail", emailNote: "Wir beantworten jede Anfrage per E-Mail.", chatTitle: "Chat", chatNote: "Sie können uns auch über den Chat-Button unten rechts schreiben.", chatBtn: "Chat öffnen", pickType: "Bitte wählen Sie die Art der Anfrage." },
  fr: { type: "Type de demande", order: "Commande (facultatif)", noOrder: "Pas liée à une commande", product: "Produit (facultatif)", allProducts: "Toute la commande", name: "Nom", emailTitle: "E-mail", emailNote: "Nous répondons à chaque demande par e-mail.", chatTitle: "Chat", chatNote: "Vous pouvez aussi nous écrire via le bouton de chat en bas à droite.", chatBtn: "Ouvrir le chat", pickType: "Veuillez choisir un type de demande." },
  pt: { type: "Tipo de pedido", order: "Pedido (opcional)", noOrder: "Não é sobre um pedido", product: "Produto (opcional)", allProducts: "O pedido inteiro", name: "Nome", emailTitle: "E-mail", emailNote: "Respondemos a todas as mensagens por e-mail.", chatTitle: "Chat", chatNote: "Você também pode falar conosco pelo botão de chat no canto inferior direito.", chatBtn: "Abrir chat", pickType: "Escolha o tipo de pedido." },
  ja: { type: "お問い合わせの種類", order: "ご注文（任意）", noOrder: "注文以外のお問い合わせ", product: "商品（任意）", allProducts: "注文全体", name: "お名前", emailTitle: "メール", emailNote: "すべてのお問い合わせにメールでご返信します。", chatTitle: "チャット", chatNote: "右下のチャットボタンからもお問い合わせいただけます。", chatBtn: "チャットを開く", pickType: "お問い合わせの種類を選択してください。" },
};

type OrderOption = { id: string; created_at: string; items: string[] };
const NONE = "none";

const Contact = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const s = supportTexts[language] || supportTexts.en;
  const x = EXTRA[language as Language] || EXTRA.en;
  const [category, setCategory] = useState<SupportCategory | null>(null);
  const [orders, setOrders] = useState<OrderOption[]>([]);
  const [orderId, setOrderId] = useState(NONE);
  const [product, setProduct] = useState(NONE);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  // Members pick one of their own orders (newest first) and, optionally, one product in it.
  useEffect(() => {
    if (!user) return;
    setName(n => n || (user.user_metadata as any)?.full_name || (user.user_metadata as any)?.name || "");
    supabase.from("orders").select("id, created_at, order_items(product_name)").eq("user_id", user.id)
      .order("created_at", { ascending: false }).limit(30)
      .then(({ data }) => setOrders((data || []).map((o: any) => ({
        id: o.id, created_at: o.created_at, items: (o.order_items || []).map((i: any) => i.product_name),
      }))));
    supabase.from("profiles").select("phone").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => { if (data?.phone) setPhone(p => p || data.phone); });
  }, [user]);

  const selectedOrder = useMemo(() => orders.find(o => o.id === orderId), [orders, orderId]);
  const orderLabel = (o: OrderOption) =>
    `#${o.id.slice(0, 8).toUpperCase()} · ${new Date(o.created_at).toLocaleDateString(language)}${o.items[0] ? ` · ${o.items[0]}${o.items.length > 1 ? ` +${o.items.length - 1}` : ""}` : ""}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { requireLogin(false); return; }
    if (!category) { toast.error(x.pickType); return; }
    if (phone.replace(/\D/g, "").length < 7) { toast.error(s.phoneRequired); return; }
    if (message.trim().length < 2) { toast.error(s.placeholder); return; }
    setSending(true);
    try {
      const productLine = product !== NONE ? `[Product: ${product}]\n` : "";
      const { data, error } = await supabase.functions.invoke("send-inquiry", {
        body: {
          name: name.trim() || user.email,
          phone: phone.trim(),
          category,
          orderId: orderId !== NONE ? orderId : undefined,
          message: productLine + message.trim(),
          language,
        },
      });
      if (error || (data as any)?.error) throw new Error((data as any)?.error || error?.message);
      toast.success(s.sent);
      setMessage(""); setCategory(null); setOrderId(NONE); setProduct(NONE);
    } catch {
      toast.error(s.error);
    } finally {
      setSending(false);
    }
  };

  const label = "text-xs font-sans tracking-wider uppercase";

  return (
    <div className="min-h-dvh">
      <SEO
        title="Contact Youthroom | K-Beauty Support"
        description="Reach the Youthroom customer support team for order help and product questions."
        path="/contact"
        jsonLd={{ "@context": "https://schema.org", "@type": "Organization", name: "Youthroom", email: SUPPORT_EMAIL, url: "https://youthroom.shop/contact" }}
      />
      <Navigation />
      <PageBlocks page="contact" part="top" />
      <section className="py-16 md:py-24 px-4 md:px-6 lg:px-8">
        <div className="container max-w-6xl">
          <div className="mb-12 md:mb-16 space-y-3">
            <p className="text-xs font-sans tracking-[0.3em] uppercase text-muted-foreground">{t("contact_tagline")}</p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-light">{t("contact_title")}</h1>
            <p className="text-sm text-muted-foreground font-light max-w-lg">{t("contact_subtitle")}</p>
          </div>

          <div className="grid md:grid-cols-[1fr_320px] gap-12 md:gap-16">
            {!user ? (
              <div className="border border-border p-8 space-y-4 text-center bg-muted/20">
                <p className="text-sm text-muted-foreground leading-relaxed">{s.loginRequired}</p>
                <Button className="rounded-none px-8" onClick={() => requireLogin(false)}>{s.loginBtn}</Button>
              </div>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <p className={label}>{x.type} *</p>
                  <div className="flex flex-wrap gap-2">
                    {SUPPORT_CATEGORIES.map(c => (
                      <button
                        type="button"
                        key={c}
                        onClick={() => setCategory(c)}
                        aria-pressed={category === c}
                        className={`min-h-[40px] px-4 border text-sm transition-colors ${category === c ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground hover:text-foreground hover:border-foreground"}`}
                      >
                        {s.cats[c]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className={label}>{x.order}</p>
                    <Select value={orderId} onValueChange={v => { setOrderId(v); setProduct(NONE); }}>
                      <SelectTrigger className="rounded-none"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NONE}>{orders.length ? x.noOrder : s.noOrder}</SelectItem>
                        {orders.map(o => <SelectItem key={o.id} value={o.id}>{orderLabel(o)}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <p className={label}>{x.product}</p>
                    <Select value={product} onValueChange={setProduct} disabled={!selectedOrder || selectedOrder.items.length === 0}>
                      <SelectTrigger className="rounded-none"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NONE}>{x.allProducts}</SelectItem>
                        {[...new Set(selectedOrder?.items || [])].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className={label}>{x.name}</p>
                    <Input className="rounded-none" value={name} maxLength={120} onChange={e => setName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <p className={label}>{s.phone}</p>
                    <Input type="tel" className="rounded-none" value={phone} maxLength={30} onChange={e => setPhone(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <p className={label}>{t("contact_message")} *</p>
                  <Textarea rows={6} className="rounded-none resize-none" placeholder={s.placeholder} value={message} maxLength={5000} onChange={e => setMessage(e.target.value)} />
                </div>
                <Button type="submit" disabled={sending} className="w-full rounded-none py-6 text-xs tracking-[0.15em] uppercase">
                  {sending ? s.sending : t("contact_submit")}
                </Button>
              </form>
            )}

            <aside className="space-y-8">
              <div className="flex items-start gap-4 pb-8 border-b border-border">
                <Mail className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <h3 className="text-sm font-sans font-medium mb-1">{x.emailTitle}</h3>
                  <a href={`mailto:${SUPPORT_EMAIL}`} className="text-sm break-all hover:text-primary">{SUPPORT_EMAIL}</a>
                  <p className="text-sm text-muted-foreground font-light mt-1">{x.emailNote}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <MessageCircle className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <h3 className="text-sm font-sans font-medium mb-1">{x.chatTitle}</h3>
                  <p className="text-sm text-muted-foreground font-light">{x.chatNote}</p>
                  <button
                    type="button"
                    onClick={() => (document.querySelector('[aria-label="Customer Support"]') as HTMLButtonElement | null)?.click()}
                    className="mt-2 text-sm underline underline-offset-4 hover:text-primary"
                  >
                    {x.chatBtn}
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
      <PageBlocks page="contact" part="bottom" />
      <Footer />
      <FloatingButtons />
    </div>
  );
};

export default Contact;
