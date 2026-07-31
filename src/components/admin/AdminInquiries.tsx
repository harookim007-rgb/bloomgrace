import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Search, Mail, MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";

const AdminInquiries = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "answered">("all");
  const [active, setActive] = useState<any>(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const { data, error } = await supabase
      .from("inquiries")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) { toast.error("문의를 불러오지 못했습니다: " + error.message); return; }
    setRows(data || []);
  };

  const openReply = (row: any) => {
    setActive(row);
    setReply(row.admin_reply || "");
  };

  const sendReply = async () => {
    if (!active) return;
    if (reply.trim().length < 2) { toast.error("답변 내용을 입력해주세요."); return; }
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("reply-inquiry", {
        body: { inquiryId: active.id, reply: reply.trim() },
      });
      if (error) throw error;
      if (data?.emailed) toast.success("답변을 저장하고 고객에게 이메일을 보냈습니다.");
      else toast.warning("답변은 저장했지만 이메일 발송에 실패했습니다: " + (data?.error || "unknown"));
      setActive(null);
      fetchData();
    } catch (e: any) {
      toast.error("답변 전송 실패: " + (e?.message || "unknown"));
    } finally {
      setSending(false);
    }
  };

  const filtered = rows.filter(r => {
    if (filter !== "all" && (r.status || "pending") !== filter) return false;
    if (search) {
      const s = search.toLowerCase();
      if (!(`${r.name} ${r.email} ${r.message}`.toLowerCase().includes(s))) return false;
    }
    return true;
  });

  const pendingCount = rows.filter(r => (r.status || "pending") === "pending").length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-serif">CS 문의 관리</h1>
        <p className="text-sm text-muted-foreground mt-1">
          총 {rows.length}건 · 미답변 <span className="text-primary font-semibold">{pendingCount}건</span>
        </p>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="이름, 이메일, 내용 검색..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1 p-1 bg-muted/50 rounded-lg">
          {([["all", "전체"], ["pending", "미답변"], ["answered", "답변완료"]] as const).map(([k, label]) => (
            <Button key={k} size="sm" variant={filter === k ? "default" : "ghost"} className="h-8 px-3 text-xs"
              onClick={() => setFilter(k as any)}>{label}</Button>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">접수일</TableHead>
                <TableHead>고객</TableHead>
                <TableHead>이메일</TableHead>
                <TableHead>문의 내용</TableHead>
                <TableHead>언어</TableHead>
                <TableHead>상태</TableHead>
                <TableHead className="text-right">답변</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(r => (
                <TableRow key={r.id}>
                  <TableCell className="text-sm whitespace-nowrap">{new Date(r.created_at).toLocaleDateString("ko-KR")}</TableCell>
                  <TableCell className="font-medium text-sm">{r.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{r.email}</TableCell>
                  <TableCell className="text-sm max-w-[320px] truncate" title={r.message}>{r.message}</TableCell>
                  <TableCell><Badge variant="outline" className="text-[10px] uppercase">{r.language || "en"}</Badge></TableCell>
                  <TableCell>
                    {(r.status || "pending") === "answered"
                      ? <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px]">답변완료</Badge>
                      : <Badge className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px]">미답변</Badge>}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => openReply(r)}>
                      <MessageSquare className="h-3.5 w-3.5 mr-1" />
                      {(r.status || "pending") === "answered" ? "답변 보기" : "답변하기"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">문의가 없습니다.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!active} onOpenChange={o => !o && setActive(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>문의 답변</DialogTitle></DialogHeader>
          {active && (
            <div className="space-y-4">
              <div className="text-sm space-y-1">
                <p><span className="text-muted-foreground">고객:</span> <strong>{active.name}</strong></p>
                <p className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{active.email}</span>
                </p>
                <p className="text-xs text-muted-foreground">{new Date(active.created_at).toLocaleString("ko-KR")}</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg text-sm whitespace-pre-line">{active.message}</div>
              <div>
                <p className="text-sm font-medium mb-2">답변 내용 (고객 이메일로 발송됩니다)</p>
                <Textarea rows={7} value={reply} onChange={e => setReply(e.target.value)} placeholder="Write your reply to the customer..." />
                <p className="text-xs text-muted-foreground mt-1">고객 응대 언어에 맞춰 작성해주세요. (문의 언어: {active.language || "en"})</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setActive(null)}>닫기</Button>
            <Button onClick={sendReply} disabled={sending}>
              <Send className="h-4 w-4 mr-1" />{sending ? "전송 중..." : "답변 전송"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminInquiries;
