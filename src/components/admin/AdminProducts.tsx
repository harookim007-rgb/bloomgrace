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
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Search, Download, Upload, Copy, X } from "lucide-react";
import { toast } from "sonner";
import ImageUploader from "./ImageUploader";

const emptyForm = {
  name: "", slug: "", description: "", price: "", original_price: "", category_id: "",
  brand: "", image_url: "", thumbnail_url: "", images: [] as string[], stock: "0", is_active: true, is_featured: false, tags: ""
};

const AdminProducts = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const [p, c] = await Promise.all([
      supabase.from("products").select("*, categories(name)").order("created_at", { ascending: false }),
      supabase.from("categories").select("*").order("sort_order"),
    ]);
    setProducts(p.data || []);
    setCategories(c.data || []);
  };

  const save = async () => {
    const slug = form.slug || form.name.toLowerCase().replace(/[^a-z0-9가-힣]+/g, "-").replace(/-+/g, "-");
    const payload = {
      name: form.name, slug, description: form.description,
      price: parseFloat(form.price) || 0,
      original_price: form.original_price ? parseFloat(form.original_price) : null,
      stock: parseInt(form.stock) || 0,
      category_id: form.category_id || null,
      brand: form.brand || null,
      image_url: form.image_url || null,
      thumbnail_url: form.thumbnail_url || null,
      images: form.images || [],
      is_active: form.is_active,
      is_featured: form.is_featured,
      tags: form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
    };

    if (editingId) {
      const { error } = await supabase.from("products").update(payload).eq("id", editingId);
      if (error) { toast.error(error.message); return; }
      toast.success("상품이 수정되었습니다.");
    } else {
      const { error } = await supabase.from("products").insert(payload);
      if (error) { toast.error(error.message); return; }
      toast.success("상품이 등록되었습니다.");
    }
    resetForm();
    fetchData();
  };

  const resetForm = () => { setForm(emptyForm); setEditingId(null); setDialogOpen(false); };

  const editProduct = (p: any) => {
    setForm({
      name: p.name, slug: p.slug, description: p.description || "",
      price: String(p.price), original_price: p.original_price ? String(p.original_price) : "",
      category_id: p.category_id || "", brand: p.brand || "", image_url: p.image_url || "",
      thumbnail_url: p.thumbnail_url || "", images: p.images || [],
      stock: String(p.stock), is_active: p.is_active, is_featured: p.is_featured,
      tags: (p.tags || []).join(", "),
    });
    setEditingId(p.id);
    setDialogOpen(true);
  };

  const duplicateProduct = (p: any) => {
    setForm({
      name: p.name + " (복사)", slug: "", description: p.description || "",
      price: String(p.price), original_price: p.original_price ? String(p.original_price) : "",
      category_id: p.category_id || "", brand: p.brand || "", image_url: p.image_url || "",
      thumbnail_url: p.thumbnail_url || "", images: p.images || [],
      stock: String(p.stock), is_active: false, is_featured: false,
      tags: (p.tags || []).join(", "),
    });
    setEditingId(null);
    setDialogOpen(true);
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    await supabase.from("products").delete().eq("id", id);
    toast.success("삭제되었습니다.");
    fetchData();
  };

  const bulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`${selectedIds.size}개 상품을 삭제하시겠습니까?`)) return;
    for (const id of selectedIds) {
      await supabase.from("products").delete().eq("id", id);
    }
    setSelectedIds(new Set());
    toast.success("일괄 삭제 완료");
    fetchData();
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
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editingId ? "상품 수정" : "새 상품 등록"}</DialogTitle></DialogHeader>
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
              <div className="col-span-2">
                <Label>대표 이미지 (정사각형 자동 크롭, 자동 크기 조정)</Label>
                <ImageUploader
                  value={form.image_url}
                  onChange={(url) => setForm({...form, image_url: url})}
                  folder="products"
                  maxWidth={1200}
                  maxHeight={1200}
                  aspect="square"
                  label="대표 이미지"
                />
              </div>
              <div className="col-span-2">
                <Label>썸네일 이미지 (목록용, 비워두면 대표 이미지 사용)</Label>
                <ImageUploader
                  value={form.thumbnail_url}
                  onChange={(url) => setForm({...form, thumbnail_url: url})}
                  folder="thumbnails"
                  maxWidth={600}
                  maxHeight={600}
                  aspect="square"
                  label="썸네일"
                />
              </div>
              <div className="col-span-2">
                <Label>추가 이미지 ({form.images.length}장)</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.images.map((url, idx) => (
                    <div key={idx} className="relative">
                      <img src={url} className="w-20 h-20 object-cover rounded border" />
                      <button
                        type="button"
                        onClick={() => setForm({...form, images: form.images.filter((_, i) => i !== idx)})}
                        className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-2">
                  <ImageUploader
                    value=""
                    onChange={(url) => url && setForm({...form, images: [...form.images, url]})}
                    folder="products"
                    maxWidth={1200}
                    maxHeight={1200}
                    aspect="square"
                    label="추가 이미지"
                  />
                </div>
              </div>
              <div className="col-span-2"><Label>태그 (쉼표 구분)</Label><Input value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} placeholder="신상품, 베스트셀러, 한정판" /></div>
              <div className="col-span-2"><Label>설명</Label><Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={4} /></div>
              <div className="flex items-center gap-6 col-span-2">
                <div className="flex items-center gap-2"><Switch checked={form.is_active} onCheckedChange={v => setForm({...form, is_active: v})} /><Label>판매 활성화</Label></div>
                <div className="flex items-center gap-2"><Switch checked={form.is_featured} onCheckedChange={v => setForm({...form, is_featured: v})} /><Label>추천 상품</Label></div>
              </div>
              <Button className="col-span-2" onClick={save}>{editingId ? "수정 저장" : "상품 등록"}</Button>
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
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="카테고리" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 카테고리</SelectItem>
            {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[130px]"><SelectValue placeholder="상태" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="active">활성</SelectItem>
            <SelectItem value="inactive">비활성</SelectItem>
            <SelectItem value="featured">추천</SelectItem>
            <SelectItem value="outofstock">품절</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bulk actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-2 mb-4 p-3 bg-primary/5 rounded-lg">
          <span className="text-sm font-medium">{selectedIds.size}개 선택됨</span>
          <Button size="sm" variant="outline" onClick={() => bulkToggleActive(true)}>활성화</Button>
          <Button size="sm" variant="outline" onClick={() => bulkToggleActive(false)}>비활성화</Button>
          <Button size="sm" variant="destructive" onClick={bulkDelete}>일괄 삭제</Button>
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
                <TableHead className="w-16">이미지</TableHead>
                <TableHead>상품명</TableHead>
                <TableHead>카테고리</TableHead>
                <TableHead>가격</TableHead>
                <TableHead>재고</TableHead>
                <TableHead>상태</TableHead>
                <TableHead className="text-right">관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(p => (
                <TableRow key={p.id} className={selectedIds.has(p.id) ? "bg-primary/5" : ""}>
                  <TableCell><input type="checkbox" checked={selectedIds.has(p.id)} onChange={() => toggleSelect(p.id)} /></TableCell>
                  <TableCell>
                    {(p.thumbnail_url || p.image_url) ? <img src={p.thumbnail_url || p.image_url} className="w-12 h-12 object-cover rounded" /> : <div className="w-12 h-12 bg-muted rounded" />}
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
                      <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteProduct(p.id)} title="삭제"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">상품이 없습니다.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminProducts;
