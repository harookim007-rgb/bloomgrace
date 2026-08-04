import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { requireLogin } from "@/components/LoginDialog";

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
    brand?: string | null;
    translations?: any;
  };
}

const CART_MSG = {
  en: { login: "Please sign in first.", added: "Added to cart!", fail: "Failed to add to cart." },
  es: { login: "Inicia sesión primero.", added: "¡Agregado al carrito!", fail: "Error al agregar al carrito." },
  de: { login: "Bitte melden Sie sich zuerst an.", added: "Zum Warenkorb hinzugefügt!", fail: "Hinzufügen fehlgeschlagen." },
  fr: { login: "Veuillez vous connecter.", added: "Ajouté au panier !", fail: "Échec de l’ajout au panier." },
  pt: { login: "Faça login primeiro.", added: "Adicionado ao carrinho!", fail: "Falha ao adicionar ao carrinho." },
  ja: { login: "ログインしてください。", added: "カートに追加しました！", fail: "カートへの追加に失敗しました。" },
  ar: { login: "يرجى تسجيل الدخول أولاً.", added: "تمت الإضافة إلى السلة!", fail: "فشلت الإضافة إلى السلة." },
};

export const useCart = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const msg = CART_MSG[language] || CART_MSG.en;
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [adding, setAdding] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) { setItems([]); return; }
    setIsLoading(true);
    const { data } = await supabase
      .from("cart_items")
      .select("id, product_id, quantity, products(id, name, price, original_price, image_url, stock, brand, translations)")
      .eq("user_id", user.id);
    setItems((data || []).map((item: any) => ({ ...item, product: item.products })));
    setIsLoading(false);
  }, [user]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addToCart = useCallback(async (productId: string, qty = 1, opts: { silent?: boolean } = {}): Promise<boolean> => {
    if (!user) { requireLogin(false); return false; }
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
      if (!opts.silent) toast.success(msg.added);
      await fetchCart();
      return true;
    } catch (e: any) {
      toast.error(e?.message || msg.fail);
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
