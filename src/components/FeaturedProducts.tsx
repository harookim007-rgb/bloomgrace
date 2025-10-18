import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import lipstickImg from "@/assets/product-lipstick.jpg";
import creamImg from "@/assets/product-cream.jpg";
import perfumeImg from "@/assets/product-perfume.jpg";
import brushesImg from "@/assets/product-brushes.jpg";

const products = [
  {
    id: 1,
    name: "Rose Velvet Lipstick",
    price: "$28",
    image: lipstickImg,
    description: "Silky smooth formula with natural rose extract",
  },
  {
    id: 2,
    name: "Botanical Face Cream",
    price: "$45",
    image: creamImg,
    description: "Nourishing cream with eucalyptus & shea butter",
  },
  {
    id: 3,
    name: "Fleur d'Élégance",
    price: "$65",
    image: perfumeImg,
    description: "Signature fragrance with floral notes",
  },
  {
    id: 4,
    name: "Luxury Brush Set",
    price: "$52",
    image: brushesImg,
    description: "Professional rose-gold brushes",
  },
];

const FeaturedProducts = () => {
  return (
    <section className="py-24 px-4 md:px-6 lg:px-8 bg-gradient-to-b from-background to-muted/30">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
          <div className="inline-block">
            <span className="text-sm font-medium tracking-[0.3em] uppercase text-muted-foreground/70 mb-3 block">
              Signature Collection
            </span>
            <div className="w-16 h-0.5 bg-gradient-to-r from-primary via-accent to-secondary mx-auto" />
          </div>
          <h2 className="text-5xl md:text-6xl font-bold">Featured Collection</h2>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            Luxurious Korean beauty essentials, handpicked to reveal your natural radiance
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {products.map((product, index) => (
            <Card 
              key={product.id}
              className="border border-border/50 hover-lift overflow-hidden group bg-card/80 backdrop-blur-sm shadow-soft hover:shadow-elegant transition-all duration-500"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="p-0 relative">
                <div className="aspect-square overflow-hidden bg-muted/50">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* Subtle overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                <CardTitle className="text-xl font-semibold group-hover:text-primary transition-colors duration-300">
                  {product.name}
                </CardTitle>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
                <div className="flex items-baseline gap-2 pt-2">
                  <p className="text-2xl font-bold text-foreground">{product.price}</p>
                  <span className="text-xs text-muted-foreground">USD</span>
                </div>
              </CardContent>
              <CardFooter className="p-6 pt-0">
                <Button 
                  className="w-full bg-primary hover:bg-primary-glow text-primary-foreground shadow-soft hover:shadow-elegant transition-all duration-500 font-medium"
                >
                  Add to Cart
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
