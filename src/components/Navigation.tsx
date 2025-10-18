import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingBag, User } from "lucide-react";

const Navigation = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold font-serif">Bloom & Grace</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium transition-colors hover:text-primary">
            Home
          </Link>
          <Link to="#products" className="text-sm font-medium transition-colors hover:text-primary">
            Products
          </Link>
          <Link to="#about" className="text-sm font-medium transition-colors hover:text-primary">
            About
          </Link>
        </nav>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="hover:bg-primary-soft">
            <ShoppingBag className="h-5 w-5" />
          </Button>
          <Link to="/admin">
            <Button variant="ghost" size="icon" className="hover:bg-primary-soft">
              <User className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navigation;
