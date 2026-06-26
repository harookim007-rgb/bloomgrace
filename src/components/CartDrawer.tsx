import { Link } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Plus, Minus, X } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useLanguage } from "@/contexts/LanguageContext";
import { getLocalizedProductName } from "@/lib/productI18n";

const CartDrawer = () => {
  const { items, total, itemCount, updateQuantity, removeItem } = useCart();
  const { t, formatPrice, language } = useLanguage();
  const productName = (p: any) => getLocalizedProductName(p, language);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-10 w-10 text-foreground/60 hover:text-primary">
          <ShoppingBag className="h-[18px] w-[18px]" />
          {itemCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-5 w-5 flex items-center justify-center text-[10px] font-bold bg-primary text-primary-foreground rounded-full font-sans">
              {itemCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[85vw] max-w-[400px] flex flex-col p-0">
        <SheetHeader className="px-6 py-5 border-b border-border">
          <SheetTitle className="text-base font-sans font-bold tracking-[0.1em] uppercase">{t("cart_title")}</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-0" style={{ WebkitOverflowScrolling: 'touch' }}>
          {items.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <ShoppingBag className="h-10 w-10 mx-auto mb-4 opacity-20" />
              <p className="text-base">{t("cart_empty")}</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4 py-4 border-b border-border">
                <img src={item.product.image_url || "/placeholder.svg"} alt={productName(item.product)}
                  className="w-20 h-24 object-cover bg-muted/30 rounded-sm" />
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex justify-between items-start">
                    <h4 className="text-sm font-medium leading-snug pr-2">{productName(item.product)}</h4>
                    <button onClick={() => removeItem(item.id)} className="text-muted-foreground hover:text-foreground shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-base font-bold">{formatPrice(item.product.price)}</p>
                  <div className="flex items-center border border-border w-fit">
                    <button className="px-3 py-2 min-w-[44px] min-h-[44px] flex items-center justify-center" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="text-sm w-10 text-center font-sans font-semibold">{item.quantity}</span>
                    <button className="px-3 py-2 min-w-[44px] min-h-[44px] flex items-center justify-center" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {items.length > 0 && (
          <div className="border-t border-border px-6 py-5 space-y-4">
            <div className="flex justify-between text-base font-bold">
              <span className="tracking-wider uppercase">{t("cart_total")}</span>
              <span>{formatPrice(total)}</span>
            </div>
            <Link to="/checkout">
              <Button className="w-full rounded-sm py-6 text-sm font-bold tracking-[0.12em] uppercase">{t("cart_checkout")}</Button>
            </Link>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
