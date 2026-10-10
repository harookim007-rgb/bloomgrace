import { supabase } from "@/integrations/supabase/client";

// Translates a short admin-entered label (menu, category) into every storefront language.
// Returns null when the translation service fails so callers can warn the admin.
export const translateLabel = async (text: string): Promise<Record<string, string> | null> => {
  try {
    const { data } = await supabase.functions.invoke("translate-banner", { body: { title: text, subtitle: "" } });
    const out: Record<string, string> = {};
    for (const [lang, v] of Object.entries((data?.translations || {}) as Record<string, { title?: string }>)) {
      if (v?.title) out[lang] = v.title;
    }
    return Object.keys(out).length > 0 ? out : null;
  } catch (e) {
    console.warn("translateLabel failed", e);
    return null;
  }
};
