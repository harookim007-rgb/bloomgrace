import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingBag, User, Menu } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const Navigation = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/90 shadow-sm">
      <div className="container flex h-20 items-center justify-between px-4 md:px-6 lg:px-8">
        <Link to="/" className="flex items-center space-x-2 group">
          <span className="text-2xl md:text-3xl font-bold font-serif group-hover:text-primary transition-colors">
            Bloom & Grace
          </span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          <Link to="/" className="text-sm font-medium transition-colors hover:text-primary">
            홈
          </Link>
          
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent hover:bg-primary-soft/50 data-[state=open]:bg-primary-soft/50">
                  제품
                </NavigationMenuTrigger>
                <NavigationMenuContent className="bg-background/95 backdrop-blur-md border-border/50">
                  <ul className="grid w-[400px] gap-3 p-4">
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/products"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-primary-soft/50 hover:text-primary"
                        >
                          <div className="text-sm font-medium leading-none">전체 제품</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            모든 컬렉션 둘러보기
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/products?category=skincare"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-primary-soft/50 hover:text-primary"
                        >
                          <div className="text-sm font-medium leading-none">스킨케어</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            피부를 위한 케어 제품
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/products?category=makeup"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-primary-soft/50 hover:text-primary"
                        >
                          <div className="text-sm font-medium leading-none">메이크업</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            컬러 화장품 라인
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          
          <Link to="/#about" className="text-sm font-medium transition-colors hover:text-primary">
            브랜드 스토리
          </Link>
          
          <Link to="/qa" className="text-sm font-medium transition-colors hover:text-primary">
            Q&A
          </Link>
          
          <Link to="/contact" className="text-sm font-medium transition-colors hover:text-primary">
            문의하기
          </Link>
        </nav>
        
        {/* Icons */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="hover:bg-primary-soft/50 hover:text-primary transition-all">
            <ShoppingBag className="h-5 w-5" />
          </Button>
          <Link to="/admin">
            <Button variant="ghost" size="icon" className="hover:bg-primary-soft/50 hover:text-primary transition-all">
              <User className="h-5 w-5" />
            </Button>
          </Link>
          
          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="hover:bg-primary-soft/50">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[300px] bg-background/98 backdrop-blur-md">
              <SheetHeader>
                <SheetTitle className="font-serif text-2xl">메뉴</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-4 mt-8">
                <Link to="/" className="text-base font-medium py-2 hover:text-primary transition-colors">
                  홈
                </Link>
                <Link to="/products" className="text-base font-medium py-2 hover:text-primary transition-colors">
                  전체 제품
                </Link>
                <Link to="/#about" className="text-base font-medium py-2 hover:text-primary transition-colors">
                  브랜드 스토리
                </Link>
                <Link to="/qa" className="text-base font-medium py-2 hover:text-primary transition-colors">
                  Q&A
                </Link>
                <Link to="/contact" className="text-base font-medium py-2 hover:text-primary transition-colors">
                  문의하기
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Navigation;
