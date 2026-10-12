// Storefront design chosen in the admin design editor. Stored in site_settings.settings.design
// and applied to every non-admin page, so what the editor shows is what visitors get.

export type HomeSectionId = "hero" | "featured" | "consultation";

export type PopupPosition = "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right";

export type SitePopup = {
  id: string;
  name: string;
  enabled: boolean;
  type: "image" | "html";
  image: string;
  link: string;
  html: string; // rendered in a sandboxed frame, so scripts cannot touch the store page
  position: PopupPosition;
  width: number;
  height: number; // used by "html" popups only
  pages: "all" | "home" | "products";
  device: "all" | "desktop" | "mobile";
  startsAt: string; // datetime-local value, "" = no limit
  endsAt: string;
  hideOption: "none" | "day" | "week";
};

export type SiteDesign = {
  colors: { primary: string; background: string; foreground: string }; // "H S% L%"
  fonts: { heading: string; body: string; scale: number };
  home: { sections: { id: HomeSectionId; visible: boolean }[]; featuredCount: number };
  effects: { petals: boolean };
  announcement: { enabled: boolean; text: string; link: string };
  layout: {
    corners: "square" | "soft" | "round";
    heroHeight: "compact" | "normal" | "tall";
    heroInterval: number; // seconds per slide
    featuredColumns: 3 | 4;
    featuredTitle: string; // "" = built-in translated title
    featuredSubtitle: string;
  };
  header: { sticky: boolean; greeting: boolean; floating: boolean };
  popups: SitePopup[];
  customCss: string;
};

export const defaultDesign: SiteDesign = {
  colors: { primary: "350 32% 62%", background: "36 30% 97%", foreground: "24 18% 18%" },
  fonts: { heading: "Playfair Display", body: "Inter", scale: 100 },
  home: {
    sections: [
      { id: "hero", visible: true },
      { id: "featured", visible: true },
      { id: "consultation", visible: true },
    ],
    featuredCount: 8,
  },
  effects: { petals: true },
  announcement: { enabled: false, text: "", link: "" },
  layout: { corners: "square", heroHeight: "normal", heroInterval: 6, featuredColumns: 4, featuredTitle: "", featuredSubtitle: "" },
  header: { sticky: true, greeting: true, floating: true },
  popups: [],
  customCss: "",
};

export const MAX_POPUPS = 10;
export const POPUP_POSITIONS: { value: PopupPosition; label: string }[] = [
  { value: "center", label: "화면 가운데" },
  { value: "top-left", label: "왼쪽 위" },
  { value: "top-right", label: "오른쪽 위" },
  { value: "bottom-left", label: "왼쪽 아래" },
  { value: "bottom-right", label: "오른쪽 아래" },
];
export const HERO_HEIGHTS: Record<SiteDesign["layout"]["heroHeight"], { label: string; css: string }> = {
  compact: { label: "낮게", css: "60dvh" },
  normal: { label: "기본", css: "85dvh" },
  tall: { label: "높게", css: "100dvh" },
};
export const HERO_INTERVALS = [4, 6, 8, 10];
export const CORNERS: { value: SiteDesign["layout"]["corners"]; label: string }[] = [
  { value: "square", label: "각진" },
  { value: "soft", label: "살짝 둥근" },
  { value: "round", label: "둥근" },
];

