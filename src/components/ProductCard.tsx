import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
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
    translations?: any;
  };
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { t, formatPrice, language } = useLanguage();
  const discount = product.original_price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : 0;

  // Get translated name
  const translatedName = product.translations?.[language]?.name || product.name;

  return (
    <div className="group">
      <div className="relative aspect-[3/4] overflow-hidden bg-muted/50 mb-4">
        <Link to={`/products/${product.slug}`}>
          <img
            src={product.image_url || "/placeholder.svg"}
            alt={translatedName}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        </Link>
        {discount > 0 && (
          <span className="absolute top-3 left-3 bg-primary/90 text-primary-foreground text-[10px] font-sans font-medium tracking-wider px-2.5 py-1">
            -{discount}%
          </span>
        )}
        <button
          onClick={() => toggleWishlist(product.id)}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300"
        >
          <Heart className={`h-3.5 w-3.5 ${isWishlisted(product.id) ? "fill-primary text-primary" : "text-foreground/60"}`} />
        </button>
        <button
          onClick={() => addToCart(product.id)}
          className="absolute bottom-0 left-0 right-0 bg-primary/90 text-primary-foreground text-xs font-sans tracking-[0.15em] uppercase py-3 text-center translate-y-full group-hover:translate-y-0 transition-transform duration-300"
        >
          {t("pc_add_to_cart")}
        </button>
      </div>
      <div className="space-y-1.5">
        {product.brand && (
          <p className="text-[10px] font-sans tracking-[0.2em] uppercase text-muted-foreground">{product.brand}</p>
        )}
        <Link to={`/products/${product.slug}`}>
          <h3 className="text-sm font-sans font-light leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {translatedName}
          </h3>
        </Link>
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-sans font-medium">{formatPrice(product.price)}</span>
          {product.original_price && (
            <span className="text-xs text-muted-foreground line-through">{formatPrice(product.original_price)}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
