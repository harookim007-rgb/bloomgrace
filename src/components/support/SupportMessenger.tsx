import { useState, useEffect, useCallback, useRef } from "react";
import { MessageCircle, X, Send, ChevronLeft, CheckCircle2, Clock, ImagePlus, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { requireLogin } from "@/components/LoginDialog";
import { toast } from "sonner";
import { supportTexts, SUPPORT_CATEGORIES, SupportCategory } from "./supportTexts";

interface OrderLite { id: string; created_at: string; status: string; items: string }

const ATTACH_I18N: Record<string, { attach: string; max: string; uploadFail: string }> = {
  en: { attach: "Attach image", max: "You can attach up to 5 images.", uploadFail: "Image upload failed" },
  es: { attach: "Adjuntar imagen", max: "Puedes adjuntar hasta 5 imágenes.", uploadFail: "Error al subir la imagen" },
  de: { attach: "Bild anhängen", max: "Bis zu 5 Bilder möglich.", uploadFail: "Bild-Upload fehlgeschlagen" },
  fr: { attach: "Joindre une image", max: "Jusqu'à 5 images.", uploadFail: "Échec du téléchargement" },
  pt: { attach: "Anexar imagem", max: "Até 5 imagens.", uploadFail: "Falha no envio da imagem" },
  ja: { attach: "画像を添付", max: "画像は5枚までです。", uploadFail: "画像のアップロードに失敗しました" },
  ar: { attach: "إرفاق صورة", max: "حتى 5 صور.", uploadFail: "فشل رفع الصورة" },
};

async function shrink(file: File, max = 1280, quality = 0.82): Promise<Blob> {
  const dataUrl = await new Promise<string>((r, j) => {
    const fr = new FileReader();
    fr.onload = () => r(fr.result as string);
    fr.onerror = j;
    fr.readAsDataURL(file);
  });
  const img = await new Promise<HTMLImageElement>((r, j) => {
    const i = new Image();
    i.onload = () => r(i);
    i.onerror = j;
    i.src = dataUrl;
  });
  let w = img.width, h = img.height;
  if (w > max || h > max) {
    const k = Math.min(max / w, max / h);
    w = Math.round(w * k); h = Math.round(h * k);
  }
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  c.getContext("2d")!.drawImage(img, 0, 0, w, h);
  return await new Promise<Blob>((res) => c.toBlob((b) => res(b!), "image/jpeg", quality));
}

const SupportMessenger = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const t = supportTexts[language] || supportTexts.en;
  const ta = ATTACH_I18N[language] || ATTACH_I18N.en;

  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"new" | "history">("new");
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [category, setCategory] = useState<SupportCategory | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orders, setOrders] = useState<OrderLite[]>([]);
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const loadHistory = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("inquiries")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(30);
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

  useEffect(() => {
    if (tab === "history") scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [history, tab]);

  const reset = () => { setStep(1); setCategory(null); setOrderId(null); setMessage(""); setAttachments([]); };

  const pickCategory = (c: SupportCategory) => {
    setCategory(c);
    setStep(orders.length > 0 ? 2 : 3);
  };

  const handleFiles = async (files: FileList) => {
    if (!user) { requireLogin(false); return; }
    if (attachments.length + files.length > 5) { toast.error(ta.max); return; }
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const f of Array.from(files)) {
        if (!f.type.startsWith("image/")) continue;
        const blob = await shrink(f);
        const path = `inquiries/${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
        const { error } = await supabase.storage.from("media").upload(path, blob, { contentType: "image/jpeg", upsert: false });
        if (error) throw error;
        const { data: signed } = await supabase.storage.from("media").createSignedUrl(path, 60 * 60 * 24 * 365 * 5);
        if (signed?.signedUrl) urls.push(signed.signedUrl);
      }
      setAttachments((a) => [...a, ...urls]);
    } catch (e: any) {
      toast.error(`${ta.uploadFail}: ${e?.message || ""}`);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleSend = async () => {
    if (!user) { requireLogin(false); return; }
    if (phone.replace(/\D/g, "").length < 7) { toast.error(t.phoneRequired); return; }
    if (message.trim().length < 2 && attachments.length === 0) return;

    const body = {
      name: user.user_metadata?.display_name || user.email,
      phone, message, language, category, orderId, attachments,
    };
    const optimistic = {
      id: `tmp-${Date.now()}`,
      created_at: new Date().toISOString(),
      message: message.trim() || "(image)",
      category, order_id: orderId, attachments, admin_reply: null, pendingSend: true,
    };

    // Show the message instantly, then confirm in the background
    setHistory((h) => [...h, optimistic]);
    setTab("history");
    reset();
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-inquiry", { body });
      if (error || (data as any)?.error) throw new Error((data as any)?.error || error?.message);
      setHistory((h) => h.map((x) => (x.id === optimistic.id ? { ...(data as any).inquiry ?? optimistic, pendingSend: false } : x)));
    } catch {
      setHistory((h) => h.filter((x) => x.id !== optimistic.id));
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

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3 min-h-[220px]">
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
                      <div className={`bg-primary text-primary-foreground px-3.5 py-2.5 max-w-[85%] ${h.pendingSend ? "opacity-60" : ""}`}>
                        <p className="text-[9px] opacity-70 mb-1">
                          {t.cats[(h.category || "other") as SupportCategory]}
                          {h.order_id ? ` · ${shortId(h.order_id)}` : ""}
                        </p>
                        {(h.attachments || []).length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-1.5">
                            {(h.attachments as string[]).map((u, i) => (
                              <a key={i} href={u} target="_blank" rel="noreferrer">
                                <img src={u} alt="" className="w-16 h-16 object-cover" />
                              </a>
                            ))}
                          </div>
                        )}
                        {h.message && h.message !== "(image)" && (
                          <p className="text-xs leading-relaxed whitespace-pre-line">{h.message}</p>
                        )}
                        <p className="text-[9px] opacity-60 mt-1 flex items-center gap-1">
                          {h.pendingSend && <Loader2 className="h-2.5 w-2.5 animate-spin" />}
                          {new Date(h.created_at).toLocaleDateString()}
                        </p>
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
                    ) : !h.pendingSend && (
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

              {attachments.length > 0 && (
                <div className="flex gap-1.5 flex-wrap">
                  {attachments.map((u, i) => (
                    <div key={i} className="relative w-14 h-14 border border-border/40">
                      <img src={u} alt="" className="w-full h-full object-cover" />
                      <button type="button" aria-label="Remove image"
                        onClick={() => setAttachments(attachments.filter((_, j) => j !== i))}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-background border border-border rounded-full flex items-center justify-center">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
                  onChange={(e) => e.target.files && handleFiles(e.target.files)} />
                <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading || attachments.length >= 5}
                  aria-label={ta.attach} title={ta.attach}
                  className="px-2.5 py-2.5 border border-border/40 text-muted-foreground hover:text-foreground hover:border-primary/40 disabled:opacity-40 transition-colors">
                  {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
                </button>
                <input type="text" placeholder={t.placeholder} value={message} onChange={(e) => setMessage(e.target.value)}
                  onPaste={(e) => {
                    const imgs = Array.from(e.clipboardData.files).filter((f) => f.type.startsWith("image/"));
                    if (imgs.length) {
                      e.preventDefault();
                      const dt = new DataTransfer();
                      imgs.forEach((f) => dt.items.add(f));
                      handleFiles(dt.files);
                    }
                  }}
                  onKeyDown={(e) => e.key === "Enter" && !sending && handleSend()}
                  className="flex-1 text-xs px-3 py-2.5 border border-border/40 bg-transparent focus:outline-none focus:border-primary/40 placeholder:text-muted-foreground/50" />
                <button onClick={handleSend} disabled={sending || uploading || (!message.trim() && attachments.length === 0)} aria-label={t.send}
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
