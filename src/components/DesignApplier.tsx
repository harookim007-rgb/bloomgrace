import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useDesign } from "@/hooks/useDesign";
import {
  applyDesign, clearDesign, designDraft, normalizeDesign, DESIGN_DRAFT_MESSAGE, DESIGN_READY_MESSAGE,
} from "@/lib/design";

const ADMIN_FONT_ID = "admin-font";

// Applies the storefront design to every non-admin page, and inside the design editor's
// preview frame keeps it in sync with the editor's unsaved draft.
const DesignApplier = () => {
  const { pathname } = useLocation();
  const design = useDesign();
  const isAdminPage = pathname.startsWith("/admin");

  useEffect(() => {
    if (isAdminPage) clearDesign(); else applyDesign(design);
  }, [design, isAdminPage]);

  // Admin pages get their own theme and UI font instead of the storefront's.
  useEffect(() => {
    document.documentElement.classList.toggle("admin-theme", isAdminPage);
    if (isAdminPage && !document.getElementById(ADMIN_FONT_ID)) {
      const link = document.createElement("link");
      link.id = ADMIN_FONT_ID;
      link.rel = "stylesheet";
      link.href = "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css";
      document.head.appendChild(link);
    }
  }, [isAdminPage]);

  useEffect(() => {
    if (window.parent === window) return;
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.data?.type !== DESIGN_DRAFT_MESSAGE) return;
      designDraft.set(normalizeDesign(e.data.design));
    };
    window.addEventListener("message", onMessage);
    window.parent.postMessage({ type: DESIGN_READY_MESSAGE }, window.location.origin);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return null;
};

export default DesignApplier;
