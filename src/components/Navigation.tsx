import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingBag, User, Menu, Search, Heart, Globe, X } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage, Language } from "@/contexts/LanguageContext";
import CartDrawer from "@/components/CartDrawer";

const langLabels: Record<Language, string> = {
  en: "English", ko: "한국어", es: "Español", de: "Deutsch",
};

const Navigation = () => {
  const { user, isAdmin } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { to: "/", label: t("nav_home") },
    { to: "/products", label: t("nav_products") },
    { to: "/products?category=skincare", label: t("nav_skincare") },
    { to: "/products?category=makeup", label: t("nav_makeup") },
    { to: "/#about", label: t("nav_brand_story") },
    { to: "/contact", label: t("nav_contact") },
  ];

  return (
    <>
      {/* Announcement bar */}
      <div className="bg-foreground text-background text-[13px] text-center py-2.5 font-sans font-medium tracking-[0.12em]">
        {t("hero_tagline")}
      </div>

      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? "bg-background/98 backdrop-blur-md shadow-soft"
            : "bg-background"
        }`}
      >
        <div className="container flex h-16 md:h-20 items-center justify-between px-4 md:px-6 lg:px-8">
          {/* Mobile menu toggle */}
          <button
            className="lg:hidden p-2 -ml-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Logo — luxurious serif with letter spacing */}
          <Link to="/" className="flex items-center">
            <span className="text-xl md:text-2xl font-serif font-semibold tracking-[0.2em] uppercase text-foreground">
              BLOOM<span className="text-foreground/40 mx-0.5">&</span>GRACE
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="text-[13px] font-sans font-semibold tracking-[0.08em] uppercase text-foreground/85 hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                className="text-[13px] font-sans font-semibold tracking-[0.08em] uppercase text-primary hover:text-primary/80 transition-colors"
              >
                {t("nav_admin")}
              </Link>
            )}
          </nav>

          {/* Icons */}
          <div className="flex items-center gap-0.5">
            {/* Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-foreground/50 hover:text-primary">
                  <Globe className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[140px]">
                {(Object.keys(langLabels) as Language[]).map(lang => (
                  <DropdownMenuItem
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`text-xs tracking-wider ${language === lang ? "font-semibold text-primary" : ""}`}
                  >
                    {langLabels[lang]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link to="/products">
              <Button variant="ghost" size="icon" className="h-9 w-9 text-foreground/50 hover:text-primary">
                <Search className="h-4 w-4" />
              </Button>
            </Link>
            {user && (
              <Link to="/mypage">
                <Button variant="ghost" size="icon" className="h-9 w-9 text-foreground/50 hover:text-primary">
                  <Heart className="h-4 w-4" />
                </Button>
              </Link>
            )}
            <CartDrawer />
            <Link to={user ? "/mypage" : "/auth"}>
              <Button variant="ghost" size="icon" className="h-9 w-9 text-foreground/50 hover:text-primary">
                <User className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="h-px bg-primary/10" />
      </header>

      {/* Mobile slide-out menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-[300px] bg-background shadow-luxury p-8 animate-slide-in">
            <div className="mb-10">
              <span className="text-lg font-serif font-semibold tracking-[0.2em] uppercase text-foreground">
                BLOOM<span className="text-foreground/40 mx-0.5">&</span>GRACE
              </span>
            </div>
            <nav className="flex flex-col gap-0">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-base font-sans font-medium tracking-[0.06em] uppercase py-3.5 border-b border-border/40 text-foreground/85 hover:text-primary transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/qa"
                className="text-sm font-sans tracking-[0.1em] uppercase py-3.5 border-b border-border/40 text-foreground/60 hover:text-primary transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {t("nav_qa")}
              </Link>
              {user ? (
                <Link to="/mypage" className="text-sm font-sans tracking-[0.1em] uppercase py-3.5 border-b border-border/40 text-foreground/60 hover:text-primary" onClick={() => setMobileOpen(false)}>
                  {t("nav_mypage")}
                </Link>
              ) : (
                <Link to="/auth" className="text-sm font-sans tracking-[0.1em] uppercase py-3.5 border-b border-border/40 text-foreground/60 hover:text-primary" onClick={() => setMobileOpen(false)}>
                  {t("nav_login")}
                </Link>
              )}
              {isAdmin && (
                <Link to="/admin" className="text-sm font-sans tracking-[0.1em] uppercase py-3.5 border-b border-border/40 text-primary" onClick={() => setMobileOpen(false)}>
                  {t("nav_admin")}
                </Link>
              )}

              {/* Language switcher in mobile */}
              <div className="pt-8">
                <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-3">Language</p>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(langLabels) as Language[]).map(lang => (
                    <button
                      key={lang}
                      onClick={() => { setLanguage(lang); setMobileOpen(false); }}
                      className={`text-[11px] tracking-wider px-4 py-2 border transition-all duration-200 ${
                        language === lang ? "border-primary text-primary bg-primary/5" : "border-border text-muted-foreground hover:border-primary/30"
                      }`}
                    >
                      {langLabels[lang]}
                    </button>
                  ))}
                </div>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation;
