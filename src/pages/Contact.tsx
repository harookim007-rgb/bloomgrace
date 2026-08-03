import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const MSG: Record<string, { ok: string; fail: string; invalid: string; sending: string }> = {
  en: { ok: "Thank you! We received your message and will reply by email.", fail: "Could not send your message. Please try again.", invalid: "Please fill in your name, a valid email and a message.", sending: "Sending..." },
  es: { ok: "¡Gracias! Recibimos tu mensaje y te responderemos por correo.", fail: "No se pudo enviar el mensaje. Inténtalo de nuevo.", invalid: "Completa tu nombre, un correo válido y un mensaje.", sending: "Enviando..." },
  de: { ok: "Danke! Wir haben Ihre Nachricht erhalten und antworten per E-Mail.", fail: "Nachricht konnte nicht gesendet werden. Bitte erneut versuchen.", invalid: "Bitte Name, gültige E-Mail und Nachricht ausfüllen.", sending: "Wird gesendet..." },
  fr: { ok: "Merci ! Nous avons reçu votre message et répondrons par e-mail.", fail: "Envoi impossible. Veuillez réessayer.", invalid: "Veuillez indiquer votre nom, un e-mail valide et un message.", sending: "Envoi..." },
  pt: { ok: "Obrigado! Recebemos sua mensagem e responderemos por e-mail.", fail: "Não foi possível enviar. Tente novamente.", invalid: "Preencha nome, e-mail válido e mensagem.", sending: "Enviando..." },
  ja: { ok: "ありがとうございます。メッセージを受け取りました。メールでご返信します。", fail: "送信できませんでした。もう一度お試しください。", invalid: "お名前・有効なメール・メッセージをご入力ください。", sending: "送信中..." },
  ar: { ok: "شكرًا لك! تم استلام رسالتك وسنرد عبر البريد الإلكتروني.", fail: "تعذر إرسال الرسالة. حاول مرة أخرى.", invalid: "يرجى إدخال الاسم وبريد صحيح ورسالة.", sending: "جارٍ الإرسال..." },
};

const Contact = () => {
  const { t, language } = useLanguage();
  const m = MSG[language] || MSG.en;
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
    if (!form.name.trim() || !emailOk || form.message.trim().length < 2) {
      toast.error(m.invalid);
      return;
    }
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-inquiry", {
        body: {
          name: form.name.trim(),
          email: form.email.trim(),
          message: `${form.message.trim()}${form.phone.trim() ? `\n\n---\nPhone: ${form.phone.trim()}` : ""}`,
          language,
        },
      });
      if (error || (data as any)?.error) throw new Error((data as any)?.error || error?.message);
      toast.success(m.ok);
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch {
      toast.error(m.fail);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-dvh">
      <SEO
        title="Contact Bloom & Grace | K-Beauty Support"
        description="Reach the Bloom & Grace customer support team for order help, product questions, and partnership inquiries."
        path="/contact"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: "Bloom & Grace",
          email: "offical@bloomgrace.shop",
          url: "https://bloomgrace.shop/contact",
        }}
      />
      <Navigation />
      <section className="py-16 md:py-24 px-4 md:px-6 lg:px-8">
        <div className="container max-w-6xl">
          <div className="mb-16 space-y-3">
            <p className="text-xs font-sans tracking-[0.3em] uppercase text-muted-foreground">{t("contact_tagline")}</p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-light">{t("contact_title")}</h1>
            <p className="text-sm text-muted-foreground font-light max-w-lg">{t("contact_subtitle")}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-16">
            <div>
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label className="text-xs font-sans tracking-wider uppercase">{t("contact_name")}</label>
                  <Input className="rounded-none border-border" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-sans tracking-wider uppercase">{t("contact_email")}</label>
                  <Input type="email" className="rounded-none border-border" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-sans tracking-wider uppercase">{t("contact_phone")}</label>
                  <Input type="tel" className="rounded-none border-border" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-sans tracking-wider uppercase">{t("contact_message")}</label>
                  <Textarea rows={5} className="rounded-none border-border resize-none" placeholder={t("contact_message_placeholder")} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
                </div>
                <Button type="submit" disabled={sending} className="w-full rounded-none py-6 text-xs tracking-[0.15em] uppercase">
                  {sending ? m.sending : t("contact_submit")}
                </Button>
              </form>

            </div>

            <div className="space-y-8">
              {[
                { icon: MapPin, title: t("contact_address_title"), value: t("contact_address_value") },
                { icon: Phone, title: t("contact_phone_title"), value: t("contact_phone_value") },
                { icon: Mail, title: t("contact_email_title"), value: t("contact_email_value") },
                { icon: Clock, title: t("contact_hours_title"), value: t("contact_hours_value") },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 pb-8 border-b border-border last:border-0">
                  <item.icon className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <h3 className="text-sm font-sans font-medium mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground font-light whitespace-pre-line">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Contact;
