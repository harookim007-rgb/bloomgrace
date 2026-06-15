import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X, Loader2, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string; // e.g. "products", "banners", "thumbnails"
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  aspect?: "square" | "wide" | "free";
  label?: string;
}

// Resize image client-side using canvas. Preserves aspect by default.
async function resizeImage(
  file: File,
  maxW: number,
  maxH: number,
  quality: number,
  forceAspect?: "square" | "wide"
): Promise<Blob> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = dataUrl;
  });

  let targetW = img.width;
  let targetH = img.height;

  if (forceAspect === "square") {
    const size = Math.min(img.width, img.height);
    const canvas = document.createElement("canvas");
    const out = Math.min(size, maxW);
    canvas.width = out;
    canvas.height = out;
    const ctx = canvas.getContext("2d")!;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, (img.width - size) / 2, (img.height - size) / 2, size, size, 0, 0, out, out);
    return await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), "image/jpeg", quality));
  }

  if (forceAspect === "wide") {
    // 16:9 crop
    const targetRatio = 16 / 9;
    const srcRatio = img.width / img.height;
    let sw = img.width, sh = img.height, sx = 0, sy = 0;
    if (srcRatio > targetRatio) {
      sw = img.height * targetRatio;
      sx = (img.width - sw) / 2;
    } else {
      sh = img.width / targetRatio;
      sy = (img.height - sh) / 2;
    }
    const outW = Math.min(maxW, sw);
    const outH = outW / targetRatio;
    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d")!;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, outW, outH);
    return await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), "image/jpeg", quality));
  }

  // free aspect — fit within max
  if (targetW > maxW || targetH > maxH) {
    const ratio = Math.min(maxW / targetW, maxH / targetH);
    targetW = Math.round(targetW * ratio);
    targetH = Math.round(targetH * ratio);
  }
  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, targetW, targetH);
  return await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), "image/jpeg", quality));
}

const ImageUploader = ({
  value,
  onChange,
  folder = "uploads",
  maxWidth = 1600,
  maxHeight = 1600,
  quality = 0.88,
  aspect = "free",
  label = "이미지",
}: ImageUploaderProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [showUrl, setShowUrl] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("이미지 파일만 업로드 가능합니다.");
      return;
    }
    setUploading(true);
    try {
      const force = aspect === "free" ? undefined : aspect;
      const blob = await resizeImage(file, maxWidth, maxHeight, quality, force);
      const ext = "jpg";
      const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: upErr } = await supabase.storage.from("media").upload(path, blob, {
        contentType: "image/jpeg",
        upsert: false,
      });
      if (upErr) throw upErr;
      // long-expiry signed URL (10 years)
      const { data: signed, error: sErr } = await supabase.storage
        .from("media")
        .createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
      if (sErr || !signed) throw sErr || new Error("signed url failed");
      onChange(signed.signedUrl);
      toast.success("이미지 업로드 완료");
    } catch (e: any) {
      toast.error("업로드 실패: " + (e?.message || ""));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
        <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={uploading} className="gap-2">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {uploading ? "업로드 중..." : `${label} 업로드`}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setShowUrl((v) => !v)} className="gap-1 text-xs">
          <LinkIcon className="h-3 w-3" /> URL
        </Button>
        {value && (
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange("")} className="text-destructive">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      {showUrl && (
        <Input
          placeholder="또는 이미지 URL 직접 입력"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ fontSize: "16px" }}
        />
      )}
      {value && (
        <div className="relative inline-block">
          <img
            src={value}
            alt="preview"
            className="w-32 h-32 object-cover rounded-lg border block"
            style={{ maxWidth: "128px", maxHeight: "128px" }}
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
