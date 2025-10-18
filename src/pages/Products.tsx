import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import lipstickImg from "@/assets/product-lipstick.jpg";
import creamImg from "@/assets/product-cream.jpg";
import perfumeImg from "@/assets/product-perfume.jpg";
import brushesImg from "@/assets/product-brushes.jpg";

const allProducts = [
  {
    id: 1,
    name: "Rose Velvet Lipstick",
    price: "$28",
    image: lipstickImg,
    description: "Silky smooth formula with natural rose extract",
    category: "makeup"
  },
  {
    id: 2,
    name: "Botanical Face Cream",
    price: "$45",
    image: creamImg,
    description: "Nourishing cream with eucalyptus & shea butter",
    category: "skincare"
  },
  {
    id: 3,
    name: "Fleur d'Élégance",
    price: "$65",
    image: perfumeImg,
    description: "Signature fragrance with floral notes",
    category: "fragrance"
  },
  {
    id: 4,
    name: "Luxury Brush Set",
    price: "$52",
    image: brushesImg,
    description: "Professional rose-gold brushes",
    category: "tools"
  },
  {
    id: 5,
    name: "Autumn Glow Serum",
    price: "$58",
    image: creamImg,
    description: "Vitamin C infused brightening serum",
    category: "skincare"
  },
  {
    id: 6,
    name: "Pink Pearl Highlighter",
    price: "$32",
    image: lipstickImg,
    description: "Luminous pearl finish highlighter",
    category: "makeup"
  },
  {
    id: 7,
    name: "Green Tea Mist",
    price: "$25",
    image: creamImg,
    description: "Refreshing Korean green tea facial mist",
    category: "skincare"
  },
  {
    id: 8,
    name: "Velvet Blush Duo",
    price: "$36",
    image: lipstickImg,
    description: "Soft matte blush in autumn shades",
    category: "makeup"
  },
];

const Products = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      
      <section className="py-16 px-4 md:px-6 lg:px-8 bg-gradient-to-b from-primary-soft/20 to-background">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-6">
            <div className="inline-block">
              <span className="text-sm font-medium tracking-[0.3em] uppercase text-muted-foreground/70 mb-3 block">
                전체 컬렉션
              </span>
              <div className="w-16 h-0.5 bg-gradient-to-r from-primary via-accent to-secondary mx-auto" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold">All Products</h1>
            <p className="text-lg text-muted-foreground">
              한국의 아름다움을 담은 프리미엄 화장품 컬렉션
            </p>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-5 mb-12 h-auto p-1 bg-muted/50">
              <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                All
              </TabsTrigger>
              <TabsTrigger value="skincare" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Skincare
              </TabsTrigger>
              <TabsTrigger value="makeup" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Makeup
              </TabsTrigger>
              <TabsTrigger value="fragrance" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Fragrance
              </TabsTrigger>
              <TabsTrigger value="tools" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Tools
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-0">
              <ProductGrid products={allProducts} />
            </TabsContent>
            
            <TabsContent value="skincare">
              <ProductGrid products={allProducts.filter(p => p.category === "skincare")} />
            </TabsContent>
            
            <TabsContent value="makeup">
              <ProductGrid products={allProducts.filter(p => p.category === "makeup")} />
            </TabsContent>
            
            <TabsContent value="fragrance">
              <ProductGrid products={allProducts.filter(p => p.category === "fragrance")} />
            </TabsContent>
            
            <TabsContent value="tools">
              <ProductGrid products={allProducts.filter(p => p.category === "tools")} />
            </TabsContent>
          </Tabs>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

const ProductGrid = ({ products }: { products: typeof allProducts }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
    {products.map((product, index) => (
      <Card 
        key={product.id}
        className="border border-border/50 hover-lift overflow-hidden group bg-card/80 backdrop-blur-sm shadow-soft hover:shadow-elegant transition-all duration-500"
        style={{ animationDelay: `${index * 50}ms` }}
      >
        <CardHeader className="p-0 relative">
          <div className="aspect-square overflow-hidden bg-muted/50">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
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
            장바구니 담기
          </Button>
        </CardFooter>
      </Card>
    ))}
  </div>
);

export default Products;
