import { Link } from "react-router-dom";
import { Heart, ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";

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
    translations?: any;
    is_featured?: boolean;
    tags?: string[] | null;
    created_at?: string;
  };
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { t, formatPrice, language } = useLanguage();
  const discount = product.original_price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : 0;

  const translatedName = product.translations?.[language]?.name || product.name;

  // Badge logic
  const isNew = product.created_at
    ? Date.now() - new Date(product.created_at).getTime() < 30 * 24 * 60 * 60 * 1000
    : false;
  const isBest = product.tags?.includes("bestseller") || product.is_featured;

  return (
    <div className="group hover-lift">
      {/* Image container — 1:1 ratio */}
      <div className="relative aspect-square overflow-hidden bg-muted/30 mb-2.5 md:mb-4 rounded-sm">
        <Link to={`/products/${product.slug}`}>
          <img
            src={product.image_url || "/placeholder.svg"}
            alt={translatedName}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        </Link>

        {/* Badges — top left */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {discount > 0 && (
            <Badge variant="destructive" className="rounded-sm text-[11px] font-sans font-bold px-2.5 py-0.5">
              -{discount}%
            </Badge>
          )}
          {isNew && (
            <Badge className="rounded-sm text-[11px] font-sans font-bold px-2.5 py-0.5 bg-foreground text-background border-foreground">
              NEW
            </Badge>
          )}
          {isBest && !isNew && (
            <Badge className="rounded-sm text-[11px] font-sans font-bold px-2.5 py-0.5 bg-secondary text-secondary-foreground border-secondary">
              BEST
            </Badge>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={() => toggleWishlist(product.id)}
          className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center bg-background/90 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-soft"
        >
          <Heart className={`h-4 w-4 ${isWishlisted(product.id) ? "fill-primary text-primary" : "text-foreground/60"}`} />
        </button>

        {/* Quick add to cart */}
        <button
          onClick={() => addToCart(product.id)}
          className="absolute bottom-3 right-3 w-10 h-10 flex items-center justify-center bg-primary text-primary-foreground rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-elegant hover:scale-110"
        >
          <ShoppingBag className="h-4 w-4" />
        </button>
      </div>

      {/* Product info */}
      <div className="space-y-2 px-0.5">
        {product.brand && (
          <p className="text-xs font-sans font-semibold tracking-[0.15em] uppercase text-muted-foreground">{product.brand}</p>
        )}
        <Link to={`/products/${product.slug}`}>
          <h3 className="text-base font-sans font-medium leading-snug line-clamp-2 text-foreground">
            {translatedName}
          </h3>
        </Link>
        <div className="flex items-baseline gap-2.5">
          <span className="text-lg font-sans font-bold text-foreground">{formatPrice(product.price)}</span>
          {product.original_price && (
            <span className="text-sm text-muted-foreground line-through">{formatPrice(product.original_price)}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
