import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingBag, User, Menu, Search, Heart, Globe } from "lucide-react";
import {
  NavigationMenu, NavigationMenuContent, NavigationMenuItem,
  NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage, Language } from "@/contexts/LanguageContext";
import CartDrawer from "@/components/CartDrawer";

const langLabels: Record<Language, string> = {
  en: "English",
  ko: "한국어",
  es: "Español",
  de: "Deutsch",
};

const Navigation = () => {
  const { user, isAdmin } = useAuth();
  const { t, language, setLanguage } = useLanguage();

  const categories = [
    { to: "/products", label: t("nav_all_products"), desc: t("nav_all_products") },
    { to: "/products?category=skincare", label: t("nav_skincare"), desc: t("nav_skincare_desc") },
    { to: "/products?category=makeup", label: t("nav_makeup"), desc: t("nav_makeup_desc") },
    { to: "/products?category=haircare", label: t("nav_haircare"), desc: t("nav_haircare_desc") },
    { to: "/products?category=fragrance", label: t("nav_fragrance"), desc: t("nav_fragrance_desc") },
    { to: "/products?category=bodycare", label: t("nav_bodycare"), desc: t("nav_bodycare_desc") },
    { to: "/products?category=health", label: t("nav_health"), desc: t("nav_health_desc") },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/90 shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6 lg:px-8">
        <Link to="/" className="flex items-center space-x-2 group">
          <span className="text-xl md:text-2xl font-bold font-serif group-hover:text-primary transition-colors">
            🌸 Bloom & Grace
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium transition-colors hover:text-primary">{t("nav_home")}</Link>
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent hover:bg-primary-soft/50">{t("nav_products")}</NavigationMenuTrigger>
                <NavigationMenuContent className="bg-background/95 backdrop-blur-md">
                  <ul className="grid w-[300px] gap-2 p-3">
                    {categories.map(item => (
                      <li key={item.to}>
                        <NavigationMenuLink asChild>
                          <Link to={item.to} className="block p-2 rounded-md hover:bg-primary-soft/50 transition-colors">
                            <div className="text-sm font-medium">{item.label}</div>
                            <p className="text-xs text-muted-foreground">{item.desc}</p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          <Link to="/#about" className="text-sm font-medium transition-colors hover:text-primary">{t("nav_brand_story")}</Link>
          <Link to="/qa" className="text-sm font-medium transition-colors hover:text-primary">{t("nav_qa")}</Link>
          <Link to="/contact" className="text-sm font-medium transition-colors hover:text-primary">{t("nav_contact")}</Link>
          {isAdmin && (
            <Link to="/admin" className="text-sm font-medium transition-colors hover:text-primary text-primary">
              {t("nav_admin")}
            </Link>
          )}
        </nav>

        {/* Icons */}
        <div className="flex items-center gap-1">
          {/* Language Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-primary-soft/50 hover:text-primary">
                <Globe className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[140px]">
              {(Object.keys(langLabels) as Language[]).map(lang => (
                <DropdownMenuItem
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={language === lang ? "bg-primary/10 text-primary font-medium" : ""}
                >
                  {langLabels[lang]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Link to="/products">
            <Button variant="ghost" size="icon" className="hover:bg-primary-soft/50 hover:text-primary">
              <Search className="h-5 w-5" />
            </Button>
          </Link>
          {user && (
            <Link to="/mypage">
              <Button variant="ghost" size="icon" className="hover:bg-primary-soft/50 hover:text-primary">
                <Heart className="h-5 w-5" />
              </Button>
            </Link>
          )}
          <CartDrawer />
          <Link to={user ? "/mypage" : "/auth"}>
            <Button variant="ghost" size="icon" className="hover:bg-primary-soft/50 hover:text-primary">
              <User className="h-5 w-5" />
            </Button>
          </Link>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon"><Menu className="h-5 w-5" /></Button>
            </SheetTrigger>
            <SheetContent className="w-[300px]">
              <SheetHeader><SheetTitle className="font-serif text-2xl">🌸 {t("nav_menu")}</SheetTitle></SheetHeader>
              <nav className="flex flex-col gap-3 mt-6">
                <Link to="/" className="text-base font-medium py-2 hover:text-primary">{t("nav_home")}</Link>
                <Link to="/products" className="text-base font-medium py-2 hover:text-primary">{t("nav_all_products")}</Link>
                <Link to="/products?category=skincare" className="text-sm py-1 pl-4 hover:text-primary text-muted-foreground">{t("nav_skincare")}</Link>
                <Link to="/products?category=makeup" className="text-sm py-1 pl-4 hover:text-primary text-muted-foreground">{t("nav_makeup")}</Link>
                <Link to="/products?category=haircare" className="text-sm py-1 pl-4 hover:text-primary text-muted-foreground">{t("nav_haircare")}</Link>
                <Link to="/products?category=fragrance" className="text-sm py-1 pl-4 hover:text-primary text-muted-foreground">{t("nav_fragrance")}</Link>
                <Link to="/#about" className="text-base font-medium py-2 hover:text-primary">{t("nav_brand_story")}</Link>
                <Link to="/qa" className="text-base font-medium py-2 hover:text-primary">{t("nav_qa")}</Link>
                <Link to="/contact" className="text-base font-medium py-2 hover:text-primary">{t("nav_contact")}</Link>

                {/* Mobile Language Switcher */}
                <div className="border-t pt-3 mt-2">
                  <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Language</p>
                  <div className="flex flex-wrap gap-2">
                    {(Object.keys(langLabels) as Language[]).map(lang => (
                      <Button key={lang} variant={language === lang ? "default" : "outline"} size="sm"
                        onClick={() => setLanguage(lang)}>
                        {langLabels[lang]}
                      </Button>
                    ))}
                  </div>
                </div>

                {user ? (
                  <Link to="/mypage" className="text-base font-medium py-2 hover:text-primary">{t("nav_mypage")}</Link>
                ) : (
                  <Link to="/auth" className="text-base font-medium py-2 hover:text-primary">{t("nav_login")}</Link>
                )}
                {isAdmin && <Link to="/admin" className="text-base font-medium py-2 text-primary">{t("nav_admin")}</Link>}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Navigation;
