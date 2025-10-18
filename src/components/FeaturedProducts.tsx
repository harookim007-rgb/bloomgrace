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
    <section className="py-20 px-4 md:px-6">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold">Featured Collection</h2>
          <p className="text-lg text-muted-foreground">
            Handpicked favorites to enhance your natural beauty
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product, index) => (
            <Card 
              key={product.id}
              className="border-border hover-lift overflow-hidden group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="p-0">
                <div className="aspect-square overflow-hidden bg-muted">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <CardTitle className="text-xl mb-2">{product.name}</CardTitle>
                <p className="text-sm text-muted-foreground mb-3">
                  {product.description}
                </p>
                <p className="text-2xl font-semibold">{product.price}</p>
              </CardContent>
              <CardFooter className="p-6 pt-0">
                <Button 
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
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
