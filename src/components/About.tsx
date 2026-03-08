import { useLanguage } from "@/contexts/LanguageContext";

const About = () => {
  const { t } = useLanguage();

  return (
    <section id="about" className="py-24 px-4 md:px-6 lg:px-8 bg-gradient-to-b from-primary-soft/20 via-muted/20 to-secondary-soft/20 relative overflow-hidden">
      {/* Floral decorative elements */}
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-secondary/5 rounded-full blur-3xl" />
      <div className="absolute top-10 right-10 text-primary/8 text-9xl select-none pointer-events-none font-serif rotate-12">🌸</div>
      <div className="absolute bottom-10 left-10 text-secondary/8 text-7xl select-none pointer-events-none font-serif -rotate-6">🌿</div>
      <div className="absolute top-1/3 left-10 text-accent/8 text-6xl select-none pointer-events-none font-serif">🌺</div>
      
      <div className="container max-w-5xl relative z-10">
        <div className="text-center space-y-10">
          <div className="space-y-6">
            <div className="inline-block">
              <span className="text-sm font-medium tracking-[0.3em] uppercase text-muted-foreground/70 mb-3 block">
                {t("about_tagline")}
              </span>
              <div className="w-16 h-0.5 bg-gradient-to-r from-primary via-accent to-secondary mx-auto" />
            </div>
            <h2 className="text-5xl md:text-6xl font-bold">{t("about_title")}</h2>
          </div>
          
          <div className="space-y-8 text-lg md:text-xl leading-relaxed text-foreground/75 max-w-3xl mx-auto">
            <p className="first-letter:text-5xl first-letter:font-bold first-letter:text-primary first-letter:mr-1 first-letter:float-left first-letter:leading-none">
              {t("about_p1")}
            </p>
            <p>{t("about_p2")}</p>
            <p>{t("about_p3")}</p>
          </div>
          
          <div className="pt-8">
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <span className="w-12 h-px bg-border"></span>
              <span>🌷 {t("about_since")} 🌷</span>
              <span className="w-12 h-px bg-border"></span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
