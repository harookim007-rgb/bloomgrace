import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { MessageCircle, Package, RefreshCw, Shield, Sparkles, Leaf } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const QA = () => {
  const { t } = useLanguage();

  const faqs = [
    { category: t("qa_cat_product"), icon: Sparkles, questions: [
      { q: t("qa_q1"), a: t("qa_a1") }, { q: t("qa_q2"), a: t("qa_a2") }, { q: t("qa_q3"), a: t("qa_a3") },
    ]},
    { category: t("qa_cat_shipping"), icon: Package, questions: [
      { q: t("qa_q4"), a: t("qa_a4") }, { q: t("qa_q5"), a: t("qa_a5") }, { q: t("qa_q6"), a: t("qa_a6") },
    ]},
    { category: t("qa_cat_returns"), icon: RefreshCw, questions: [
      { q: t("qa_q7"), a: t("qa_a7") }, { q: t("qa_q8"), a: t("qa_a8") },
    ]},
    { category: t("qa_cat_membership"), icon: Shield, questions: [
      { q: t("qa_q9"), a: t("qa_a9") }, { q: t("qa_q10"), a: t("qa_a10") },
    ]},
    { category: t("qa_cat_sustainability"), icon: Leaf, questions: [
      { q: t("qa_q11"), a: t("qa_a11") }, { q: t("qa_q12"), a: t("qa_a12") },
    ]},
    { category: t("qa_cat_support"), icon: MessageCircle, questions: [
      { q: t("qa_q13"), a: t("qa_a13") }, { q: t("qa_q14"), a: t("qa_a14") },
    ]},
  ];

  return (
    <div className="min-h-screen">
      <Navigation />
      <section className="py-16 md:py-24 px-4 md:px-6 lg:px-8">
        <div className="container max-w-4xl">
          <div className="mb-16 space-y-3">
            <p className="text-xs font-sans tracking-[0.3em] uppercase text-muted-foreground">{t("qa_tagline")}</p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-light">{t("qa_title")}</h1>
            <p className="text-sm text-muted-foreground font-light max-w-lg">{t("qa_subtitle")}</p>
          </div>

          <div className="space-y-12">
            {faqs.map((cat, idx) => (
              <div key={idx}>
                <div className="flex items-center gap-3 mb-6">
                  <cat.icon className="w-4 h-4 text-muted-foreground" />
                  <h2 className="text-lg font-serif font-light">{cat.category}</h2>
                </div>
                <Accordion type="single" collapsible className="space-y-0">
                  {cat.questions.map((item, qIdx) => (
                    <AccordionItem key={qIdx} value={`item-${idx}-${qIdx}`} className="border-b border-border px-0">
                      <AccordionTrigger className="text-left hover:no-underline py-5 text-sm font-sans font-light">{item.q}</AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground font-light pb-5">{item.a}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>

          <div className="mt-20 py-12 px-8 border border-border text-center space-y-4">
            <h3 className="text-xl font-serif font-light">{t("qa_not_found")}</h3>
            <p className="text-sm text-muted-foreground font-light">{t("qa_not_found_desc")}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <a href="mailto:contact@bloomandgrace.com" className="inline-flex items-center justify-center px-8 py-3 bg-foreground text-background text-xs tracking-[0.15em] uppercase">
                {t("qa_email_btn")}
              </a>
              <a href="tel:+82-2-1234-5678" className="inline-flex items-center justify-center px-8 py-3 border border-foreground text-xs tracking-[0.15em] uppercase">
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
