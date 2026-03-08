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
  index?: number;
}

const ProductCard = ({ product, index = 0 }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { t, formatPrice, language } = useLanguage();
  const discount = product.original_price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : 0;

  const translatedName = product.translations?.[language]?.name || product.name;

  const isNew = product.created_at
    ? Date.now() - new Date(product.created_at).getTime() < 30 * 24 * 60 * 60 * 1000
    : false;
  const isBest = product.tags?.includes("bestseller") || product.is_featured;

  return (
    <div
      className="group opacity-0 animate-fade-up"
      style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }}
    >
      {/* Image container — 1:1 ratio */}
      <div className="relative aspect-square overflow-hidden bg-muted/20 mb-5 border border-border/40">
        <Link to={`/products/${product.slug}`}>
          <img
            src={product.image_url || "/placeholder.svg"}
            alt={translatedName}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            loading="lazy"
          />
        </Link>

        {/* Badges — top left */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {discount > 0 && (
            <Badge variant="destructive" className="rounded-none text-[10px] font-sans font-normal px-2.5 py-1 tracking-wider">
              -{discount}%
            </Badge>
          )}
          {isNew && (
            <Badge className="rounded-none text-[10px] font-sans font-normal px-2.5 py-1 tracking-wider bg-foreground text-background border-foreground">
              NEW
            </Badge>
          )}
          {isBest && !isNew && (
            <Badge className="rounded-none text-[10px] font-sans font-normal px-2.5 py-1 tracking-wider bg-accent text-accent-foreground border-accent">
              BEST
            </Badge>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={() => toggleWishlist(product.id)}
          className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300"
        >
          <Heart className={`h-4 w-4 ${isWishlisted(product.id) ? "fill-accent text-accent" : "text-foreground/50"}`} />
        </button>

        {/* Quick add to cart */}
        <button
          onClick={() => addToCart(product.id)}
          className="absolute bottom-0 left-0 right-0 py-3 bg-foreground/90 text-primary-foreground text-xs font-sans tracking-[0.12em] uppercase text-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm"
        >
          Add to Cart
        </button>
      </div>

      {/* Product info */}
      <div className="space-y-2 px-0.5">
        {product.brand && (
          <p className="text-[10px] font-sans font-light tracking-[0.18em] uppercase text-muted-foreground">{product.brand}</p>
        )}
        <Link to={`/products/${product.slug}`} className="block">
          <h3 className="link-underline text-base font-serif font-normal leading-snug line-clamp-2 text-foreground tracking-wide inline">
            {translatedName}
          </h3>
        </Link>
        <div className="flex items-baseline gap-2.5">
          <span className="text-sm font-sans font-light text-muted-foreground">{formatPrice(product.price)}</span>
          {product.original_price && (
            <span className="text-xs text-muted-foreground/50 line-through">{formatPrice(product.original_price)}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
