import { useLanguage } from "@/contexts/LanguageContext";
import aboutImg from "@/assets/about-luxury.jpg";

const About = () => {
  const { t } = useLanguage();

  return (
    <>
      <div className="section-divider" />
      <section id="about" className="py-16 md:py-[120px]">
        <div className="container px-4 md:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
            {/* Image */}
            <div className="aspect-[4/5] overflow-hidden">
              <img
                src={aboutImg}
                alt="About Bloom & Grace"
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-[1.03]"
                loading="lazy"
              />
            </div>

            {/* Content */}
            <div className="space-y-8 max-w-lg">
              <div className="space-y-4">
                <p className="text-xs font-sans font-light tracking-[0.25em] uppercase text-accent">
                  {t("about_tagline")}
                </p>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-normal leading-tight tracking-[0.04em]">
                  {t("about_title")}
                </h2>
                <span className="block w-10 h-px bg-accent mt-4" />
              </div>

              <div className="space-y-5 text-base leading-[1.9] text-muted-foreground font-sans font-light">
                <p>{t("about_p1")}</p>
                <p>{t("about_p2")}</p>
                <p>{t("about_p3")}</p>
              </div>

              <div className="pt-4">
                <p className="text-[10px] font-sans tracking-[0.25em] uppercase text-muted-foreground/40 font-light">
                  {t("about_since")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default About;
