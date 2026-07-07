import { useCallback, useEffect, useRef, useState } from "react";
import { X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";

interface Props {
  images: string[];
  index: number;
  onClose: () => void;
  onIndexChange?: (i: number) => void;
  alt?: string;
}

const MIN = 1;
const MAX = 6;
const STEP = 0.5;

/**
 * Full-screen image viewer with:
 *  - Wheel zoom (cursor-anchored)
 *  - Drag to pan when zoomed
 *  - Pinch to zoom (touch)
 *  - Double-click / double-tap to toggle 1x <-> 2.5x
 *  - Prev/Next navigation, keyboard arrows, ESC to close
 */
const ImageLightbox = ({ images, index, onClose, onIndexChange, alt = "image" }: Props) => {
  const [i, setI] = useState(index);
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);
  const pinch = useRef<{ dist: number; scale: number } | null>(null);

  useEffect(() => setI(index), [index]);
  useEffect(() => { onIndexChange?.(i); }, [i]);

  const reset = useCallback(() => { setScale(1); setTx(0); setTy(0); }, []);

  useEffect(() => { reset(); }, [i, reset]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") setI((v) => (v + 1) % images.length);
      else if (e.key === "ArrowLeft") setI((v) => (v - 1 + images.length) % images.length);
      else if (e.key === "+" || e.key === "=") setScale((s) => Math.min(MAX, s + STEP));
      else if (e.key === "-") setScale((s) => Math.max(MIN, s - STEP));
      else if (e.key === "0") reset();
    };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [images.length, onClose, reset]);

  const zoomAt = (clientX: number, clientY: number, next: number) => {
    const el = containerRef.current;
    if (!el) { setScale(next); return; }
    const rect = el.getBoundingClientRect();
    const cx = clientX - rect.left - rect.width / 2;
    const cy = clientY - rect.top - rect.height / 2;
    // Keep the point under cursor stable
    const ratio = next / scale;
    setTx((v) => cx - (cx - v) * ratio);
    setTy((v) => cy - (cy - v) * ratio);
    setScale(next);
  };

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = -e.deltaY * 0.0025;
    const next = Math.min(MAX, Math.max(MIN, scale + delta * scale));
    zoomAt(e.clientX, e.clientY, next);
  };

  const onMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    dragging.current = { x: e.clientX, y: e.clientY, tx, ty };
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging.current) return;
    setTx(dragging.current.tx + (e.clientX - dragging.current.x));
    setTy(dragging.current.ty + (e.clientY - dragging.current.y));
  };
  const endDrag = () => { dragging.current = null; };

  const onDoubleClick = (e: React.MouseEvent) => {
    if (scale > 1) reset();
    else zoomAt(e.clientX, e.clientY, 2.5);
  };

  // Touch
  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const [a, b] = [e.touches[0], e.touches[1]];
      const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      pinch.current = { dist, scale };
    } else if (e.touches.length === 1 && scale > 1) {
      const t = e.touches[0];
      dragging.current = { x: t.clientX, y: t.clientY, tx, ty };
    }
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinch.current) {
      const [a, b] = [e.touches[0], e.touches[1]];
      const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      const next = Math.min(MAX, Math.max(MIN, pinch.current.scale * (dist / pinch.current.dist)));
      const cx = (a.clientX + b.clientX) / 2;
      const cy = (a.clientY + b.clientY) / 2;
      zoomAt(cx, cy, next);
    } else if (e.touches.length === 1 && dragging.current) {
      const t = e.touches[0];
      setTx(dragging.current.tx + (t.clientX - dragging.current.x));
      setTy(dragging.current.ty + (t.clientY - dragging.current.y));
    }
  };
  const onTouchEnd = () => { dragging.current = null; pinch.current = null; };

  const src = images[i];

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center select-none animate-in fade-in duration-150">
      {/* Top bar */}
      <div className="absolute top-0 inset-x-0 z-10 flex items-center justify-between px-4 py-3 text-white/90">
        <div className="text-xs tracking-widest font-sans">{i + 1} / {images.length}</div>
        <div className="flex items-center gap-1">
          <button aria-label="Zoom out" onClick={() => setScale((s) => Math.max(MIN, s - STEP))}
            className="p-2 rounded hover:bg-white/10"><ZoomOut className="h-5 w-5" /></button>
          <div className="text-xs font-sans tabular-nums w-12 text-center">{Math.round(scale * 100)}%</div>
          <button aria-label="Zoom in" onClick={() => setScale((s) => Math.min(MAX, s + STEP))}
            className="p-2 rounded hover:bg-white/10"><ZoomIn className="h-5 w-5" /></button>
          <button aria-label="Reset" onClick={reset} className="p-2 rounded hover:bg-white/10">
            <RotateCcw className="h-4 w-4" />
          </button>
          <button aria-label="Close" onClick={onClose} className="p-2 rounded hover:bg-white/10 ml-2">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Image */}
      <div
        ref={containerRef}
        className="w-full h-full flex items-center justify-center overflow-hidden touch-none"
        onWheel={onWheel}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={endDrag}
        onMouseLeave={endDrag}
        onDoubleClick={onDoubleClick}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{ cursor: scale > 1 ? (dragging.current ? "grabbing" : "grab") : "zoom-in" }}
      >
        <img
          src={src}
          alt={alt}
          draggable={false}
          className="max-w-[95vw] max-h-[90vh] object-contain will-change-transform transition-transform duration-75"
          style={{ transform: `translate3d(${tx}px, ${ty}px, 0) scale(${scale})` }}
        />
      </div>

      {/* Nav */}
      {images.length > 1 && (
        <>
          <button aria-label="Previous" onClick={() => setI((v) => (v - 1 + images.length) % images.length)}
            className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur flex items-center justify-center text-white">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button aria-label="Next" onClick={() => setI((v) => (v + 1) % images.length)}
            className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur flex items-center justify-center text-white">
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}
    </div>
  );
};

export default ImageLightbox;
