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
  en: { title: "Sign in to continue", desc: "Sign in with Google to add items to your cart and check out.", google: "Continue with Google", note: "It only takes a few seconds." },
  es: { title: "Inicia sesión para continuar", desc: "Inicia sesión con Google para añadir productos al carrito y pagar.", google: "Continuar con Google", note: "Solo toma unos segundos." },
  de: { title: "Zum Fortfahren anmelden", desc: "Melden Sie sich mit Google an, um Artikel in den Warenkorb zu legen.", google: "Mit Google fortfahren", note: "Es dauert nur wenige Sekunden." },
  fr: { title: "Connectez-vous pour continuer", desc: "Connectez-vous avec Google pour ajouter des articles au panier.", google: "Continuer avec Google", note: "Cela ne prend que quelques secondes." },
  pt: { title: "Entre para continuar", desc: "Entre com o Google para adicionar itens ao carrinho e finalizar a compra.", google: "Continuar com Google", note: "Leva apenas alguns segundos." },
  ja: { title: "続けるにはログイン", desc: "Googleでログインすると、カートに追加してご購入いただけます。", google: "Googleで続ける", note: "数秒で完了します。" },
  ar: { title: "سجّل الدخول للمتابعة", desc: "سجّل الدخول عبر Google لإضافة المنتجات إلى السلة وإتمام الشراء.", google: "المتابعة عبر Google", note: "يستغرق ثوانٍ قليلة فقط." },
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
      <DialogContent className="max-w-[360px] rounded-sm">
        <DialogHeader>
          <DialogTitle className="text-lg font-serif font-normal">{c.title}</DialogTitle>
          <DialogDescription className="text-sm text-foreground/70 leading-relaxed">{c.desc}</DialogDescription>
        </DialogHeader>
        <Button
          type="button"
          variant="outline"
          className="w-full rounded-none py-6 text-sm font-semibold tracking-wide flex items-center justify-center gap-3 border-border hover:bg-muted/50"
          onClick={signIn}
          disabled={loading}
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <GoogleIcon />}
          {c.google}
        </Button>
        <p className="text-xs text-center text-muted-foreground">{c.note}</p>
      </DialogContent>
    </Dialog>
  );
};

export default LoginDialog;
