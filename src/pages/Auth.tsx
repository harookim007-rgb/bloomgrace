import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import BrandLogo from "@/components/BrandLogo";
import { Loader2 } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";
  const { user } = useAuth();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);

  // If already signed in, route to profile completion or destination.
  useEffect(() => {
    const route = async () => {
      if (!user) return;
      const { data: addr } = await supabase
        .from("addresses")
        .select("id")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();
      navigate(addr ? redirectTo : "/complete-profile", { replace: true });
    };
    route();
  }, [user, navigate, redirectTo]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin + "/auth",
      });
      if (result.error) toast.error(result.error.message || t("auth_login_fail"));
    } catch (err: any) {
      toast.error(err.message || t("auth_login_fail"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-dvh">
      <Navigation />
      <section className="py-16 md:py-24 px-4 flex items-center justify-center min-h-[70dvh]">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-3 flex flex-col items-center">
            <BrandLogo size="lg" showTagline={true} asLink={false} />
            <p className="text-base text-foreground/70 font-medium pt-2">{t("auth_subtitle")}</p>
          </div>

          <div className="space-y-5 border border-border/60 p-6 md:p-8 bg-background/80 backdrop-blur-sm">
            <Button
              type="button"
              variant="outline"
              className="w-full rounded-none py-6 text-sm font-semibold tracking-wide flex items-center justify-center gap-3 border-border hover:bg-muted/50"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <GoogleIcon />}
              {t("auth_google_signin")}
            </Button>
            <p className="text-xs text-center text-muted-foreground leading-relaxed">
              {t("auth_terms_agree")}
            </p>
          </div>

          <div className="border border-border/50 p-5 space-y-3 bg-muted/30">
            <p className="text-xs font-bold tracking-wider uppercase text-center text-foreground">
              {t("auth_benefits_title")}
            </p>
            <ul className="space-y-2 text-xs text-foreground/70">
              <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-primary" />{t("auth_benefit_1")}</li>
              <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-primary" />{t("auth_benefit_2")}</li>
              <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-primary" />{t("auth_benefit_3")}</li>
            </ul>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export default Auth;
