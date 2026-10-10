import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { defaultSiteSettings, fetchSiteSettings, SITE_SETTINGS_KEY, type SiteSettings } from "@/hooks/useSiteSettings";

const AdminSettings = () => {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSiteSettings().then(s => { setSettings(s); setLoading(false); });
  }, []);

  const save = async () => {
    const gaId = settings.googleAnalyticsId.trim();
    if (gaId && !/^G-[A-Z0-9]+$/i.test(gaId)) {
      toast.error("Google Analytics ID는 G-XXXXXXXXXX 형식이어야 합니다.");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("site_settings")
      .upsert({ id: "default", settings: { ...settings, googleAnalyticsId: gaId } });
    setSaving(false);
    if (error) { toast.error(`설정을 저장하지 못했습니다: ${error.message}`); return; }
    queryClient.invalidateQueries({ queryKey: SITE_SETTINGS_KEY });
    toast.success("사이트 설정이 저장되었습니다.");
  };

  if (loading) return <p className="p-6 text-sm text-muted-foreground text-center">로딩 중...</p>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-serif">사이트 설정</h1>
        <p className="text-sm text-muted-foreground mt-1">쇼핑몰 운영 설정을 관리합니다. 배송비는 '배송비 관리', 결제는 '결제 설정'에서 관리합니다.</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">운영</CardTitle>
            <CardDescription>저장하면 쇼핑몰에 바로 적용됩니다</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div><Label>점검 모드</Label><p className="text-xs text-muted-foreground">관리자를 제외한 방문자에게 점검 안내 화면을 보여줍니다</p></div>
              <Switch checked={settings.maintenanceMode} onCheckedChange={v => setSettings({ ...settings, maintenanceMode: v })} />
            </div>
            <div className="flex items-center justify-between">
              <div><Label>리뷰 기능</Label><p className="text-xs text-muted-foreground">끄면 상품 리뷰 영역과 리뷰 작성 버튼이 숨겨집니다</p></div>
              <Switch checked={settings.allowReviews} onCheckedChange={v => setSettings({ ...settings, allowReviews: v })} />
            </div>
            <div className="flex items-center justify-between">
              <div><Label>찜 기능</Label><p className="text-xs text-muted-foreground">끄면 찜 버튼과 마이페이지의 찜 목록이 숨겨집니다</p></div>
              <Switch checked={settings.allowWishlist} onCheckedChange={v => setSettings({ ...settings, allowWishlist: v })} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">SEO 설정</CardTitle>
            <CardDescription>홈 화면의 검색·공유 정보입니다. 비워두면 기본값을 사용합니다</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div><Label>메타 타이틀</Label><Input value={settings.metaTitle} onChange={e => setSettings({ ...settings, metaTitle: e.target.value })} placeholder="Youthroom | Korean Beauty Boutique" /></div>
            <div><Label>메타 설명</Label><Textarea value={settings.metaDescription} onChange={e => setSettings({ ...settings, metaDescription: e.target.value })} rows={2} /></div>
            <div><Label>OG 이미지 URL</Label><Input value={settings.ogImage} onChange={e => setSettings({ ...settings, ogImage: e.target.value })} placeholder="https://..." /></div>
            <div><Label>Google Analytics ID</Label><Input value={settings.googleAnalyticsId} onChange={e => setSettings({ ...settings, googleAnalyticsId: e.target.value })} placeholder="G-XXXXXXXXXX" /></div>
          </CardContent>
        </Card>

        <Button onClick={save} disabled={saving} className="w-full">{saving ? "저장 중..." : "설정 저장"}</Button>
      </div>
    </div>
  );
};

export default AdminSettings;
