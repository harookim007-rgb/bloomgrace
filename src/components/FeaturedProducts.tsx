import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";

const FeaturedProducts = () => {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("products").select("*").eq("is_active", true).eq("is_featured", true).limit(8)
      .then(({ data }) => setProducts(data || []));
  }, []);

  return (
    <section className="py-20 px-4 md:px-6 lg:px-8 bg-gradient-to-b from-background to-muted/30">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-sm font-medium tracking-[0.3em] uppercase text-muted-foreground/70">
            Signature Collection
          </span>
          <h2 className="text-4xl md:text-5xl font-bold">추천 상품</h2>
          <p className="text-lg text-muted-foreground">한국의 아름다움을 담은 프리미엄 뷰티 에센셜</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map(product => <ProductCard key={product.id} product={product} />)}
        </div>
        <div className="text-center mt-12">
          <Link to="/products">
            <Button variant="outline" size="lg" className="px-10">전체 상품 보기</Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
