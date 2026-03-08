import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Contact = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen">
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
              <form className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-sans tracking-wider uppercase">{t("contact_name")}</label>
                  <Input className="rounded-none border-border" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-sans tracking-wider uppercase">{t("contact_email")}</label>
                  <Input type="email" className="rounded-none border-border" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-sans tracking-wider uppercase">{t("contact_phone")}</label>
                  <Input type="tel" className="rounded-none border-border" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-sans tracking-wider uppercase">{t("contact_message")}</label>
                  <Textarea rows={5} className="rounded-none border-border resize-none" placeholder={t("contact_message_placeholder")} />
                </div>
                <Button type="submit" className="w-full rounded-none py-6 text-xs tracking-[0.15em] uppercase">
                  {t("contact_submit")}
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
