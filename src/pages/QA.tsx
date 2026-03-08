import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { MessageCircle, Package, RefreshCw, Shield, Sparkles, Leaf } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const QA = () => {
  const { t } = useLanguage();

  const faqs = [
    {
      category: t("qa_cat_product"), icon: Sparkles,
      questions: [
        { q: t("qa_q1"), a: t("qa_a1") },
        { q: t("qa_q2"), a: t("qa_a2") },
        { q: t("qa_q3"), a: t("qa_a3") },
      ]
    },
    {
      category: t("qa_cat_shipping"), icon: Package,
      questions: [
        { q: t("qa_q4"), a: t("qa_a4") },
        { q: t("qa_q5"), a: t("qa_a5") },
        { q: t("qa_q6"), a: t("qa_a6") },
      ]
    },
    {
      category: t("qa_cat_returns"), icon: RefreshCw,
      questions: [
        { q: t("qa_q7"), a: t("qa_a7") },
        { q: t("qa_q8"), a: t("qa_a8") },
      ]
    },
    {
      category: t("qa_cat_membership"), icon: Shield,
      questions: [
        { q: t("qa_q9"), a: t("qa_a9") },
        { q: t("qa_q10"), a: t("qa_a10") },
      ]
    },
    {
      category: t("qa_cat_sustainability"), icon: Leaf,
      questions: [
        { q: t("qa_q11"), a: t("qa_a11") },
        { q: t("qa_q12"), a: t("qa_a12") },
      ]
    },
    {
      category: t("qa_cat_support"), icon: MessageCircle,
      questions: [
        { q: t("qa_q13"), a: t("qa_a13") },
        { q: t("qa_q14"), a: t("qa_a14") },
      ]
    },
  ];

  return (
    <div className="min-h-screen">
      <Navigation />
      <section className="py-20 px-4 md:px-6 lg:px-8 bg-gradient-to-b from-background via-primary-soft/10 to-background">
        <div className="container max-w-5xl">
          <div className="text-center mb-16 space-y-6">
            <div className="inline-block">
              <span className="text-sm font-medium tracking-[0.3em] uppercase text-muted-foreground/70 mb-3 block">{t("qa_tagline")}</span>
              <div className="w-16 h-0.5 bg-gradient-to-r from-primary via-accent to-secondary mx-auto" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold">{t("qa_title")}</h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">{t("qa_subtitle")}</p>
          </div>
          <div className="space-y-12">
            {faqs.map((category, idx) => (
              <div key={idx} className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-primary/10"><category.icon className="w-6 h-6 text-primary" /></div>
                  <h2 className="text-2xl md:text-3xl font-bold">{category.category}</h2>
                </div>
                <Accordion type="single" collapsible className="space-y-4">
                  {category.questions.map((item, qIdx) => (
                    <AccordionItem key={qIdx} value={`item-${idx}-${qIdx}`}
                      className="border border-border/50 rounded-lg px-6 bg-card/50 backdrop-blur-sm hover:shadow-soft transition-all duration-300">
                      <AccordionTrigger className="text-left hover:text-primary transition-colors py-5 text-base md:text-lg font-medium">{item.q}</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground leading-relaxed pb-5 text-sm md:text-base">{item.a}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>
          <div className="mt-20 text-center p-10 rounded-2xl bg-gradient-to-br from-primary-soft/30 to-secondary-soft/30 border border-border/50">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">{t("qa_not_found")}</h3>
            <p className="text-muted-foreground mb-6 text-lg">{t("qa_not_found_desc")}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="mailto:contact@bloomandgrace.com"
                className="inline-flex items-center justify-center px-8 py-3 rounded-lg bg-primary hover:bg-primary-glow text-primary-foreground font-medium shadow-soft hover:shadow-elegant transition-all duration-500">
                {t("qa_email_btn")}
              </a>
              <a href="tel:+82-2-1234-5678"
                className="inline-flex items-center justify-center px-8 py-3 rounded-lg border-2 border-secondary/40 hover:border-secondary hover:bg-secondary/10 backdrop-blur-sm transition-all duration-500 font-medium">
                {t("qa_phone_btn")}
              </a>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default QA;
