import { useEffect, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage, type Language } from "@/contexts/LanguageContext";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import BrandLogo from "@/components/BrandLogo";

const maintenanceText: Record<Language, { title: string; desc: string }> = {
  en: { title: "We'll be back soon", desc: "Our store is undergoing scheduled maintenance. Please check back shortly." },
  es: { title: "Volvemos pronto", desc: "Nuestra tienda está en mantenimiento programado. Vuelve en unos minutos." },
  de: { title: "Wir sind bald zurück", desc: "Unser Shop wird gerade gewartet. Bitte schauen Sie in Kürze wieder vorbei." },
  fr: { title: "Nous revenons bientôt", desc: "Notre boutique est en maintenance programmée. Merci de revenir dans quelques instants." },
  pt: { title: "Voltamos em breve", desc: "Nossa loja está em manutenção programada. Volte em instantes." },
  ja: { title: "まもなく再開します", desc: "ただいまメンテナンス中です。しばらくしてからもう一度お越しください。" },
  ar: { title: "سنعود قريباً", desc: "متجرنا يخضع لصيانة مجدولة. يرجى العودة بعد قليل." },
};

// Applies the admin "사이트 설정" values that affect the whole site: maintenance mode and Google Analytics.
const SiteGate = ({ children }: { children: ReactNode }) => {
  const { pathname } = useLocation();
  const { isAdmin, isLoading } = useAuth();
  const { language } = useLanguage();
  const { maintenanceMode, googleAnalyticsId } = useSiteSettings();

  useEffect(() => {
    if (!/^G-[A-Z0-9]+$/i.test(googleAnalyticsId) || document.getElementById("ga-script")) return;
    const script = document.createElement("script");
    script.id = "ga-script";
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`;
    document.head.appendChild(script);
    const w = window as any;
    w.dataLayer = w.dataLayer || [];
    w.gtag = function () { w.dataLayer.push(arguments); };
    w.gtag("js", new Date());
    w.gtag("config", googleAnalyticsId);
  }, [googleAnalyticsId]);

  // Admins keep full access, and the sign-in page stays reachable so they can log in.
  const exempt = pathname.startsWith("/admin") || pathname.startsWith("/auth");
  if (maintenanceMode && !exempt && !isAdmin) {
    if (isLoading) return null;
    const text = maintenanceText[language] || maintenanceText.en;
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-6 px-6 text-center bg-background">
        <BrandLogo size="lg" asLink={false} />
        <h1 className="text-2xl md:text-3xl font-serif">{text.title}</h1>
        <p className="text-sm md:text-base text-muted-foreground max-w-md">{text.desc}</p>
      </div>
    );
  }

  return <>{children}</>;
};

export default SiteGate;
