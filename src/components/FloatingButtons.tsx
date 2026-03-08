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
  ko: {
    title: "고객 상담",
    subtitle: "보통 몇 시간 이내에 답변드립니다",
    placeholder: "메시지를 입력하세요...",
    send: "전송",
    name: "이름",
    email: "이메일",
    sent: "메시지가 전송되었습니다! 곧 답변드리겠습니다.",
    error: "메시지 전송에 실패했습니다. 다시 시도해주세요.",
    greeting: "안녕하세요! 무엇을 도와드릴까요?",
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
};

const bookmarkTexts: Record<string, { line1: string; line2: string; hover: string }> = {
  en: { line1: "MAKE YOUR", line2: "ROUTINE", hover: "Personalize your beauty routine with our AI advisor. Discover products perfectly matched to your skin, body & hair." },
  ko: { line1: "나만의", line2: "루틴 만들기", hover: "AI 어드바이저로 나만의 뷰티 루틴을 완성하세요. 피부, 바디, 헤어에 맞는 제품을 추천받으세요." },
  es: { line1: "CREA TU", line2: "RUTINA", hover: "Personaliza tu rutina de belleza con nuestro asesor IA." },
  de: { line1: "DEINE", line2: "ROUTINE", hover: "Personalisieren Sie Ihre Beauty-Routine mit unserem KI-Berater." },
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
      {/* AI Bookmark Tab */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50 hidden sm:block">
        <HoverCard openDelay={200} closeDelay={100}>
          <HoverCardTrigger asChild>
            <button
              onClick={handleOpenAI}
              className="group relative flex items-center"
              aria-label="Personalize Your Routine"
            >
              <div
                className="relative bg-foreground text-primary-foreground pl-3 pr-2.5 py-8 flex flex-col items-center gap-2 transition-all duration-500 group-hover:pl-4 group-hover:pr-3"
                style={{ borderRadius: "4px 0 0 4px" }}
              >
                <span className="text-[9px] font-sans font-light tracking-[0.2em] uppercase leading-tight text-center text-primary-foreground/70">{bt.line1}</span>
                <span className="text-[9px] font-sans font-light tracking-[0.2em] uppercase text-center text-primary-foreground/70">{bt.line2}</span>
              </div>
            </button>
          </HoverCardTrigger>
          <HoverCardContent side="left" sideOffset={8} className="w-64 bg-background/95 backdrop-blur-md border-border/30 shadow-luxury p-5">
            <div className="space-y-3">
              <p className="text-base font-serif font-normal tracking-wide">Personalized Beauty</p>
              <p className="text-sm text-muted-foreground leading-relaxed font-light">{bt.hover}</p>
              <div className="flex gap-2">
                {["Skin", "Body", "Hair"].map(cat => (
                  <span key={cat} className="text-[10px] px-2.5 py-1 border border-border/40 tracking-[0.1em] uppercase font-light text-muted-foreground">{cat}</span>
                ))}
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      </div>

      {/* Messenger */}
      <div className="fixed right-4 md:right-6 bottom-6 z-50">
        {messengerOpen && (
          <div className="absolute bottom-16 right-0 w-[calc(100vw-2rem)] max-w-[360px] bg-background border border-border/30 shadow-luxury flex flex-col max-h-[70dvh] animate-fade-in">
            <div className="px-5 py-4 border-b border-border/20">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-serif font-normal">{mt.title}</h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5 font-light">{mt.subtitle}</p>
                </div>
                <button onClick={() => setMessengerOpen(false)} className="text-muted-foreground/40 hover:text-foreground transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 min-h-[200px]" style={{ WebkitOverflowScrolling: 'touch' as any }}>
              <div className="flex gap-2">
                <div className="w-6 h-6 border border-accent/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-[7px] font-sans text-accent">B&G</span>
                </div>
                <div className="bg-muted/30 px-3.5 py-2.5 max-w-[80%]">
                  <p className="text-xs leading-relaxed font-light">{mt.greeting}</p>
                </div>
              </div>

              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-2 ${msg.from === "user" ? "justify-end" : ""}`}>
                  {msg.from === "system" && (
                    <div className="w-6 h-6 border border-accent/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-[7px] font-sans text-accent">B&G</span>
                    </div>
                  )}
                  <div className={`px-3.5 py-2.5 max-w-[80%] ${msg.from === "user" ? "bg-foreground text-primary-foreground" : "bg-muted/30"}`}>
                    <p className="text-xs leading-relaxed font-light">{msg.text}</p>
                    <p className={`text-[9px] mt-1 ${msg.from === "user" ? "text-primary-foreground/40" : "text-muted-foreground/40"}`}>{msg.time}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-border/20 px-4 py-3 space-y-2">
              {!user && (
                <div className="flex gap-2">
                  <input type="text" placeholder={mt.name} value={name} onChange={(e) => setName(e.target.value)}
                    className="flex-1 text-xs px-3 py-2 border border-border/30 bg-transparent focus:outline-none focus:border-accent/40 placeholder:text-muted-foreground/30 font-light" />
                  <input type="email" placeholder={mt.email} value={email} onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 text-xs px-3 py-2 border border-border/30 bg-transparent focus:outline-none focus:border-accent/40 placeholder:text-muted-foreground/30 font-light" />
                </div>
              )}
              <div className="flex gap-2">
                <input type="text" placeholder={mt.placeholder} value={message} onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  className="flex-1 text-xs px-3 py-2.5 border border-border/30 bg-transparent focus:outline-none focus:border-accent/40 placeholder:text-muted-foreground/30 font-light" />
                <button onClick={handleSend} disabled={sending || !message.trim()}
                  className="px-3 py-2.5 bg-foreground text-primary-foreground disabled:opacity-40 hover:bg-foreground/90 transition-colors">
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={() => setMessengerOpen(!messengerOpen)}
          className="w-12 h-12 md:w-13 md:h-13 bg-foreground text-primary-foreground flex items-center justify-center shadow-luxury hover:bg-foreground/90 transition-all duration-300"
          aria-label="Customer Support"
        >
          {messengerOpen ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
        </button>
      </div>
    </>
  );
};

export default FloatingButtons;
