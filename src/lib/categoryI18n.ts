// Maps category slugs (stored in DB in Korean) to i18n translation keys.
// Categories without a known slug use the translations saved by the admin screen,
// and fall back to the raw DB name when neither exists.
const SLUG_KEY: Record<string, string> = {
  skincare: "nav_skincare",
  makeup: "nav_makeup",
  haircare: "nav_haircare",
  fragrance: "nav_fragrance",
  bodycare: "nav_bodycare",
  health: "nav_health",
  tools: "nav_tools",
};

export const localizeCategory = (
  category: { slug?: string | null; name?: string | null; translations?: unknown } | null | undefined,
  t: (key: string) => string,
  language?: string,
): string => {
  if (!category) return "";
  const key = category.slug ? SLUG_KEY[category.slug] : undefined;
  if (key) {
    const translated = t(key);
    if (translated && translated !== key) return translated;
  }
  const saved = language ? (category.translations as Record<string, string> | null)?.[language] : undefined;
  if (typeof saved === "string" && saved.trim()) return saved;
  return category.name || "";
};
