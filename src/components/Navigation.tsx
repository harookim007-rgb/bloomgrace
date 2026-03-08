import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingBag, User, Menu, Search, Heart } from "lucide-react";
import {
  NavigationMenu, NavigationMenuContent, NavigationMenuItem,
  NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import CartDrawer from "@/components/CartDrawer";

const Navigation = () => {
  const { user, isAdmin } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/90 shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6 lg:px-8">
        <Link to="/" className="flex items-center space-x-2 group">
          <span className="text-xl md:text-2xl font-bold font-serif group-hover:text-primary transition-colors">
            Bloom & Grace
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium transition-colors hover:text-primary">홈</Link>
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent hover:bg-primary-soft/50">제품</NavigationMenuTrigger>
                <NavigationMenuContent className="bg-background/95 backdrop-blur-md">
                  <ul className="grid w-[300px] gap-2 p-3">
                    {[
                      { to: "/products", label: "전체 제품", desc: "모든 컬렉션" },
                      { to: "/products?category=skincare", label: "스킨케어", desc: "피부 케어 제품" },
                      { to: "/products?category=makeup", label: "메이크업", desc: "컬러 화장품" },
                      { to: "/products?category=haircare", label: "헤어케어", desc: "모발 관리" },
                      { to: "/products?category=fragrance", label: "향수", desc: "시그니처 향수" },
                      { to: "/products?category=bodycare", label: "바디케어", desc: "바디 케어" },
                      { to: "/products?category=health", label: "건강식품", desc: "건강 보조 식품" },
                    ].map(item => (
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
          <Link to="/#about" className="text-sm font-medium transition-colors hover:text-primary">브랜드 스토리</Link>
          <Link to="/qa" className="text-sm font-medium transition-colors hover:text-primary">Q&A</Link>
          <Link to="/contact" className="text-sm font-medium transition-colors hover:text-primary">문의하기</Link>
          {/* Admin link - only visible to admins */}
          {isAdmin && (
            <Link to="/admin" className="text-sm font-medium transition-colors hover:text-primary text-primary">
              관리자
            </Link>
          )}
        </nav>

        {/* Icons */}
        <div className="flex items-center gap-1">
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
              <SheetHeader><SheetTitle className="font-serif text-2xl">메뉴</SheetTitle></SheetHeader>
              <nav className="flex flex-col gap-3 mt-6">
                <Link to="/" className="text-base font-medium py-2 hover:text-primary">홈</Link>
                <Link to="/products" className="text-base font-medium py-2 hover:text-primary">전체 제품</Link>
                <Link to="/products?category=skincare" className="text-sm py-1 pl-4 hover:text-primary text-muted-foreground">스킨케어</Link>
                <Link to="/products?category=makeup" className="text-sm py-1 pl-4 hover:text-primary text-muted-foreground">메이크업</Link>
                <Link to="/products?category=haircare" className="text-sm py-1 pl-4 hover:text-primary text-muted-foreground">헤어케어</Link>
                <Link to="/products?category=fragrance" className="text-sm py-1 pl-4 hover:text-primary text-muted-foreground">향수</Link>
                <Link to="/#about" className="text-base font-medium py-2 hover:text-primary">브랜드 스토리</Link>
                <Link to="/qa" className="text-base font-medium py-2 hover:text-primary">Q&A</Link>
                <Link to="/contact" className="text-base font-medium py-2 hover:text-primary">문의하기</Link>
                {user ? (
                  <Link to="/mypage" className="text-base font-medium py-2 hover:text-primary">마이페이지</Link>
                ) : (
                  <Link to="/auth" className="text-base font-medium py-2 hover:text-primary">로그인</Link>
                )}
                {isAdmin && <Link to="/admin" className="text-base font-medium py-2 text-primary">관리자</Link>}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Navigation;
