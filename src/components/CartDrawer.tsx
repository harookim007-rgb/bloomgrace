import { Link } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Plus, Minus, X } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useLanguage } from "@/contexts/LanguageContext";

const CartDrawer = () => {
  const { items, total, itemCount, updateQuantity, removeItem } = useCart();
  const { t, formatPrice } = useLanguage();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9 text-foreground/60 hover:text-foreground">
          <ShoppingBag className="h-4 w-4" />
          {itemCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 flex items-center justify-center text-[9px] bg-foreground text-background rounded-full font-sans">
              {itemCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[360px] flex flex-col p-0">
        <SheetHeader className="px-6 py-5 border-b border-border">
          <SheetTitle className="text-sm font-sans font-medium tracking-[0.15em] uppercase">{t("cart_title")}</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-0">
          {items.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <ShoppingBag className="h-8 w-8 mx-auto mb-4 opacity-20" />
              <p className="text-sm font-light">{t("cart_empty")}</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4 py-4 border-b border-border">
                <img src={item.product.image_url || "/placeholder.svg"} alt={item.product.name}
                  className="w-20 h-24 object-cover bg-muted/30" />
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex justify-between items-start">
                    <h4 className="text-sm font-light leading-snug pr-2">{item.product.name}</h4>
                    <button onClick={() => removeItem(item.id)} className="text-muted-foreground hover:text-foreground shrink-0">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="text-sm font-medium">{formatPrice(item.product.price)}</p>
                  <div className="flex items-center border border-border w-fit">
                    <button className="px-2 py-1" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="text-xs w-8 text-center font-sans">{item.quantity}</span>
                    <button className="px-2 py-1" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {items.length > 0 && (
          <div className="border-t border-border px-6 py-5 space-y-4">
            <div className="flex justify-between text-sm font-medium">
              <span className="tracking-wider uppercase">{t("cart_total")}</span>
              <span>{formatPrice(total)}</span>
            </div>
            <Link to="/checkout">
              <Button className="w-full rounded-none py-5 text-xs tracking-[0.15em] uppercase">{t("cart_checkout")}</Button>
            </Link>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
