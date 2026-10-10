import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  CAFE24_HANDOFF_EVENT,
  Cafe24HandoffRequest,
  cafe24JoinUrl,
  cafe24LoginUrl,
  loadCafe24Settings,
  openInTab,
} from "@/lib/cafe24";
import { ArrowRight, BadgeCheck, CreditCard, ExternalLink, Sparkles, UserPlus } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

type LangKey = "en" | "es" | "de" | "fr" | "pt" | "ja" | "ar";

type Copy = {
  lead: string;
  joinTitle: string;
  joinDesc: string;
  joinCta: string;
  memberCta: string;
  guestCta: string;
  afterTitle: string;
  afterDesc: string;
  afterCta: string;
  opened: string;
  secure: string;
};

const L: Record<LangKey, Copy> = {
  en: {
    lead: "Payment is completed on our secure checkout page. Credit card and bank transfer are supported.",
    joinTitle: "Join and earn reward points",
    joinDesc: "Create an account to collect points, follow your orders, and check out faster next time.",
    joinCta: "Sign up & continue",
    memberCta: "I already have an account",
    guestCta: "Continue without an account",
    afterTitle: "Finished signing up?",
    afterDesc: "Come back here and open your order form — everything you picked is still waiting.",
    afterCta: "Open my order form",
    opened: "The checkout page opened in a new tab.",
    secure: "Secure checkout · Card & bank transfer",
  },
  es: {
    lead: "El pago se completa en nuestra página segura. Aceptamos tarjeta y transferencia bancaria.",
    joinTitle: "Regístrate y acumula puntos",
    joinDesc: "Crea una cuenta para sumar puntos, seguir tus pedidos y comprar más rápido la próxima vez.",
    joinCta: "Registrarme y continuar",
    memberCta: "Ya tengo una cuenta",
    guestCta: "Continuar sin cuenta",
    afterTitle: "¿Ya te registraste?",
    afterDesc: "Vuelve aquí y abre tu pedido: todo lo que elegiste sigue guardado.",
    afterCta: "Abrir mi pedido",
    opened: "La página de pago se abrió en una nueva pestaña.",
    secure: "Pago seguro · Tarjeta y transferencia",
  },
  de: {
    lead: "Die Zahlung erfolgt auf unserer sicheren Seite. Kreditkarte und Banküberweisung werden unterstützt.",
    joinTitle: "Registrieren und Punkte sammeln",
    joinDesc: "Erstellen Sie ein Konto, um Punkte zu sammeln, Bestellungen zu verfolgen und schneller zu bezahlen.",
    joinCta: "Registrieren & fortfahren",
    memberCta: "Ich habe bereits ein Konto",
    guestCta: "Ohne Konto fortfahren",
    afterTitle: "Registrierung abgeschlossen?",
    afterDesc: "Kehren Sie hierher zurück und öffnen Sie Ihre Bestellseite – Ihre Auswahl bleibt erhalten.",
    afterCta: "Bestellseite öffnen",
    opened: "Die Kasse wurde in einem neuen Tab geöffnet.",
    secure: "Sichere Kasse · Karte & Überweisung",
  },
  fr: {
    lead: "Le paiement se fait sur notre page sécurisée. Carte bancaire et virement sont acceptés.",
    joinTitle: "Inscrivez-vous et cumulez des points",
    joinDesc: "Créez un compte pour gagner des points, suivre vos commandes et payer plus vite la prochaine fois.",
    joinCta: "S'inscrire et continuer",
    memberCta: "J'ai déjà un compte",
    guestCta: "Continuer sans compte",
    afterTitle: "Inscription terminée ?",
    afterDesc: "Revenez ici et ouvrez votre bon de commande : votre sélection vous attend.",
    afterCta: "Ouvrir mon bon de commande",
    opened: "La page de paiement s'est ouverte dans un nouvel onglet.",
    secure: "Paiement sécurisé · Carte et virement",
  },
  pt: {
    lead: "O pagamento é concluído em nossa página segura. Aceitamos cartão de crédito e transferência bancária.",
    joinTitle: "Cadastre-se e acumule pontos",
    joinDesc: "Crie uma conta para somar pontos, acompanhar seus pedidos e comprar mais rápido da próxima vez.",
    joinCta: "Cadastrar e continuar",
    memberCta: "Já tenho uma conta",
    guestCta: "Continuar sem cadastro",
    afterTitle: "Cadastro concluído?",
    afterDesc: "Volte aqui e abra seu pedido — tudo o que você escolheu continua salvo.",
    afterCta: "Abrir meu pedido",
    opened: "A página de pagamento abriu em uma nova aba.",
    secure: "Pagamento seguro · Cartão e transferência",
  },
  ja: {
    lead: "お支払いは安全な決済ページで行います。クレジットカードと銀行振込に対応しています。",
    joinTitle: "会員登録でポイントが貯まります",
    joinDesc: "会員登録するとポイントが貯まり、注文の確認や次回のお買い物がよりスムーズになります。",
    joinCta: "会員登録して続ける",
    memberCta: "すでに会員の方",
    guestCta: "会員登録せずに続ける",
    afterTitle: "会員登録はお済みですか？",
    afterDesc: "こちらに戻って注文書を開くと、お選びいただいた内容がそのまま残っています。",
    afterCta: "注文書を開く",
    opened: "決済ページを新しいタブで開きました。",
    secure: "安全な決済 · カード・銀行振込",
  },
  ar: {
    lead: "يتم الدفع في صفحة آمنة. ندفع بالبطاقة البنكية والتحويل البنكي.",
    joinTitle: "سجّل واحصل على نقاط",
    joinDesc: "أنشئ حساباً لجمع النقاط ومتابعة طلباتك والدفع بشكل أسرع في المرة القادمة.",
    joinCta: "التسجيل والمتابعة",
    memberCta: "لديّ حساب بالفعل",
    guestCta: "المتابعة بدون حساب",
    afterTitle: "هل انتهيت من التسجيل؟",
    afterDesc: "عُد إلى هنا وافتح صفحة الطلب — كل ما اخترته ما زال محفوظاً.",
    afterCta: "فتح صفحة الطلب",
    opened: "تم فتح صفحة الدفع في تبويب جديد.",
    secure: "دفع آمن · بطاقة وتحويل بنكي",
  },
};

