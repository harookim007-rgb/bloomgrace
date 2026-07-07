import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

type Row = { id: string; email: string; note: string | null; created_at: string };

const AdminWhitelist = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("admin_whitelist").select("*").order("created_at", { ascending: false });
    setRows((data as Row[]) || []);
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    const clean = email.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(clean)) { toast.error("유효한 이메일을 입력하세요."); return; }
    setBusy(true);
    const { error } = await supabase.from("admin_whitelist").insert({ email: clean, note: note.trim() || null });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    setEmail(""); setNote("");
    toast.success("화이트리스트에 추가되었습니다.");
    load();
  };

  const remove = async (id: string, e: string) => {
    if (!window.confirm(`${e} 를(을) 화이트리스트에서 제거하시겠습니까?`)) return;
    const { error } = await supabase.from("admin_whitelist").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("제거되었습니다.");
    load();
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-serif flex items-center gap-2"><ShieldCheck className="h-6 w-6" />관리자 화이트리스트</h1>
        <p className="text-sm text-muted-foreground mt-1">여기에 등록된 이메일로 Google 로그인한 사용자만 관리자 인증(이메일 OTP)을 진행할 수 있습니다.</p>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6 space-y-3">
          <p className="text-sm font-medium">새 관리자 이메일 추가</p>
          <div className="flex gap-2 flex-wrap">
            <Input placeholder="admin@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="max-w-xs" />
            <Input placeholder="메모 (선택)" value={note} onChange={(e) => setNote(e.target.value)} className="max-w-xs" />
            <Button onClick={add} disabled={busy} className="gap-2"><Plus className="h-4 w-4" />추가</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이메일</TableHead>
                <TableHead>메모</TableHead>
                <TableHead>등록일</TableHead>
                <TableHead className="text-right">관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-sm">{r.email}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{r.note || "-"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button size="icon" variant="ghost" className="text-destructive" onClick={() => remove(r.id, r.email)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">화이트리스트가 비어있습니다.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminWhitelist;
