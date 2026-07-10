import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import FeaturedProducts from "@/components/FeaturedProducts";
import BeautyConsultation from "@/components/BeautyConsultation";
import Footer from "@/components/Footer";
import FloatingButtons from "@/components/FloatingButtons";
import SEO from "@/components/SEO";

const Index = () => {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Bloom & Grace",
      url: "https://bloomgrace.shop",
      logo: "https://bloomgrace.shop/placeholder.svg",
      sameAs: [],
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Bloom & Grace",
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
        title="Bloom & Grace | Korean Beauty Boutique"
        description="Discover elegant, natural K-Beauty. Curated Korean skincare, makeup, and body care with worldwide shipping and AI-personalized routines."
        path="/"
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
