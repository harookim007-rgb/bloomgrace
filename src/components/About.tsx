const About = () => {
  return (
    <section className="py-24 px-4 md:px-6 lg:px-8 bg-gradient-to-b from-primary-soft/20 via-muted/20 to-secondary-soft/20 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-secondary/5 rounded-full blur-3xl" />
      
      <div className="container max-w-5xl relative z-10">
        <div className="text-center space-y-10">
          <div className="space-y-6">
            <div className="inline-block">
              <span className="text-sm font-medium tracking-[0.3em] uppercase text-muted-foreground/70 mb-3 block">
                Our Philosophy
              </span>
              <div className="w-16 h-0.5 bg-gradient-to-r from-primary via-accent to-secondary mx-auto" />
            </div>
            <h2 className="text-5xl md:text-6xl font-bold">Our Story</h2>
          </div>
          
          <div className="space-y-8 text-lg md:text-xl leading-relaxed text-foreground/75 max-w-3xl mx-auto">
            <p className="first-letter:text-5xl first-letter:font-bold first-letter:text-primary first-letter:mr-1 first-letter:float-left first-letter:leading-none">
              Welcome to Bloom & Grace, where Korean beauty wisdom meets autumn's gentle embrace. 
              Like walking through a serene garden kissed by fall's golden light, where soft pink 
              petals rest on verdant grass, our boutique is a sanctuary of refined elegance.
            </p>
            
            <p>
              Every product in our collection embodies the meticulous care of Korean beauty traditions—infused 
              with natural botanicals, autumn herbs, and the gentle touch of nature's finest ingredients. 
              We believe beauty should feel as luxurious and comforting as the warm glow of an autumn afternoon, 
              where every detail whispers sophistication.
            </p>
            
            <p>
              From our signature formulations to our thoughtfully designed packaging, each element is crafted 
              to enhance your natural radiance while nourishing your skin with the purity of nature. 
              Join us in celebrating beauty that blooms gracefully from within, just like the changing seasons.
            </p>
          </div>
          
          <div className="pt-8">
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <span className="w-12 h-px bg-border"></span>
              <span>Crafted with care since 2024</span>
              <span className="w-12 h-px bg-border"></span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
