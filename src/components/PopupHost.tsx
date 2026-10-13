import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { X } from "lucide-react";
import { useDesign } from "@/hooks/useDesign";
import { useLanguage, type Language } from "@/contexts/LanguageContext";
import { designDraft, type PopupPosition, type SitePopup } from "@/lib/design";
import { SANDBOX, sandboxDoc } from "@/lib/homeBlocks";

const TEXT: Record<Language, { close: string; day: string; week: string }> = {
  en: { close: "Close", day: "Don't show today", week: "Don't show for a week" },
  es: { close: "Cerrar", day: "No mostrar hoy", week: "No mostrar durante una semana" },
  de: { close: "Schließen", day: "Heute nicht mehr anzeigen", week: "Eine Woche nicht anzeigen" },
  fr: { close: "Fermer", day: "Ne plus afficher aujourd'hui", week: "Ne plus afficher pendant une semaine" },
  pt: { close: "Fechar", day: "Não mostrar hoje", week: "Não mostrar por uma semana" },
  ja: { close: "閉じる", day: "今日は表示しない", week: "1週間表示しない" },
  ar: { close: "إغلاق", day: "عدم الإظهار اليوم", week: "عدم الإظهار لمدة أسبوع" },
};

const HIDE_KEY = (id: string) => `popup-hide-${id}`;
const hiddenUntil = (id: string) => {
  try { return Number(localStorage.getItem(HIDE_KEY(id)) || 0); } catch { return 0; }
};

const CORNER_CLASS: Record<Exclude<PopupPosition, "center">, string> = {
  "top-left": "top-28 left-4 items-start",
  "top-right": "top-28 right-4 items-end",
  "bottom-left": "bottom-4 left-4 items-start",
  "bottom-right": "bottom-24 right-4 items-end",
};

const matchesPage = (popup: SitePopup, pathname: string) =>
  popup.pages === "all" ||
  (popup.pages === "home" && pathname === "/") ||
  (popup.pages === "products" && pathname.startsWith("/products"));

const inSchedule = (popup: SitePopup, now: number) =>
  (!popup.startsAt || new Date(popup.startsAt).getTime() <= now) &&
  (!popup.endsAt || new Date(popup.endsAt).getTime() >= now);

const hasContent = (popup: SitePopup) => (popup.type === "image" ? !!popup.image.trim() : !!popup.html.trim());

const PopupCard = ({ popup, onClose, onHide }: { popup: SitePopup; onClose: () => void; onHide: () => void }) => {
  const { language } = useLanguage();
  const text = TEXT[language] || TEXT.en;
  const link = popup.link.trim();

  const image = <img src={popup.image} alt={popup.name} className="block w-full h-auto max-h-[70dvh] object-contain" />;
  const body = popup.type === "html"
    ? (
      <iframe
        title={popup.name}
        srcDoc={sandboxDoc(popup.html)}
        sandbox={SANDBOX}
        className="block w-full border-0"
        style={{ height: `min(${popup.height}px, 70dvh)` }}
      />
    )
    : /^https?:\/\//.test(link) ? <a href={link} target="_blank" rel="noopener noreferrer" onClick={onClose}>{image}</a>
    : link.startsWith("/") ? <Link to={link} onClick={onClose}>{image}</Link>
    : image;

  return (
    <div
      role="dialog"
      aria-label={popup.name}
      className="pointer-events-auto bg-card text-card-foreground border border-border shadow-luxury rounded-md overflow-hidden"
      style={{ width: `min(${popup.width}px, calc(100vw - 2rem))` }}
    >
      {body}
      <div className="flex items-center justify-between gap-2 border-t border-border bg-card px-3 text-xs font-sans">
        {popup.hideOption !== "none"
          ? <button onClick={onHide} className="min-h-[40px] text-left text-muted-foreground hover:text-foreground">{popup.hideOption === "week" ? text.week : text.day}</button>
          : <span />}
        <button onClick={onClose} className="min-h-[40px] shrink-0 flex items-center gap-1 font-semibold hover:text-primary">
          {text.close}<X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

// Shows the popups configured in the admin design editor on storefront pages.
const PopupHost = () => {
  const { pathname } = useLocation();
  const { popups } = useDesign();
  const [closed, setClosed] = useState<Record<string, string>>({});
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // In the editor's preview a visitor's "don't show today" choice is ignored, and a popup
  // reappears whenever it is edited, so the admin always sees what they are changing.
  const preview = designDraft.get() !== null;

  const active = useMemo(() => {
    const now = Date.now();
    return popups.filter(p =>
      p.enabled && hasContent(p) && matchesPage(p, pathname) && inSchedule(p, now) &&
      (p.device === "all" || (p.device === "mobile") === isMobile) &&
      closed[p.id] !== JSON.stringify(p) &&
      (preview || hiddenUntil(p.id) < now)
    );
  }, [popups, pathname, isMobile, closed, preview]);

  if (pathname.startsWith("/admin") || active.length === 0) return null;

  const close = (p: SitePopup) => setClosed(c => ({ ...c, [p.id]: JSON.stringify(p) }));
  const hide = (p: SitePopup) => {
    if (!preview) {
      const days = p.hideOption === "week" ? 7 : 1;
      try { localStorage.setItem(HIDE_KEY(p.id), String(Date.now() + days * 86_400_000)); } catch { /* storage unavailable */ }
    }
    close(p);
  };
  const card = (p: SitePopup) => <PopupCard key={p.id} popup={p} onClose={() => close(p)} onHide={() => hide(p)} />;

  // Phones have no room for several popups, so show them one at a time in the middle.
  if (isMobile) {
    return (
      <div className="fixed inset-0 z-[65] flex items-center justify-center bg-black/40 p-4">
        {card(active[0])}
      </div>
    );
  }

  const centered = active.filter(p => p.position === "center");
  return (
    <>
      {centered.length > 0 && (
        <div className="fixed inset-0 z-[65] flex flex-wrap items-center justify-center content-center gap-4 bg-black/40 p-6 overflow-y-auto">
          {centered.map(card)}
        </div>
      )}
      {(Object.keys(CORNER_CLASS) as (keyof typeof CORNER_CLASS)[]).map(position => {
        const list = active.filter(p => p.position === position);
        if (list.length === 0) return null;
        return (
          <div key={position} className={`fixed z-[66] flex flex-col gap-3 max-h-[calc(100dvh-8rem)] overflow-y-auto pointer-events-none ${CORNER_CLASS[position]}`}>
            {list.map(card)}
          </div>
        );
      })}
    </>
  );
};

export default PopupHost;
