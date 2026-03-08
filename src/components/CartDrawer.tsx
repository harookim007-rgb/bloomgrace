import { Link } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Plus, Minus, Trash2 } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";

const CartDrawer = () => {
  const { items, total, itemCount, updateQuantity, removeItem } = useCart();
  const { t, formatPrice } = useLanguage();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative hover:bg-primary-soft/50 hover:text-primary transition-all">
          <ShoppingBag className="h-5 w-5" />
          {itemCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-primary text-primary-foreground">
              {itemCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[380px] flex flex-col">
        <SheetHeader>
          <SheetTitle className="font-serif text-2xl">🌸 {t("cart_title")}</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>{t("cart_empty")}</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-3 p-3 rounded-lg bg-muted/30">
                <img src={item.product.image_url || "/placeholder.svg"} alt={item.product.name}
                  className="w-20 h-20 rounded-md object-cover" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium truncate">{item.product.name}</h4>
                  <p className="text-sm font-bold mt-1">{formatPrice(item.product.price)}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Button variant="outline" size="icon" className="h-7 w-7"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="text-sm w-6 text-center">{item.quantity}</span>
                    <Button variant="outline" size="icon" className="h-7 w-7"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 ml-auto text-muted-foreground hover:text-destructive"
                      onClick={() => removeItem(item.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {items.length > 0 && (
          <div className="border-t pt-4 space-y-4">
            <div className="flex justify-between text-lg font-bold">
              <span>{t("cart_total")}</span>
              <span>{formatPrice(total)}</span>
            </div>
            <Link to="/checkout">
              <Button className="w-full" size="lg">{t("cart_checkout")}</Button>
            </Link>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
