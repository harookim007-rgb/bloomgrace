import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-foreground text-primary-foreground">
      {/* Gold top border */}
      <div className="h-px bg-accent" />

      <div className="container px-4 md:px-6 lg:px-8 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {/* Brand story */}
          <div className="space-y-5">
            <h3 className="text-lg font-serif font-normal tracking-[0.2em] uppercase">BLOOM & GRACE</h3>
            <p className="text-sm text-primary-foreground/50 leading-relaxed font-light">{t("footer_desc")}</p>
            <div className="flex gap-6 pt-2">
              {["Instagram", "Facebook", "YouTube"].map(name => (
                <a key={name} href="#" className="text-[10px] font-sans font-light tracking-[0.15em] uppercase text-primary-foreground/40 hover:text-accent transition-colors">
                  {name}
                </a>
              ))}
            </div>
          </div>

          {/* Navigation links */}
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-[10px] font-sans font-normal tracking-[0.2em] uppercase text-primary-foreground/30">{t("footer_products")}</h4>
              <ul className="space-y-3">
                <li><Link to="/products" className="text-sm text-primary-foreground/50 hover:text-accent transition-colors font-light">{t("nav_all_products")}</Link></li>
                <li><Link to="/products?category=skincare" className="text-sm text-primary-foreground/50 hover:text-accent transition-colors font-light">{t("nav_skincare")}</Link></li>
                <li><Link to="/products?category=makeup" className="text-sm text-primary-foreground/50 hover:text-accent transition-colors font-light">{t("nav_makeup")}</Link></li>
                <li><Link to="/products?category=new" className="text-sm text-primary-foreground/50 hover:text-accent transition-colors font-light">{t("footer_new")}</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] font-sans font-normal tracking-[0.2em] uppercase text-primary-foreground/30">{t("footer_brand")}</h4>
              <ul className="space-y-3">
                <li><Link to="/#about" className="text-sm text-primary-foreground/50 hover:text-accent transition-colors font-light">{t("nav_brand_story")}</Link></li>
                <li><Link to="/contact" className="text-sm text-primary-foreground/50 hover:text-accent transition-colors font-light">{t("footer_store")}</Link></li>
                <li><a href="#" className="text-sm text-primary-foreground/50 hover:text-accent transition-colors font-light">{t("footer_sustainability")}</a></li>
              </ul>
            </div>
          </div>

          {/* Contact + Support */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-sans font-normal tracking-[0.2em] uppercase text-primary-foreground/30">{t("footer_support")}</h4>
            <ul className="space-y-3">
              <li><Link to="/contact" className="text-sm text-primary-foreground/50 hover:text-accent transition-colors font-light">{t("nav_contact")}</Link></li>
              <li><Link to="/qa" className="text-sm text-primary-foreground/50 hover:text-accent transition-colors font-light">{t("footer_faq")}</Link></li>
              <li><a href="#" className="text-sm text-primary-foreground/50 hover:text-accent transition-colors font-light">{t("footer_shipping")}</a></li>
              <li><a href="#" className="text-sm text-primary-foreground/50 hover:text-accent transition-colors font-light">{t("footer_returns")}</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-primary-foreground/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-primary-foreground/30 font-sans font-light">
            <p>&copy; 2024 Bloom & Grace. {t("footer_rights")}</p>
            <p className="tracking-wider">{t("footer_cs")}</p>
          </div>
          <div className="mt-4 text-center">
            <p className="text-[10px] text-primary-foreground/20 font-sans font-light leading-relaxed">
              사업자등록번호: 123-45-67890 | 통신판매업신고번호: 2024-서울강남-00000 | 대표: 홍길동
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
