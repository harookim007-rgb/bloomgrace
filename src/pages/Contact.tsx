import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Contact = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen">
      <Navigation />
      <section className="py-20 px-4 md:px-6 lg:px-8">
        <div className="container max-w-6xl">
          <div className="text-center mb-16 space-y-6">
            <div className="inline-block">
              <span className="text-sm font-medium tracking-[0.3em] uppercase text-muted-foreground/70 mb-3 block">{t("contact_tagline")}</span>
              <div className="w-16 h-0.5 bg-gradient-to-r from-primary via-accent to-secondary mx-auto" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold">{t("contact_title")}</h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">{t("contact_subtitle")}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold mb-6">{t("contact_send")}</h2>
                <form className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t("contact_name")}</label>
                    <Input placeholder="John Doe" className="bg-background/50 border-border/50 focus:border-primary transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t("contact_email")}</label>
                    <Input type="email" placeholder="your@email.com" className="bg-background/50 border-border/50 focus:border-primary transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t("contact_phone")}</label>
                    <Input type="tel" placeholder="+1-234-567-8900" className="bg-background/50 border-border/50 focus:border-primary transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t("contact_message")}</label>
                    <Textarea placeholder={t("contact_message_placeholder")} rows={6} className="bg-background/50 border-border/50 focus:border-primary transition-colors resize-none" />
                  </div>
                  <Button type="submit" className="w-full py-6 text-base font-medium">{t("contact_submit")}</Button>
                </form>
              </div>
            </div>
            <div className="space-y-6">
              <h2 className="text-3xl font-bold mb-6">{t("contact_info")}</h2>
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-soft hover:shadow-elegant transition-all duration-300">
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10"><MapPin className="w-6 h-6 text-primary" /></div>
                    <div><h3 className="font-semibold mb-1">{t("contact_address_title")}</h3><p className="text-muted-foreground whitespace-pre-line">{t("contact_address_value")}</p></div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-secondary/10"><Phone className="w-6 h-6 text-secondary" /></div>
                    <div><h3 className="font-semibold mb-1">{t("contact_phone_title")}</h3><p className="text-muted-foreground whitespace-pre-line">{t("contact_phone_value")}</p></div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-accent/10"><Mail className="w-6 h-6 text-accent" /></div>
                    <div><h3 className="font-semibold mb-1">{t("contact_email_title")}</h3><p className="text-muted-foreground whitespace-pre-line">{t("contact_email_value")}</p></div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10"><Clock className="w-6 h-6 text-primary" /></div>
                    <div><h3 className="font-semibold mb-1">{t("contact_hours_title")}</h3><p className="text-muted-foreground whitespace-pre-line">{t("contact_hours_value")}</p></div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border/50 bg-gradient-to-br from-primary-soft/30 to-secondary-soft/30 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <h3 className="text-xl font-bold mb-3">{t("contact_visit")}</h3>
                  <p className="text-muted-foreground mb-4">{t("contact_visit_desc")}</p>
                  <Button>{t("contact_reserve")}</Button>
                </CardContent>
              </Card>
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-elegant">
            <div className="bg-muted/30 p-4 text-center"><p className="text-sm text-muted-foreground">{t("contact_map")}</p></div>
            <div className="aspect-video bg-muted/50 flex items-center justify-center"><p className="text-muted-foreground">{t("contact_map_desc")}</p></div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Contact;
