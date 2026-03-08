import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useLanguage } from "@/contexts/LanguageContext";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    original_price: number | null;
    image_url: string | null;
    brand: string | null;
    rating: number | null;
    review_count: number | null;
  };
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { t, formatPrice } = useLanguage();
  const discount = product.original_price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : 0;

  return (
    <Card className="border border-border/50 hover-lift overflow-hidden group bg-card/80 backdrop-blur-sm shadow-soft hover:shadow-elegant transition-all duration-500">
      <CardHeader className="p-0 relative">
        <Link to={`/products/${product.slug}`}>
          <div className="aspect-square overflow-hidden bg-muted/50">
            <img src={product.image_url || "/placeholder.svg"} alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
          </div>
        </Link>
        {discount > 0 && (
          <span className="absolute top-3 left-3 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded-sm">
            -{discount}%
          </span>
        )}
        <button onClick={() => toggleWishlist(product.id)}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-all">
          <Heart className={`h-4 w-4 ${isWishlisted(product.id) ? "fill-destructive text-destructive" : "text-muted-foreground"}`} />
        </button>
      </CardHeader>
      <CardContent className="p-4 space-y-2">
        {product.brand && <p className="text-xs text-muted-foreground">{product.brand}</p>}
        <Link to={`/products/${product.slug}`}>
          <h3 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">{product.name}</h3>
        </Link>
        <div className="flex items-center gap-1">
          {product.rating && product.rating > 0 && (
            <>
              <Star className="h-3 w-3 fill-accent text-accent" />
              <span className="text-xs text-muted-foreground">{product.rating} ({product.review_count})</span>
            </>
          )}
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold">{formatPrice(product.price)}</span>
          {product.original_price && (
            <span className="text-sm text-muted-foreground line-through">{formatPrice(product.original_price)}</span>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button onClick={() => addToCart(product.id)} className="w-full gap-2" size="sm">
          <ShoppingBag className="h-4 w-4" />{t("pc_add_to_cart")}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
