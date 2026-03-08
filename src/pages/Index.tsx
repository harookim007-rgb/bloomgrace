import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import FeaturedProducts from "@/components/FeaturedProducts";
import BeautyConsultation from "@/components/BeautyConsultation";
import About from "@/components/About";
import Footer from "@/components/Footer";
import FloatingButtons from "@/components/FloatingButtons";

const Index = () => {
  return (
    <div className="min-h-[100dvh] overflow-x-hidden">
      <Navigation />
      <Hero />
      <div className="section-divider" />
      <FeaturedProducts />
      <div className="section-divider" />
      <BeautyConsultation mode="section" />
      <About />
      <Footer />
      <BeautyConsultation mode="modal" />
      <FloatingButtons />
    </div>
  );
};

export default Index;
