import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
      <section className="py-16 px-4 flex items-center justify-center min-h-[80vh]">
        <Card className="w-full max-w-md shadow-elegant border-border/50">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-serif">🌸 {t("auth_title")}</CardTitle>
            <CardDescription>{t("auth_subtitle")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">{t("auth_login")}</TabsTrigger>
                <TabsTrigger value="signup">{t("auth_signup")}</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">{t("auth_email")}</Label>
                    <Input id="login-email" type="email" value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      placeholder={t("auth_email_placeholder")} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">{t("auth_password")}</Label>
                    <Input id="login-password" type="password" value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      placeholder={t("auth_password_placeholder")} required />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? t("auth_logging_in") : t("auth_login")}
                  </Button>
                </form>
              </TabsContent>
              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">{t("auth_name")}</Label>
                    <Input id="signup-name" value={signupForm.displayName}
                      onChange={(e) => setSignupForm({ ...signupForm, displayName: e.target.value })}
                      placeholder={t("auth_name_placeholder")} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">{t("auth_email")}</Label>
                    <Input id="signup-email" type="email" value={signupForm.email}
                      onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                      placeholder={t("auth_email_placeholder")} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">{t("auth_password")}</Label>
                    <Input id="signup-password" type="password" value={signupForm.password}
                      onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                      placeholder={t("auth_password_placeholder")} required minLength={6} />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? t("auth_signing_up") : t("auth_signup")}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </section>
      <Footer />
    </div>
  );
};

export default Auth;
