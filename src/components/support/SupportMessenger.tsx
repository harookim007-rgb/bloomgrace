import { useState, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, ChevronLeft, CheckCircle2, Clock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { requireLogin } from "@/components/LoginDialog";
import { toast } from "sonner";
import { supportTexts, SUPPORT_CATEGORIES, SupportCategory } from "./supportTexts";

interface OrderLite { id: string; created_at: string; status: string; items: string }

const SupportMessenger = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const t = supportTexts[language] || supportTexts.en;

  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"new" | "history">("new");
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [category, setCategory] = useState<SupportCategory | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orders, setOrders] = useState<OrderLite[]>([]);
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  const loadHistory = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("inquiries")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);
    setHistory(data || []);
  }, [user]);

  useEffect(() => {
    if (!open || !user) return;
    loadHistory();
    (async () => {
      const { data: prof } = await supabase.from("profiles").select("phone").eq("user_id", user.id).maybeSingle();
      if (prof?.phone) setPhone((p) => p || prof.phone!);
      const { data: ords } = await supabase
        .from("orders")
        .select("id, created_at, status, order_items(product_name, quantity)")
        .order("created_at", { ascending: false })
        .limit(5);
      setOrders(
        (ords || []).map((o: any) => ({
          id: o.id,
          created_at: o.created_at,
          status: o.status,
          items: (o.order_items || []).map((i: any) => `${i.product_name} x${i.quantity}`).join(", "),
        }))
      );
    })();
  }, [open, user, loadHistory]);

  const reset = () => { setStep(1); setCategory(null); setOrderId(null); setMessage(""); };

  const pickCategory = (c: SupportCategory) => {
    setCategory(c);
    setStep(orders.length > 0 ? 2 : 3);
  };

  const handleSend = async () => {
    if (!user) { requireLogin(false); return; }
    if (phone.replace(/\D/g, "").length < 7) { toast.error(t.phoneRequired); return; }
    if (message.trim().length < 2) return;
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-inquiry", {
        body: { name: user.user_metadata?.display_name || user.email, phone, message, language, category, orderId },
      });
      if (error || (data as any)?.error) throw new Error((data as any)?.error || error?.message);
      toast.success(t.sent);
      reset();
      setTab("history");
      loadHistory();
    } catch {
      toast.error(t.error);
    } finally {
      setSending(false);
    }
  };

  const shortId = (id: string) => `#${id.slice(0, 8).toUpperCase()}`;

  return (
    <div className="fixed right-4 md:right-6 bottom-6 z-50">
      {open && (
        <div className="absolute bottom-16 right-0 w-[calc(100vw-2rem)] max-w-[380px] bg-background border border-border/40 shadow-luxury flex flex-col max-h-[72dvh] animate-fade-in">
          {/* Header */}
          <div className="px-5 py-4 border-b border-border/30 bg-muted/30">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-serif font-medium">{t.title}</h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">{t.subtitle}</p>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Close support chat" className="text-muted-foreground/60 hover:text-foreground transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {user && (
            <div className="flex border-b border-border/30">
              {(["new", "history"] as const).map((k) => (
                <button key={k} onClick={() => { setTab(k); if (k === "history") loadHistory(); }}
                  className={`flex-1 text-[11px] py-2.5 tracking-wide transition-colors ${tab === k ? "text-foreground border-b-2 border-primary font-medium" : "text-muted-foreground hover:text-foreground"}`}>
                  {k === "new" ? t.tabNew : t.tabHistory}
                </button>
              ))}
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 min-h-[220px]">
            {!user ? (
              <div className="space-y-4 py-4 text-center">
                <p className="text-xs leading-relaxed text-muted-foreground">{t.loginRequired}</p>
                <button onClick={() => requireLogin(false)}
                  className="w-full py-2.5 bg-primary text-primary-foreground text-xs tracking-wide hover:bg-primary/90 transition-colors">
                  {t.loginBtn}
                </button>
              </div>
            ) : tab === "history" ? (
              history.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-8">{t.emptyHistory}</p>
              ) : (
                history.map((h) => (
                  <div key={h.id} className="space-y-2">
                    <div className="flex justify-end">
                      <div className="bg-primary text-primary-foreground px-3.5 py-2.5 max-w-[85%]">
                        <p className="text-[9px] opacity-70 mb-1">
                          {t.cats[(h.category || "other") as SupportCategory]}
                          {h.order_id ? ` · ${shortId(h.order_id)}` : ""}
                        </p>
                        <p className="text-xs leading-relaxed whitespace-pre-line">{h.message}</p>
                        <p className="text-[9px] opacity-60 mt-1">{new Date(h.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    {h.admin_reply ? (
                      <div className="flex gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-[8px] font-sans font-bold text-foreground">B&G</span>
                        </div>
                        <div className="bg-muted/50 px-3.5 py-2.5 max-w-[85%]">
                          <p className="text-[9px] text-muted-foreground mb-1 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />{t.answered}
                          </p>
                          <p className="text-xs leading-relaxed whitespace-pre-line">{h.admin_reply}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{t.pending}</p>
                    )}
                  </div>
                ))
              )
            ) : (
              <>
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-[8px] font-sans font-bold text-foreground">B&G</span>
                  </div>
                  <div className="bg-muted/50 px-3.5 py-2.5 max-w-[85%]">
                    <p className="text-xs leading-relaxed">{t.greeting}</p>
                  </div>
                </div>

                {step === 1 && (
                  <div className="space-y-2 pt-1">
                    <p className="text-[11px] text-muted-foreground">{t.stepCategory}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {SUPPORT_CATEGORIES.map((c) => (
                        <button key={c} onClick={() => pickCategory(c)}
                          className="text-xs py-2.5 px-2 border border-border/50 hover:border-primary hover:bg-primary-soft/40 transition-colors">
                          {t.cats[c]}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-2 pt-1">
                    <p className="text-[11px] text-muted-foreground">{t.stepOrder}</p>
                    {orders.map((o) => (
                      <button key={o.id} onClick={() => { setOrderId(o.id); setStep(3); }}
                        className="w-full text-left p-3 border border-border/50 hover:border-primary hover:bg-primary-soft/40 transition-colors">
                        <p className="text-[11px] font-medium">{shortId(o.id)} · {new Date(o.created_at).toLocaleDateString()}</p>
                        <p className="text-[10px] text-muted-foreground truncate mt-0.5">{o.items}</p>
                      </button>
                    ))}
                    <button onClick={() => { setOrderId(null); setStep(3); }}
                      className="w-full text-[11px] py-2 text-muted-foreground hover:text-foreground underline underline-offset-2">
                      {t.orderSkip}
                    </button>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-2 pt-1">
                    <button onClick={() => setStep(orders.length > 0 ? 2 : 1)}
                      className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1">
                      <ChevronLeft className="h-3 w-3" />{t.back}
                    </button>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-[10px] px-2 py-1 bg-primary-soft text-primary">{category && t.cats[category]}</span>
                      {orderId && <span className="text-[10px] px-2 py-1 bg-muted">{shortId(orderId)}</span>}
                    </div>
                    <p className="text-[11px] text-muted-foreground pt-1">{t.stepDetail}</p>
                  </div>
                )}
              </>
            )}
          </div>

          {user && tab === "new" && step === 3 && (
            <div className="border-t border-border/30 px-4 py-3 space-y-2">
              <input type="tel" placeholder={t.phone} value={phone} onChange={(e) => setPhone(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-border/40 bg-transparent focus:outline-none focus:border-primary/40 placeholder:text-muted-foreground/50" />
              <div className="flex gap-2">
                <input type="text" placeholder={t.placeholder} value={message} onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !sending && handleSend()}
                  className="flex-1 text-xs px-3 py-2.5 border border-border/40 bg-transparent focus:outline-none focus:border-primary/40 placeholder:text-muted-foreground/50" />
                <button onClick={handleSend} disabled={sending || !message.trim()} aria-label={t.send}
                  className="px-3 py-2.5 bg-primary text-primary-foreground disabled:opacity-40 hover:bg-primary/90 transition-colors">
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          {user && tab === "history" && history.length > 0 && (
            <div className="border-t border-border/30 px-4 py-2.5">
              <button onClick={() => { reset(); setTab("new"); }}
                className="w-full text-[11px] py-2 border border-border/50 hover:border-primary transition-colors">
                {t.newInquiry}
              </button>
            </div>
          )}
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className="w-12 h-12 md:w-14 md:h-14 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-luxury hover:scale-105 transition-transform duration-300"
        aria-label="Customer Support"
      >
        {open ? <X className="h-5 w-5 md:h-6 md:w-6" /> : <MessageCircle className="h-5 w-5 md:h-6 md:w-6" />}
      </button>
    </div>
  );
};

export default SupportMessenger;
