import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const useWishlist = () => {
  const { user } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);

  const fetchWishlist = useCallback(async () => {
    if (!user) { setWishlistIds([]); return; }
    const { data } = await supabase.from("wishlists").select("product_id").eq("user_id", user.id);
    setWishlistIds((data || []).map((w: any) => w.product_id));
  }, [user]);

  useEffect(() => { fetchWishlist(); }, [fetchWishlist]);

  const toggleWishlist = async (productId: string) => {
    if (!user) { toast.error("로그인이 필요합니다."); return; }
    if (wishlistIds.includes(productId)) {
      await supabase.from("wishlists").delete().eq("user_id", user.id).eq("product_id", productId);
      toast.success("찜 목록에서 제거되었습니다.");
    } else {
      await supabase.from("wishlists").insert({ user_id: user.id, product_id: productId });
      toast.success("찜 목록에 추가되었습니다!");
    }
    fetchWishlist();
  };

  const isWishlisted = (productId: string) => wishlistIds.includes(productId);

  return { wishlistIds, toggleWishlist, isWishlisted, fetchWishlist };
};
