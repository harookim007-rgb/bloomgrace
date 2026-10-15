import Navigation from "@/components/Navigation";
import { Link } from "react-router-dom";
import { SUPPORT_EMAIL } from "@/lib/shop";
import { PageBlocks } from "@/components/home/HomeBlocks";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { MessageCircle, Package, RefreshCw, Shield, Sparkles, Leaf } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { ensureFont } from "@/lib/design";
import { normalizeFaq, pick, type FaqIcon } from "@/lib/faq";

const ICONS: Record<FaqIcon, React.ElementType> = {
  sparkles: Sparkles, package: Package, refresh: RefreshCw, shield: Shield, leaf: Leaf, message: MessageCircle,
};

const QA = () => {
  const { t, language } = useLanguage();
  const { faq: savedFaq } = useSiteSettings();
  const faqData = useMemo(() => normalizeFaq(savedFaq), [savedFaq]);
  const { style } = faqData;
  useEffect(() => { if (style.font) ensureFont(style.font); }, [style.font]);
  const fontStyle = style.font ? { fontFamily: `"${style.font}", var(--font-body), sans-serif` } : undefined;

  const faqs = faqData.categories
    .map(c => ({
      category: pick(c.title, language),
      icon: ICONS[c.icon],
      questions: c.items.map(i => ({ q: pick(i.q, language), a: pick(i.a, language) })).filter(i => i.q),
    }))
    .filter(c => c.questions.length > 0);

  return (
    <div className="min-h-dvh">
      <SEO
        title="Q&A — Shipping, Returns & Skincare Help | Youthroom"
        description="Answers to common questions about Youthroom K-Beauty products, shipping, returns, membership, and sustainability."
        path="/qa"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.flatMap((c) =>
            c.questions.map((q) => ({
              "@type": "Question",
              name: q.q,
              acceptedAnswer: { "@type": "Answer", text: q.a },
            })),
          ),
        }}
      />
      <Navigation />
      <PageBlocks page="qa" part="top" />
      <section className="py-16 md:py-24 px-4 md:px-6 lg:px-8">
        <div className="container max-w-4xl">
          <div className="mb-16 space-y-3">
            <p className="text-sm font-sans tracking-[0.3em] uppercase text-muted-foreground">{t("qa_tagline")}</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-light">{t("qa_title")}</h1>
            <p className="text-base md:text-lg text-muted-foreground font-light max-w-lg leading-relaxed">{t("qa_subtitle")}</p>
          </div>

          <div className="space-y-14">
            {faqs.map((cat, idx) => (
              <div key={idx}>
                <div className="flex items-center gap-3 mb-7">
                  <cat.icon className="w-5 h-5 text-muted-foreground" />
                  <h2 className="text-xl md:text-2xl font-serif font-light" style={{ ...fontStyle, color: style.titleColor || undefined }}>{cat.category}</h2>
                </div>
                <Accordion type="single" collapsible className="space-y-0">
                  {cat.questions.map((item, qIdx) => (
                    <AccordionItem key={qIdx} value={`item-${idx}-${qIdx}`} className="border-b border-border px-0">
                      <AccordionTrigger className="text-left hover:no-underline py-6 text-base md:text-lg font-sans font-medium leading-relaxed" style={{ ...fontStyle, color: style.questionColor || undefined }}>
                        {item.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-base md:text-[17px] text-muted-foreground font-light pb-6 leading-[1.85] whitespace-pre-line" style={{ ...fontStyle, color: style.answerColor || undefined }}>
                        {item.a}
                      </AccordionContent>
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
              <a href={`mailto:${SUPPORT_EMAIL}`} className="inline-flex items-center justify-center px-8 py-3 bg-foreground text-background text-xs tracking-[0.15em] uppercase">
                {t("qa_email_btn")}
              </a>
              <Link to="/contact" className="inline-flex items-center justify-center px-8 py-3 border border-foreground text-xs tracking-[0.15em] uppercase">
                {t("contact_title")}
              </Link>
            </div>
          </div>
        </div>
      </section>
      <PageBlocks page="qa" part="bottom" />
      <Footer />
    </div>
  );
};

export default QA;
