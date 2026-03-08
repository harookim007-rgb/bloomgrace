import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const Auth = () => {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({ email: "", password: "", displayName: "" });

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
    setIsLoading(true);
    try {
      await signUp(signupForm.email, signupForm.password, signupForm.displayName);
      toast.success(t("auth_signup_success"));
      navigate("/");
    } catch (err: any) {
      toast.error(err.message || t("auth_signup_fail"));
    } finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      <section className="py-16 md:py-24 px-4 flex items-center justify-center min-h-[70vh]">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-3">
            <h1 className="text-3xl md:text-4xl font-serif font-light">{t("auth_title")}</h1>
            <p className="text-sm text-muted-foreground font-light">{t("auth_subtitle")}</p>
          </div>

          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2 mb-8 rounded-none bg-muted/50">
              <TabsTrigger value="login" className="rounded-none text-xs tracking-wider uppercase">{t("auth_login")}</TabsTrigger>
              <TabsTrigger value="signup" className="rounded-none text-xs tracking-wider uppercase">{t("auth_signup")}</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-xs tracking-wider uppercase">{t("auth_email")}</Label>
                  <Input type="email" value={loginForm.email} className="rounded-none border-border"
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs tracking-wider uppercase">{t("auth_password")}</Label>
                  <Input type="password" value={loginForm.password} className="rounded-none border-border"
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} required />
                </div>
                <Button type="submit" className="w-full rounded-none py-6 text-xs tracking-[0.15em] uppercase" disabled={isLoading}>
                  {isLoading ? t("auth_logging_in") : t("auth_login")}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-xs tracking-wider uppercase">{t("auth_name")}</Label>
                  <Input value={signupForm.displayName} className="rounded-none border-border"
                    onChange={(e) => setSignupForm({ ...signupForm, displayName: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs tracking-wider uppercase">{t("auth_email")}</Label>
                  <Input type="email" value={signupForm.email} className="rounded-none border-border"
                    onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs tracking-wider uppercase">{t("auth_password")}</Label>
                  <Input type="password" value={signupForm.password} className="rounded-none border-border"
                    onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })} required minLength={6} />
                </div>
                <Button type="submit" className="w-full rounded-none py-6 text-xs tracking-[0.15em] uppercase" disabled={isLoading}>
                  {isLoading ? t("auth_signing_up") : t("auth_signup")}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Auth;
