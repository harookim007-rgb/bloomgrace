import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type SiteSettings = {
  maintenanceMode: boolean;
  allowReviews: boolean;
  allowWishlist: boolean;
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
  googleAnalyticsId: string;
  // Seller details shown in the store footer.
  businessName: string;
  representative: string;
  businessNumber: string;
  businessAddress: string;
  mailOrderNumber: string; // 통신판매업 신고번호
  design?: unknown;
  faq?: unknown; // see src/lib/faq.ts
};

export const defaultSiteSettings: SiteSettings = {
  maintenanceMode: false,
  allowReviews: true,
  allowWishlist: true,
  metaTitle: "",
  metaDescription: "",
  ogImage: "",
  googleAnalyticsId: "",
  businessName: "",
  representative: "",
  businessNumber: "",
  businessAddress: "",
  mailOrderNumber: "",
};

export const SITE_SETTINGS_KEY = ["site-settings"];

export const fetchSiteSettings = async (): Promise<SiteSettings> => {
  const { data } = await supabase.from("site_settings").select("settings").eq("id", "default").maybeSingle();
  return { ...defaultSiteSettings, ...((data?.settings as Partial<SiteSettings>) || {}) };
};

// Falls back to the defaults while loading or if the settings cannot be read.
export const useSiteSettings = (): SiteSettings => {
  const { data } = useQuery({ queryKey: SITE_SETTINGS_KEY, queryFn: fetchSiteSettings, staleTime: 60_000 });
  return data ?? defaultSiteSettings;
};
