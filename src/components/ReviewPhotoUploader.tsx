import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, X } from "lucide-react";
import { toast } from "sonner";

interface Props {
  value: string[];
  onChange: (urls: string[]) => void;
  max?: number;
}

async function shrink(file: File, max = 1280, quality = 0.85): Promise<Blob> {
  const dataUrl = await new Promise<string>((r, j) => {
    const fr = new FileReader();
    fr.onload = () => r(fr.result as string);
    fr.onerror = j;
    fr.readAsDataURL(file);
  });
  const img = await new Promise<HTMLImageElement>((r, j) => {
    const i = new Image();
    i.onload = () => r(i);
    i.onerror = j;
    i.src = dataUrl;
  });
  let w = img.width, h = img.height;
  if (w > max || h > max) {
    const k = Math.min(max / w, max / h);
    w = Math.round(w * k); h = Math.round(h * k);
  }
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  c.getContext("2d")!.drawImage(img, 0, 0, w, h);
  return await new Promise<Blob>(res => c.toBlob(b => res(b!), "image/jpeg", quality));
}

const ReviewPhotoUploader = ({ value, onChange, max = 5 }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const handleFiles = async (files: FileList) => {
    if (value.length + files.length > max) {
      toast.error(`최대 ${max}장까지 업로드 가능합니다.`);
      return;
    }
    setBusy(true);
    try {
      const uploaded: string[] = [];
      for (const f of Array.from(files)) {
        if (!f.type.startsWith("image/")) continue;
        const blob = await shrink(f);
        const path = `reviews/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
        const { error } = await supabase.storage.from("media").upload(path, blob, {
          contentType: "image/jpeg", upsert: false,
        });
        if (error) throw error;
        const { data: signed } = await supabase.storage.from("media")
          .createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
        if (signed?.signedUrl) uploaded.push(signed.signedUrl);
      }
      onChange([...value, ...uploaded]);
    } catch (e: any) {
      toast.error("사진 업로드 실패: " + (e?.message || ""));
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        <input ref={inputRef} type="file" accept="image/*" multiple className="hidden"
          onChange={e => e.target.files && handleFiles(e.target.files)} />
        <Button type="button" size="sm" variant="outline" className="rounded-none gap-2"
          disabled={busy || value.length >= max} onClick={() => inputRef.current?.click()}>
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
          사진 첨부 ({value.length}/{max})
        </Button>
      </div>
      {value.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {value.map((u, i) => (
            <div key={i} className="relative w-20 h-20 border border-border">
              <img src={u} alt="" className="w-full h-full object-cover" />
              <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))}
                className="absolute -top-2 -right-2 w-5 h-5 bg-background border border-border rounded-full flex items-center justify-center">
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewPhotoUploader;
