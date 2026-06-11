import { useEffect, useMemo, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight, Heart, Minus, Plus, Star, Loader2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { localizeCategory } from "@/lib/categoryI18n";

export interface ProductViewData {
  name: string;
  brand?: string | null;
  price: number;
  original_price?: number | null;
  image_url?: string | null;
  images?: string[] | null;          // additional images
  detail_images?: string[] | null;   // long vertical detail images
  description?: string | null;
  description_top?: string | null;
  description_bottom?: string | null;
  description_position?: "top" | "bottom" | "both" | "none" | string | null;
  image_alt?: string | null;
  stock?: number | null;
  rating?: number | null;
  review_count?: number | null;
  categories?: { name?: string; slug?: string } | null;
  translations?: any;
  benefits?: string[] | null;
}

interface Props {
  product: ProductViewData;
  preview?: boolean;
  onAddToCart?: (qty: number) => void | Promise<void>;
  onBuyNow?: (qty: number) => void;
  onToggleWishlist?: () => void;
  isWishlisted?: boolean;
  isAddingToCart?: boolean;
}

const FALLBACK_IMG = "/placeholder.svg";

const ProductView = ({ product, preview = false, onAddToCart, onBuyNow, onToggleWishlist, isWishlisted, isAddingToCart }: Props) => {
  const { t, formatPrice, language } = useLanguage();
  const [quantity, setQuantity] = useState(1);

  const mainImage = product.image_url || "";
  const additional = (product.images || []).filter((u) => u && u !== mainImage);
  const slides = useMemo(() => {
    const arr = [mainImage, ...additional].filter(Boolean) as string[];
    return arr.length ? arr : [FALLBACK_IMG];
  }, [mainImage, additional.join("|")]);

  const detailImages = (product.detail_images || []).filter(Boolean) as string[];
  const pos = product.description_position || "none";
  const showTop = pos === "top" || pos === "both";
  const showBottom = pos === "bottom" || pos === "both";
  const altBase = product.image_alt || product.name || "product image";

  // Embla
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start" },
    [Autoplay({ delay: 3500, stopOnInteraction: false, stopOnMouseEnter: true })],
  );
  const [selectedIdx, setSelectedIdx] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSel = () => setSelectedIdx(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSel);
    onSel();
    return () => { emblaApi.off("select", onSel); };
  }, [emblaApi]);

  useEffect(() => {
    if (emblaApi) emblaApi.reInit();
  }, [slides.length, emblaApi]);

  const discount = product.original_price
    ? Math.round((1 - product.price / Number(product.original_price)) * 100)
    : 0;

  const localizedName = product.translations?.[language]?.name || product.name;
  const localizedDescription =
    product.translations?.[language]?.description || product.description;

  const DescriptionBlock = ({ html }: { html: string }) => (
    <div
      className="prose prose-sm max-w-none text-sm text-foreground/80 font-light leading-relaxed [&_a]:text-primary [&_a]:underline [&_strong]:font-medium [&_p]:my-2"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );

  return (
    <div className="space-y-12 md:space-y-16">
      {/* Top: image slider + info */}
      <div className="grid md:grid-cols-2 gap-8 md:gap-16">
        {/* Slider */}
        <div className="relative group">
          <div className="overflow-hidden aspect-square bg-muted/30" ref={emblaRef}>
            <div className="flex h-full">
              {slides.map((src, i) => (
                <div key={i} className="relative min-w-0 shrink-0 grow-0 basis-full h-full">
                  <img
                    src={src}
                    alt={`${altBase} ${i + 1}`}
                    loading={i === 0 ? "eager" : "lazy"}
                    className="w-full h-full object-cover"
                    onError={(e) => ((e.currentTarget as HTMLImageElement).src = FALLBACK_IMG)}
                  />
                </div>
              ))}
            </div>
          </div>

          {slides.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous image"
                onClick={() => emblaApi?.scrollPrev()}
                className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/80 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity md:opacity-0 max-md:opacity-100"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                aria-label="Next image"
                onClick={() => emblaApi?.scrollNext()}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/80 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity md:opacity-0 max-md:opacity-100"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-background/80 backdrop-blur text-[10px] tracking-widest font-sans">
                {selectedIdx + 1} / {slides.length}
              </div>
            </>
          )}
        </div>

        {/* Info */}
        <div className="space-y-6 md:py-8">
          {product.brand && (
            <p className="text-[10px] font-sans tracking-[0.3em] uppercase text-muted-foreground">
              {product.brand}
            </p>
          )}
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif font-light">{localizedName}</h1>

          {product.categories?.name && (
            <span className="inline-block text-[10px] font-sans tracking-[0.15em] uppercase border border-border px-3 py-1">
              {localizeCategory(product.categories as any, t)}
            </span>
          )}

          <div className="flex items-center gap-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`h-4 w-4 ${s <= (product.rating || 0) ? "fill-accent text-accent" : "text-border"}`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">({product.review_count || 0})</span>
          </div>

          <div className="flex items-baseline gap-3 py-4 border-y border-border">
            {discount > 0 && <span className="text-lg font-sans font-medium text-primary">-{discount}%</span>}
            <span className="text-2xl font-sans font-medium">{formatPrice(product.price)}</span>
            {product.original_price && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(Number(product.original_price))}
              </span>
            )}
          </div>

          {/* Top description */}
          {showTop && (product.description_top || localizedDescription) && (
            <DescriptionBlock html={product.description_top || localizedDescription || ""} />
          )}

          {!showTop && localizedDescription && (
            <p className="text-sm text-muted-foreground font-light leading-relaxed whitespace-pre-line">
              {localizedDescription}
            </p>
          )}

          <p className="text-xs text-muted-foreground">
            {(product.stock ?? 0) > 0 ? (
              `${t("pd_stock")}: ${product.stock}`
            ) : (
              <span className="text-destructive">{t("pd_out_of_stock")}</span>
            )}
          </p>

          <div className="flex items-center gap-4 pt-2">
            <div className="flex items-center border border-border">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-none h-10 w-10"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="w-12 text-center text-sm font-sans">{quantity}</span>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-none h-10 w-10"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus className="h-3 w-3" />
              </Button>
      </div>

      {/* Efficacy / benefits circles */}
      {(product.benefits && product.benefits.length > 0) && (
        <div className="max-w-3xl mx-auto">
          <h3 className="text-center text-xs tracking-[0.3em] uppercase text-muted-foreground mb-6">Key Benefits</h3>
          <div className="flex flex-wrap justify-center gap-4 md:gap-8">
            {product.benefits.map((b, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border border-border bg-muted/30 flex items-center justify-center text-center px-2">
                  <span className="text-xs md:text-sm font-serif font-light leading-tight">{b}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              className="flex-1 rounded-none py-6 text-xs tracking-[0.15em] uppercase"
              onClick={() => !preview && onAddToCart?.(quantity)}
              disabled={preview || isAddingToCart || (product.stock ?? 0) === 0}
            >
              {isAddingToCart ? <Loader2 className="h-4 w-4 animate-spin" /> : t("pd_add_to_cart")}
            </Button>
            {onBuyNow && (
              <Button
                variant="secondary"
                className="flex-1 rounded-none py-6 text-xs tracking-[0.15em] uppercase bg-foreground text-background hover:bg-foreground/90"
                onClick={() => !preview && onBuyNow(quantity)}
                disabled={preview || (product.stock ?? 0) === 0}
              >
                <Zap className="h-3.5 w-3.5 mr-2" /> Buy Now
              </Button>
            )}
            <Button
              variant="outline"
              className="rounded-none py-6 px-6"
              onClick={() => !preview && onToggleWishlist?.()}
              disabled={preview}
            >
              <Heart className={`h-4 w-4 ${isWishlisted ? "fill-primary text-primary" : ""}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* Detail images (vertical scroll) */}
      {detailImages.length > 0 && (
        <div className="space-y-0 max-w-3xl mx-auto">
          {detailImages.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`${altBase} detail ${i + 1}`}
              loading="lazy"
              className="w-full h-auto block"
              onError={(e) => ((e.currentTarget as HTMLImageElement).src = FALLBACK_IMG)}
            />
          ))}
        </div>
      )}

      {/* Bottom description */}
      {showBottom && (product.description_bottom || localizedDescription) && (
        <div className="max-w-3xl mx-auto">
          <DescriptionBlock html={product.description_bottom || localizedDescription || ""} />
        </div>
      )}
    </div>
  );
};

export default ProductView;
