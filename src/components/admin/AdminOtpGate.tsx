import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ShieldCheck, Loader2, KeyRound } from "lucide-react";

interface Props {
  onVerified: () => void;
}

const AdminOtpGate = ({ onVerified }: Props) => {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [code, setCode] = useState("");
  const [maskedPhone, setMaskedPhone] = useState("");

  const handleSend = async () => {
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-otp", {
        body: { purpose: "admin_login" },
      });
      if (error) throw error;
      setSent(true);
      setMaskedPhone(data?.masked_phone || "");
      if (data?.dev_mode) {
        toast.success(`[개발모드] OTP: ${data.dev_code}`, { duration: 20000 });
      } else {
        toast.success("등록된 마스터 휴대폰으로 인증코드를 발송했습니다.");
      }
    } catch (err: any) {
      toast.error(err.message || "OTP 전송 실패");
    } finally {
      setSending(false);
    }
  };

  const handleVerify = async () => {
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("verify-otp", {
        body: { code, purpose: "admin_login" },
      });
      if (error) throw error;
      if (data?.success) {
        sessionStorage.setItem("admin_otp_verified", "1");
        toast.success("마스터 인증 완료");
        onVerified();
      }
    } catch (err: any) {
      toast.error(err.message || "인증 실패");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-muted/30">
      <div className="w-full max-w-sm bg-card p-8 border border-border rounded-lg shadow-elegant space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <h2 className="font-serif text-xl">마스터 관리자 인증</h2>
          <p className="text-xs text-muted-foreground">등록된 휴대폰으로 인증코드를 발송합니다.</p>
        </div>

        {!sent ? (
          <Button className="w-full" onClick={handleSend} disabled={sending}>
            {sending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            <KeyRound className="h-4 w-4 mr-2" /> 인증코드 받기
          </Button>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground text-center">{maskedPhone}로 발송됨</p>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider">인증번호 (6자리)</Label>
              <Input maxLength={6} value={code} onChange={(e) => setCode(e.target.value)} autoFocus
                className="text-center text-lg tracking-[0.5em] font-mono" />
            </div>
            <Button className="w-full" onClick={handleVerify} disabled={sending || code.length !== 6}>
              {sending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              인증
            </Button>
            <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => { setSent(false); setCode(""); }}>
              재전송
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOtpGate;
