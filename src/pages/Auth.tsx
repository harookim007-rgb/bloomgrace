import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import BrandLogo from "@/components/BrandLogo";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Loader2 } from "lucide-react";

const COUNTRY_CODES = [
  { code: "+82", label: "🇰🇷 KR +82" },
  { code: "+1", label: "🇺🇸 US +1" },
  { code: "+44", label: "🇬🇧 UK +44" },
  { code: "+81", label: "🇯🇵 JP +81" },
  { code: "+86", label: "🇨🇳 CN +86" },
  { code: "+49", label: "🇩🇪 DE +49" },
  { code: "+34", label: "🇪🇸 ES +34" },
  { code: "+33", label: "🇫🇷 FR +33" },
  { code: "+61", label: "🇦🇺 AU +61" },
  { code: "+65", label: "🇸🇬 SG +65" },
  { code: "+852", label: "🇭🇰 HK +852" },
  { code: "+886", label: "🇹🇼 TW +886" },
  { code: "+84", label: "🇻🇳 VN +84" },
  { code: "+66", label: "🇹🇭 TH +66" },
];

const Auth = () => {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({
    email: "", password: "", confirmPassword: "", displayName: "",
    countryCode: "+82", phoneLocal: "",
  });
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Phone verification state
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpSending, setOtpSending] = useState(false);

  const fullPhone = () => `${signupForm.countryCode}${signupForm.phoneLocal.replace(/\D/g, "")}`;

  const handleSendOtp = async () => {
    const phone = fullPhone();
    if (!/^\+[1-9]\d{6,15}$/.test(phone)) {
      toast.error("올바른 전화번호 형식이 아닙니다.");
      return;
    }
    setOtpSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-otp", {
        body: { phone, purpose: "signup" },
      });
      if (error) throw error;
      setOtpSent(true);
      if (data?.dev_mode) {
        toast.success(`[개발모드] 인증번호: ${data.dev_code}`, { duration: 15000 });
      } else {
        toast.success(`인증번호가 ${data?.masked_phone || phone}로 전송되었습니다.`);
      }
    } catch (err: any) {
      toast.error(err.message || "인증번호 전송 실패");
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    setOtpSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("verify-otp", {
        body: { phone: fullPhone(), code: otpCode, purpose: "signup" },
      });
      if (error) throw error;
      if (data?.success) {
        setOtpVerified(true);
        toast.success("휴대폰 인증이 완료되었습니다.");
      } else {
        toast.error("인증번호가 올바르지 않습니다.");
      }
    } catch (err: any) {
      toast.error(err.message || "인증 실패");
    } finally {
      setOtpSending(false);
    }
  };

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
    if (!agreeTerms) { toast.error(t("auth_agree_required")); return; }
    if (!otpVerified) { toast.error("휴대폰 인증을 완료해주세요."); return; }

    setIsLoading(true);
    try {
      // Pass phone via user metadata so handle_new_user trigger picks it up
      const { error } = await supabase.auth.signUp({
        email: signupForm.email,
        password: signupForm.password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            display_name: signupForm.displayName,
            phone: fullPhone(),
          },
        },
      });
      if (error) throw error;
      toast.success(t("auth_signup_success"));
      navigate("/complete-profile");
    } catch (err: any) {
      toast.error(err.message || t("auth_signup_fail"));
    } finally { setIsLoading(false); }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
      if (result.error) toast.error(result.error.message || t("auth_login_fail"));
    } catch (err: any) {
      toast.error(err.message || t("auth_login_fail"));
    } finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      <section className="py-16 md:py-24 px-4 flex items-center justify-center min-h-[70dvh]">
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
              <div className="space-y-6">
                <Button type="button" variant="outline"
                  className="w-full rounded-none py-6 text-sm tracking-wide flex items-center justify-center gap-3 border-border hover:bg-muted/50"
                  onClick={handleGoogleSignIn} disabled={isLoading}>
                  <GoogleIcon /> {t("auth_google_signin")}
                </Button>
                <div className="relative">
                  <Separator />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-4 text-xs text-muted-foreground tracking-wider uppercase">{t("auth_or")}</span>
                </div>
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

            <TabsContent value="signup">
              <div className="space-y-6">
                <Button type="button" variant="outline"
                  className="w-full rounded-none py-6 text-sm tracking-wide flex items-center justify-center gap-3 border-border hover:bg-muted/50"
                  onClick={handleGoogleSignIn} disabled={isLoading}>
                  <GoogleIcon /> {t("auth_google_signup")}
                </Button>
                <div className="relative">
                  <Separator />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-4 text-xs text-muted-foreground tracking-wider uppercase">{t("auth_or")}</span>
                </div>

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

                  {/* Phone with international code + verification */}
                  <div className="space-y-2">
                    <Label className="text-xs tracking-wider uppercase flex items-center gap-2">
                      {t("auth_phone")} <span className="text-primary">*</span>
                      {otpVerified && <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />}
                    </Label>
                    <div className="flex gap-2">
                      <select
                        className="rounded-none border border-border bg-background px-2 text-sm h-10 min-w-[110px]"
                        value={signupForm.countryCode}
                        disabled={otpSent}
                        onChange={(e) => setSignupForm({ ...signupForm, countryCode: e.target.value })}
                      >
                        {COUNTRY_CODES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
                      </select>
                      <Input type="tel" placeholder="1012345678" value={signupForm.phoneLocal} disabled={otpSent}
                        className="rounded-none border-border flex-1"
                        onChange={(e) => setSignupForm({ ...signupForm, phoneLocal: e.target.value })} required />
                    </div>
                    {!otpVerified && (
                      <>
                        {!otpSent ? (
                          <Button type="button" variant="outline" className="w-full rounded-none text-xs uppercase tracking-wider h-10"
                            disabled={otpSending || !signupForm.phoneLocal} onClick={handleSendOtp}>
                            {otpSending && <Loader2 className="h-3 w-3 animate-spin mr-2" />}
                            인증번호 전송
                          </Button>
                        ) : (
                          <div className="flex gap-2">
                            <Input placeholder="6자리 인증번호" value={otpCode} maxLength={6}
                              className="rounded-none border-border" onChange={(e) => setOtpCode(e.target.value)} />
                            <Button type="button" variant="outline" className="rounded-none text-xs uppercase h-10 px-4"
                              disabled={otpSending || otpCode.length !== 6} onClick={handleVerifyOtp}>
                              확인
                            </Button>
                            <Button type="button" variant="ghost" size="sm" className="text-xs h-10"
                              onClick={() => { setOtpSent(false); setOtpCode(""); }}>
                              재전송
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                    {otpVerified && (
                      <p className="text-xs text-green-600 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> 인증 완료</p>
                    )}
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

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} className="mt-1 w-4 h-4 rounded-none border-border" />
                    <span className="text-xs text-muted-foreground leading-relaxed">{t("auth_terms_agree")}</span>
                  </label>

                  <Button type="submit" className="w-full rounded-none py-6 text-xs tracking-[0.15em] uppercase"
                    disabled={isLoading || !agreeTerms || !otpVerified}>
                    {isLoading ? t("auth_signing_up") : t("auth_signup")}
                  </Button>
                </form>
              </div>
            </TabsContent>
          </Tabs>

          <div className="border border-border/50 p-5 space-y-3 bg-muted/30">
            <p className="text-xs font-medium tracking-wider uppercase text-center">{t("auth_benefits_title")}</p>
            <ul className="space-y-2 text-xs text-muted-foreground">
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
