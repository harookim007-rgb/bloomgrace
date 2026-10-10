import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import FeaturedProducts from "@/components/FeaturedProducts";
import BeautyConsultation from "@/components/BeautyConsultation";
import Footer from "@/components/Footer";
import FloatingButtons from "@/components/FloatingButtons";
import SEO from "@/components/SEO";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const Index = () => {
  const { metaTitle, metaDescription, ogImage } = useSiteSettings();
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Youthroom",
      url: "https://bloomgrace.shop",
      logo: "https://bloomgrace.shop/apple-touch-icon.png",
      sameAs: [],
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Youthroom",
      url: "https://bloomgrace.shop",
      potentialAction: {
        "@type": "SearchAction",
        target: "https://bloomgrace.shop/products?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
  ];

  return (
    <div
      className="min-h-[100dvh] overflow-x-hidden relative"
      style={{
        background:
          "linear-gradient(180deg, hsl(var(--sky-soft)) 0%, hsl(var(--background)) 28%, hsl(var(--background)) 70%, hsl(var(--primary-soft)) 100%)",
      }}
    >
      <SEO
        title={metaTitle || "Youthroom | Korean Beauty Boutique"}
        description={metaDescription || "Discover elegant, natural K-Beauty. Curated Korean skincare, makeup, and body care with worldwide shipping and AI-personalized routines."}
        path="/"
        image={ogImage || undefined}
        jsonLd={jsonLd}
      />
      <Navigation />
      <Hero />
      <FeaturedProducts />
      <BeautyConsultation mode="section" />

      <Footer />
      <BeautyConsultation mode="modal" />
      <FloatingButtons />
    </div>
  );
};

export default Index;
