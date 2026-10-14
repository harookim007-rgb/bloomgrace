import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import ImageUploader from "@/components/admin/ImageUploader";
import { fallbackSlides } from "@/components/Hero";

type Banner = { id: string; title: string; image_url: string | null; is_active: boolean; sort_order: number };

const usable = (url?: string | null) => !!url && url.trim() !== "" && !url.includes("placeholder");

// Replaces the pictures of the home banner slides from inside the design editor.
// Changes are saved to the banners table right away, like the 배너/프로모션 screen.
const BannerImages = ({ onSaved }: { onSaved: () => void }) => {
  const [banners, setBanners] = useState<Banner[] | null>(null);

  const load = () =>
    supabase.from("banners").select("id, title, image_url, is_active, sort_order").eq("is_active", true).order("sort_order")
      .then(({ data }) => setBanners((data as Banner[]) || []));
  useEffect(() => { load(); }, []);

  const save = async (b: Banner, url: string) => {
    const { error } = await supabase.from("banners").update({ image_url: url || null }).eq("id", b.id);
    if (error) { toast.error(`배너 이미지를 저장하지 못했습니다: ${error.message}`); return; }
    toast.success(url ? "배너 이미지를 바꿨습니다. 쇼핑몰에 바로 적용됩니다." : "기본 이미지로 되돌렸습니다.");
    await load();
    onSaved();
  };

  if (banners === null) return <p className="text-sm text-muted-foreground">배너를 불러오는 중...</p>;
  if (banners.length === 0) {
    return <p className="text-sm text-muted-foreground">켜져 있는 배너가 없어 기본 슬라이드가 표시됩니다. '배너/프로모션'에서 배너를 추가하세요.</p>;
  }

  return (
    <div className="space-y-3">
      <div>
        <Label>배너 이미지</Label>
        <p className="text-xs text-muted-foreground mt-0.5">이미지를 올리면 바로 쇼핑몰에 적용됩니다 (게시하기와 별개). 문구와 링크는 '배너/프로모션'에서 바꿉니다.</p>
      </div>
      {banners.map((b, i) => {
        const own = usable(b.image_url);
        return (
          <div key={b.id} className="rounded-md border border-border p-2.5 space-y-2 bg-background">
            <div className="flex items-center gap-3">
              <img src={own ? b.image_url! : fallbackSlides[i % fallbackSlides.length].image} alt="" className="h-14 w-24 shrink-0 rounded object-cover bg-muted" />
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{i + 1}. {b.title}</p>
                <p className="text-xs text-muted-foreground">{own ? "직접 올린 이미지" : "기본 이미지 사용 중"}</p>
              </div>
            </div>
            <ImageUploader value={own ? b.image_url! : ""} onChange={url => save(b, url)} folder="banners" maxWidth={1920} maxHeight={1080} aspect="wide" label="이미지 교체" />
          </div>
        );
      })}
    </div>
  );
};

export default BannerImages;
