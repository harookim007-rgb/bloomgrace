import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trash2, Search, Star } from "lucide-react";
import { toast } from "sonner";

const AdminReviews = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filterRating, setFilterRating] = useState("all");

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const { data } = await supabase
      .from("reviews")
      .select("*, products(name), profiles!reviews_user_id_fkey(display_name)")
      .order("created_at", { ascending: false });
    setReviews(data || []);
  };

  const remove = async (id: string) => {
    if (!confirm("이 리뷰를 삭제하시겠습니까?")) return;
    await supabase.from("reviews").delete().eq("id", id);
    toast.success("리뷰가 삭제되었습니다."); fetchData();
  };

  const filtered = reviews.filter(r => {
    if (filterRating !== "all" && r.rating !== parseInt(filterRating)) return false;
    if (search) {
      const s = search.toLowerCase();
      return (r.content?.toLowerCase() || "").includes(s) || 
             (r.title?.toLowerCase() || "").includes(s) ||
             (r.products?.name?.toLowerCase() || "").includes(s) ||
             (r.profiles?.display_name?.toLowerCase() || "").includes(s);
    }
    return true;
  });

  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "0";

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-serif">리뷰 관리</h1>
        <p className="text-sm text-muted-foreground mt-1">
          총 {reviews.length}개 리뷰 · 평균 평점 {avgRating}점
        </p>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="상품명, 작성자, 내용 검색..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={filterRating} onValueChange={setFilterRating}>
          <SelectTrigger className="w-full sm:w-[130px] shrink-0"><SelectValue placeholder="평점" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 평점</SelectItem>
            {[5, 4, 3, 2, 1].map(r => <SelectItem key={r} value={String(r)}>{r}점</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>작성일</TableHead>
                <TableHead>상품</TableHead>
                <TableHead>작성자</TableHead>
                <TableHead>평점</TableHead>
                <TableHead>제목</TableHead>
                <TableHead>내용</TableHead>
                <TableHead className="text-right">관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(r => (
                <TableRow key={r.id}>
                  <TableCell className="text-sm text-muted-foreground">{new Date(r.created_at).toLocaleDateString("ko-KR")}</TableCell>
                  <TableCell className="text-sm font-medium">{r.products?.name || "-"}</TableCell>
                  <TableCell className="text-sm">{r.profiles?.display_name || "-"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star key={i} className={`h-3 w-3 ${i < r.rating ? 'fill-accent text-accent' : 'text-muted'}`} />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{r.title || "-"}</TableCell>
                  <TableCell className="text-sm max-w-[200px] truncate" title={r.content || ""}>{r.content || "-"}</TableCell>
                  <TableCell className="text-right">
                    <Button size="icon" variant="ghost" className="text-destructive" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">리뷰가 없습니다.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminReviews;
