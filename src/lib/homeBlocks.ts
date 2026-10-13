// Home page building blocks ("widgets") managed in the admin design editor.
// One definition per block type drives three things: the defaults for a new block,
// validation of saved data, and the settings form shown in the editor.

export type BlockType =
  | "hero" | "products" | "categories" | "consultation" | "text" | "image" | "imageText"
  | "promo" | "cards" | "accordion" | "video" | "spacer" | "divider" | "html";

export type BlockItem = { title: string; body: string };

export type HomeBlock = {
  id: string;
  type: BlockType;
  visible: boolean;
  device: "all" | "desktop" | "mobile";
  bg: "none" | "soft" | "tint" | "dark";
  pad: "small" | "normal" | "large";
  s: Record<string, any>; // settings for this block type, see BLOCK_TYPES[type].fields
};

export type BlockField =
  | { key: string; kind: "text" | "textarea" | "link" | "image" | "code" | "category"; label: string; max: number; hint?: string; placeholder?: string; showIf?: (s: Record<string, any>) => boolean }
  | { key: string; kind: "select"; label: string; options: { value: string | number; label: string }[]; hint?: string; showIf?: (s: Record<string, any>) => boolean }
  | { key: string; kind: "number"; label: string; min: number; max: number; hint?: string; showIf?: (s: Record<string, any>) => boolean }
  | { key: string; kind: "items"; label: string; max: number; titleLabel: string; bodyLabel: string; hint?: string; showIf?: (s: Record<string, any>) => boolean };

type BlockDef = {
  label: string;
  desc: string;
  group: "쇼핑" | "콘텐츠" | "레이아웃" | "고급";
  single?: boolean; // only one allowed on the page
  chrome: boolean; // whether background / spacing options apply
  defaults: Record<string, any>;
  fields: BlockField[];
};

const LINK_HINT = "'/products' 같은 쇼핑몰 주소 또는 'https://'로 시작하는 주소";

