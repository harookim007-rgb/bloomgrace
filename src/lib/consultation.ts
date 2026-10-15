// Beauty consultation matching. Admins tag each product (상품 편집 > 뷰티 상담 추천) with the
// skin types and hair answers it suits; the consultation recommends the products
// tagged for the visitor's answer. A product's step in a routine is its subcategory
// (e.g. 스킨/토너, 베이스 메이크업). Tag IDs must match src/lib/consultationData.ts.

export const CONSULT_GROUPS = [
  {
    category: "Skin", label: "피부 타입",
    tags: [
      { id: "extremely_dry", label: "극건성" }, { id: "dry", label: "건성" }, { id: "normal", label: "중성" },
      { id: "oily", label: "지성" }, { id: "combination", label: "복합성" }, { id: "sensitive", label: "민감성" },
      { id: "dehydrated_oily", label: "수부지" }, { id: "acne_prone", label: "트러블성" },
    ],
  },
  {
    category: "Hair", label: "두피 타입",
    tags: [
      { id: "oily_scalp", label: "지성" }, { id: "dry_scalp", label: "건성" }, { id: "normal_scalp", label: "중성" },
      { id: "sensitive_scalp", label: "민감성" }, { id: "combination_scalp", label: "복합성" },
    ],
  },
  {
    category: "Hair", label: "모발 타입",
    tags: [
      { id: "straight", label: "직모" }, { id: "wavy", label: "웨이브" }, { id: "curly", label: "곱슬" },
      { id: "coily", label: "강한 곱슬" }, { id: "fine", label: "가는 모발" }, { id: "thick", label: "굵은 모발" },
    ],
  },
  {
    category: "Hair", label: "헤어 고민",
    tags: [
      { id: "damage", label: "손상" }, { id: "frizz", label: "부스스함" }, { id: "volume", label: "볼륨 부족" },
      { id: "dandruff", label: "비듬" }, { id: "hair_loss", label: "탈모" }, { id: "color_care", label: "염색 모발" },
    ],
  },
  {
    category: "Hair", label: "원하는 결과",
    tags: [
      { id: "smooth", label: "매끄러움" }, { id: "voluminous", label: "볼륨" }, { id: "defined_curls", label: "또렷한 컬" },
      { id: "natural_styling", label: "자연스러운 스타일링" },
    ],
  },
] as const;

// Skincare subcategory slugs (kept for the shop's category structure).
export const SKIN_STEPS = ["skin-toner", "essence-serum", "cream", "mist-oil", "mask-pack"] as const;
export const MAKEUP_STEPS = ["base-makeup", "eye-makeup", "lip-makeup", "cheek-face"] as const;

// Tags saved before the consultation was redesigned.
const ALIASES: Record<string, string[]> = {
  acne_prone: ["acne"], oily_scalp: ["hair_oily"], dry_scalp: ["hair_dry"],
};

/**
 * Hair: products in the chosen Hair Care subcategory, best first by how many of the visitor's
 * answers (scalp type, hair type, concern, desired result) the product is tagged with.
 * Without a tagged match, the subcategory's and then Hair Care's other products fill in.
 */
export const recommendHair = <P extends Product>(
  products: P[],
  categories: { id: string; slug: string; parent_id?: string | null }[],
  productSlug: string,
  answers: string[],
  limit = 4,
): ConsultMatch<P>[] => {
  const available = products.filter(p => Number(p.stock ?? 1) > 0);
  const sub = categories.find(c => c.slug === productSlug);
  const hair = categories.find(c => c.slug === "haircare");
  const inSub = (p: P) => !!sub && p.category_id === sub.id;
  const inHair = (p: P) => !!hair && (p.category_id === hair.id || categories.some(c => c.id === p.category_id && c.parent_id === hair.id));
  const score = (p: P) => answers.filter(a => (p.consult_tags || []).includes(a) || (ALIASES[a] || []).some(x => (p.consult_tags || []).includes(x))).length;
  const pick = (list: P[], exact: boolean) => list.sort((a, b) => score(b) - score(a) || rank(a, b)).map(p => ({ product: p, type: productSlug, exact }));
  const picked = pick(available.filter(p => inSub(p) && score(p) > 0), true).slice(0, limit);
  for (const pool of [available.filter(inSub), available.filter(inHair)]) {
    if (picked.length >= limit) break;
    picked.push(...pick(pool.filter(p => !picked.some(m => m.product.id === p.id)), false).slice(0, limit - picked.length));
  }
  return picked;
};