export const newPopup = (): SitePopup => ({
  id: `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
  name: "새 팝업", enabled: true, type: "image", image: "", link: "", html: "",
  position: "center", width: 360, height: 360, pages: "all", device: "all",
  startsAt: "", endsAt: "", hideOption: "day",
});

const oneOf = <T,>(value: unknown, allowed: readonly T[], fallback: T): T =>
  allowed.includes(value as T) ? (value as T) : fallback;
const str = (value: unknown, max: number) => (typeof value === "string" ? value.slice(0, max) : "");
const num = (value: unknown, min: number, max: number, fallback: number) =>
  typeof value === "number" && Number.isFinite(value) ? Math.min(max, Math.max(min, Math.round(value))) : fallback;

const normalizePopup = (raw: any): SitePopup | null => {
  if (!raw || typeof raw !== "object" || typeof raw.id !== "string" || !raw.id) return null;
  return {
    id: raw.id.slice(0, 40),
    name: str(raw.name, 60) || "팝업",
    enabled: raw.enabled !== false,
    type: oneOf(raw.type, ["image", "html"] as const, "image"),
    image: str(raw.image, 2000),
    link: str(raw.link, 500),
    html: str(raw.html, 20000),
    position: oneOf(raw.position, POPUP_POSITIONS.map(p => p.value), "center"),
    width: num(raw.width, 240, 720, 360),
    height: num(raw.height, 120, 800, 360),
    pages: oneOf(raw.pages, ["all", "home", "products"] as const, "all"),
    device: oneOf(raw.device, ["all", "desktop", "mobile"] as const, "all"),
    startsAt: str(raw.startsAt, 20),
    endsAt: str(raw.endsAt, 20),
    hideOption: oneOf(raw.hideOption, ["none", "day", "week"] as const, "day"),
  };
};

export const HOME_SECTION_LABELS: Record<HomeSectionId, { label: string; desc: string }> = {
  hero: { label: "메인 배너", desc: "배너/프로모션에서 등록한 슬라이드" },
  featured: { label: "추천 상품", desc: "상품 관리에서 '추천'으로 지정한 상품" },
  consultation: { label: "뷰티 상담", desc: "피부 타입별 상품 추천 영역" },
};

export const HEADING_FONTS = ["Playfair Display", "Cormorant Garamond", "DM Serif Display", "Noto Serif KR", "Inter", "Noto Sans KR"];
export const BODY_FONTS = ["Inter", "Noto Sans KR", "DM Sans", "Nanum Gothic"];
export const FONT_SCALES = [
  { value: 94, label: "작게" },
  { value: 100, label: "기본" },
  { value: 106, label: "크게" },
];
export const FEATURED_COUNTS = [4, 8, 12];

export const COLOR_PRESETS: { name: string; colors: SiteDesign["colors"] }[] = [
  { name: "로즈 (기본)", colors: defaultDesign.colors },
  { name: "세이지", colors: { primary: "140 18% 45%", background: "80 20% 97%", foreground: "150 15% 16%" } },
  { name: "라벤더", colors: { primary: "265 30% 60%", background: "270 30% 98%", foreground: "265 20% 18%" } },
  { name: "모카", colors: { primary: "25 35% 42%", background: "35 35% 96%", foreground: "25 25% 15%" } },
  { name: "모노", colors: { primary: "0 0% 15%", background: "0 0% 100%", foreground: "0 0% 10%" } },
];

const HSL_RE = /^\d{1,3}(\.\d+)? \d{1,3}(\.\d+)?% \d{1,3}(\.\d+)?%$/;
const isHsl = (v: unknown): v is string => typeof v === "string" && HSL_RE.test(v);

// Saved values can be partial or from an older version, so always rebuild a complete design.
export const normalizeDesign = (raw: unknown): SiteDesign => {
  const r = (raw && typeof raw === "object" ? raw : {}) as any;
  const d = defaultDesign;
  const saved: any[] = Array.isArray(r.home?.sections) ? r.home.sections : [];
  const known = d.home.sections.map(s => s.id);
  const ordered = saved.filter(s => known.includes(s?.id)).map(s => ({ id: s.id as HomeSectionId, visible: s.visible !== false }));
  const sections = [
    ...ordered.filter((s, i) => ordered.findIndex(o => o.id === s.id) === i),
    ...d.home.sections.filter(s => !ordered.some(o => o.id === s.id)),
  ];
  return {
    colors: {
      primary: isHsl(r.colors?.primary) ? r.colors.primary : d.colors.primary,
      background: isHsl(r.colors?.background) ? r.colors.background : d.colors.background,
      foreground: isHsl(r.colors?.foreground) ? r.colors.foreground : d.colors.foreground,
    },
    fonts: {
      heading: HEADING_FONTS.includes(r.fonts?.heading) ? r.fonts.heading : d.fonts.heading,
      body: BODY_FONTS.includes(r.fonts?.body) ? r.fonts.body : d.fonts.body,
      scale: FONT_SCALES.some(s => s.value === r.fonts?.scale) ? r.fonts.scale : d.fonts.scale,
    },
    home: {
      sections,
      featuredCount: FEATURED_COUNTS.includes(r.home?.featuredCount) ? r.home.featuredCount : d.home.featuredCount,
    },
    effects: { petals: r.effects?.petals !== false },
    announcement: {
      enabled: r.announcement?.enabled === true,
      text: typeof r.announcement?.text === "string" ? r.announcement.text.slice(0, 120) : "",
      link: typeof r.announcement?.link === "string" ? r.announcement.link.slice(0, 300) : "",
    },
    layout: {
      corners: oneOf(r.layout?.corners, CORNERS.map(c => c.value), d.layout.corners),
      heroHeight: oneOf(r.layout?.heroHeight, ["compact", "normal", "tall"] as const, d.layout.heroHeight),
      heroInterval: oneOf(r.layout?.heroInterval, HERO_INTERVALS, d.layout.heroInterval),
      featuredColumns: oneOf(r.layout?.featuredColumns, [3, 4] as const, d.layout.featuredColumns),
      featuredTitle: str(r.layout?.featuredTitle, 60),
      featuredSubtitle: str(r.layout?.featuredSubtitle, 120),
    },
    header: {
      sticky: r.header?.sticky !== false,
      greeting: r.header?.greeting !== false,
      floating: r.header?.floating !== false,
    },
    popups: (Array.isArray(r.popups) ? r.popups : []).map(normalizePopup).filter(Boolean).slice(0, MAX_POPUPS) as SitePopup[],
    customCss: str(r.customCss, 20000),
  };
};

export const sameDesign = (a: SiteDesign, b: SiteDesign) => JSON.stringify(a) === JSON.stringify(b);

export const hslToHex = (hsl: string): string => {
  const [h, s, l] = hsl.replace(/%/g, "").split(" ").map(Number);
  const a = (s / 100) * Math.min(l / 100, 1 - l / 100);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const c = l / 100 - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * c).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

export const hexToHsl = (hex: string): string => {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h *= 60;
  }
  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};

const parts = (hsl: string) => hsl.replace(/%/g, "").split(" ").map(Number) as [number, number, number];

const DEFAULT_LOADED_FONTS = ["Playfair Display", "Inter", "Noto Sans KR", "Cormorant Garamond"];
const ensureFont = (family: string) => {
  if (DEFAULT_LOADED_FONTS.includes(family)) return;
  const id = `design-font-${family.replace(/\s+/g, "-")}`;
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${family.replace(/\s+/g, "+")}:wght@400;500;600;700&display=swap`;
  document.head.appendChild(link);
};

const CUSTOM_CSS_ID = "design-custom-css";

const VARS = [
  "--primary", "--ring", "--primary-foreground", "--primary-soft", "--background", "--sky-soft",
  "--foreground", "--card-foreground", "--popover-foreground", "--font-heading", "--font-body",
];

// Removes every override so the page falls back to the stylesheet (used on admin pages).
export const clearDesign = () => {
  const root = document.documentElement;
  VARS.forEach(v => root.style.removeProperty(v));
  root.style.removeProperty("font-size");
  root.removeAttribute("data-corners");
  document.body.style.removeProperty("background");
  document.getElementById(CUSTOM_CSS_ID)?.remove();
};

export const applyDesign = (design: SiteDesign) => {
  clearDesign();
  const root = document.documentElement;
  const d = defaultDesign;
  const { primary, background, foreground } = design.colors;

  if (primary !== d.colors.primary) {
    const [h, s, l] = parts(primary);
    root.style.setProperty("--primary", primary);
    root.style.setProperty("--ring", primary);
    // Keep button text readable on light brand colors.
    root.style.setProperty("--primary-foreground", l > 68 ? "24 18% 18%" : "0 0% 100%");
    root.style.setProperty("--primary-soft", `${h} ${Math.min(s + 8, 60)}% 94%`);
  }
  if (background !== d.colors.background) {
    root.style.setProperty("--background", background);
    root.style.setProperty("--sky-soft", background);
    document.body.style.background = `hsl(${background})`;
  }
  if (foreground !== d.colors.foreground) {
    root.style.setProperty("--foreground", foreground);
    root.style.setProperty("--card-foreground", foreground);
    root.style.setProperty("--popover-foreground", foreground);
  }
  if (design.fonts.heading !== d.fonts.heading) {
    ensureFont(design.fonts.heading);
    root.style.setProperty("--font-heading", `"${design.fonts.heading}"`);
  }
  if (design.fonts.body !== d.fonts.body) {
    ensureFont(design.fonts.body);
    root.style.setProperty("--font-body", `"${design.fonts.body}"`);
  }
  if (design.fonts.scale !== 100) root.style.fontSize = `${design.fonts.scale}%`;
  if (design.layout.corners !== "square") root.setAttribute("data-corners", design.layout.corners);
  if (design.customCss.trim()) {
    const style = document.createElement("style");
    style.id = CUSTOM_CSS_ID;
    style.textContent = design.customCss;
    document.head.appendChild(style);
  }
};

// Draft pushed by the design editor into its preview frame; null everywhere else.
let draft: SiteDesign | null = null;
const listeners = new Set<() => void>();
export const designDraft = {
  get: () => draft,
  set: (next: SiteDesign | null) => { draft = next; listeners.forEach(l => l()); },
  subscribe: (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; },
};

export const DESIGN_DRAFT_MESSAGE = "design-draft";
export const DESIGN_READY_MESSAGE = "design-preview-ready";
