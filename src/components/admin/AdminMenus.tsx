import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, ArrowUp, ArrowDown, Save } from "lucide-react";
import { toast } from "sonner";
import { translateLabel } from "@/lib/translateLabel";

type Item = {
  id: string;
  label: string;
  link: string;
  sort_order: number;
  is_visible: boolean;
  translations?: Record<string, string> | null;
};

// Built-in menu keys are translated by the storefront's own dictionary.
const BUILT_IN_LABELS: Record<string, string> = {
  nav_home: "홈", nav_products: "상품", nav_ranking: "랭킹", nav_routine: "루틴 만들기", nav_contact: "문의",
};

// `compact` is the narrow layout used inside the design editor; both layouts save the same menu_items rows.
const AdminMenus = ({ compact = false, onSaved }: { compact?: boolean; onSaved?: () => void }) => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("menu_items").select("*").order("sort_order");
    setItems((data as Item[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const add = async () => {
    const nextOrder = (items[items.length - 1]?.sort_order ?? 0) + 10;
    const { data, error } = await supabase.from("menu_items")
      .insert({ label: "새 메뉴", link: "/", sort_order: nextOrder, is_visible: true })
      .select().single();
    if (error) { toast.error(error.message); return; }
    setItems([...items, data as Item]);
  };

  const removeItem = async (id: string) => {
    if (!window.confirm("이 메뉴를 삭제하시겠습니까?")) return;
    const snap = items;
    setItems(items.filter(i => i.id !== id));
    const { error } = await supabase.from("menu_items").delete().eq("id", id);
    if (error) { setItems(snap); toast.error(error.message); return; }
    toast.success("삭제되었습니다.");
  };

  const move = (idx: number, dir: -1 | 1) => {
    const j = idx + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[idx], next[j]] = [next[j], next[idx]];
    // reassign order
    next.forEach((it, i) => { it.sort_order = (i + 1) * 10; });
    setItems(next);
  };

  const updateField = (id: string, patch: Partial<Item>) => {
    // A changed label needs a fresh translation on the next save
    const reset = patch.label !== undefined ? { translations: null } : {};
    setItems(items.map(i => (i.id === id ? { ...i, ...patch, ...reset } : i)));
  };

  const saveAll = async () => {
    setSaving(true);
    let translationFailed = false;
    // Update each row (small table, straightforward)
    for (const it of items) {
      const { error } = await supabase.from("menu_items")
        .update({ label: it.label, link: it.link, sort_order: it.sort_order, is_visible: it.is_visible })
        .eq("id", it.id);
      if (error) { toast.error(error.message); setSaving(false); return; }

      // "nav_" keys are translated by the built-in dictionary; other labels are auto-translated once
      const isKey = it.label.startsWith("nav_");
      if (!isKey && it.translations) continue;
      const translations = isKey ? null : await translateLabel(it.label);
      if (!isKey && !translations) { translationFailed = true; continue; }
      const { error: trError } = await supabase.from("menu_items").update({ translations }).eq("id", it.id);
      if (trError) translationFailed = true;
    }
    setSaving(false);
    toast.success(translationFailed ? "메뉴가 저장되었습니다. 직접 입력한 이름은 그대로 표시됩니다." : "메뉴가 저장되었습니다.");
    load();
    onSaved?.();
  };

  if (compact) {
    return (
      <div className="space-y-3">
        {loading && <p className="text-sm text-muted-foreground text-center py-4">로딩 중...</p>}
        {!loading && items.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">메뉴가 없습니다.</p>}
        {items.map((it, idx) => (
          <div key={it.id} className={`rounded-md border border-border p-2.5 space-y-2 ${it.is_visible ? "bg-background" : "bg-muted/50"}`}>
            {BUILT_IN_LABELS[it.label] && (
              <p className="text-xs text-muted-foreground">기본 메뉴 · {BUILT_IN_LABELS[it.label]} (언어별 자동 표시)</p>
            )}
            <div className="flex items-center gap-1">
              <Input value={it.label} onChange={(e) => updateField(it.id, { label: e.target.value })} className="h-9 min-w-0 flex-1" aria-label="메뉴 이름" />
              <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" disabled={idx === 0} onClick={() => move(idx, -1)} aria-label="위로"><ArrowUp className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" disabled={idx === items.length - 1} onClick={() => move(idx, 1)} aria-label="아래로"><ArrowDown className="h-4 w-4" /></Button>
            </div>
            <div className="flex items-center gap-2">
              <Input value={it.link} onChange={(e) => updateField(it.id, { link: e.target.value })} placeholder="/products" className="h-9 min-w-0 flex-1" aria-label="링크" />
              <Switch checked={it.is_visible} onCheckedChange={(v) => updateField(it.id, { is_visible: v })} aria-label="표시" />
              <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0 text-destructive" onClick={() => removeItem(it.id)} aria-label="삭제"><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={add} className="gap-1.5"><Plus className="h-4 w-4" />메뉴 추가</Button>
          <Button onClick={saveAll} disabled={saving} className="gap-1.5"><Save className="h-4 w-4" />{saving ? "저장 중..." : "메뉴 저장"}</Button>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          메뉴는 '메뉴 저장'을 누르면 바로 쇼핑몰에 적용됩니다. 이름에 nav_home 같은 키를 쓰면 언어별 내장 번역이 표시되고, 직접 입력한 이름은 그대로 표시됩니다.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold font-serif">메뉴 관리</h1>
          <p className="text-sm text-muted-foreground mt-1">사이트 상단 내비게이션 메뉴를 관리합니다.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={add} className="gap-2"><Plus className="h-4 w-4" />메뉴 추가</Button>
          <Button onClick={saveAll} disabled={saving} className="gap-2"><Save className="h-4 w-4" />{saving ? "저장 중..." : "전체 저장"}</Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <p className="p-6 text-sm text-muted-foreground text-center">로딩 중...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">순서</TableHead>
                  <TableHead>라벨 (i18n 키 또는 표시명)</TableHead>
                  <TableHead>링크</TableHead>
                  <TableHead className="w-24">표시</TableHead>
                  <TableHead className="w-32 text-right">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((it, idx) => (
                  <TableRow key={it.id}>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" disabled={idx === 0} onClick={() => move(idx, -1)}><ArrowUp className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" disabled={idx === items.length - 1} onClick={() => move(idx, 1)}><ArrowDown className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Input value={it.label} onChange={(e) => updateField(it.id, { label: e.target.value })} className="h-9" />
                      <p className="text-[10px] text-muted-foreground mt-1">nav_home, nav_products 같은 키는 언어별 내장 번역을 쓰고, 직접 입력한 이름은 그대로 표시됩니다</p>
                    </TableCell>
                    <TableCell>
                      <Input value={it.link} onChange={(e) => updateField(it.id, { link: e.target.value })} placeholder="/products 또는 __routine__" className="h-9" />
                    </TableCell>
                    <TableCell>
                      <Switch checked={it.is_visible} onCheckedChange={(v) => updateField(it.id, { is_visible: v })} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="icon" variant="ghost" className="text-destructive" onClick={() => removeItem(it.id)}><Trash2 className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
                {items.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">메뉴가 없습니다. "메뉴 추가"를 눌러주세요.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminMenus;
