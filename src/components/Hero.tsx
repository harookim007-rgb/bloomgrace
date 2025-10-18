import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-korean-cosmetics.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-background/96 via-background/85 to-background/40" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/30" />
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-20 right-10 w-32 h-32 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-20 left-10 w-40 h-40 rounded-full bg-secondary/10 blur-3xl" />
      
      <div className="container relative z-10 px-4 md:px-6 lg:px-8">
        <div className="max-w-3xl space-y-8 animate-fade-in">
          <div className="inline-block">
            <span className="text-sm font-medium tracking-[0.3em] uppercase text-muted-foreground/80 mb-4 block">
              Premium Korean Beauty
            </span>
            <div className="w-16 h-0.5 bg-gradient-to-r from-primary to-secondary/50" />
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold tracking-tight leading-[1.1]">
            Bloom & Grace
          </h1>
          
          <p className="text-xl md:text-2xl text-foreground/70 font-light leading-relaxed max-w-2xl">
            Where Korean beauty traditions meet autumn elegance. 
            Discover luxurious cosmetics infused with natural botanicals, 
            crafted to enhance your innate grace.
          </p>
          
          <div className="flex flex-wrap gap-4 pt-6">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary-glow text-primary-foreground shadow-elegant hover:shadow-luxury transition-all duration-500 px-10 py-6 text-base font-medium"
            >
              Explore Collection
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-2 border-secondary/40 hover:border-secondary hover:bg-secondary/10 backdrop-blur-sm transition-all duration-500 px-10 py-6 text-base font-medium"
            >
              Our Philosophy
            </Button>
          </div>
          
          <div className="flex items-center gap-6 pt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span>Natural Ingredients</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span>Korean Formula</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span>Cruelty Free</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
