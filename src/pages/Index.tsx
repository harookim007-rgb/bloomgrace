import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import FeaturedProducts from "@/components/FeaturedProducts";
import BeautyConsultation from "@/components/BeautyConsultation";
import Footer from "@/components/Footer";
import FloatingButtons from "@/components/FloatingButtons";

const Index = () => {
  return (
    <div
      className="min-h-[100dvh] overflow-x-hidden relative"
      style={{
        background:
          "linear-gradient(180deg, hsl(var(--sky-soft)) 0%, hsl(var(--background)) 28%, hsl(var(--background)) 70%, hsl(var(--primary-soft)) 100%)",
      }}
    >
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

