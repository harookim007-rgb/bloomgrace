import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const LOGIN_EVENT = "open-login-dialog";

/** Opens the global login dialog. Returns true when the user is already signed in. */
export const requireLogin = (isSignedIn: boolean) => {
  if (isSignedIn) return true;
  window.dispatchEvent(new Event(LOGIN_EVENT));
  return false;
};

const L = {
  en: { title: "Welcome!", sub: "We are Bloom & Grace", desc: "Sign in with Google to save your favorites and check out faster.", google: "Continue with Google" },
  es: { title: "¡Bienvenido!", sub: "Somos Bloom & Grace", desc: "Inicia sesión con Google para guardar tus favoritos y comprar más rápido.", google: "Continuar con Google" },
  de: { title: "Willkommen!", sub: "Wir sind Bloom & Grace", desc: "Melden Sie sich mit Google an, um Favoriten zu speichern und schneller zu bezahlen.", google: "Mit Google fortfahren" },
  fr: { title: "Bienvenue !", sub: "Nous sommes Bloom & Grace", desc: "Connectez-vous avec Google pour enregistrer vos favoris et accélérer le paiement.", google: "Continuer avec Google" },
  pt: { title: "Bem-vindo!", sub: "Somos a Bloom & Grace", desc: "Entre com o Google para salvar seus favoritos e finalizar a compra mais rápido.", google: "Continuar com Google" },
  ja: { title: "ようこそ！", sub: "Bloom & Grace です", desc: "Googleでログインすると、お気に入りを保存してスムーズにお買い物できます。", google: "Googleで続ける" },
  ar: { title: "!أهلاً بك", sub: "نحن Bloom & Grace", desc: "سجّل الدخول عبر Google لحفظ المفضلات والدفع بشكل أسرع.", google: "المتابعة عبر Google" },
} as const;

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);




const LoginDialog = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const c = (L as any)[language] || L.en;

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener(LOGIN_EVENT, onOpen);
    return () => window.removeEventListener(LOGIN_EVENT, onOpen);
  }, []);

  useEffect(() => { if (user) setOpen(false); }, [user]);

  const signIn = async () => {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin + "/auth",
      });
      if (result.error) toast.error(result.error.message);
    } catch (e: any) {
      toast.error(e?.message || "Sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-[92vw] sm:max-w-[420px] rounded-2xl border border-primary/10 bg-gradient-to-b from-primary-soft/40 via-card to-card p-0 shadow-luxury overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-primary/40 via-secondary/80 to-primary/40" />
        <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute -bottom-12 -left-12 w-36 h-36 rounded-full bg-secondary/25 blur-3xl" />

        <div className="relative px-8 pt-11 pb-9 flex flex-col items-center text-center">
          <div className="mb-5 p-4 rounded-full bg-primary/8 ring-1 ring-primary/15 shadow-soft">
            <BlossomIcon />
          </div>

          <DialogHeader className="space-y-3 text-center sm:text-center">
            <DialogTitle className="text-3xl font-serif font-semibold tracking-tight text-foreground">
              {c.title}
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-muted-foreground max-w-[290px] mx-auto">
              {c.desc}
            </DialogDescription>
          </DialogHeader>

          <Button
            type="button"
            className="mt-8 w-full rounded-xl py-6 text-sm font-semibold tracking-wide flex items-center justify-center gap-3 bg-white text-foreground border border-primary/15 shadow-soft hover:bg-primary-soft/60 hover:border-primary/30 hover:shadow-elegant transition-all duration-300"
            onClick={signIn}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin text-primary" /> : <GoogleIcon />}
            {c.google}
          </Button>

          <div className="mt-5 flex items-center gap-3 w-full max-w-[260px]">
            <span className="flex-1 h-px bg-border" />
            <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground/70">{c.note}</span>
            <span className="flex-1 h-px bg-border" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginDialog;
