import { useEffect, useState } from "react";

// iPhone "hello"-style rolling greeting. Brand name stays in English.
const greetings: { lang: string; text: string; dir?: "rtl" }[] = [
  { lang: "ko", text: "안녕하세요! 저희는 BLOOM & GRACE 입니다." },
  { lang: "en", text: "Hello! We are BLOOM & GRACE." },
  { lang: "ja", text: "こんにちは！私たちは BLOOM & GRACE です。" },
  { lang: "zh", text: "你好！我们是 BLOOM & GRACE。" },
  { lang: "es", text: "¡Hola! Somos BLOOM & GRACE." },
  { lang: "fr", text: "Bonjour ! Nous sommes BLOOM & GRACE." },
  { lang: "de", text: "Hallo! Wir sind BLOOM & GRACE." },
  { lang: "it", text: "Ciao! Siamo BLOOM & GRACE." },
  { lang: "pt", text: "Olá! Somos a BLOOM & GRACE." },
  { lang: "ru", text: "Привет! Мы — BLOOM & GRACE." },
  { lang: "ar", text: "مرحباً! نحن BLOOM & GRACE.", dir: "rtl" },
  { lang: "hi", text: "नमस्ते! हम BLOOM & GRACE हैं।" },
  { lang: "th", text: "สวัสดี! เราคือ BLOOM & GRACE" },
  { lang: "vi", text: "Xin chào! Chúng tôi là BLOOM & GRACE." },
  { lang: "tr", text: "Merhaba! Biz BLOOM & GRACE." },
  { lang: "id", text: "Halo! Kami adalah BLOOM & GRACE." },
];

const RollingGreeting = () => {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % greetings.length), 2800);
    return () => clearInterval(t);
  }, []);

  const g = greetings[i];

  return (
    <div className="relative overflow-hidden border-b border-primary/10 bg-gradient-to-r from-[hsl(var(--sky-soft))] via-background to-[hsl(var(--primary-soft))]">
      <div className="container px-4 py-2 md:py-2.5 flex items-center justify-center">
        <div className="relative h-5 md:h-6 w-full max-w-[680px] overflow-hidden">
          {greetings.map((item, idx) => (
            <p
              key={idx}
              dir={item.dir || "ltr"}
              className={`absolute inset-0 flex items-center justify-center text-center text-[12px] md:text-[13.5px] font-sans font-medium tracking-[0.04em] text-foreground/80 transition-all duration-700 ease-out ${
                idx === i ? "opacity-100 translate-y-0" : idx === (i - 1 + greetings.length) % greetings.length ? "opacity-0 -translate-y-3" : "opacity-0 translate-y-3"
              }`}
            >
              {item.text}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RollingGreeting;
