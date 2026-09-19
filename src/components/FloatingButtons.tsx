import { useLanguage } from "@/contexts/LanguageContext";
import SupportMessenger from "@/components/support/SupportMessenger";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";


const bookmarkTexts: Record<string, { line1: string; line2: string; title: string; subtitle: string; hover: string; cats: string[] }> = {
  en: { line1: "MAKE YOUR", line2: "ROUTINE", title: "Personalized Beauty", subtitle: "Personalize Your Routine", hover: "Personalize your beauty routine with our AI advisor. Discover products perfectly matched to your skin, body & hair.", cats: ["Skin", "Body", "Hair"] },
  es: { line1: "CREA TU", line2: "RUTINA", title: "Belleza Personalizada", subtitle: "Personaliza Tu Rutina", hover: "Personaliza tu rutina de belleza con nuestro asesor IA. Descubre productos perfectos para ti.", cats: ["Piel", "Cuerpo", "Cabello"] },
  de: { line1: "DEINE", line2: "ROUTINE", title: "Personalisierte Schönheit", subtitle: "Deine Routine", hover: "Personalisieren Sie Ihre Beauty-Routine mit unserem KI-Berater. Entdecken Sie perfekt abgestimmte Produkte.", cats: ["Haut", "Körper", "Haar"] },
  fr: { line1: "VOTRE", line2: "ROUTINE", title: "Beauté Personnalisée", subtitle: "Personnalisez Votre Routine", hover: "Personnalisez votre routine beauté avec notre conseiller IA. Découvrez des produits faits pour vous.", cats: ["Peau", "Corps", "Cheveux"] },
  pt: { line1: "SUA", line2: "ROTINA", title: "Beleza Personalizada", subtitle: "Personalize Sua Rotina", hover: "Personalize sua rotina de beleza com nosso consultor IA. Descubra produtos perfeitos para você.", cats: ["Pele", "Corpo", "Cabelo"] },
  ja: { line1: "あなたの", line2: "ルーティン", title: "パーソナルビューティー", subtitle: "あなたのルーティンを作る", hover: "AIアドバイザーが肌・ボディ・髪に合う商品を提案します。", cats: ["スキン", "ボディ", "ヘア"] },
  ar: { line1: "اصنعي", line2: "روتينك", title: "جمالك المخصص", subtitle: "اصنعي روتينك", hover: "خصصي روتين جمالك مع مستشار الذكاء الاصطناعي واكتشفي المنتجات المناسبة لك.", cats: ["البشرة", "الجسم", "الشعر"] },
};

const FloatingButtons = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const mt = messengerTexts[language] || messengerTexts.en;
  const bt = bookmarkTexts[language] || bookmarkTexts.en;

  const [messengerOpen, setMessengerOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<{ text: string; from: "user" | "system"; time: string }[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.email) setEmail(user.email);
    if (user?.user_metadata?.display_name) setName(user.user_metadata.display_name);
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleOpenAI = () => {
    window.dispatchEvent(new Event("open-beauty-advisor"));
  };

  const handleSend = async () => {
    if (!message.trim() || !email.trim()) return;
    setSending(true);

    const newMsg = { text: message, from: "user" as const, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
    setMessages((prev) => [...prev, newMsg]);

    try {
      const { error } = await supabase.functions.invoke("send-inquiry", {
        body: { name: name || "Guest", email, message, language },
      });
      if (error) throw error;
      toast.success(mt.sent);
      setMessage("");
    } catch {
      toast.error(mt.error);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* AI Bookmark Tab — hidden on very small screens, sticky right edge */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50 hidden sm:block">
        <HoverCard openDelay={200} closeDelay={100}>
          <HoverCardTrigger asChild>
            <button
              onClick={handleOpenAI}
              className="group relative flex items-center"
              aria-label="Personalize Your Routine"
            >
              <div
                className="relative border border-primary/15 bg-primary-soft text-primary pl-4 pr-3 py-10 flex flex-col items-center gap-3 shadow-luxury transition-all duration-500 group-hover:pl-5 group-hover:pr-4 group-hover:bg-primary-soft/80"
                style={{ borderRadius: "8px 0 0 8px" }}
              >
                <span className="text-xs font-sans font-bold tracking-[0.18em] uppercase leading-tight text-center">{bt.line1}</span>
                <span className="text-xs font-sans font-bold tracking-[0.18em] uppercase text-center">{bt.line2}</span>
              </div>
            </button>
          </HoverCardTrigger>
          <HoverCardContent side="left" sideOffset={8} className="w-72 bg-background/95 backdrop-blur-md border-border/30 shadow-luxury p-5">
            <div className="space-y-3">
              <div>
              <p className="text-lg font-serif font-bold">{bt.title}</p>
                <p className="text-sm text-foreground/70 tracking-[0.1em] uppercase mt-0.5 font-semibold">{bt.subtitle}</p>
              </div>
              <p className="text-base text-foreground/80 leading-relaxed">{bt.hover}</p>
              <div className="flex gap-2">
                {bt.cats.map(cat => (
                  <span key={cat} className="text-xs px-2.5 py-1 bg-muted text-foreground/80 border border-border/40 tracking-[0.08em] uppercase font-medium">{cat}</span>
                ))}
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      </div>

      {/* Right — Customer Messenger */}
      <SupportMessenger />
    </>
  );
};

export default FloatingButtons;
