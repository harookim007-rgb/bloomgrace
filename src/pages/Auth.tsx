import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Separator } from "@/components/ui/separator";

const Auth = () => {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({ email: "", password: "", confirmPassword: "", displayName: "", phone: "" });
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signIn(loginForm.email, loginForm.password);
      toast.success(t("auth_login_success"));
      navigate("/");
    } catch (err: any) {
      toast.error(err.message || t("auth_login_fail"));
    } finally { setIsLoading(false); }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupForm.password !== signupForm.confirmPassword) {
      toast.error(t("auth_password_mismatch"));
      return;
    }
    if (!agreeTerms) {
      toast.error(t("auth_agree_required"));
      return;
    }
    setIsLoading(true);
    try {
      await signUp(signupForm.email, signupForm.password, signupForm.displayName);
      toast.success(t("auth_signup_success"));
      navigate("/complete-profile");
    } catch (err: any) {
      toast.error(err.message || t("auth_signup_fail"));
    } finally { setIsLoading(false); }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error(result.error.message || t("auth_login_fail"));
      }
    } catch (err: any) {
      toast.error(err.message || t("auth_login_fail"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      <section className="py-16 md:py-24 px-4 flex items-center justify-center min-h-[70dvh]">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center space-y-3">
            <h1 className="text-3xl md:text-4xl font-serif font-light">{t("auth_title")}</h1>
            <p className="text-sm text-muted-foreground font-light">{t("auth_subtitle")}</p>
          </div>

          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2 mb-8 rounded-none bg-muted/50">
              <TabsTrigger value="login" className="rounded-none text-xs tracking-wider uppercase">{t("auth_login")}</TabsTrigger>
              <TabsTrigger value="signup" className="rounded-none text-xs tracking-wider uppercase">{t("auth_signup")}</TabsTrigger>
            </TabsList>

            {/* LOGIN TAB */}
            <TabsContent value="login">
              <div className="space-y-6">
                {/* Google Sign In */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full rounded-none py-6 text-sm tracking-wide flex items-center justify-center gap-3 border-border hover:bg-muted/50"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  {t("auth_google_signin")}
                </Button>

                <div className="relative">
                  <Separator />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-4 text-xs text-muted-foreground tracking-wider uppercase">
                    {t("auth_or")}
                  </span>
                </div>

                {/* Email Login */}
                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-xs tracking-wider uppercase">{t("auth_email")}</Label>
                    <Input type="email" placeholder={t("auth_email_placeholder")} value={loginForm.email} className="rounded-none border-border"
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs tracking-wider uppercase">{t("auth_password")}</Label>
                    <Input type="password" placeholder={t("auth_password_placeholder")} value={loginForm.password} className="rounded-none border-border"
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} required />
                  </div>
                  <Button type="submit" className="w-full rounded-none py-6 text-xs tracking-[0.15em] uppercase" disabled={isLoading}>
                    {isLoading ? t("auth_logging_in") : t("auth_login")}
                  </Button>
                </form>
              </div>
            </TabsContent>

            {/* SIGNUP TAB */}
            <TabsContent value="signup">
              <div className="space-y-6">
                {/* Google Sign Up */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full rounded-none py-6 text-sm tracking-wide flex items-center justify-center gap-3 border-border hover:bg-muted/50"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  {t("auth_google_signup")}
                </Button>

                <div className="relative">
                  <Separator />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-4 text-xs text-muted-foreground tracking-wider uppercase">
                    {t("auth_or")}
                  </span>
                </div>

                {/* Email Signup */}
                <form onSubmit={handleSignup} className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-xs tracking-wider uppercase">{t("auth_name")}</Label>
                    <Input placeholder={t("auth_name_placeholder")} value={signupForm.displayName} className="rounded-none border-border"
                      onChange={(e) => setSignupForm({ ...signupForm, displayName: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs tracking-wider uppercase">{t("auth_email")}</Label>
                    <Input type="email" placeholder={t("auth_email_placeholder")} value={signupForm.email} className="rounded-none border-border"
                      onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs tracking-wider uppercase">{t("auth_phone")}</Label>
                    <Input type="tel" placeholder={t("auth_phone_placeholder")} value={signupForm.phone} className="rounded-none border-border"
                      onChange={(e) => setSignupForm({ ...signupForm, phone: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs tracking-wider uppercase">{t("auth_password")}</Label>
                    <Input type="password" placeholder={t("auth_password_placeholder")} value={signupForm.password} className="rounded-none border-border"
                      onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })} required minLength={6} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs tracking-wider uppercase">{t("auth_confirm_password")}</Label>
                    <Input type="password" placeholder={t("auth_confirm_password_placeholder")} value={signupForm.confirmPassword} className="rounded-none border-border"
                      onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })} required minLength={6} />
                  </div>

                  {/* Terms */}
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded-none border-border" />
                    <span className="text-xs text-muted-foreground leading-relaxed">{t("auth_terms_agree")}</span>
                  </label>

                  <Button type="submit" className="w-full rounded-none py-6 text-xs tracking-[0.15em] uppercase" disabled={isLoading || !agreeTerms}>
                    {isLoading ? t("auth_signing_up") : t("auth_signup")}
                  </Button>
                </form>
              </div>
            </TabsContent>
          </Tabs>

          {/* Signup benefits */}
          <div className="border border-border/50 p-5 space-y-3 bg-muted/30">
            <p className="text-xs font-medium tracking-wider uppercase text-center">{t("auth_benefits_title")}</p>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-primary" />
                {t("auth_benefit_1")}
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-primary" />
                {t("auth_benefit_2")}
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-primary" />
                {t("auth_benefit_3")}
              </li>
            </ul>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Auth;
