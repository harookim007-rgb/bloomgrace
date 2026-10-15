import { getDictionary, translations, type Language } from "@/contexts/LanguageContext";

// FAQ shown on the Q&A page, editable in admin (FAQ 관리) and stored in site_settings.settings.faq.
// Every text has one entry per storefront language; a missing language falls back to English.

export const FAQ_LANGUAGES: { code: Language; label: string }[] = [
  { code: "en", label: "English" }, { code: "es", label: "Español" }, { code: "de", label: "Deutsch" },
  { code: "fr", label: "Français" }, { code: "pt", label: "Português" }, { code: "ja", label: "日本語" }, { code: "ar", label: "العربية" },
];
export const FAQ_ICONS = ["sparkles", "package", "refresh", "shield", "leaf", "message"] as const;
export type FaqIcon = (typeof FAQ_ICONS)[number];

export type LangText = Partial<Record<Language, string>>;
export type FaqItem = { id: string; q: LangText; a: LangText };
export type FaqCategory = { id: string; icon: FaqIcon; title: LangText; items: FaqItem[] };
export type FaqStyle = { font: string; titleColor: string; questionColor: string; answerColor: string };
export type FaqSettings = { categories: FaqCategory[]; style: FaqStyle };

export const defaultFaqStyle: FaqStyle = { font: "", titleColor: "", questionColor: "", answerColor: "" };

const fromDict = (key: string): LangText => {
  const out: LangText = {};
  for (const { code } of FAQ_LANGUAGES) {
    const v = (getDictionary(code) as any)?.[key] ?? (code === "en" ? (translations.en as any)[key] : undefined);
    if (typeof v === "string" && v.trim()) out[code] = v.replace(/&amp;/g, "&");
  }
  return out;
};

const SEED: { id: string; icon: FaqIcon; title: string; qs: number[] }[] = [
  { id: "product", icon: "sparkles", title: "qa_cat_product", qs: [1, 2, 3] },
  { id: "shipping", icon: "package", title: "qa_cat_shipping", qs: [4, 5, 6] },
  { id: "returns", icon: "refresh", title: "qa_cat_returns", qs: [7, 8] },
  { id: "membership", icon: "shield", title: "qa_cat_membership", qs: [10] },
  { id: "sustainability", icon: "leaf", title: "qa_cat_sustainability", qs: [11, 12] },
  { id: "support", icon: "message", title: "qa_cat_support", qs: [13, 14] },
];

// The FAQ as it was written into the site's translations, used until an admin saves their own.
export const defaultFaq = (): FaqSettings => ({
  categories: SEED.map(c => ({
    id: c.id, icon: c.icon, title: fromDict(c.title),
    items: c.qs.map(n => ({ id: `q${n}`, q: fromDict(`qa_q${n}`), a: fromDict(`qa_a${n}`) })),
  })),
  style: { ...defaultFaqStyle },
});

const HEX = /^#[0-9a-fA-F]{6}$/;
const text = (v: unknown, max: number): LangText => {
  const out: LangText = {};
  if (v && typeof v === "object") for (const { code } of FAQ_LANGUAGES) {
    const s = (v as any)[code];
    if (typeof s === "string" && s.trim()) out[code] = s.slice(0, max);
  }
  return out;
};

export const normalizeFaq = (raw: unknown): FaqSettings => {
  const r = raw as any;
  if (!r || !Array.isArray(r.categories)) return defaultFaq();
  return {
    categories: r.categories.slice(0, 20).filter((c: any) => c && typeof c.id === "string").map((c: any) => ({
      id: c.id.slice(0, 40),
      icon: FAQ_ICONS.includes(c.icon) ? c.icon : "sparkles",
      title: text(c.title, 120),
      items: (Array.isArray(c.items) ? c.items : []).slice(0, 50).filter((i: any) => i && typeof i.id === "string")
        .map((i: any) => ({ id: i.id.slice(0, 40), q: text(i.q, 300), a: text(i.a, 3000) })),
    })),
    style: {
      font: typeof r.style?.font === "string" ? r.style.font.slice(0, 60) : "",
      titleColor: HEX.test(r.style?.titleColor) ? r.style.titleColor : "",
      questionColor: HEX.test(r.style?.questionColor) ? r.style.questionColor : "",
      answerColor: HEX.test(r.style?.answerColor) ? r.style.answerColor : "",
    },
  };
};

export const pick = (t: LangText, lang: Language) => t[lang] || t.en || "";
export const newFaqId = (prefix: string) => `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
