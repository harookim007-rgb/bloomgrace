import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, GripVertical } from "lucide-react";
import { toast } from "sonner";

const emptyForm = { name: "", slug: "", description: "", parent_id: "", image_url: "", sort_order: "0" };

const AdminCategories = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const { data } = await supabase.from("categories").select("*").order("sort_order");
    setCategories(data || []);
  };

  const save = async () => {
    if (!form.name) { toast.error("카테고리명을 입력하세요."); return; }
    const slug = form.slug || form.name.toLowerCase().replace(/[^a-z0-9가-힣]+/g, "-");
    const payload = {
      name: form.name, slug, description: form.description || null,
      parent_id: form.parent_id || null, image_url: form.image_url || null,
      sort_order: parseInt(form.sort_order) || 0,
    };

    if (editingId) {
      const { error } = await supabase.from("categories").update(payload).eq("id", editingId);
      if (error) { toast.error(error.message); return; }
      toast.success("카테고리가 수정되었습니다.");
    } else {
      const { error } = await supabase.from("categories").insert(payload);
      if (error) { toast.error(error.message); return; }
      toast.success("카테고리가 추가되었습니다.");
    }
    setForm(emptyForm); setEditingId(null); setDialogOpen(false);
    fetchData();
  };

  const edit = (c: any) => {
    setForm({
      name: c.name, slug: c.slug, description: c.description || "",
      parent_id: c.parent_id || "", image_url: c.image_url || "", sort_order: String(c.sort_order),
    });
    setEditingId(c.id); setDialogOpen(true);
  };

  const remove = async (id: string) => {
    if (!confirm("이 카테고리를 삭제하시겠습니까? 하위 카테고리와 상품이 영향받을 수 있습니다.")) return;
    await supabase.from("categories").delete().eq("id", id);
    toast.success("삭제되었습니다."); fetchData();
  };

  const parentCategories = categories.filter(c => !c.parent_id);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-serif">카테고리 관리</h1>
          <p className="text-sm text-muted-foreground mt-1">상품 분류 카테고리를 관리합니다</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={() => { setForm(emptyForm); setEditingId(null); }}><Plus className="h-4 w-4" />카테고리 추가</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingId ? "카테고리 수정" : "새 카테고리"}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>카테고리명 *</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
              <div><Label>슬러그</Label><Input value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} placeholder="자동 생성" /></div>
              <div><Label>상위 카테고리</Label>
                <Select value={form.parent_id} onValueChange={v => setForm({...form, parent_id: v === "none" ? "" : v})}>
                  <SelectTrigger><SelectValue placeholder="없음 (최상위)" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">없음 (최상위)</SelectItem>
                    {parentCategories.filter(c => c.id !== editingId).map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>이미지 URL</Label><Input value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})} /></div>
              <div><Label>설명</Label><Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} /></div>
              <div><Label>정렬 순서</Label><Input type="number" value={form.sort_order} onChange={e => setForm({...form, sort_order: e.target.value})} /></div>
              <Button className="w-full" onClick={save}>{editingId ? "수정" : "추가"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>순서</TableHead>
                <TableHead>카테고리명</TableHead>
                <TableHead>슬러그</TableHead>
                <TableHead>상위 카테고리</TableHead>
                <TableHead>상품 수</TableHead>
                <TableHead className="text-right">관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map(c => (
                <TableRow key={c.id}>
                  <TableCell className="text-sm text-muted-foreground">{c.sort_order}</TableCell>
                  <TableCell className="font-medium">
                    {c.parent_id && <span className="text-muted-foreground mr-2">└</span>}
                    {c.name}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground font-mono">{c.slug}</TableCell>
                  <TableCell className="text-sm">{categories.find(p => p.id === c.parent_id)?.name || "-"}</TableCell>
                  <TableCell className="text-sm">-</TableCell>
                  <TableCell className="text-right">
                    <Button size="icon" variant="ghost" onClick={() => edit(c)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" className="text-destructive" onClick={() => remove(c.id)}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
              {categories.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">카테고리가 없습니다.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCategories;
