import { useEffect, useState } from "react";

// Multilingual rolling greeting — flag always in front, no trailing emojis.
const greetings: { lang: string; flag: string; text: string; dir?: "rtl" }[] = [
  
  { lang: "en", flag: "🇺🇸", text: "Hello, gorgeous! We're BLOOM & GRACE" },
  { lang: "ja", flag: "🇯🇵", text: "こんにちは！BLOOM & GRACE です" },
  
  { lang: "es", flag: "🇪🇸", text: "¡Hola, bella! Somos BLOOM & GRACE" },
  { lang: "fr", flag: "🇫🇷", text: "Bonjour ! Nous sommes BLOOM & GRACE" },
  { lang: "de", flag: "🇩🇪", text: "Hallo! Wir sind BLOOM & GRACE" },
  { lang: "it", flag: "🇮🇹", text: "Ciao, bella! Siamo BLOOM & GRACE" },
  { lang: "pt", flag: "🇧🇷", text: "Olá, linda! Somos a BLOOM & GRACE" },
  { lang: "ru", flag: "🇷🇺", text: "Привет! Мы — BLOOM & GRACE" },
  { lang: "ar", flag: "🇸🇦", text: "مرحباً! نحن BLOOM & GRACE", dir: "rtl" },
  { lang: "hi", flag: "🇮🇳", text: "नमस्ते! हम BLOOM & GRACE हैं" },
  { lang: "th", flag: "🇹🇭", text: "สวัสดี! เราคือ BLOOM & GRACE" },
  { lang: "vi", flag: "🇻🇳", text: "Xin chào! Chúng tôi là BLOOM & GRACE" },
  { lang: "tr", flag: "🇹🇷", text: "Merhaba güzelim! Biz BLOOM & GRACE" },
  { lang: "id", flag: "🇮🇩", text: "Halo cantik! Kami BLOOM & GRACE" },
];

const RollingGreeting = () => {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % greetings.length), 4500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative overflow-hidden border-b border-primary/15 bg-gradient-to-r from-[hsl(var(--sky-soft))] via-[hsl(var(--primary-soft))] to-[hsl(var(--sky-soft))]">
      <div className="container px-3 py-2 md:py-3 flex items-center justify-center">
        <div className="relative h-6 md:h-8 w-full max-w-[760px] overflow-hidden">
          {greetings.map((item, idx) => (
            <p
              key={idx}
              dir={item.dir || "ltr"}
              className={`absolute inset-0 flex items-center justify-center gap-1.5 md:gap-2 text-center font-sans font-medium text-[11px] xs:text-[12px] sm:text-[14px] md:text-[16px] leading-none tracking-[0.01em] text-foreground/85 whitespace-nowrap transition-all duration-[900ms] ease-out ${
                idx === i
                  ? "opacity-100 translate-y-0 scale-100"
                  : idx === (i - 1 + greetings.length) % greetings.length
                  ? "opacity-0 -translate-y-3 scale-95"
                  : "opacity-0 translate-y-3 scale-95"
              }`}
            >
              <span className="text-sm md:text-lg leading-none shrink-0" style={{ fontFamily: '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif' }}>{item.flag}</span>
              <span className="truncate">{item.text}</span>
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RollingGreeting;
