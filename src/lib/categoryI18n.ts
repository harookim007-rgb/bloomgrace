// Maps category slugs (stored in DB in Korean) to i18n translation keys.
// Falls back to the raw DB name when slug is unknown.
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
  category: { slug?: string | null; name?: string | null } | null | undefined,
  t: (key: string) => string,
): string => {
  if (!category) return "";
  const key = category.slug ? SLUG_KEY[category.slug] : undefined;
  if (key) {
    const translated = t(key);
    if (translated && translated !== key) return translated;
  }
  return category.name || "";
};
