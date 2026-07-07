import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, Pencil, Trash2, Search, Copy, X, ArrowUp, ArrowDown, Eye } from "lucide-react";
import { toast } from "sonner";
import ImageUploader from "./ImageUploader";
import ProductView from "@/components/ProductView";

type DescPos = "none" | "top" | "bottom" | "both";

export const BENEFIT_OPTIONS = [
  "보습", "미백", "주름개선", "진정", "탄력",
  "트러블케어", "자외선차단", "모공케어", "각질케어", "영양",
];

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
  image_url: "", images: [], detail_images: [],
  stock: "0", is_active: true, is_featured: false, tags: "",
  benefits: [], skin_types: [], related_product_ids: [],
};

// Sortable image list with up/down/delete
const SortableImages = ({
  images, onChange, folder, aspect = "free", label,
}: {
  images: string[];
  onChange: (next: string[]) => void;
  folder: string;
  aspect?: "square" | "wide" | "free";
  label: string;
}) => {
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= images.length) return;
    const next = [...images];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const remove = (i: number) => onChange(images.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-3">
      {images.length > 0 && (
        <div className="space-y-2">
          {images.map((url, i) => (
            <div key={i} className="flex items-center gap-2 p-2 border rounded">
              <span className="text-xs font-mono w-6 text-center text-muted-foreground">{i + 1}</span>
              <img src={url} className="w-16 h-16 object-cover rounded border" alt="" />
              <div className="flex-1 truncate text-xs text-muted-foreground">{url.split("/").pop()}</div>
              <Button type="button" size="icon" variant="ghost" disabled={i === 0} onClick={() => move(i, -1)} title="위로">
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button type="button" size="icon" variant="ghost" disabled={i === images.length - 1} onClick={() => move(i, 1)} title="아래로">
                <ArrowDown className="h-4 w-4" />
              </Button>
              <Button type="button" size="icon" variant="ghost" className="text-destructive" onClick={() => remove(i)} title="삭제">
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
      <ImageUploader
        value=""
        onChange={(url) => url && onChange([...images, url])}
        folder={folder}
        aspect={aspect}
        maxWidth={aspect === "free" ? 1600 : 1600}
        maxHeight={aspect === "free" ? 4000 : 1600}
        label={label}
      />
    </div>
  );
};

const AdminProducts = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<"info" | "images" | "description" | "extras" | "preview">("info");
  const [pendingDelete, setPendingDelete] = useState<{ ids: string[]; label: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const [p, c] = await Promise.all([
      supabase.from("products").select("*, categories(name)").order("created_at", { ascending: false }),
      supabase.from("categories").select("*").order("sort_order"),
    ]);
    setProducts(p.data || []);
    setCategories(c.data || []);
  };

  const validateForm = (): string | null => {
    if (!form.name.trim()) return "상품명을 입력해주세요.";
    if (!form.image_url) return "대표 이미지는 필수입니다. 1장 등록해주세요.";
    if (!form.price || isNaN(parseFloat(form.price))) return "판매가를 입력해주세요.";
    return null;
  };

  const save = async () => {
    const err = validateForm();
    if (err) { toast.error(err); return; }
    const slug = form.slug || form.name.toLowerCase().replace(/[^a-z0-9가-힣]+/g, "-").replace(/-+/g, "-");
    const payload = {
      name: form.name,
      slug,
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
      // keep thumbnail_url in sync with main image for backwards compatibility
      thumbnail_url: form.image_url || null,
      images: (form.images || []).filter((u) => u && u !== form.image_url),
      detail_images: form.detail_images || [],
      is_active: form.is_active,
      is_featured: form.is_featured,
      tags: form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
      benefits: form.benefits || [],
      skin_types: form.skin_types || [],
      related_product_ids: form.related_product_ids || [],
    };

    // Auto-translate name & description into all supported languages
    let translations: any = {};
    try {
      const { data: tr } = await supabase.functions.invoke("translate-product", {
        body: { name: form.name, brand: form.brand || "", description: form.description || "" },
      });
      if (tr?.translations) translations = tr.translations;
    } catch (e) {
      console.warn("translate-product failed", e);
    }

    if (editingId) {
      const { data: existing } = await supabase.from("products").select("translations").eq("id", editingId).maybeSingle();
      const merged = { ...(existing?.translations as any || {}), ...translations };
      const { error } = await supabase.from("products").update({ ...payload, translations: merged }).eq("id", editingId);
      if (error) { toast.error(error.message); return; }
      toast.success("상품이 수정되었습니다.");
    } else {
      const { error } = await supabase.from("products").insert({ ...payload, translations });
      if (error) { toast.error(error.message); return; }
      toast.success("상품이 등록되었습니다.");
    }
    resetForm();
    fetchData();
  };

  const resetForm = () => { setForm(emptyForm); setEditingId(null); setDialogOpen(false); setActiveTab("info"); };

  const loadProduct = (p: any, asCopy = false): FormState => ({
    name: asCopy ? p.name + " (복사)" : p.name,
    slug: asCopy ? "" : p.slug,
    description: p.description || "",
    description_top: p.description_top || "",
    description_bottom: p.description_bottom || "",
    description_position: (p.description_position as DescPos) || "none",
    image_alt: p.image_alt || "",
    price: String(p.price),
    original_price: p.original_price ? String(p.original_price) : "",
    category_id: p.category_id || "",
    brand: p.brand || "",
    image_url: p.image_url || "",
    images: (p.images || []).filter((u: string) => u && u !== p.image_url),
    detail_images: p.detail_images || [],
    stock: String(p.stock),
    is_active: asCopy ? false : p.is_active,
    is_featured: asCopy ? false : p.is_featured,
    tags: (p.tags || []).join(", "),
    benefits: p.benefits || [],
    skin_types: p.skin_types || [],
    related_product_ids: p.related_product_ids || [],
  });

  const editProduct = (p: any) => {
    setForm(loadProduct(p, false));
    setEditingId(p.id);
    setActiveTab("info");
    setDialogOpen(true);
  };

  const duplicateProduct = (p: any) => {
    setForm(loadProduct(p, true));
    setEditingId(null);
    setActiveTab("info");
    setDialogOpen(true);
  };

  const requestDeleteProduct = (p: any) => setPendingDelete({ ids: [p.id], label: p.name });
  const requestBulkDelete = () => {
    if (selectedIds.size === 0) return;
    setPendingDelete({ ids: Array.from(selectedIds), label: `${selectedIds.size}개 상품` });
  };

  const explainDeleteError = (err: any): string => {
    const code = err?.code || "";
    const msg = err?.message || String(err || "");
    if (code === "23503" || /foreign key/i.test(msg)) {
      return "이 상품은 다른 데이터에서 참조하고 있어 삭제할 수 없습니다. 잠시 후 다시 시도하거나 비활성화하세요.";
    }
    if (code === "42501" || /permission|rls/i.test(msg)) {
      return "삭제 권한이 없습니다. 관리자 계정으로 로그인했는지 확인하세요.";
    }
    if (/network|fetch/i.test(msg)) return "네트워크 오류로 삭제하지 못했습니다. 연결 상태를 확인해주세요.";
    return msg || "알 수 없는 오류가 발생했습니다.";
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    const ids = pendingDelete.ids;
    // Optimistic UI removal
    const snapshot = products;
    setProducts((prev) => prev.filter((p) => !ids.includes(p.id)));
    const { error, count } = await supabase
      .from("products")
      .delete({ count: "exact" })
      .in("id", ids);
    setDeleting(false);
    if (error) {
      setProducts(snapshot); // rollback
      toast.error(`삭제 실패: ${explainDeleteError(error)}`);
      return;
    }
    if ((count ?? 0) === 0) {
      setProducts(snapshot);
      toast.error("삭제된 항목이 없습니다. 권한이 없거나 이미 삭제된 상품일 수 있습니다.");
      await fetchData();
      return;
    }
    setSelectedIds(new Set());
    setPendingDelete(null);
    toast.success(ids.length > 1 ? `${count}개 상품이 삭제되었습니다.` : "상품이 삭제되었습니다.");
  };

  const bulkToggleActive = async (active: boolean) => {
    for (const id of selectedIds) {
      await supabase.from("products").update({ is_active: active }).eq("id", id);
    }
    setSelectedIds(new Set());
    toast.success(active ? "활성화 완료" : "비활성화 완료");
    fetchData();
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedIds(next);
  };

  const selectAll = () => {
    if (selectedIds.size === filtered.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filtered.map(p => p.id)));
  };

  const filtered = products.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.brand?.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterCategory !== "all" && p.category_id !== filterCategory) return false;
    if (filterStatus === "active" && !p.is_active) return false;
    if (filterStatus === "inactive" && p.is_active) return false;
    if (filterStatus === "featured" && !p.is_featured) return false;
    if (filterStatus === "outofstock" && p.stock > 0) return false;
    return true;
  });

  // Build preview product object from form
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
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-serif">상품 관리</h1>
          <p className="text-sm text-muted-foreground mt-1">총 {products.length}개 상품 · {products.filter(p=>p.is_active).length}개 활성</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={resetForm}><Plus className="h-4 w-4" />상품 추가</Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "상품 수정" : "새 상품 등록"}</DialogTitle>
            </DialogHeader>

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
              <TabsList className="grid grid-cols-5 w-full">
                <TabsTrigger value="info">기본 정보</TabsTrigger>
                <TabsTrigger value="images">이미지 관리</TabsTrigger>
                <TabsTrigger value="description">상품 설명</TabsTrigger>
                <TabsTrigger value="extras">효능/연계</TabsTrigger>
                <TabsTrigger value="preview" className="gap-1"><Eye className="h-3 w-3" />미리보기</TabsTrigger>
              </TabsList>

              {/* INFO */}
              <TabsContent value="info" className="mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2"><Label>상품명 *</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="상품명을 입력하세요" /></div>
                  <div><Label>슬러그 (자동 생성)</Label><Input value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} placeholder="auto-generated" /></div>
                  <div><Label>브랜드</Label><Input value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} /></div>
                  <div><Label>판매가 (원) *</Label><Input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} /></div>
                  <div><Label>정가 (원)</Label><Input type="number" value={form.original_price} onChange={e => setForm({...form, original_price: e.target.value})} /></div>
                  <div><Label>카테고리</Label>
                    <Select value={form.category_id} onValueChange={v => setForm({...form, category_id: v})}>
                      <SelectTrigger><SelectValue placeholder="선택" /></SelectTrigger>
                      <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>재고</Label><Input type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} /></div>
                  <div className="col-span-2"><Label>태그 (쉼표 구분)</Label><Input value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} placeholder="신상품, 베스트셀러, 한정판" /></div>
                  <div className="col-span-2">
                    <Label>피부 타입 (랭킹 분류)</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(["dry","oily","combination","sensitive","dehydrated_oily","acne_prone"] as const).map(s => {
                        const labelMap: Record<string,string> = { dry:"건성", oily:"지성", combination:"복합성", sensitive:"민감성", dehydrated_oily:"수부지", acne_prone:"여드름성" };
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
                  <div className="flex items-center gap-6 col-span-2">
                    <div className="flex items-center gap-2"><Switch checked={form.is_active} onCheckedChange={v => setForm({...form, is_active: v})} /><Label>판매 활성화</Label></div>
                    <div className="flex items-center gap-2"><Switch checked={form.is_featured} onCheckedChange={v => setForm({...form, is_featured: v})} /><Label>추천 상품</Label></div>
                  </div>
                </div>
              </TabsContent>

              {/* IMAGES */}
              <TabsContent value="images" className="mt-4 space-y-8">
                {/* 대표 */}
                <section className="border rounded-lg p-4 space-y-2">
                  <div>
                    <Label className="text-base">대표 이미지 *</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      상품 리스트 · 검색 · 장바구니 · 상세페이지 첫 화면에 표시되는 이미지입니다. (정사각형 자동 크롭, 1장 필수)
                    </p>
                  </div>
                  <ImageUploader
                    value={form.image_url}
                    onChange={(url) => setForm({...form, image_url: url})}
                    folder="products"
                    maxWidth={1200}
                    maxHeight={1200}
                    aspect="square"
                    label="대표 이미지"
                  />
                </section>

                {/* 추가 */}
                <section className="border rounded-lg p-4 space-y-3">
                  <div>
                    <Label className="text-base">추가 이미지 ({form.images.length}장)</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      상세페이지 상단 슬라이더에 대표 이미지 다음으로 노출됩니다. 등록한 순서대로 슬라이드됩니다. (대표 이미지는 자동으로 첫 슬라이드)
                    </p>
                  </div>
                  <SortableImages
                    images={form.images}
                    onChange={(next) => setForm({...form, images: next})}
                    folder="products"
                    aspect="square"
                    label="추가 이미지"
                  />
                </section>

                {/* 상세 */}
                <section className="border rounded-lg p-4 space-y-3">
                  <div>
                    <Label className="text-base">상세 이미지 ({form.detail_images.length}장)</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      상품 상세페이지 본문에 위에서 아래로 세로 출력되는 긴 설명 이미지입니다. 세로 비율 자유, 여러 장 등록 가능.
                    </p>
                  </div>
                  <SortableImages
                    images={form.detail_images}
                    onChange={(next) => setForm({...form, detail_images: next})}
                    folder="details"
                    aspect="free"
                    label="상세 이미지"
                  />
                </section>

                <div>
                  <Label>이미지 대체 텍스트 (alt)</Label>
                  <Input value={form.image_alt} onChange={(e) => setForm({...form, image_alt: e.target.value})} placeholder="접근성과 SEO를 위한 이미지 설명" />
                </div>
              </TabsContent>

              {/* DESCRIPTION */}
              <TabsContent value="description" className="mt-4 space-y-4">
                <div>
                  <Label>상품 설명 노출 위치</Label>
                  <Select value={form.description_position} onValueChange={(v) => setForm({...form, description_position: v as DescPos})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">노출 안 함</SelectItem>
                      <SelectItem value="top">상단에만 노출</SelectItem>
                      <SelectItem value="bottom">하단에만 노출</SelectItem>
                      <SelectItem value="both">상단 + 하단 모두 노출</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>상단 상품 설명 (이미지/가격/구매 버튼 근처)</Label>
                  <Textarea
                    value={form.description_top}
                    onChange={(e) => setForm({...form, description_top: e.target.value})}
                    rows={5}
                    placeholder="HTML 사용 가능: <strong>굵게</strong>, <a href='...'>링크</a>, 줄바꿈은 <br/> 또는 <p>"
                  />
                </div>
                <div>
                  <Label>하단 상품 설명 (상세 이미지 아래)</Label>
                  <Textarea
                    value={form.description_bottom}
                    onChange={(e) => setForm({...form, description_bottom: e.target.value})}
                    rows={5}
                    placeholder="HTML 사용 가능"
                  />
                </div>
                <div>
                  <Label className="text-muted-foreground">기본 설명 (호환용 / 위치 미설정 시 사용)</Label>
                  <Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} />
                </div>
              </TabsContent>

              {/* EXTRAS: benefits + related products */}
              <TabsContent value="extras" className="mt-4 space-y-6">
                <section className="border rounded-lg p-4 space-y-3">
                  <div>
                    <Label className="text-base">상품 효능 ({form.benefits.length}개 선택)</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      상품 상세페이지에 동그라미 아이콘으로 표시됩니다. 선택한 항목만 노출됩니다.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {BENEFIT_OPTIONS.map((b) => {
                      const active = form.benefits.includes(b);
                      return (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setForm({
                            ...form,
                            benefits: active ? form.benefits.filter(x => x !== b) : [...form.benefits, b],
                          })}
                          className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                            active ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"
                          }`}
                        >
                          {b}
                        </button>
                      );
                    })}
                  </div>
                </section>

                <section className="border rounded-lg p-4 space-y-3">
                  <div>
                    <Label className="text-base">연계 상품 ({form.related_product_ids.length}개 선택)</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      상품 상세페이지 하단에 추천 상품으로 노출됩니다. 고객이 바로 장바구니에 담을 수 있습니다.
                    </p>
                  </div>
                  <div className="max-h-72 overflow-y-auto border rounded">
                    {products.filter(p => p.id !== editingId).map((p) => {
                      const active = form.related_product_ids.includes(p.id);
                      return (
                        <label key={p.id} className={`flex items-center gap-3 p-2 border-b cursor-pointer hover:bg-muted/30 ${active ? "bg-primary/5" : ""}`}>
                          <input
                            type="checkbox"
                            checked={active}
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
                    {products.length === 0 && <p className="text-xs text-muted-foreground p-3">등록된 상품이 없습니다.</p>}
                  </div>
                </section>
              </TabsContent>

              {/* PREVIEW */}
              <TabsContent value="preview" className="mt-4">
                <div className="border rounded-lg p-4 md:p-6 bg-background">
                  <ProductView product={previewProduct as any} preview />
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-between items-center gap-2 pt-4 border-t mt-4 sticky bottom-0 bg-background">
              <Button variant="ghost" onClick={() => setDialogOpen(false)}>돌아가기</Button>
              <div className="flex gap-2">
                {activeTab !== "preview" && (
                  <Button variant="outline" onClick={() => setActiveTab("preview")} className="gap-1">
                    <Eye className="h-4 w-4" />미리보기
                  </Button>
                )}
                <Button onClick={save}>
                  {activeTab === "preview" ? "저장 후 적용" : editingId ? "수정 저장" : "상품 등록"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="상품명, 브랜드 검색..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full sm:w-[150px] shrink-0"><SelectValue placeholder="카테고리" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 카테고리</SelectItem>
            {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-[130px] shrink-0"><SelectValue placeholder="상태" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="active">활성</SelectItem>
            <SelectItem value="inactive">비활성</SelectItem>
            <SelectItem value="featured">추천</SelectItem>
            <SelectItem value="outofstock">품절</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {selectedIds.size > 0 && (
        <div className="flex items-center gap-2 mb-4 p-3 bg-primary/5 rounded-lg">
          <span className="text-sm font-medium">{selectedIds.size}개 선택됨</span>
          <Button size="sm" variant="outline" onClick={() => bulkToggleActive(true)}>활성화</Button>
          <Button size="sm" variant="outline" onClick={() => bulkToggleActive(false)}>비활성화</Button>
          <Button size="sm" variant="destructive" onClick={requestBulkDelete}>일괄 삭제</Button>
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <input type="checkbox" checked={selectedIds.size === filtered.length && filtered.length > 0} onChange={selectAll} className="rounded" />
                </TableHead>
                <TableHead className="w-16">대표</TableHead>
                <TableHead>상품명</TableHead>
                <TableHead>카테고리</TableHead>
                <TableHead>가격</TableHead>
                <TableHead>재고</TableHead>
                <TableHead>이미지</TableHead>
                <TableHead>상태</TableHead>
                <TableHead className="text-right">관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(p => (
                <TableRow key={p.id} className={selectedIds.has(p.id) ? "bg-primary/5" : ""}>
                  <TableCell><input type="checkbox" checked={selectedIds.has(p.id)} onChange={() => toggleSelect(p.id)} /></TableCell>
                  <TableCell>
                    {p.image_url ? <img src={p.image_url} className="w-12 h-12 object-cover rounded" alt={p.name} /> : <div className="w-12 h-12 bg-muted rounded" />}
                  </TableCell>
                  <TableCell>
                    <p className="font-medium text-sm">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.brand || ""}</p>
                  </TableCell>
                  <TableCell className="text-sm">{p.categories?.name || "-"}</TableCell>
                  <TableCell>
                    <p className="text-sm font-medium">{Number(p.price).toLocaleString()}원</p>
                    {p.original_price && <p className="text-xs text-muted-foreground line-through">{Number(p.original_price).toLocaleString()}원</p>}
                  </TableCell>
                  <TableCell>
                    <span className={`text-sm font-medium ${p.stock <= 0 ? 'text-destructive' : p.stock <= 10 ? 'text-accent' : ''}`}>
                      {p.stock}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    추가 {(p.images || []).length} · 상세 {(p.detail_images || []).length}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      <Badge variant={p.is_active ? "default" : "secondary"} className="text-xs">
                        {p.is_active ? "활성" : "비활성"}
                      </Badge>
                      {p.is_featured && <Badge variant="outline" className="text-xs">추천</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => editProduct(p)} title="수정"><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => duplicateProduct(p)} title="복사"><Copy className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" className="text-destructive" onClick={() => requestDeleteProduct(p)} title="삭제"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">상품이 없습니다.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminProducts;
