import { useMemo, useSyncExternalStore } from "react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { designDraft, normalizeDesign, type SiteDesign } from "@/lib/design";

// The design visitors see: the published one, or the editor's unsaved draft inside its preview frame.
export const useDesign = (): SiteDesign => {
  const { design } = useSiteSettings();
  const draft = useSyncExternalStore(designDraft.subscribe, designDraft.get);
  const published = useMemo(() => normalizeDesign(design), [design]);
  return draft ?? published;
};
