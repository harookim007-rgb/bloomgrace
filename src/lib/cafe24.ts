import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Cafe24Settings {
  id?: string;
  is_enabled: boolean;
  mall_url: string;
  join_url: string;
  login_url: string;
  cart_url: string;
  show_join_prompt: boolean;
  updated_at?: string;
}

export const DEFAULT_CAFE24: Cafe24Settings = {
  is_enabled: false,
  mall_url: "",
  join_url: "",
  login_url: "",
  cart_url: "",
  show_join_prompt: true,
};

let cache: Cafe24Settings | null = null;
let pending: Promise<Cafe24Settings> | null = null;

/** Reads the single Cafe24 config row once and keeps it in memory. */
export const loadCafe24Settings = (force = false): Promise<Cafe24Settings> => {
  if (cache && !force) return Promise.resolve(cache);
  if (pending) return pending;
  pending = (async (): Promise<Cafe24Settings> => {
    try {
      const { data, error } = await supabase
        .from("cafe24_settings")
        .select("*")
        .maybeSingle();
      const next: Cafe24Settings =
        !error && data ? { ...DEFAULT_CAFE24, ...(data as object) } : { ...DEFAULT_CAFE24 };
      cache = next;
      return next;
    } catch {
      return { ...DEFAULT_CAFE24 };
    } finally {
      pending = null;
    }
  })();
  return pending;
};

export const useCafe24Settings = () => {
  const [settings, setSettings] = useState<Cafe24Settings | null>(cache);
  useEffect(() => {
    let alive = true;
    loadCafe24Settings().then((s) => {
      if (alive) setSettings(s);
    });
    return () => {
      alive = false;
    };
  }, []);
  return settings;
};

export const cafe24BuyUrlOf = (product: any): string =>
  String(product?.cafe24_buy_url || "").trim();

/** True when this product can be handed off to the Cafe24 order form. */
export const isCafe24Checkout = (settings: Cafe24Settings | null | undefined, product: any) =>
  !!settings?.is_enabled && !!cafe24BuyUrlOf(product);

const trim = (u: string) => u.replace(/\/+$/, "");

export const cafe24JoinUrl = (s: Cafe24Settings) =>
  (s.join_url || "").trim() || (s.mall_url ? `${trim(s.mall_url)}/member/join.html` : "");

export const cafe24LoginUrl = (s: Cafe24Settings) =>
  (s.login_url || "").trim() || (s.mall_url ? `${trim(s.mall_url)}/member/login.html` : "");

export const cafe24CartUrl = (s: Cafe24Settings) =>
  (s.cart_url || "").trim() || (s.mall_url ? `${trim(s.mall_url)}/cart` : "");

export const CAFE24_HANDOFF_EVENT = "open-cafe24-handoff";

export interface Cafe24HandoffRequest {
  buyUrl: string;
  productName?: string;
  quantity?: number;
}

/** Opens the global "join or continue" checkout dialog. */
export const startCafe24Checkout = (req: Cafe24HandoffRequest) => {
  window.dispatchEvent(new CustomEvent(CAFE24_HANDOFF_EVENT, { detail: req }));
};

/** Opens a URL in a new tab; falls back to same-tab when the browser blocks the popup. */
export const openInTab = (url: string) => {
  if (!url) return;
  let w: Window | null = null;
  try {
    // No "noopener" feature here on purpose: with it the browser always returns null,
    // which would make us think the popup was blocked and navigate the storefront away.
    w = window.open(url, "_blank");
  } catch {
    w = null;
  }
  if (w) {
    // Detach so the opened page cannot reach back into this window.
    try {
      w.opener = null;
    } catch {
      /* cross-origin already detached */
    }
  } else {
    window.location.href = url;
  }
};
