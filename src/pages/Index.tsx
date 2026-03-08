import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import FeaturedProducts from "@/components/FeaturedProducts";
import BeautyConsultation from "@/components/BeautyConsultation";
import About from "@/components/About";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      <FeaturedProducts />
      <BeautyConsultation mode="section" />
      <About />
      <Footer />
      {/* First-visit modal */}
      <BeautyConsultation mode="modal" />
    </div>
  );
};

export default Index;
