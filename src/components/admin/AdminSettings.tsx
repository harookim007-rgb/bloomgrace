import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

const AdminSettings = () => {
  const [siteSettings, setSiteSettings] = useState({
    siteName: "Bloom & Grace",
    siteDescription: "한국 화장품 & 뷰티 쇼핑몰",
    contactEmail: "support@bloomandgrace.com",
    contactPhone: "02-1234-5678",
    address: "서울특별시 강남구",
    shippingFee: "3000",
    freeShippingThreshold: "50000",
    maintenanceMode: false,
    allowReviews: true,
    allowWishlist: true,
    currency: "KRW",
    taxRate: "10",
  });

  const [seoSettings, setSeoSettings] = useState({
    metaTitle: "Bloom & Grace - 한국 프리미엄 뷰티 쇼핑몰",
    metaDescription: "최고급 한국 화장품, 스킨케어, 메이크업 제품을 만나보세요.",
    ogImage: "",
    googleAnalyticsId: "",
  });

  const saveSiteSettings = () => {
    // In a real app, these would be saved to the database
    localStorage.setItem("site_settings", JSON.stringify(siteSettings));
    toast.success("사이트 설정이 저장되었습니다.");
  };

  const saveSeoSettings = () => {
    localStorage.setItem("seo_settings", JSON.stringify(seoSettings));
    toast.success("SEO 설정이 저장되었습니다.");
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-serif">사이트 설정</h1>
        <p className="text-sm text-muted-foreground mt-1">쇼핑몰 기본 설정을 관리합니다</p>
      </div>

      <div className="space-y-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">기본 정보</CardTitle>
            <CardDescription>쇼핑몰 기본 정보를 설정합니다</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>사이트명</Label><Input value={siteSettings.siteName} onChange={e => setSiteSettings({...siteSettings, siteName: e.target.value})} /></div>
              <div><Label>통화</Label><Input value={siteSettings.currency} onChange={e => setSiteSettings({...siteSettings, currency: e.target.value})} /></div>
            </div>
            <div><Label>사이트 설명</Label><Textarea value={siteSettings.siteDescription} onChange={e => setSiteSettings({...siteSettings, siteDescription: e.target.value})} rows={2} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>대표 이메일</Label><Input value={siteSettings.contactEmail} onChange={e => setSiteSettings({...siteSettings, contactEmail: e.target.value})} /></div>
              <div><Label>대표 전화</Label><Input value={siteSettings.contactPhone} onChange={e => setSiteSettings({...siteSettings, contactPhone: e.target.value})} /></div>
            </div>
            <div><Label>주소</Label><Input value={siteSettings.address} onChange={e => setSiteSettings({...siteSettings, address: e.target.value})} /></div>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div><Label>배송비 (원)</Label><Input type="number" value={siteSettings.shippingFee} onChange={e => setSiteSettings({...siteSettings, shippingFee: e.target.value})} /></div>
              <div><Label>무료배송 기준금액 (원)</Label><Input type="number" value={siteSettings.freeShippingThreshold} onChange={e => setSiteSettings({...siteSettings, freeShippingThreshold: e.target.value})} /></div>
            </div>
            <div><Label>부가세율 (%)</Label><Input type="number" value={siteSettings.taxRate} onChange={e => setSiteSettings({...siteSettings, taxRate: e.target.value})} /></div>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div><Label>점검 모드</Label><p className="text-xs text-muted-foreground">사이트를 임시 점검 상태로 전환합니다</p></div>
                <Switch checked={siteSettings.maintenanceMode} onCheckedChange={v => setSiteSettings({...siteSettings, maintenanceMode: v})} />
              </div>
              <div className="flex items-center justify-between">
                <div><Label>리뷰 기능</Label><p className="text-xs text-muted-foreground">고객이 리뷰를 작성할 수 있게 합니다</p></div>
                <Switch checked={siteSettings.allowReviews} onCheckedChange={v => setSiteSettings({...siteSettings, allowReviews: v})} />
              </div>
              <div className="flex items-center justify-between">
                <div><Label>찜 기능</Label><p className="text-xs text-muted-foreground">고객이 상품을 찜할 수 있게 합니다</p></div>
                <Switch checked={siteSettings.allowWishlist} onCheckedChange={v => setSiteSettings({...siteSettings, allowWishlist: v})} />
              </div>
            </div>
            <Button onClick={saveSiteSettings} className="w-full">설정 저장</Button>
          </CardContent>
        </Card>

        {/* SEO Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">SEO 설정</CardTitle>
            <CardDescription>검색 엔진 최적화 설정</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div><Label>메타 타이틀</Label><Input value={seoSettings.metaTitle} onChange={e => setSeoSettings({...seoSettings, metaTitle: e.target.value})} /></div>
            <div><Label>메타 설명</Label><Textarea value={seoSettings.metaDescription} onChange={e => setSeoSettings({...seoSettings, metaDescription: e.target.value})} rows={2} /></div>
            <div><Label>OG 이미지 URL</Label><Input value={seoSettings.ogImage} onChange={e => setSeoSettings({...seoSettings, ogImage: e.target.value})} /></div>
            <div><Label>Google Analytics ID</Label><Input value={seoSettings.googleAnalyticsId} onChange={e => setSeoSettings({...seoSettings, googleAnalyticsId: e.target.value})} placeholder="G-XXXXXXXXXX" /></div>
            <Button onClick={saveSeoSettings} className="w-full">SEO 설정 저장</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSettings;