const Cafe24Handoff = () => {
  const { language } = useLanguage();
  const c = L[(language as LangKey)] || L.en;
  const [open, setOpen] = useState(false);
  const [req, setReq] = useState<Cafe24HandoffRequest | null>(null);
  const [step, setStep] = useState<"prompt" | "after">("prompt");
  const [showPrompt, setShowPrompt] = useState(true);
  const [joinUrl, setJoinUrl] = useState("");
  const [loginUrl, setLoginUrl] = useState("");
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    const onOpen = (e: Event) => {
      const detail = (e as CustomEvent<Cafe24HandoffRequest>).detail;
      if (!detail?.buyUrl) return;
      setReq(detail);
      setStep("prompt");
      setOpened(false);
      setOpen(true);
      loadCafe24Settings().then((s) => {
        setShowPrompt(s.show_join_prompt !== false);
        setJoinUrl(cafe24JoinUrl(s));
        setLoginUrl(cafe24LoginUrl(s));
      });
    };
    window.addEventListener(CAFE24_HANDOFF_EVENT, onOpen);
    return () => window.removeEventListener(CAFE24_HANDOFF_EVENT, onOpen);
  }, []);

  // No join prompt configured: hand straight over to the order form.
  useEffect(() => {
    if (open && !showPrompt && req?.buyUrl) {
      openInTab(req.buyUrl);
      setOpen(false);
    }
  }, [open, showPrompt, req?.buyUrl]);

  const goToOrderForm = () => {
    if (!req?.buyUrl) return;
    openInTab(req.buyUrl);
    setOpened(true);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-[92vw] sm:max-w-[440px] rounded-3xl border border-primary/15 bg-gradient-to-b from-primary-soft/70 via-primary-soft/25 to-card p-0 shadow-luxury overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-primary/30 via-primary/60 to-primary/30" />
        <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-44 h-44 rounded-full bg-primary/8 blur-3xl" />

        <div className="relative px-7 pt-10 pb-8 flex flex-col items-center text-center">
          <BrandLogo size="sm" showTagline={false} asLink={false} className="mb-5" />

          <DialogHeader className="space-y-2 text-center sm:text-center">
            <DialogTitle className="text-[22px] font-serif font-medium tracking-tight text-foreground leading-tight">
              {step === "prompt" ? c.joinTitle : c.afterTitle}
            </DialogTitle>
            <DialogDescription className="pt-1 text-sm leading-relaxed text-muted-foreground max-w-[320px] mx-auto">
              {step === "prompt" ? c.joinDesc : c.afterDesc}
            </DialogDescription>
          </DialogHeader>

          {step === "prompt" ? (
            <div className="w-full mt-7 space-y-3">
              <Button
                type="button"
                className="w-full rounded-xl py-5 text-sm font-semibold tracking-wide flex items-center justify-center gap-2 bg-foreground text-background hover:bg-foreground/90 transition-all duration-300"
                onClick={() => {
                  if (joinUrl) openInTab(joinUrl);
                  setStep("after");
                }}
              >
                <UserPlus className="h-4 w-4" /> {c.joinCta}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full rounded-xl py-5 text-sm font-medium flex items-center justify-center gap-2 border-primary/25 hover:border-primary/45 hover:bg-primary-soft/50"
                onClick={() => {
                  if (loginUrl) openInTab(loginUrl);
                  setStep("after");
                }}
              >
                <BadgeCheck className="h-4 w-4" /> {c.memberCta}
              </Button>
              <button
                type="button"
                onClick={goToOrderForm}
                className="w-full pt-2 text-xs tracking-[0.12em] uppercase text-muted-foreground hover:text-foreground underline underline-offset-4 min-h-[44px]"
              >
                {c.guestCta}
              </button>
            </div>
          ) : (
            <div className="w-full mt-7 space-y-3">
              <Button
                type="button"
                className="w-full rounded-xl py-5 text-sm font-semibold tracking-wide flex items-center justify-center gap-2 bg-foreground text-background hover:bg-foreground/90"
                onClick={goToOrderForm}
              >
                <ArrowRight className="h-4 w-4" /> {c.afterCta}
              </Button>
              {opened && (
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                  <ExternalLink className="h-3 w-3" /> {c.opened}
                </p>
              )}
            </div>
          )}

          <p className="mt-6 text-[10px] font-sans uppercase tracking-[0.18em] text-primary/70 flex items-center gap-1.5">
            <CreditCard className="h-3 w-3" /> {c.secure}
          </p>
          <p className="mt-2 text-[10px] font-sans uppercase tracking-[0.18em] text-muted-foreground/70 flex items-center gap-1.5">
            <Sparkles className="h-3 w-3" /> Youthroom
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Cafe24Handoff;
