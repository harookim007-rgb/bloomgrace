import { useLanguage } from "@/contexts/LanguageContext";
import aboutImg from "@/assets/about-luxury.jpg";

const About = () => {
  const { t } = useLanguage();

  return (
    <section id="about" className="py-20 md:py-28 bg-muted/30">
      <div className="container px-4 md:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
          {/* Image */}
          <div className="aspect-square overflow-hidden bg-primary-soft rounded-sm">
            <img
              src={aboutImg}
              alt="About Bloom & Grace"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>

          {/* Content */}
          <div className="space-y-8 max-w-lg">
            <div className="space-y-4">
              <p className="text-sm font-sans font-bold tracking-[0.2em] uppercase text-primary">
                {t("about_tagline")}
              </p>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold leading-tight">
                {t("about_title")}
              </h2>
            </div>

            <div className="space-y-5 text-base md:text-lg leading-[1.8] text-muted-foreground font-sans">
              <p>{t("about_p1")}</p>
              <p>{t("about_p2")}</p>
              <p>{t("about_p3")}</p>
            </div>

            <div className="pt-4">
              <p className="text-sm font-sans tracking-[0.2em] uppercase text-muted-foreground/60 font-semibold">
                {t("about_since")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
