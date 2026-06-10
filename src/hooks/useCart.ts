import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    original_price: number | null;
    image_url: string | null;
    stock: number;
  };
}

export const useCart = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [adding, setAdding] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) { setItems([]); return; }
    setIsLoading(true);
    const { data } = await supabase
      .from("cart_items")
      .select("id, product_id, quantity, products(id, name, price, original_price, image_url, stock)")
      .eq("user_id", user.id);
    setItems((data || []).map((item: any) => ({ ...item, product: item.products })));
    setIsLoading(false);
  }, [user]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addToCart = useCallback(async (productId: string, qty = 1, opts: { silent?: boolean } = {}): Promise<boolean> => {
    if (!user) { toast.error("로그인이 필요합니다."); return false; }
    if (adding) return false;
    setAdding(true);
    try {
      const existing = items.find(i => i.product_id === productId);
      if (existing) {
        const { error } = await supabase.from("cart_items").update({ quantity: existing.quantity + qty }).eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("cart_items").insert({ user_id: user.id, product_id: productId, quantity: qty });
        if (error) throw error;
      }
      if (!opts.silent) toast.success("장바구니에 추가되었습니다!");
      await fetchCart();
      return true;
    } catch (e: any) {
      toast.error(e?.message || "장바구니 추가 실패");
      return false;
    } finally {
      setAdding(false);
    }
  }, [user, items, adding, fetchCart]);

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await supabase.from("cart_items").delete().eq("id", itemId);
    } else {
      await supabase.from("cart_items").update({ quantity: Math.max(1, quantity) }).eq("id", itemId);
    }
    fetchCart();
  };

  const removeItem = async (itemId: string) => {
    await supabase.from("cart_items").delete().eq("id", itemId);
    fetchCart();
  };

  const clearCart = async () => {
    if (!user) return;
    await supabase.from("cart_items").delete().eq("user_id", user.id);
    setItems([]);
  };

  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return { items, isLoading, adding, addToCart, updateQuantity, removeItem, clearCart, total, itemCount, fetchCart };
};
