import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowLeft, CheckCircle2, Loader2, Eye, GripVertical, X, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import ImageUploader from "@/components/admin/ImageUploader";
import RichTextEditor from "@/components/RichTextEditor";
import ProductView from "@/components/ProductView";
import { BENEFIT_OPTIONS } from "@/components/admin/AdminProducts";

type DescPos = "none" | "top" | "bottom" | "both";

interface FormState {
  name: string;
  slug: string;
  description: string;
  description_top: string;
  description_bottom: string;
  description_position: DescPos;
  image_alt: string;
  price: string;
  original_price: string;
  category_id: string;
  brand: string;
  image_url: string;
  images: string[];
  detail_images: string[];
  image_links: Record<string, string>;
  stock: string;
  is_active: boolean;
  is_featured: boolean;
  tags: string;
  benefits: string[];
  skin_types: string[];
  related_product_ids: string[];
}

const emptyForm: FormState = {
  name: "", slug: "", description: "", description_top: "", description_bottom: "",
  description_position: "none", image_alt: "",
  price: "", original_price: "", category_id: "", brand: "",
  image_url: "", images: [], detail_images: [], image_links: {},
  stock: "0", is_active: true, is_featured: false, tags: "",
  benefits: [], skin_types: [], related_product_ids: [],
};