export const BLOCK_TYPES: Record<BlockType, BlockDef> = {
  hero: {
    label: "메인 배너", desc: "배너/프로모션에 등록한 슬라이드", group: "쇼핑", single: true, chrome: false,
    defaults: { height: "normal", interval: 6 },
    fields: [
      { key: "height", kind: "select", label: "배너 높이", options: [{ value: "compact", label: "낮게" }, { value: "normal", label: "기본" }, { value: "tall", label: "높게 (화면 가득)" }], hint: "배너 이미지와 문구는 '배너/프로모션'에서 등록합니다" },
      { key: "interval", kind: "select", label: "슬라이드 넘김 간격", options: [4, 6, 8, 10].map(n => ({ value: n, label: `${n}초` })) },
    ],
  },
  products: {
    label: "상품 목록", desc: "추천·신상품·카테고리별 상품", group: "쇼핑", chrome: false,
    defaults: { source: "featured", category: "", count: 8, columns: 4, title: "", subtitle: "" },
    fields: [
      { key: "source", kind: "select", label: "보여줄 상품", options: [{ value: "featured", label: "추천 상품" }, { value: "new", label: "신상품 (최근 등록순)" }, { value: "category", label: "카테고리 선택" }], hint: "추천 상품은 '상품 관리'에서 추천으로 지정한 상품입니다" },
      { key: "category", kind: "category", label: "카테고리", max: 60, showIf: s => s.source === "category" },
      { key: "count", kind: "select", label: "상품 개수", options: [4, 8, 12].map(n => ({ value: n, label: `${n}개` })) },
      { key: "columns", kind: "select", label: "PC 한 줄 상품 수", options: [{ value: 3, label: "3개씩" }, { value: 4, label: "4개씩" }] },
      { key: "title", kind: "text", label: "제목 (선택)", max: 60, placeholder: "비워두면 언어별 기본 제목" },
      { key: "subtitle", kind: "text", label: "설명 (선택)", max: 120, placeholder: "비워두면 언어별 기본 설명" },
    ],
  },
  categories: {
    label: "카테고리 바로가기", desc: "카테고리 관리의 카테고리 버튼", group: "쇼핑", chrome: true,
    defaults: { title: "" },
    fields: [{ key: "title", kind: "text", label: "제목 (선택)", max: 60 }],
  },
  consultation: {
    label: "뷰티 상담", desc: "피부 타입별 상품 추천 영역", group: "쇼핑", single: true, chrome: false,
    defaults: {}, fields: [],
  },
  text: {
    label: "텍스트", desc: "제목과 본문", group: "콘텐츠", chrome: true,
    defaults: { heading: "제목을 입력하세요", body: "", align: "center", size: "normal" },
    fields: [
      { key: "heading", kind: "text", label: "제목", max: 120 },
      { key: "body", kind: "textarea", label: "본문", max: 2000 },
      { key: "align", kind: "select", label: "정렬", options: [{ value: "left", label: "왼쪽" }, { value: "center", label: "가운데" }] },
      { key: "size", kind: "select", label: "제목 크기", options: [{ value: "normal", label: "기본" }, { value: "large", label: "크게" }] },
    ],
  },
  image: {
    label: "이미지", desc: "이미지 한 장 (링크 가능)", group: "콘텐츠", chrome: true,
    defaults: { image: "", alt: "", link: "", width: "contained" },
    fields: [
      { key: "image", kind: "image", label: "이미지", max: 2000 },
      { key: "alt", kind: "text", label: "이미지 설명 (선택)", max: 160, hint: "검색엔진과 화면 낭독기가 읽는 문구" },
      { key: "link", kind: "link", label: "클릭 시 이동 (선택)", max: 500, hint: LINK_HINT },
      { key: "width", kind: "select", label: "너비", options: [{ value: "contained", label: "본문 폭" }, { value: "full", label: "화면 가득" }] },
    ],
  },
  imageText: {
    label: "이미지 + 텍스트", desc: "이미지 옆에 글과 버튼", group: "콘텐츠", chrome: true,
    defaults: { image: "", heading: "제목을 입력하세요", body: "", buttonLabel: "", buttonLink: "", side: "left" },
    fields: [
      { key: "image", kind: "image", label: "이미지", max: 2000 },
      { key: "side", kind: "select", label: "이미지 위치", options: [{ value: "left", label: "왼쪽" }, { value: "right", label: "오른쪽" }] },
      { key: "heading", kind: "text", label: "제목", max: 120 },
      { key: "body", kind: "textarea", label: "본문", max: 2000 },
      { key: "buttonLabel", kind: "text", label: "버튼 문구 (선택)", max: 40 },
      { key: "buttonLink", kind: "link", label: "버튼 링크", max: 500, hint: LINK_HINT, showIf: s => !!String(s.buttonLabel || "").trim() },
    ],
  },
  promo: {
    label: "프로모션 배너", desc: "강조 문구와 버튼", group: "콘텐츠", chrome: true,
    defaults: { heading: "프로모션 문구를 입력하세요", body: "", buttonLabel: "Shop now", buttonLink: "/products" },
    fields: [
      { key: "heading", kind: "text", label: "문구", max: 120 },
      { key: "body", kind: "text", label: "보조 문구 (선택)", max: 200 },
      { key: "buttonLabel", kind: "text", label: "버튼 문구 (선택)", max: 40 },
      { key: "buttonLink", kind: "link", label: "버튼 링크", max: 500, hint: LINK_HINT, showIf: s => !!String(s.buttonLabel || "").trim() },
    ],
  },
  cards: {
    label: "텍스트 카드", desc: "장점·안내를 카드로 나란히", group: "콘텐츠", chrome: true,
    defaults: { title: "", items: [{ title: "카드 제목", body: "카드 내용" }, { title: "카드 제목", body: "카드 내용" }, { title: "카드 제목", body: "카드 내용" }] },
    fields: [
      { key: "title", kind: "text", label: "제목 (선택)", max: 120 },
      { key: "items", kind: "items", label: "카드", max: 6, titleLabel: "카드 제목", bodyLabel: "카드 내용" },
    ],
  },
  accordion: {
    label: "아코디언 (FAQ)", desc: "누르면 펼쳐지는 질문과 답", group: "콘텐츠", chrome: true,
    defaults: { title: "", items: [{ title: "질문을 입력하세요", body: "답변을 입력하세요" }] },
    fields: [
      { key: "title", kind: "text", label: "제목 (선택)", max: 120 },
      { key: "items", kind: "items", label: "항목", max: 12, titleLabel: "질문", bodyLabel: "답변" },
    ],
  },
  video: {
    label: "동영상", desc: "유튜브 또는 동영상 파일 주소", group: "콘텐츠", chrome: true,
    defaults: { url: "", title: "" },
    fields: [
      { key: "url", kind: "text", label: "동영상 주소", max: 500, placeholder: "https://www.youtube.com/watch?v=...", hint: "유튜브 주소 또는 .mp4 파일 주소" },
      { key: "title", kind: "text", label: "제목 (선택)", max: 120 },
    ],
  },
  spacer: {
    label: "여백", desc: "블록 사이 빈 공간", group: "레이아웃", chrome: false,
    defaults: { height: 48 },
    fields: [{ key: "height", kind: "select", label: "높이", options: [24, 48, 80, 120].map(n => ({ value: n, label: `${n}px` })) }],
  },
  divider: {
    label: "구분선", desc: "가로 선", group: "레이아웃", chrome: false,
    defaults: {}, fields: [],
  },
  html: {
    label: "코드 (HTML·JS)", desc: "직접 작성한 HTML·CSS·JavaScript", group: "고급", chrome: true,
    defaults: { code: "", height: 240 },
    fields: [
      { key: "code", kind: "code", label: "HTML · CSS · JavaScript", max: 20000, hint: "코드는 이 블록 안에서만 실행되어 쇼핑몰 화면을 깨뜨리지 않습니다" },
      { key: "height", kind: "number", label: "높이 (px)", min: 60, max: 1200 },
    ],
  },
};

