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

const safeExt = (file: File) => {
  const byType: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/avif": "avif",
  };
  const typed = byType[file.type];
  if (typed) return typed;
  const named = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "");
  return named || "jpg";
};

const getUploadErrorMessage = (error: unknown) => {
  if (!error) return "알 수 없는 오류";
  if (typeof error === "string") return error;
  if (error instanceof Error && error.message) return error.message;

  if (typeof error === "object") {
    const record = error as Record<string, unknown>;
    for (const key of ["message", "error", "msg", "details", "hint"]) {
      const value = record[key];
      if (typeof value === "string" && value.trim()) return value;
    }

    const status = record.statusCode || record.status;
    if (status) return `이미지 저장소 오류 (${status})`;
  }

  return "이미지 처리 중 오류가 발생했습니다.";
};

// Resizes uploads in the browser so every image the store serves is consistent:
// - "square" (product main / gallery images): the whole image is placed, uncropped, on a white
//   maxWidth x maxWidth canvas so all product photos share one size and shape and no edge is cut off.
// - otherwise: images larger than the limit are scaled down, keeping their shape.
// Animated GIFs and SVGs are uploaded untouched.
export async function fitImageWithinLimit(
  file: File,
  maxW: number,
  maxH: number,
  quality: number,
  aspect: ImageUploaderProps["aspect"] = "free",
): Promise<{ blob: Blob; contentType: string; ext: string }> {
  const original = { blob: file as Blob, contentType: file.type || "application/octet-stream", ext: safeExt(file) };
  if (/gif|svg/.test(file.type) || typeof createImageBitmap === "undefined") return original;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" } as ImageBitmapOptions);
  } catch {
    return original;
  }
  const { width: w, height: h } = bitmap;
  const square = aspect === "square";
  const scale = square ? 1 : Math.min(1, maxW / w, maxH / h);
  if (!square && scale === 1 && file.size <= 1.5 * 1024 * 1024) { bitmap.close(); return original; }

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) { bitmap.close(); return original; }
  if (square) {
    // Every product image comes out at exactly maxW x maxW, small originals included.
    const side = maxW;
    const fit = side / Math.max(w, h);
    canvas.width = canvas.height = side;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, side, side);
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, Math.round((side - w * fit) / 2), Math.round((side - h * fit) / 2), Math.round(w * fit), Math.round(h * fit));
  } else {
    canvas.width = Math.round(w * scale);
    canvas.height = Math.round(h * scale);
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  }
  bitmap.close();

  // Keep PNG for transparent artwork outside the square product frame; everything else is JPEG.
  const png = !square && file.type === "image/png";
  const contentType = png ? "image/png" : "image/jpeg";
  const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, contentType, png ? undefined : quality));
  if (!blob) return original;
  return { blob, contentType, ext: png ? "png" : "jpg" };
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
  const [progress, setProgress] = useState<string>("");
  const [showUrl, setShowUrl] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("이미지 파일만 업로드 가능합니다.");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error("파일이 너무 큽니다 (최대 20MB).");
      return;
    }
    // Pre-check auth session — private bucket requires admin role
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      toast.error("세션이 만료되었습니다. 다시 로그인해 주세요.");
      return;
    }
    setUploading(true);
    setProgress("이미지 처리 중...");
    try {
      const { blob, contentType, ext } = await fitImageWithinLimit(file, maxWidth, maxHeight, quality, aspect);
      setProgress("업로드 중...");
      const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: upErr } = await supabase.storage.from("media").upload(path, blob, {
        contentType,
        upsert: false,
        cacheControl: "31536000",
      });
      if (upErr) {
        const msg = getUploadErrorMessage(upErr);
        if (/row-level security|not authorized|permission/i.test(msg)) {
          throw new Error("업로드 권한이 없습니다 (관리자 전용).");
        }
        throw new Error(msg);
      }
      setProgress("링크 생성 중...");
      // 1 year signed URL — well within Supabase limits, refreshable on read
      const { data: signed, error: sErr } = await supabase.storage
        .from("media")
        .createSignedUrl(path, 60 * 60 * 24 * 365);
      if (sErr || !signed?.signedUrl) {
        throw new Error(sErr ? getUploadErrorMessage(sErr) : "서명 URL 생성 실패");
      }
      onChange(signed.signedUrl);
      toast.success("이미지 업로드 완료");
    } catch (e: any) {
      console.error("[ImageUploader] upload failed", e);
      toast.error("업로드 실패: " + getUploadErrorMessage(e));
    } finally {
      setUploading(false);
      setProgress("");
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        className="flex flex-wrap items-center gap-2"
      >
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
          {uploading ? (progress || "업로드 중...") : `${label} 업로드`}
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
            className="w-32 h-32 object-contain rounded-lg border block bg-muted/30"
            style={{ maxWidth: "128px", maxHeight: "128px" }}
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
