import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import FeaturedProducts from "@/components/FeaturedProducts";
import BeautyConsultation from "@/components/BeautyConsultation";
import About from "@/components/About";
import Footer from "@/components/Footer";
import FloatingButtons from "@/components/FloatingButtons";
import FallingPetals from "@/components/FallingPetals";
import sakuraCorner from "@/assets/sakura-bg-corner.png";

const Index = () => {
  return (
    <div
      className="min-h-[100dvh] overflow-x-hidden relative"
      style={{
        background:
          "linear-gradient(180deg, hsl(var(--sky-soft)) 0%, hsl(var(--background)) 28%, hsl(var(--background)) 70%, hsl(var(--primary-soft)) 100%)",
      }}
    >
      {/* page-wide petals now mounted globally in App.tsx */}


      <Navigation />
      <Hero />

      {/* Featured section with subtle sakura corner */}
      <div className="relative">
        <img
          src={sakuraCorner}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute top-10 left-0 w-[22%] max-w-[260px] opacity-30 mix-blend-multiply select-none"
        />
        <FeaturedProducts />
      </div>

      <BeautyConsultation mode="section" />

      <div className="relative">
        <img
          src={sakuraCorner}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute top-0 right-0 w-[26%] max-w-[300px] opacity-30 mix-blend-multiply select-none -scale-x-100"
        />
        <About />
      </div>

      <Footer />
      <BeautyConsultation mode="modal" />
      <FloatingButtons />
    </div>
  );
};

export default Index;
