import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ShieldCheck, Loader2, Mail, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  onVerified: () => void;
}

const AdminOtpGate = ({ onVerified }: Props) => {
  const { signOut } = useAuth();
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [code, setCode] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [devCode, setDevCode] = useState<string | null>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const handleSend = async () => {
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-admin-otp", { body: {} });
      if (error) {
        const details = (error as any).context ? await (error as any).context.text().catch(() => "") : "";
        try {
          const parsed = details ? JSON.parse(details) : null;
          throw new Error(parsed?.error || (error as any).message || "발송 실패");
        } catch (e: any) {
          throw new Error(e?.message || (error as any).message || "발송 실패");
        }
      }
      setSent(true);
      setMaskedEmail(data?.masked_email || "");
      setCooldown(45);
      if (data?.dev_mode && data?.dev_code) {
        setDevCode(data.dev_code);
        toast.success(`[개발모드] OTP: ${data.dev_code}`, { duration: 20000 });
      } else {
        toast.success("이메일로 6자리 인증번호를 발송했습니다.");
      }
    } catch (err: any) {
      toast.error(err.message || "OTP 발송 실패");
    } finally {
      setBusy(false);
    }
  };

  const handleVerify = async () => {
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("verify-admin-otp", { body: { code } });
      if (error) {
        const details = (error as any).context ? await (error as any).context.text().catch(() => "") : "";
        try {
          const parsed = details ? JSON.parse(details) : null;
          throw new Error(parsed?.error || (error as any).message || "인증 실패");
        } catch (e: any) {
          throw new Error(e?.message || (error as any).message || "인증 실패");
        }
      }
      if (data?.success) {
        sessionStorage.setItem("admin_otp_verified", "1");
        toast.success("관리자 인증 완료");
        onVerified();
      }
    } catch (err: any) {
      toast.error(err.message || "인증 실패");
      setCode("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center p-6 bg-muted/30">
      <div className="w-full max-w-sm bg-card p-8 border border-border rounded-lg shadow-elegant space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <h2 className="font-serif text-xl">관리자 2단계 인증</h2>
          <p className="text-xs text-muted-foreground">
            Google 계정 로그인 후, 화이트리스트에 등록된 이메일로 발송되는 6자리 코드를 입력합니다.
          </p>
        </div>

        {!sent ? (
          <Button className="w-full" onClick={handleSend} disabled={busy}>
            {busy && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            <Mail className="h-4 w-4 mr-2" /> 인증코드 이메일로 받기
          </Button>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground text-center">{maskedEmail} 로 발송됨</p>
            {devCode && (
              <p className="text-[11px] text-center p-2 bg-amber-50 border border-amber-200 rounded font-mono">
                [DEV] {devCode}
              </p>
            )}
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider">인증번호 (6자리)</Label>
              <Input maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                autoFocus inputMode="numeric"
                className="text-center text-lg tracking-[0.5em] font-mono" />
            </div>
            <Button className="w-full" onClick={handleVerify} disabled={busy || code.length !== 6}>
              {busy && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              인증
            </Button>
            <Button variant="ghost" size="sm" className="w-full text-xs"
              onClick={handleSend} disabled={busy || cooldown > 0}>
              {cooldown > 0 ? `${cooldown}초 후 재전송 가능` : "재전송"}
            </Button>
          </div>
        )}

        <button
          onClick={signOut}
          className="w-full text-[11px] text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1"
        >
          <LogOut className="h-3 w-3" /> 다른 계정으로 로그인
        </button>
      </div>
    </div>
  );
};

export default AdminOtpGate;
