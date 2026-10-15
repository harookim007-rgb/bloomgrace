// Beauty consultation matching. Admins tag each product (상품 등록 > 뷰티 상담 추천) with the
// concerns it suits; the consultation recommends the products tagged for the concern the visitor
// picks. A skincare product's routine step is its subcategory (스킨/토너, 에센스/세럼/앰플, ...).
// IDs must match BeautyConsultation's options and the category slugs.

export const CONSULT_GROUPS = [
  {
    category: "Skin", label: "스킨케어 고민",
    tags: [
      { id: "oily", label: "지성" }, { id: "dry", label: "건성" }, { id: "combination", label: "복합성" },
      { id: "sensitive", label: "민감성" }, { id: "acne", label: "트러블·여드름" }, { id: "aging", label: "주름·탄력" },
    ],
  },
  {
    category: "Body", label: "바디 고민",
    tags: [
      { id: "body_dry", label: "바디 건조" }, { id: "body_acne", label: "바디 트러블" },
      { id: "body_firming", label: "바디 탄력" }, { id: "body_moisture", label: "바디 보습" },
    ],
  },
  {
    category: "Hair", label: "헤어·두피 고민",
    tags: [
      { id: "hair_dandruff", label: "비듬·두피" }, { id: "hair_dry", label: "건조 모발" }, { id: "hair_oily", label: "지성 두피" },
      { id: "hair_damaged", label: "손상 모발" }, { id: "hair_loss", label: "탈모" },
    ],
  },
] as const;

// Skincare subcategory slugs (the "product type" choices in the consultation).
export const SKIN_STEPS = ["skin-toner", "essence-serum", "cream", "mist-oil", "mask-pack"] as const;
const ROUTINE_ORDER: string[] = [...SKIN_STEPS];

// Owner's routine: first step (mist/oil, or skin/toner when there is no mist/oil) → mask pack
// → essence/serum/ampoule → cream. Mist/oil takes the toner's place, so when both are present
// only the mist/oil is recommended for that step.
const STEP_POSITION: Record<string, number> = { "mist-oil": 0, "skin-toner": 0, "mask-pack": 1, "essence-serum": 2, cream: 3 };
const routineOrder = <M extends { type: string | null }>(matches: M[]): M[] => {
  const hasMist = matches.some(m => m.type === "mist-oil");
  return matches
    .filter(m => !(hasMist && m.type === "skin-toner"))
    .sort((a, b) => (a.type ? STEP_POSITION[a.type] ?? 9 : 9) - (b.type ? STEP_POSITION[b.type] ?? 9 : 9));
};
// Product types chosen before subcategories existed.
const LEGACY_TYPES: Record<string, string> = { Toner: "skin-toner", Ample: "essence-serum", Lotion: "essence-serum", Cream: "cream", Pack: "mask-pack" };

// Shop category slugs used when no product is tagged for the chosen concern yet.
const FALLBACK_SLUGS: Record<string, string[]> = { Skin: ["skincare"], Body: ["bodycare"], Hair: ["haircare"] };

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
 * Picks up to `limit` products for a concern. Products tagged with the concern come first;
 * for skincare a chosen product type narrows them further. When nothing is tagged yet,
 * products from the matching shop category are used so the visitor still gets suggestions.
 */
export const recommendProducts = <P extends Product>(
  products: P[],
  categories: { id: string; slug: string; parent_id?: string | null }[],
  category: string,
  concern: string,
  productType: string | null,
  limit = 4,
): ConsultMatch<P>[] => {
  const available = products.filter(p => Number(p.stock ?? 1) > 0);
  const slugOf = (id?: string | null) => categories.find(c => c.id === id)?.slug;
  const typeOf = (p: P) => {
    const slug = slugOf(p.category_id);
    if (slug && ROUTINE_ORDER.includes(slug)) return slug;
    const legacy = (p.consult_tags || []).find(t => LEGACY_TYPES[t]);
    return legacy ? LEGACY_TYPES[legacy] : null;
  };
  let tagged = available.filter(p => (p.consult_tags || []).includes(concern));
  if (productType && productType !== "All") {
    const ofType = tagged.filter(p => typeOf(p) === productType);
    if (ofType.length > 0) tagged = ofType;
  }
  // Skincare follows the routine rules (which may leave out a toner), then is cut to the limit.
  const ordered = [...tagged].sort(rank).map(p => ({ product: p, type: typeOf(p), exact: true }));
  const picked: ConsultMatch<P>[] = (category === "Skin" ? routineOrder(ordered) : ordered).slice(0, limit);
  if (picked.length < limit) {
    const tops = categories.filter(c => (FALLBACK_SLUGS[category] || []).includes(c.slug)).map(c => c.id);
    const ids = new Set([...tops, ...categories.filter(c => c.parent_id && tops.includes(c.parent_id)).map(c => c.id)]);
    const extra = available
      .filter(p => !picked.some(m => m.product.id === p.id) && p.category_id && ids.has(p.category_id))
      .sort(rank)
      .slice(0, limit - picked.length)
      .map(p => ({ product: p, type: typeOf(p), exact: false }));
    picked.push(...extra);
  }
  // Skincare results are listed in the order they are used.
  return category === "Skin" ? routineOrder(picked) : picked;
};
