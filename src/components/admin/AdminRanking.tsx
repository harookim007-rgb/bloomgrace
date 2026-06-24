import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, X, Save } from "lucide-react";

type Product = {
  id: string;
  name: string;
  brand: string | null;
  thumbnail_url: string | null;
  image_url: string | null;
  is_active: boolean;
  manual_rank: number | null;
};

const AdminRanking = () => {
  const [pinned, setPinned] = useState<Product[]>([]);
  const [others, setOthers] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("products")
      .select("id,name,brand,thumbnail_url,image_url,is_active,manual_rank")
      .eq("is_active", true)
      .order("name", { ascending: true });
    const all = (data || []) as Product[];
    const p = all
      .filter((x) => x.manual_rank !== null)
      .sort((a, b) => (a.manual_rank ?? 0) - (b.manual_rank ?? 0));
    const o = all.filter((x) => x.manual_rank === null);
    setPinned(p);
    setOthers(o);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const move = (idx: number, dir: -1 | 1) => {
    const next = [...pinned];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    setPinned(next);
  };

  const addToPinned = (product: Product) => {
    setOthers((o) => o.filter((x) => x.id !== product.id));
    setPinned((p) => [...p, product]);
  };

  const removeFromPinned = (product: Product) => {
    setPinned((p) => p.filter((x) => x.id !== product.id));
    setOthers((o) => [...o, product].sort((a, b) => a.name.localeCompare(b.name)));
  };

  const save = async () => {
    setSaving(true);
    try {
      // Set ranks 1..N for pinned (in display order)
      for (let i = 0; i < pinned.length; i++) {
        const { error } = await supabase
          .from("products")
          .update({ manual_rank: i + 1 })
          .eq("id", pinned[i].id);
        if (error) throw error;
      }
      // Clear manual_rank on all others
      const otherIds = others.map((o) => o.id);
      if (otherIds.length) {
        const { error } = await supabase
          .from("products")
          .update({ manual_rank: null })
          .in("id", otherIds);
        if (error) throw error;
      }
      toast.success("랭킹이 저장되었습니다.");
      await load();
    } catch (e: any) {
      toast.error(e?.message || "저장 실패");
    } finally {
      setSaving(false);
    }
  };

  const filtered = others.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.brand || "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="text-muted-foreground">로딩 중...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold font-serif">랭킹 관리</h1>
          <p className="text-sm text-muted-foreground mt-1">
            고정된 상품은 누적 판매와 상관없이 랭킹 페이지에서 순서대로 우선 노출됩니다. 나머지 자리는 자동으로 판매 순으로 채워집니다.
          </p>
        </div>
        <Button onClick={save} disabled={saving}>
          <Save className="h-4 w-4 mr-2" /> {saving ? "저장 중..." : "저장하기"}
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Pinned list */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h2 className="font-semibold mb-3">고정된 상품 ({pinned.length})</h2>
          {pinned.length === 0 ? (
            <div className="text-sm text-muted-foreground py-8 text-center">
              아직 고정된 상품이 없습니다. 오른쪽에서 추가하세요.
            </div>
          ) : (
            <ul className="space-y-2">
              {pinned.map((p, i) => (
                <li key={p.id} className="flex items-center gap-2 p-2 bg-muted/40 rounded">
                  <span className="w-8 text-center font-serif tabular-nums text-sm">{i + 1}</span>
                  <img
                    src={p.thumbnail_url || p.image_url || "/placeholder.svg"}
                    alt={p.name}
                    className="h-10 w-10 object-cover rounded shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    {p.brand && <div className="text-[10px] uppercase tracking-wider text-muted-foreground truncate">{p.brand}</div>}
                    <div className="text-sm truncate">{p.name}</div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button size="icon" variant="ghost" onClick={() => move(i, -1)} disabled={i === 0}>
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => move(i, 1)} disabled={i === pinned.length - 1}>
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => removeFromPinned(p)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Other products */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h2 className="font-semibold mb-3">상품 추가</h2>
          <Input
            placeholder="상품 이름 또는 브랜드 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-3"
          />
          <ul className="space-y-1 max-h-[500px] overflow-y-auto">
            {filtered.map((p) => (
              <li
                key={p.id}
                onClick={() => addToPinned(p)}
                className="flex items-center gap-2 p-2 hover:bg-muted/60 rounded cursor-pointer"
              >
                <img
                  src={p.thumbnail_url || p.image_url || "/placeholder.svg"}
                  alt={p.name}
                  className="h-10 w-10 object-cover rounded shrink-0"
                />
                <div className="flex-1 min-w-0">
                  {p.brand && <div className="text-[10px] uppercase tracking-wider text-muted-foreground truncate">{p.brand}</div>}
                  <div className="text-sm truncate">{p.name}</div>
                </div>
                <span className="text-xs text-primary shrink-0">+ 추가</span>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="text-sm text-muted-foreground py-8 text-center">검색 결과가 없습니다.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminRanking;
