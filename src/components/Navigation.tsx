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
  en: "EN", ko: "KR", es: "ES", de: "DE",
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
      <div className="bg-foreground text-background text-xs text-center py-2 font-sans tracking-wider">
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

          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-xl md:text-2xl font-serif font-semibold tracking-wider uppercase">
              BLOOM & GRACE
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="text-xs font-sans font-medium tracking-[0.15em] uppercase text-foreground/70 hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                className="text-xs font-sans font-medium tracking-[0.15em] uppercase text-primary hover:text-primary/80 transition-colors"
              >
                {t("nav_admin")}
              </Link>
            )}
          </nav>

          {/* Icons */}
          <div className="flex items-center gap-0.5">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-foreground/60 hover:text-foreground">
                  <Globe className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[100px]">
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
              <Button variant="ghost" size="icon" className="h-9 w-9 text-foreground/60 hover:text-foreground">
                <Search className="h-4 w-4" />
              </Button>
            </Link>
            {user && (
              <Link to="/mypage">
                <Button variant="ghost" size="icon" className="h-9 w-9 text-foreground/60 hover:text-foreground">
                  <Heart className="h-4 w-4" />
                </Button>
              </Link>
            )}
            <CartDrawer />
            <Link to={user ? "/mypage" : "/auth"}>
              <Button variant="ghost" size="icon" className="h-9 w-9 text-foreground/60 hover:text-foreground">
                <User className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Subtle bottom border */}
        <div className="h-px bg-border" />
      </header>

      {/* Mobile slide-out menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-foreground/20" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-[280px] bg-background shadow-luxury p-8 animate-slide-in">
            <div className="mb-10">
              <span className="text-lg font-serif font-semibold tracking-wider uppercase">BLOOM & GRACE</span>
            </div>
            <nav className="flex flex-col gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-sm font-sans tracking-wider uppercase py-3 border-b border-border/50 text-foreground/70 hover:text-foreground transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/qa"
                className="text-sm font-sans tracking-wider uppercase py-3 border-b border-border/50 text-foreground/70 hover:text-foreground transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {t("nav_qa")}
              </Link>
              {user ? (
                <Link to="/mypage" className="text-sm font-sans tracking-wider uppercase py-3 border-b border-border/50 text-foreground/70 hover:text-foreground" onClick={() => setMobileOpen(false)}>
                  {t("nav_mypage")}
                </Link>
              ) : (
                <Link to="/auth" className="text-sm font-sans tracking-wider uppercase py-3 border-b border-border/50 text-foreground/70 hover:text-foreground" onClick={() => setMobileOpen(false)}>
                  {t("nav_login")}
                </Link>
              )}
              {isAdmin && (
                <Link to="/admin" className="text-sm font-sans tracking-wider uppercase py-3 border-b border-border/50 text-primary" onClick={() => setMobileOpen(false)}>
                  {t("nav_admin")}
                </Link>
              )}

              {/* Language */}
              <div className="pt-6 flex gap-3">
                {(Object.keys(langLabels) as Language[]).map(lang => (
                  <button
                    key={lang}
                    onClick={() => { setLanguage(lang); setMobileOpen(false); }}
                    className={`text-xs tracking-wider uppercase px-3 py-1.5 border transition-colors ${
                      language === lang ? "border-foreground text-foreground" : "border-border text-muted-foreground"
                    }`}
                  >
                    {langLabels[lang]}
                  </button>
                ))}
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation;
