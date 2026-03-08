import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-border bg-muted/20">
      <div className="container px-4 md:px-6 lg:px-8 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-8">
          <div className="space-y-5 lg:col-span-1">
            <h3 className="text-xl font-serif font-bold tracking-wider uppercase">BLOOM & GRACE</h3>
            <p className="text-base text-muted-foreground leading-relaxed">{t("footer_desc")}</p>
            <div className="flex gap-5 pt-2">
              {["Instagram", "Facebook", "YouTube"].map(name => (
                <a key={name} href="#" className="text-sm font-sans font-semibold tracking-wide uppercase text-foreground/60 hover:text-primary transition-colors">
                  {name}
                </a>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-base font-sans font-bold tracking-[0.1em] uppercase">{t("footer_products")}</h4>
            <ul className="space-y-3">
              <li><Link to="/products" className="text-base text-muted-foreground hover:text-primary transition-colors">{t("nav_all_products")}</Link></li>
              <li><Link to="/products?category=skincare" className="text-base text-muted-foreground hover:text-primary transition-colors">{t("nav_skincare")}</Link></li>
              <li><Link to="/products?category=makeup" className="text-base text-muted-foreground hover:text-primary transition-colors">{t("nav_makeup")}</Link></li>
              <li><Link to="/products?category=new" className="text-base text-muted-foreground hover:text-primary transition-colors">{t("footer_new")}</Link></li>
              <li><Link to="/products?category=bestseller" className="text-base text-muted-foreground hover:text-primary transition-colors">{t("footer_bestseller")}</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-base font-sans font-bold tracking-[0.1em] uppercase">{t("footer_brand")}</h4>
            <ul className="space-y-3">
              <li><Link to="/#about" className="text-base text-muted-foreground hover:text-primary transition-colors">{t("nav_brand_story")}</Link></li>
              <li><Link to="/contact" className="text-base text-muted-foreground hover:text-primary transition-colors">{t("footer_store")}</Link></li>
              <li><a href="#" className="text-base text-muted-foreground hover:text-primary transition-colors">{t("footer_sustainability")}</a></li>
              <li><a href="#" className="text-base text-muted-foreground hover:text-primary transition-colors">{t("footer_ingredients")}</a></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-base font-sans font-bold tracking-[0.1em] uppercase">{t("footer_support")}</h4>
            <ul className="space-y-3">
              <li><Link to="/contact" className="text-base text-muted-foreground hover:text-primary transition-colors">{t("nav_contact")}</Link></li>
              <li><Link to="/qa" className="text-base text-muted-foreground hover:text-primary transition-colors">{t("footer_faq")}</Link></li>
              <li><a href="#" className="text-base text-muted-foreground hover:text-primary transition-colors">{t("footer_shipping")}</a></li>
              <li><a href="#" className="text-base text-muted-foreground hover:text-primary transition-colors">{t("footer_returns")}</a></li>
              <li><a href="#" className="text-base text-muted-foreground hover:text-primary transition-colors">{t("footer_terms")}</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground font-sans font-medium">
            <p>&copy; 2024 Bloom & Grace. {t("footer_rights")}</p>
            <p className="tracking-wider">{t("footer_cs")}</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
