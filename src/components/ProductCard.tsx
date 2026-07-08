import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { Heart, ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { getLocalizedBrand, getLocalizedProductName, productUi } from "@/lib/productI18n";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    original_price: number | null;
    image_url: string | null;
    images?: string[] | null;
    thumbnail_url?: string | null;
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

  const translatedName = getLocalizedProductName(product, language);
  const translatedBrand = getLocalizedBrand(product, language);
  const labels = productUi(language);
  const isNew = product.created_at
    ? Date.now() - new Date(product.created_at).getTime() < 30 * 24 * 60 * 60 * 1000
    : false;
  const isBest = product.tags?.includes("bestseller") || product.is_featured;

  const main = product.image_url || product.thumbnail_url || "/placeholder.svg";
  const slides = useMemo(() => {
    const extras = (product.images || []).filter((u) => u && u !== main);
    return [main, ...extras];
  }, [main, (product.images || []).join("|")]);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start" },
    slides.length > 1 ? [Autoplay({ delay: 3500, stopOnInteraction: false, stopOnMouseEnter: true })] : [],
  );

  useEffect(() => { emblaApi?.reInit(); }, [slides.length, emblaApi]);

  return (
    <div className="group hover-lift">
      <div className="relative aspect-square overflow-hidden bg-muted/30 mb-2.5 md:mb-4 rounded-sm">
        <Link to={`/products/${product.slug}`} className="block w-full h-full">
          <div className="overflow-hidden w-full h-full" ref={emblaRef}>
            <div className="flex h-full">
              {slides.map((src, i) => (
                <div key={i} className="relative min-w-0 shrink-0 grow-0 basis-full h-full">
                  <img
                    src={src}
                    alt={translatedName}
                    className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => ((e.currentTarget as HTMLImageElement).src = "/placeholder.svg")}
                  />
                </div>
              ))}
            </div>
          </div>
        </Link>

        {slides.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous"
              onClick={(e) => { e.preventDefault(); emblaApi?.scrollPrev(); }}
              className="absolute left-1.5 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-background/80 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Next"
              onClick={(e) => { e.preventDefault(); emblaApi?.scrollNext(); }}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-background/80 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}

        <div className="absolute top-2 md:top-3 left-2 md:left-3 flex flex-col gap-1 z-10">
          {discount > 0 && (
            <Badge variant="destructive" className="rounded-sm text-[10px] md:text-[11px] font-sans font-bold px-1.5 md:px-2.5 py-0.5">
              -{discount}%
            </Badge>
          )}
          {isNew && (
            <Badge className="rounded-sm text-[10px] md:text-[11px] font-sans font-bold px-1.5 md:px-2.5 py-0.5 bg-primary-soft text-primary border-primary/20">
              {labels.new}
            </Badge>
          )}
          {isBest && !isNew && (
            <Badge className="rounded-sm text-[10px] md:text-[11px] font-sans font-bold px-1.5 md:px-2.5 py-0.5 bg-secondary text-secondary-foreground border-secondary">
              {labels.best}
            </Badge>
          )}
        </div>

        <button
          onClick={() => toggleWishlist(product.id)}
          className="absolute top-2 md:top-3 right-2 md:right-3 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-background/90 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-soft z-10"
        >
          <Heart className={`h-3.5 w-3.5 md:h-4 md:w-4 ${isWishlisted(product.id) ? "fill-primary text-primary" : "text-foreground/60"}`} />
        </button>

        <button
          onClick={() => addToCart(product.id)}
          className="absolute bottom-2 md:bottom-3 right-2 md:right-3 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-primary text-primary-foreground rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-elegant hover:scale-110 z-10"
        >
          <ShoppingBag className="h-3.5 w-3.5 md:h-4 md:w-4" />
        </button>
      </div>

      <div className="space-y-1 md:space-y-2 px-0.5">
        {translatedBrand && (
          <p className="text-[10px] md:text-xs font-sans font-semibold tracking-[0.12em] md:tracking-[0.15em] uppercase text-muted-foreground">{translatedBrand}</p>
        )}
        <Link to={`/products/${product.slug}`}>
          <h3
            title={translatedName}
            className="text-[13px] md:text-base font-sans font-medium leading-snug line-clamp-2 text-foreground min-h-[2.4em]"
          >
            {translatedName}
          </h3>
        </Link>
        <div className="flex items-baseline gap-1.5 md:gap-2.5">
          <span className="text-sm md:text-lg font-sans font-bold text-foreground">{formatPrice(product.price)}</span>
          {product.original_price && (
            <span className="text-[11px] md:text-sm text-muted-foreground line-through">{formatPrice(product.original_price)}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