export const BLOCK_GROUPS = ["쇼핑", "콘텐츠", "레이아웃", "고급"] as const;
export const MAX_BLOCKS = 30;

const newId = () => `b${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export const newBlock = (type: BlockType): HomeBlock => ({
  id: newId(), type, visible: true, device: "all", bg: "none", pad: "normal",
  s: JSON.parse(JSON.stringify(BLOCK_TYPES[type].defaults)),
});

export const cloneBlock = (block: HomeBlock): HomeBlock => ({ ...JSON.parse(JSON.stringify(block)), id: newId() });

const oneOf = <T,>(value: unknown, allowed: readonly T[], fallback: T): T => (allowed.includes(value as T) ? (value as T) : fallback);

const normalizeSettings = (type: BlockType, raw: any): Record<string, any> => {
  const def = BLOCK_TYPES[type];
  const out: Record<string, any> = {};
  for (const f of def.fields) {
    const v = raw?.[f.key];
    const fallback = def.defaults[f.key];
    if (f.kind === "select") out[f.key] = oneOf(v, f.options.map(o => o.value), fallback);
    else if (f.kind === "number") out[f.key] = typeof v === "number" && Number.isFinite(v) ? Math.min(f.max, Math.max(f.min, Math.round(v))) : fallback;
    else if (f.kind === "items") {
      out[f.key] = (Array.isArray(v) ? v : fallback).slice(0, f.max).map((it: any) => ({
        title: typeof it?.title === "string" ? it.title.slice(0, 160) : "",
        body: typeof it?.body === "string" ? it.body.slice(0, 2000) : "",
      }));
    } else out[f.key] = typeof v === "string" ? v.slice(0, f.max) : fallback;
  }
  return out;
};

const normalizeBlock = (raw: any): HomeBlock | null => {
  if (!raw || typeof raw !== "object" || typeof raw.id !== "string" || !raw.id || !(raw.type in BLOCK_TYPES)) return null;
  const type = raw.type as BlockType;
  return {
    id: raw.id.slice(0, 40),
    type,
    visible: raw.visible !== false,
    device: oneOf(raw.device, ["all", "desktop", "mobile"] as const, "all"),
    bg: oneOf(raw.bg, ["none", "soft", "tint", "dark"] as const, "none"),
    pad: oneOf(raw.pad, ["small", "normal", "large"] as const, "normal"),
    s: normalizeSettings(type, raw.s),
  };
};

export const defaultBlocks = (): HomeBlock[] => [
  { ...newBlock("hero"), id: "hero" },
  { ...newBlock("products"), id: "featured" },
  { ...newBlock("consultation"), id: "consultation" },
];

// Rebuilds a valid block list. Designs saved before blocks existed stored a fixed list of
// three sections plus a few layout options, so those are converted instead of being lost.
export const normalizeBlocks = (home: any, legacyLayout: any): HomeBlock[] => {
  if (Array.isArray(home?.blocks)) {
    const seen = new Set<string>();
    const singles = new Set<BlockType>();
    return home.blocks.map(normalizeBlock).filter((b: HomeBlock | null): b is HomeBlock => {
      if (!b || seen.has(b.id)) return false;
      if (BLOCK_TYPES[b.type].single) { if (singles.has(b.type)) return false; singles.add(b.type); }
      seen.add(b.id);
      return true;
    }).slice(0, MAX_BLOCKS);
  }
  const base = defaultBlocks();
  const legacy: any[] = Array.isArray(home?.sections) ? home.sections : [];
  const ordered = [
    ...legacy.map(s => base.find(b => b.id === s?.id)).filter(Boolean) as HomeBlock[],
    ...base.filter(b => !legacy.some(s => s?.id === b.id)),
  ].filter((b, i, all) => all.indexOf(b) === i);
  return ordered.map(b => {
    const visible = legacy.find(s => s?.id === b.id)?.visible !== false;
    if (b.id === "hero") return { ...b, visible, s: normalizeSettings("hero", { height: legacyLayout?.heroHeight, interval: legacyLayout?.heroInterval }) };
    if (b.id === "featured") return { ...b, visible, s: normalizeSettings("products", { source: "featured", count: home?.featuredCount, columns: legacyLayout?.featuredColumns, title: legacyLayout?.featuredTitle, subtitle: legacyLayout?.featuredSubtitle }) };
    return { ...b, visible };
  });
};

const linkOk = (link: unknown) => {
  const v = String(link || "").trim();
  return !v || v.startsWith("/") || /^https?:\/\//.test(v);
};

// Returns the first block whose link field is not a usable address, for a publish-time warning.
export const findBadLink = (blocks: HomeBlock[]): HomeBlock | null =>
  blocks.find(b => BLOCK_TYPES[b.type].fields.some(f => f.kind === "link" && !linkOk(b.s[f.key]))) || null;

const blank = (...values: unknown[]) => values.every(v => !String(v ?? "").trim());

// A block with nothing to show yet (for example an image block before an image is chosen).
// The storefront skips these so they never leave an empty gap; the editor preview shows a placeholder.
export const isEmptyBlock = (b: HomeBlock): boolean => {
  const s = b.s;
  switch (b.type) {
    case "text": return blank(s.heading, s.body);
    case "image": return blank(s.image);
    case "imageText": return blank(s.image, s.heading, s.body);
    case "promo": return blank(s.heading, s.body, s.buttonLabel);
    case "cards": return blank(s.title) && !(s.items as BlockItem[]).some(it => !blank(it.title, it.body));
    case "accordion": return blank(s.title) && !(s.items as BlockItem[]).some(it => !blank(it.title));
    case "video": return !/^https?:\/\//.test(String(s.url || "").trim());
    case "html": return blank(s.code);
    case "products": return s.source === "category" && blank(s.category);
    default: return false;
  }
};

// Custom code runs in a sandboxed frame: scripts work, but cannot read or change the store page.
export const SANDBOX = "allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation";
export const sandboxDoc = (html: string) =>
  `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><base target="_top"><style>html,body{margin:0;padding:0;font-family:system-ui,-apple-system,"Noto Sans KR",sans-serif}img{max-width:100%}</style></head><body>${html}</body></html>`;

export const DESIGN_FOCUS_MESSAGE = "design-focus"; // editor -> preview: scroll to a block
export const DESIGN_SELECT_MESSAGE = "design-select"; // preview -> editor: open a block's settings
