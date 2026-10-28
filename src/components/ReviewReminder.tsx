import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { PenLine, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage, type Language } from "@/contexts/LanguageContext";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { getLocalizedProductName } from "@/lib/productI18n";

const TEXT: Record<Language, { title: string; body: (name: string, more: number) => string; cta: string; close: string }> = {
  en: { title: "Your order has arrived!", body: (n, m) => `How do you like ${n}${m ? ` and ${m} more` : ""}? Write a review and earn 1,000P.`, cta: "Write a review", close: "Close" },
  es: { title: "¡Tu pedido ha llegado!", body: (n, m) => `¿Qué te parece ${n}${m ? ` y ${m} más` : ""}? Escribe una reseña y gana 1.000P.`, cta: "Escribir reseña", close: "Cerrar" },
  de: { title: "Ihre Bestellung ist angekommen!", body: (n, m) => `Wie gefällt Ihnen ${n}${m ? ` und ${m} weitere` : ""}? Schreiben Sie eine Bewertung und erhalten Sie 1.000P.`, cta: "Bewertung schreiben", close: "Schließen" },
  fr: { title: "Votre commande est arrivée !", body: (n, m) => `Que pensez-vous de ${n}${m ? ` et ${m} autre(s)` : ""} ? Laissez un avis et gagnez 1 000P.`, cta: "Écrire un avis", close: "Fermer" },
  pt: { title: "Seu pedido chegou!", body: (n, m) => `O que achou de ${n}${m ? ` e mais ${m}` : ""}? Escreva uma avaliação e ganhe 1.000P.`, cta: "Escrever avaliação", close: "Fechar" },
  ja: { title: "ご注文の商品が届きました！", body: (n, m) => `${n}${m ? `ほか${m}点` : ""}はいかがですか？レビューを書くと1,000Pが貯まります。`, cta: "レビューを書く", close: "閉じる" },
};

// Remembers which waiting items the member closed the reminder for, so it comes back only
// when another delivered order has something new to review.
const DISMISS_KEY = (userId: string) => `review-reminder-${userId}`;

type Pending = { orderId: string; productName: string; count: number; key: string };

// After an order is marked delivered (주문 관리 > 배송 완료), reminds the member on the store to review it.
const ReviewReminder = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { allowReviews } = useSiteSettings();
  const { pathname } = useLocation();
  const [pending, setPending] = useState<Pending | null>(null);
  const text = TEXT[language] || TEXT.en;

  useEffect(() => {
    setPending(null);
    if (!user || !allowReviews) return;
    let cancelled = false;
    (async () => {
      const [ordersRes, reviewsRes] = await Promise.all([
        supabase.from("orders").select("id, updated_at, order_items(product_id, product_name, products(name, translations))")
          .eq("user_id", user.id).eq("status", "delivered").order("updated_at", { ascending: false }),
        supabase.from("reviews").select("product_id").eq("user_id", user.id),
      ]);
      if (cancelled) return;
      const reviewed = new Set((reviewsRes.data || []).map((r: any) => r.product_id));
      const items = (ordersRes.data || []).flatMap((o: any) =>
        (o.order_items || []).filter((i: any) => !reviewed.has(i.product_id)).map((i: any) => ({ order: o.id, item: i })));
      const unique = items.filter((x, idx) => items.findIndex(y => y.item.product_id === x.item.product_id) === idx);
      if (unique.length === 0) return;
      const key = unique.map(x => x.item.product_id).sort().join(",");
      try { if (localStorage.getItem(DISMISS_KEY(user.id)) === key) return; } catch { /* storage unavailable */ }
      const first = unique[0];
      setPending({
        orderId: first.order,
        productName: getLocalizedProductName(first.item.products || { name: first.item.product_name }, language as any),
        count: unique.length,
        key,
      });
    })();
    return () => { cancelled = true; };
  }, [user, allowReviews, language]);

  if (!pending || !user || pathname.startsWith("/admin") || pathname.startsWith("/mypage")) return null;

  const dismiss = () => {
    try { localStorage.setItem(DISMISS_KEY(user.id), pending.key); } catch { /* storage unavailable */ }
    setPending(null);
  };

  return (
    <div role="status" className="fixed bottom-4 left-4 z-[60] w-[min(340px,calc(100vw-2rem))] border border-primary/40 bg-card text-card-foreground shadow-luxury p-4 font-sans animate-in fade-in slide-in-from-bottom-2">
      <button onClick={dismiss} aria-label={text.close} className="absolute right-2 top-2 p-1 text-muted-foreground hover:text-foreground">
        <X className="h-4 w-4" />
      </button>
      <p className="pr-6 text-sm font-semibold">{text.title}</p>
      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{text.body(pending.productName, pending.count - 1)}</p>
      <Link
        to={`/mypage?review=${pending.orderId}`}
        onClick={() => setPending(null)}
        className="mt-3 inline-flex min-h-[36px] items-center gap-1.5 bg-primary px-4 text-xs font-semibold tracking-wider uppercase text-primary-foreground hover:opacity-90"
      >
        <PenLine className="h-3.5 w-3.5" />{text.cta}
      </Link>
    </div>
  );
};

export default ReviewReminder;