// Shop category slugs used when no product is tagged for the answer yet.
const FALLBACK_SLUGS: Record<string, string[]> = { Skin: ["skincare"], Makeup: ["makeup"], Hair: ["haircare"] };

// Owner's skincare routine: first step (mist/oil, or skin/toner when there is no mist/oil) → mask pack
// → essence/serum/ampoule → cream. Mist/oil takes the toner's place, so when both are present only
// the mist/oil is recommended for that step. Makeup goes base → eye → lip → cheek & face.
const STEP_POSITION: Record<string, number> = {
  "mist-oil": 0, "skin-toner": 0, "mask-pack": 1, "essence-serum": 2, cream: 3,
  "base-makeup": 0, "eye-makeup": 1, "lip-makeup": 2, "cheek-face": 3,
};
const routineOrder = <M extends { type: string | null }>(matches: M[], skin: boolean): M[] => {
  const hasMist = skin && matches.some(m => m.type === "mist-oil");
  return matches
    .filter(m => !(hasMist && m.type === "skin-toner"))
    .sort((a, b) => (a.type ? STEP_POSITION[a.type] ?? 9 : 9) - (b.type ? STEP_POSITION[b.type] ?? 9 : 9));
};

type Product = {
  id: string; is_featured?: boolean; rating?: number | null; review_count?: number | null;
  consult_tags?: string[] | null; category_id?: string | null; stock?: number | null;
};

export type ConsultMatch<P> = { product: P; type: string | null; exact: boolean };

const rank = (a: Product, b: Product) =>
  Number(!!b.is_featured) - Number(!!a.is_featured) ||
  Number(b.rating || 0) - Number(a.rating || 0) ||
  Number(b.review_count || 0) - Number(a.review_count || 0);

/**
 * Picks up to `limit` products for an answer (skin type, makeup look or scalp type). Products tagged
 * with it come first, in routine order for skin and makeup. When nothing is tagged yet, products from
 * the matching shop category are used so the visitor still gets suggestions.
 */
export const recommendProducts = <P extends Product>(
  products: P[],
  categories: { id: string; slug: string; parent_id?: string | null }[],
  category: "Skin" | "Makeup" | "Hair",
  answer: string,
  limit = 4,
): ConsultMatch<P>[] => {
  const available = products.filter(p => Number(p.stock ?? 1) > 0);
  const typeOf = (p: P) => {
    const slug = categories.find(c => c.id === p.category_id)?.slug;
    return slug && slug in STEP_POSITION ? slug : null;
  };
  const accepted = [answer, ...(ALIASES[answer] || [])];
  const ordered = available
    .filter(p => (p.consult_tags || []).some(t => accepted.includes(t)))
    .sort(rank)
    .map(p => ({ product: p, type: typeOf(p), exact: true }));
  const picked: ConsultMatch<P>[] = (category === "Hair" ? ordered : routineOrder(ordered, category === "Skin")).slice(0, limit);
  if (picked.length < limit) {
    const tops = categories.filter(c => (FALLBACK_SLUGS[category] || []).includes(c.slug)).map(c => c.id);
    const ids = new Set([...tops, ...categories.filter(c => c.parent_id && tops.includes(c.parent_id)).map(c => c.id)]);
    picked.push(...available
      .filter(p => !picked.some(m => m.product.id === p.id) && p.category_id && ids.has(p.category_id))
      .sort(rank)
      .slice(0, limit - picked.length)
      .map(p => ({ product: p, type: typeOf(p), exact: false })));
  }
  return category === "Hair" ? picked : routineOrder(picked, category === "Skin");
};
