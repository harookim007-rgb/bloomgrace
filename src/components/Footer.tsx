import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container px-4 md:px-6 lg:px-8 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-8">
          <div className="space-y-5 lg:col-span-1">
            <h3 className="text-lg font-serif font-semibold tracking-wider uppercase">BLOOM & GRACE</h3>
            <p className="text-base text-foreground/75 font-normal leading-relaxed">{t("footer_desc")}</p>
            <div className="flex gap-4 pt-2">
              {["Instagram", "Facebook", "YouTube"].map(name => (
                <a key={name} href="#" className="text-sm font-sans font-medium tracking-wide uppercase text-foreground/70 hover:text-foreground transition-colors">
                  {name}
                </a>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-sans font-semibold tracking-[0.14em] uppercase">{t("footer_products")}</h4>
            <ul className="space-y-3 text-base text-foreground/75 font-normal">
              <li><Link to="/products" className="hover:text-foreground transition-colors">{t("nav_all_products")}</Link></li>
              <li><Link to="/products?category=skincare" className="hover:text-foreground transition-colors">{t("nav_skincare")}</Link></li>
              <li><Link to="/products?category=makeup" className="hover:text-foreground transition-colors">{t("nav_makeup")}</Link></li>
              <li><Link to="/products?category=new" className="hover:text-foreground transition-colors">{t("footer_new")}</Link></li>
              <li><Link to="/products?category=bestseller" className="hover:text-foreground transition-colors">{t("footer_bestseller")}</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-sans font-semibold tracking-[0.14em] uppercase">{t("footer_brand")}</h4>
            <ul className="space-y-3 text-base text-foreground/75 font-normal">
              <li><Link to="/#about" className="hover:text-foreground transition-colors">{t("nav_brand_story")}</Link></li>
              <li><Link to="/contact" className="hover:text-foreground transition-colors">{t("footer_store")}</Link></li>
              <li><a href="#" className="hover:text-foreground transition-colors">{t("footer_sustainability")}</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">{t("footer_ingredients")}</a></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-sans font-semibold tracking-[0.14em] uppercase">{t("footer_support")}</h4>
            <ul className="space-y-3 text-base text-foreground/75 font-normal">
              <li><Link to="/contact" className="hover:text-foreground transition-colors">{t("nav_contact")}</Link></li>
              <li><Link to="/qa" className="hover:text-foreground transition-colors">{t("footer_faq")}</Link></li>
              <li><a href="#" className="hover:text-foreground transition-colors">{t("footer_shipping")}</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">{t("footer_returns")}</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">{t("footer_terms")}</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground font-sans">
            <p>&copy; 2024 Bloom & Grace. {t("footer_rights")}</p>
            <p className="tracking-wider">{t("footer_cs")}</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
