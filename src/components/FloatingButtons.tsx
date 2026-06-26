import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

const messengerTexts: Record<string, Record<string, string>> = {
  en: {
    title: "Customer Support",
    subtitle: "We typically reply within a few hours",
    placeholder: "Type your message...",
    send: "Send",
    name: "Your name",
    email: "Your email",
    sent: "Message sent! We'll get back to you soon.",
    error: "Failed to send message. Please try again.",
    greeting: "Hello! How can we help you today?",
  },
  es: {
    title: "Atención al Cliente",
    subtitle: "Respondemos en pocas horas",
    placeholder: "Escribe tu mensaje...",
    send: "Enviar",
    name: "Tu nombre",
    email: "Tu email",
    sent: "¡Mensaje enviado! Te responderemos pronto.",
    error: "Error al enviar. Inténtalo de nuevo.",
    greeting: "¡Hola! ¿Cómo podemos ayudarte?",
  },
  de: {
    title: "Kundenservice",
    subtitle: "Wir antworten in wenigen Stunden",
    placeholder: "Nachricht eingeben...",
    send: "Senden",
    name: "Ihr Name",
    email: "Ihre E-Mail",
    sent: "Nachricht gesendet! Wir melden uns bald.",
    error: "Senden fehlgeschlagen. Bitte versuchen Sie es erneut.",
    greeting: "Hallo! Wie können wir Ihnen helfen?",
  },
  fr: {
    title: "Service Client",
    subtitle: "Nous répondons généralement en quelques heures",
    placeholder: "Écrivez votre message...",
    send: "Envoyer",
    name: "Votre nom",
    email: "Votre email",
    sent: "Message envoyé ! Nous vous répondrons bientôt.",
    error: "Échec de l’envoi. Veuillez réessayer.",
    greeting: "Bonjour ! Comment pouvons-nous vous aider ?",
  },
  pt: {
    title: "Atendimento ao Cliente",
    subtitle: "Normalmente respondemos em poucas horas",
    placeholder: "Digite sua mensagem...",
    send: "Enviar",
    name: "Seu nome",
    email: "Seu email",
    sent: "Mensagem enviada! Responderemos em breve.",
    error: "Falha ao enviar. Tente novamente.",
    greeting: "Olá! Como podemos ajudar?",
  },
  ja: {
    title: "カスタマーサポート",
    subtitle: "通常、数時間以内に返信します",
    placeholder: "メッセージを入力...",
    send: "送信",
    name: "お名前",
    email: "メールアドレス",
    sent: "メッセージを送信しました。まもなく返信いたします。",
    error: "送信に失敗しました。もう一度お試しください。",
    greeting: "こんにちは！どのようにお手伝いできますか？",
  },
  ar: {
    title: "دعم العملاء",
    subtitle: "نرد عادة خلال بضع ساعات",
    placeholder: "اكتب رسالتك...",
    send: "إرسال",
    name: "اسمك",
    email: "بريدك الإلكتروني",
    sent: "تم إرسال الرسالة! سنرد عليك قريباً.",
    error: "فشل الإرسال. يرجى المحاولة مرة أخرى.",
    greeting: "مرحباً! كيف يمكننا مساعدتك؟",
  },
};

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
      <div className="fixed right-4 md:right-6 bottom-6 z-50">
        {messengerOpen && (
          <div className="absolute bottom-16 right-0 w-[calc(100vw-2rem)] max-w-[380px] bg-background border border-border/40 shadow-luxury flex flex-col max-h-[70dvh] animate-fade-in">
            {/* Header */}
            <div className="px-5 py-4 border-b border-border/30 bg-muted/30">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-serif font-medium">{mt.title}</h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{mt.subtitle}</p>
                </div>
                <button onClick={() => setMessengerOpen(false)} className="text-muted-foreground/50 hover:text-foreground transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 min-h-[200px]">
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-[8px] font-sans font-bold text-foreground">B&G</span>
                </div>
                <div className="bg-muted/50 px-3.5 py-2.5 max-w-[80%]">
                  <p className="text-xs leading-relaxed">{mt.greeting}</p>
                </div>
              </div>

              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-2 ${msg.from === "user" ? "justify-end" : ""}`}>
                  {msg.from === "system" && (
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-[8px] font-sans font-bold text-foreground">B&G</span>
                    </div>
                  )}
                  <div className={`px-3.5 py-2.5 max-w-[80%] ${msg.from === "user" ? "bg-primary text-primary-foreground" : "bg-muted/50"}`}>
                    <p className="text-xs leading-relaxed">{msg.text}</p>
                    <p className={`text-[9px] mt-1 ${msg.from === "user" ? "text-primary-foreground/50" : "text-muted-foreground/50"}`}>{msg.time}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="border-t border-border/30 px-4 py-3 space-y-2">
              {!user && (
                <div className="flex gap-2">
                  <input type="text" placeholder={mt.name} value={name} onChange={(e) => setName(e.target.value)}
                    className="flex-1 text-xs px-3 py-2 border border-border/40 bg-transparent focus:outline-none focus:border-primary/40 placeholder:text-muted-foreground/40" />
                  <input type="email" placeholder={mt.email} value={email} onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 text-xs px-3 py-2 border border-border/40 bg-transparent focus:outline-none focus:border-primary/40 placeholder:text-muted-foreground/40" />
                </div>
              )}
              <div className="flex gap-2">
                <input type="text" placeholder={mt.placeholder} value={message} onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  className="flex-1 text-xs px-3 py-2.5 border border-border/40 bg-transparent focus:outline-none focus:border-primary/40 placeholder:text-muted-foreground/40" />
                <button onClick={handleSend} disabled={sending || !message.trim()}
                  className="px-3 py-2.5 bg-primary text-primary-foreground disabled:opacity-40 hover:bg-primary/90 transition-colors">
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={() => setMessengerOpen(!messengerOpen)}
          className="w-12 h-12 md:w-14 md:h-14 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-luxury hover:scale-105 transition-transform duration-300"
          aria-label="Customer Support"
        >
          {messengerOpen ? <X className="h-5 w-5 md:h-6 md:w-6" /> : <MessageCircle className="h-5 w-5 md:h-6 md:w-6" />}
        </button>
      </div>
    </>
  );
};

export default FloatingButtons;
