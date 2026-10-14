// Beauty consultation matching. Admins tag each product (상품 등록 > 뷰티 상담 추천) with the
// concerns it suits and, for skincare, its product type; the consultation recommends the
// products tagged for the concern the visitor picks. IDs must match BeautyConsultation's options.

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

// Skincare product types, matching the consultation's "product type" step (except "All").
export const SKIN_PRODUCT_TYPES = [
  { id: "Toner", label: "토너" }, { id: "Ample", label: "앰플·세럼" }, { id: "Lotion", label: "로션" },
  { id: "Cream", label: "크림" }, { id: "Pack", label: "팩·마스크" },
] as const;

// Order the types are used in a routine.
const ROUTINE_ORDER = SKIN_PRODUCT_TYPES.map(t => t.id) as string[];

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
  categories: { id: string; slug: string }[],
  category: string,
  concern: string,
  productType: string | null,
  limit = 4,
): ConsultMatch<P>[] => {
  const available = products.filter(p => Number(p.stock ?? 1) > 0);
  const typeOf = (p: P) => ROUTINE_ORDER.find(t => (p.consult_tags || []).includes(t)) || null;
  let tagged = available.filter(p => (p.consult_tags || []).includes(concern));
  if (productType && productType !== "All") {
    const ofType = tagged.filter(p => (p.consult_tags || []).includes(productType));
    if (ofType.length > 0) tagged = ofType;
  }
  const picked: ConsultMatch<P>[] = [...tagged].sort(rank).slice(0, limit).map(p => ({ product: p, type: typeOf(p), exact: true }));
  if (picked.length < limit) {
    const ids = new Set(categories.filter(c => (FALLBACK_SLUGS[category] || []).includes(c.slug)).map(c => c.id));
    const extra = available
      .filter(p => !picked.some(m => m.product.id === p.id) && p.category_id && ids.has(p.category_id))
      .sort(rank)
      .slice(0, limit - picked.length)
      .map(p => ({ product: p, type: typeOf(p), exact: false }));
    picked.push(...extra);
  }
  // Skincare results are listed in the order they are used.
  if (category === "Skin") picked.sort((a, b) => (a.type ? ROUTINE_ORDER.indexOf(a.type) : 99) - (b.type ? ROUTINE_ORDER.indexOf(b.type) : 99));
  return picked;
};
