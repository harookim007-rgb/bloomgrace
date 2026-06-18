import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, GripVertical, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import ImageUploader from "./ImageUploader";

const emptyForm = { title: "", subtitle: "", image_url: "", link_url: "", is_active: true, sort_order: "0", starts_at: "", expires_at: "" };

const AdminBanners = () => {
  const [banners, setBanners] = useState<any[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const { data } = await supabase.from("banners").select("*").order("sort_order");
    setBanners(data || []);
  };

  const save = async () => {
    if (!form.title) { toast.error("제목을 입력하세요."); return; }
    const link = form.link_url.trim();
    if (link && !/^(\/|https?:\/\/)/i.test(link)) {
      toast.error("링크 URL은 '/'로 시작하거나 'http(s)://'로 시작해야 합니다.");
      return;
    }
    if (form.starts_at && form.expires_at && new Date(form.starts_at) >= new Date(form.expires_at)) {
      toast.error("종료일은 시작일 이후여야 합니다.");
      return;
    }
    const payload = {
      title: form.title, subtitle: form.subtitle || null,
      image_url: form.image_url || null, link_url: link || null,
      is_active: form.is_active, sort_order: parseInt(form.sort_order) || 0,
      starts_at: form.starts_at || null, expires_at: form.expires_at || null,
    };

    if (editingId) {
      const { error } = await supabase.from("banners").update(payload).eq("id", editingId);
      if (error) { toast.error(error.message); return; }
      toast.success("배너가 수정되었습니다.");
    } else {
      const { error } = await supabase.from("banners").insert(payload);
      if (error) { toast.error(error.message); return; }
      toast.success("배너가 등록되었습니다.");
    }
    setForm(emptyForm); setEditingId(null); setDialogOpen(false);
    fetchData();
  };

  const edit = (b: any) => {
    setForm({
      title: b.title, subtitle: b.subtitle || "", image_url: b.image_url || "",
      link_url: b.link_url || "", is_active: b.is_active, sort_order: String(b.sort_order),
      starts_at: b.starts_at?.slice(0, 16) || "", expires_at: b.expires_at?.slice(0, 16) || "",
    });
    setEditingId(b.id); setDialogOpen(true);
  };

  const remove = async (id: string) => {
    if (!confirm("삭제하시겠습니까?")) return;
    await supabase.from("banners").delete().eq("id", id);
    toast.success("삭제되었습니다."); fetchData();
  };

  const toggleActive = async (id: string, active: boolean) => {
    await supabase.from("banners").update({ is_active: active }).eq("id", id);
    fetchData();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-serif">배너 & 프로모션</h1>
          <p className="text-sm text-muted-foreground mt-1">홈페이지 슬라이더 배너를 관리합니다</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={() => { setForm(emptyForm); setEditingId(null); }}><Plus className="h-4 w-4" />배너 추가</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editingId ? "배너 수정" : "새 배너 등록"}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>제목 *</Label><Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div>
              <div><Label>부제</Label><Input value={form.subtitle} onChange={e => setForm({...form, subtitle: e.target.value})} /></div>
              <div>
                <Label>배너 이미지 (16:9 자동 크롭, 자동 크기 조정)</Label>
                <ImageUploader
                  value={form.image_url}
                  onChange={(url) => setForm({...form, image_url: url})}
                  folder="banners"
                  maxWidth={1920}
                  maxHeight={1080}
                  aspect="wide"
                  label="배너 이미지"
                />
              </div>
              <div><Label>링크 URL</Label><Input value={form.link_url} onChange={e => setForm({...form, link_url: e.target.value})} placeholder="/products" /></div>
              <div><Label>정렬 순서</Label><Input type="number" value={form.sort_order} onChange={e => setForm({...form, sort_order: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>시작일</Label><Input type="datetime-local" value={form.starts_at} onChange={e => setForm({...form, starts_at: e.target.value})} /></div>
                <div><Label>종료일</Label><Input type="datetime-local" value={form.expires_at} onChange={e => setForm({...form, expires_at: e.target.value})} /></div>
              </div>
              <div className="flex items-center gap-2"><Switch checked={form.is_active} onCheckedChange={v => setForm({...form, is_active: v})} /><Label>활성화</Label></div>
              <Button className="w-full" onClick={save}>{editingId ? "수정" : "등록"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {banners.map(b => (
          <Card key={b.id} className={`${!b.is_active ? 'opacity-60' : ''}`}>
            <CardContent className="p-4">
              <div className="flex gap-4 items-center">
                <div className="text-muted-foreground"><GripVertical className="h-5 w-5" /></div>
                {b.image_url ? (
                  <img src={b.image_url} alt={b.title} className="w-40 h-20 object-cover rounded-lg shrink-0" />
                ) : (
                  <div className="w-40 h-20 bg-muted rounded-lg shrink-0 flex items-center justify-center text-xs text-muted-foreground">이미지 없음</div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium">{b.title}</h3>
                  {b.subtitle && <p className="text-sm text-muted-foreground">{b.subtitle}</p>}
                  <div className="flex gap-2 mt-1 text-xs text-muted-foreground">
                    <span>순서: {b.sort_order}</span>
                    {b.link_url && <span>링크: {b.link_url}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Switch checked={b.is_active} onCheckedChange={v => toggleActive(b.id, v)} />
                  <Button size="icon" variant="ghost" onClick={() => edit(b)}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" className="text-destructive" onClick={() => remove(b.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {banners.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">등록된 배너가 없습니다.</div>
        )}
      </div>
    </div>
  );
};

export default AdminBanners;
