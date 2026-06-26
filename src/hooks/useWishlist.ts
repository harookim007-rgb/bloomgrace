import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

const WISH_MSG = {
  en: { login: "Please sign in first.", added: "Added to wishlist!", removed: "Removed from wishlist." },
  es: { login: "Inicia sesión primero.", added: "¡Agregado a favoritos!", removed: "Eliminado de favoritos." },
  de: { login: "Bitte melden Sie sich zuerst an.", added: "Zur Wunschliste hinzugefügt!", removed: "Aus der Wunschliste entfernt." },
  fr: { login: "Veuillez vous connecter.", added: "Ajouté aux favoris !", removed: "Retiré des favoris." },
  pt: { login: "Faça login primeiro.", added: "Adicionado aos favoritos!", removed: "Removido dos favoritos." },
  ja: { login: "ログインしてください。", added: "お気に入りに追加しました！", removed: "お気に入りから削除しました。" },
  ar: { login: "يرجى تسجيل الدخول أولاً.", added: "تمت الإضافة إلى المفضلة!", removed: "تمت الإزالة من المفضلة." },
};

export const useWishlist = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const msg = WISH_MSG[language] || WISH_MSG.en;
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);

  const fetchWishlist = useCallback(async () => {
    if (!user) { setWishlistIds([]); return; }
    const { data } = await supabase.from("wishlists").select("product_id").eq("user_id", user.id);
    setWishlistIds((data || []).map((w: any) => w.product_id));
  }, [user]);

  useEffect(() => { fetchWishlist(); }, [fetchWishlist]);

  const toggleWishlist = async (productId: string) => {
    if (!user) { toast.error(msg.login); return; }
    if (wishlistIds.includes(productId)) {
      await supabase.from("wishlists").delete().eq("user_id", user.id).eq("product_id", productId);
      toast.success(msg.removed);
    } else {
      await supabase.from("wishlists").insert({ user_id: user.id, product_id: productId });
      toast.success(msg.added);
    }
    fetchWishlist();
  };

  const isWishlisted = (productId: string) => wishlistIds.includes(productId);

  return { wishlistIds, toggleWishlist, isWishlisted, fetchWishlist };
};
