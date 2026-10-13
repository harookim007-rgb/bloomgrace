import Navigation from "@/components/Navigation";
import BeautyConsultation from "@/components/BeautyConsultation";
import HomeBlocks from "@/components/home/HomeBlocks";
import Footer from "@/components/Footer";
import FloatingButtons from "@/components/FloatingButtons";
import SEO from "@/components/SEO";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useDesign } from "@/hooks/useDesign";

const Index = () => {
  const { metaTitle, metaDescription, ogImage } = useSiteSettings();
  const { home } = useDesign();
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Youthroom",
      url: "https://youthroom.shop",
      logo: "https://youthroom.shop/apple-touch-icon.png",
      sameAs: [],
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Youthroom",
      url: "https://youthroom.shop",
      potentialAction: {
        "@type": "SearchAction",
        target: "https://youthroom.shop/products?q={search_term_string}",
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
      <HomeBlocks blocks={home.blocks} />

      <Footer />
      <BeautyConsultation mode="modal" />
      <FloatingButtons />
    </div>
  );
};

export default Index;
