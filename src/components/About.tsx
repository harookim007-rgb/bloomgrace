const About = () => {
  return (
    <section className="py-20 px-4 md:px-6 bg-primary-soft/30">
      <div className="container max-w-4xl">
        <div className="text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold">Our Story</h2>
          
          <div className="space-y-6 text-lg leading-relaxed text-foreground/80">
            <p>
              Welcome to Bloom & Grace, where beauty is celebrated in its most natural, 
              elegant form. Like stepping into a charming café with white walls adorned 
              with fresh flowers, our boutique offers a sanctuary of refinement and warmth.
            </p>
            
            <p>
              Every product in our collection is carefully curated with the same attention 
              to detail you'd find in a space filled with green plants, gentle lighting, 
              and the soft melody of jazz in the background. We believe beauty should feel 
              as comforting and luxurious as your favorite retreat.
            </p>
            
            <p>
              From premium ingredients to elegant packaging, we craft cosmetics that enhance 
              your natural radiance while nourishing your skin. Join us in celebrating 
              beauty that blooms from within.
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