// Task 8: Horizontal, drag-drop image gallery with per-image link
const HorizontalImages = ({
  images, links, onChange, onLinksChange, folder, aspect = "free", label,
}: {
  images: string[];
  links: Record<string, string>;
  onChange: (next: string[]) => void;
  onLinksChange: (next: Record<string, string>) => void;
  folder: string;
  aspect?: "square" | "wide" | "free";
  label: string;
}) => {
  const dragFromRef = useRef<number | null>(null);
  const move = (from: number, to: number) => {
    if (from === to || from < 0 || to < 0 || from >= images.length || to >= images.length) return;
    const next = [...images];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  };
  const remove = (i: number) => {
    const url = images[i];
    onChange(images.filter((_, idx) => idx !== i));
    if (links[url]) {
      const cp = { ...links }; delete cp[url]; onLinksChange(cp);
    }
  };
  return (
    <div className="space-y-3">
      {images.length > 0 && (
        <div className="overflow-x-auto pb-2 -mx-1">
          <div className="flex gap-3 px-1" style={{ minWidth: "min-content" }}>
            {images.map((url, i) => (
              <div
                key={url + i}
                draggable
                onDragStart={() => (dragFromRef.current = i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => { if (dragFromRef.current !== null) move(dragFromRef.current, i); dragFromRef.current = null; }}
                className="w-[180px] shrink-0 border border-border rounded-md bg-card overflow-hidden"
              >
                <div className="relative aspect-square bg-muted">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <div className="absolute top-1 left-1 flex items-center gap-1 bg-background/80 backdrop-blur px-1.5 py-0.5 rounded text-[10px] font-mono">
                    <GripVertical className="h-3 w-3" /> {i + 1}
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center bg-background/90 rounded-full text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                    title="삭제"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="p-2 space-y-1">
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <ExternalLink className="h-3 w-3" /> 링크 URL
                  </Label>
                  <Input
                    style={{ fontSize: "12px" }}
                    className="h-7 text-xs"
                    placeholder="https://..."
                    value={links[url] || ""}
                    onChange={(e) => onLinksChange({ ...links, [url]: e.target.value })}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <ImageUploader
        value=""
        onChange={(url) => url && onChange([...images, url])}
        folder={folder}
        aspect={aspect}
        maxWidth={1600}
        maxHeight={aspect === "free" ? 4000 : 1600}
        label={label}
      />
      <p className="text-[11px] text-muted-foreground">
        이미지를 드래그해서 순서를 변경할 수 있습니다. 링크 URL을 입력하면 상세페이지에서 해당 이미지를 클릭 시 이동합니다.
      </p>
    </div>
  );
};

const ProductEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin, isLoading: authLoading } = useAuth();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [categories, setCategories] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"info" | "images" | "description" | "extras" | "preview">("info");

  const initialFormRef = useRef<string>("");
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const saveTimerRef = useRef<number | null>(null);
  const inFlightRef = useRef(false);

  // Guard
  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) {
      toast.error("관리자 권한이 필요합니다.");
      navigate("/");
    }
  }, [isAdmin, authLoading, navigate]);

  // Load
  useEffect(() => {
    (async () => {
      if (!id) return;
      const [p, c, all] = await Promise.all([
        supabase.from("products").select("*").eq("id", id).maybeSingle(),
        supabase.from("categories").select("*").order("sort_order"),
        supabase.from("products").select("id, name, price, image_url").order("created_at", { ascending: false }),
      ]);
      setCategories(c.data || []);
      setAllProducts(all.data || []);
      if (!p.data) { toast.error("상품을 찾을 수 없습니다."); navigate("/admin"); return; }
      const d = p.data;
      const next: FormState = {
        name: d.name || "",
        slug: d.slug || "",
        description: d.description || "",
        description_top: d.description_top || "",
        description_bottom: d.description_bottom || "",
        description_position: (d.description_position as DescPos) || "none",
        image_alt: d.image_alt || "",
        price: String(d.price ?? ""),
        original_price: d.original_price ? String(d.original_price) : "",
        category_id: d.category_id || "",
        brand: d.brand || "",
        image_url: d.image_url || "",
        images: (d.images || []).filter((u: string) => u && u !== d.image_url),
        detail_images: d.detail_images || [],
        image_links: (d.image_links as Record<string, string>) || {},
        stock: String(d.stock ?? 0),
        is_active: !!d.is_active,
        is_featured: !!d.is_featured,
        tags: (d.tags || []).join(", "),
        benefits: d.benefits || [],
        skin_types: d.skin_types || [],
        related_product_ids: d.related_product_ids || [],
      };
      setForm(next);
      initialFormRef.current = JSON.stringify(next);
      setLoading(false);
    })();
  }, [id, navigate]);

  // Task 4: dirty tracking + beforeunload
  useEffect(() => {
    if (loading) return;
    setDirty(JSON.stringify(form) !== initialFormRef.current);
  }, [form, loading]);

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!dirty) return;
      e.preventDefault();
      e.returnValue = "저장되지 않은 변경사항이 있습니다.";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  const doSave = useCallback(async (silent = true) => {
    if (!id || inFlightRef.current) return;
    if (!form.name.trim() || !form.price) {
      if (!silent) toast.error("상품명과 판매가는 필수입니다.");
      return;
    }
    inFlightRef.current = true;
    setStatus("saving");
    const payload = {
      name: form.name,
      slug: form.slug || form.name.toLowerCase().replace(/[^a-z0-9가-힣]+/g, "-").replace(/-+/g, "-"),
      description: form.description,
      description_top: form.description_top || null,
      description_bottom: form.description_bottom || null,
      description_position: form.description_position,
      image_alt: form.image_alt || null,
      price: parseFloat(form.price) || 0,
      original_price: form.original_price ? parseFloat(form.original_price) : null,
      stock: parseInt(form.stock) || 0,
      category_id: form.category_id || null,
      brand: form.brand || null,
      image_url: form.image_url || null,
      thumbnail_url: form.image_url || null,
      images: form.images.filter(u => u && u !== form.image_url),
      detail_images: form.detail_images,
      image_links: form.image_links,
      is_active: form.is_active,
      is_featured: form.is_featured,
      tags: form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
      benefits: form.benefits,
      skin_types: form.skin_types,
      related_product_ids: form.related_product_ids,
    };
    const { error } = await supabase.from("products").update(payload).eq("id", id);
    inFlightRef.current = false;
    if (error) {
      setStatus("error");
      if (!silent) toast.error("저장 실패: " + error.message);
      return;
    }
    initialFormRef.current = JSON.stringify(form);
    setDirty(false);
    setStatus("saved");
    if (!silent) toast.success("저장되었습니다.");
    window.setTimeout(() => setStatus(s => (s === "saved" ? "idle" : s)), 2000);
  }, [id, form]);

  // Task 4: debounced autosave
  useEffect(() => {
    if (loading || !dirty) return;
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(() => { doSave(true); }, 2500);
    return () => { if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current); };
  }, [form, dirty, loading, doSave]);

  const handleBack = () => {
    if (dirty) {
      const ok = window.confirm("저장되지 않은 변경사항이 있습니다. 정말 나가시겠습니까?");
      if (!ok) return;
    }
    navigate("/admin");
  };

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-muted/30">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const statusBadge = () => {
    if (status === "saving") return <span className="text-xs text-muted-foreground flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> 저장 중...</span>;
    if (status === "saved") return <span className="text-xs text-emerald-600 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> 저장됨</span>;
    if (status === "error") return <span className="text-xs text-destructive">저장 오류 — 다시 시도하세요</span>;
    if (dirty) return <span className="text-xs text-amber-600">변경사항 있음 (자동 저장 대기)</span>;
    return <span className="text-xs text-muted-foreground">모두 저장됨</span>;
  };

  const previewProduct = {
    name: form.name || "(상품명 없음)",
    brand: form.brand,
    price: parseFloat(form.price) || 0,
    original_price: form.original_price ? parseFloat(form.original_price) : null,
    image_url: form.image_url,
    images: form.images,
    detail_images: form.detail_images,
    description: form.description,
    description_top: form.description_top,
    description_bottom: form.description_bottom,
    description_position: form.description_position,
    image_alt: form.image_alt,
    stock: parseInt(form.stock) || 0,
    categories: categories.find(c => c.id === form.category_id) || null,
    benefits: form.benefits,
    related_product_ids: form.related_product_ids,
  };

  return (
    <div className="min-h-dvh bg-muted/30">
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="ghost" size="sm" onClick={handleBack} className="gap-1 shrink-0">
              <ArrowLeft className="h-4 w-4" /> 목록
            </Button>
            <div className="min-w-0">
              <h1 className="text-lg font-semibold font-serif truncate">{form.name || "상품 수정"}</h1>
              <div className="mt-0.5">{statusBadge()}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={() => doSave(false)} disabled={status === "saving"}>
              지금 저장
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
          <TabsList className="grid grid-cols-5 w-full max-w-2xl">
            <TabsTrigger value="info">기본 정보</TabsTrigger>
            <TabsTrigger value="images">이미지</TabsTrigger>
            <TabsTrigger value="description">상품 설명</TabsTrigger>
            <TabsTrigger value="extras">효능/연계</TabsTrigger>
            <TabsTrigger value="preview" className="gap-1"><Eye className="h-3 w-3" />미리보기</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="mt-4">
            <Card><CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2"><Label>상품명 *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                <div><Label>슬러그</Label><Input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} /></div>
                <div><Label>브랜드</Label><Input value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} /></div>
                <div><Label>판매가 (원) *</Label><Input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} /></div>
                <div><Label>정가 (원)</Label><Input type="number" value={form.original_price} onChange={e => setForm({ ...form, original_price: e.target.value })} /></div>
                <div><Label>카테고리</Label>
                  <Select value={form.category_id} onValueChange={v => setForm({ ...form, category_id: v })}>
                    <SelectTrigger><SelectValue placeholder="선택" /></SelectTrigger>
                    <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>재고</Label><Input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} /></div>
                <div className="md:col-span-2"><Label>태그 (쉼표 구분)</Label><Input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} /></div>
                <div className="md:col-span-2">
                  <Label>피부 타입</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(["dry", "oily", "combination", "sensitive", "dehydrated_oily", "acne_prone"] as const).map(s => {
                      const labelMap: Record<string, string> = { dry: "건성", oily: "지성", combination: "복합성", sensitive: "민감성", dehydrated_oily: "수부지", acne_prone: "여드름성" };
                      const active = form.skin_types.includes(s);
                      return (
                        <button type="button" key={s}
                          onClick={() => setForm({ ...form, skin_types: active ? form.skin_types.filter(x => x !== s) : [...form.skin_types, s] })}
                          className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${active ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground hover:text-foreground"}`}>
                          {labelMap[s]}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="flex items-center gap-6 md:col-span-2">
                  <div className="flex items-center gap-2"><Switch checked={form.is_active} onCheckedChange={v => setForm({ ...form, is_active: v })} /><Label>판매 활성화</Label></div>
                  <div className="flex items-center gap-2"><Switch checked={form.is_featured} onCheckedChange={v => setForm({ ...form, is_featured: v })} /><Label>추천 상품</Label></div>
                </div>
              </div>
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="images" className="mt-4 space-y-6">
            <Card><CardContent className="pt-6 space-y-2">
              <Label className="text-base">대표 이미지 *</Label>
              <p className="text-xs text-muted-foreground">리스트 · 장바구니 · 상세페이지 첫 화면에 표시 (정사각형)</p>
              <ImageUploader value={form.image_url} onChange={(url) => setForm({ ...form, image_url: url })} folder="products" aspect="square" maxWidth={1200} maxHeight={1200} label="대표 이미지" />
            </CardContent></Card>

            <Card><CardContent className="pt-6 space-y-3">
              <Label className="text-base">추가 이미지 ({form.images.length}장)</Label>
              <HorizontalImages
                images={form.images}
                links={form.image_links}
                onChange={(next) => setForm({ ...form, images: next })}
                onLinksChange={(next) => setForm({ ...form, image_links: next })}
                folder="products" aspect="square" label="추가 이미지"
              />
            </CardContent></Card>

            <Card><CardContent className="pt-6 space-y-3">
              <Label className="text-base">상세 이미지 ({form.detail_images.length}장)</Label>
              <HorizontalImages
                images={form.detail_images}
                links={form.image_links}
                onChange={(next) => setForm({ ...form, detail_images: next })}
                onLinksChange={(next) => setForm({ ...form, image_links: next })}
                folder="details" aspect="free" label="상세 이미지"
              />
            </CardContent></Card>

            <Card><CardContent className="pt-6 space-y-2">
              <Label>이미지 대체 텍스트 (alt)</Label>
              <Input value={form.image_alt} onChange={(e) => setForm({ ...form, image_alt: e.target.value })} />
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="description" className="mt-4 space-y-4">
            <Card><CardContent className="pt-6 space-y-4">
              <div>
                <Label>노출 위치</Label>
                <Select value={form.description_position} onValueChange={(v) => setForm({ ...form, description_position: v as DescPos })}>
                  <SelectTrigger className="max-w-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">노출 안 함</SelectItem>
                    <SelectItem value="top">상단만</SelectItem>
                    <SelectItem value="bottom">하단만</SelectItem>
                    <SelectItem value="both">상단 + 하단</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-2 block">상단 상품 설명 (이미지/가격 근처)</Label>
                <RichTextEditor value={form.description_top} onChange={(html) => setForm({ ...form, description_top: html })} placeholder="상단 설명 내용..." />
              </div>
              <div>
                <Label className="mb-2 block">하단 상품 설명 (상세 이미지 아래)</Label>
                <RichTextEditor value={form.description_bottom} onChange={(html) => setForm({ ...form, description_bottom: html })} placeholder="하단 설명 내용..." />
              </div>
              <div>
                <Label className="mb-2 block text-muted-foreground">기본 설명 (호환용)</Label>
                <RichTextEditor value={form.description} onChange={(html) => setForm({ ...form, description: html })} minHeight={150} />
              </div>
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="extras" className="mt-4 space-y-6">
            <Card><CardContent className="pt-6 space-y-3">
              <Label className="text-base">상품 효능 ({form.benefits.length}개)</Label>
              <div className="flex flex-wrap gap-2">
                {BENEFIT_OPTIONS.map((b) => {
                  const active = form.benefits.includes(b);
                  return (
                    <button key={b} type="button"
                      onClick={() => setForm({ ...form, benefits: active ? form.benefits.filter(x => x !== b) : [...form.benefits, b] })}
                      className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${active ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"}`}>
                      {b}
                    </button>
                  );
                })}
              </div>
            </CardContent></Card>

            <Card><CardContent className="pt-6 space-y-3">
              <Label className="text-base">연계 상품 ({form.related_product_ids.length}개)</Label>
              <div className="max-h-72 overflow-y-auto border rounded">
                {allProducts.filter(p => p.id !== id).map((p) => {
                  const active = form.related_product_ids.includes(p.id);
                  return (
                    <label key={p.id} className={`flex items-center gap-3 p-2 border-b cursor-pointer hover:bg-muted/30 ${active ? "bg-primary/5" : ""}`}>
                      <input type="checkbox" checked={active}
                        onChange={() => setForm({
                          ...form,
                          related_product_ids: active
                            ? form.related_product_ids.filter(x => x !== p.id)
                            : [...form.related_product_ids, p.id],
                        })}
                      />
                      {p.image_url ? <img src={p.image_url} className="w-10 h-10 object-cover rounded" alt="" /> : <div className="w-10 h-10 bg-muted rounded" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{Number(p.price).toLocaleString()}원</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="preview" className="mt-4">
            <Card><CardContent className="pt-6">
              <ProductView product={previewProduct as any} preview />
            </CardContent></Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProductEditPage;
