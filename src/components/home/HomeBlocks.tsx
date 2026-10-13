import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { GripVertical, Pencil } from "lucide-react";
import Hero from "@/components/Hero";
import FeaturedProducts from "@/components/FeaturedProducts";
import BeautyConsultation from "@/components/BeautyConsultation";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useDesign } from "@/hooks/useDesign";
import { localizeCategory } from "@/lib/categoryI18n";
import { designDraft } from "@/lib/design";
import {
  BLOCK_TYPES, BLOCK_WIDTHS, DESIGN_MOVE_MESSAGE, DESIGN_RESIZE_MESSAGE, DESIGN_SELECT_MESSAGE, SANDBOX,
  isEmptyBlock, sandboxDoc, type BlockItem, type BlockPageKey, type BlockWidth, type HomeBlock,
} from "@/lib/homeBlocks";

const BG: Record<HomeBlock["bg"], string> = {
  none: "",
  soft: "bg-[hsl(var(--primary-soft))]",
  tint: "bg-muted/70",
  dark: "bg-foreground text-background",
  custom: "",
};
const PAD: Record<HomeBlock["pad"], string> = {
  small: "py-6 md:py-10",
  normal: "py-10 md:py-20",
  large: "py-16 md:py-32",
};
const DEVICE: Record<HomeBlock["device"], string> = { all: "", desktop: "hidden md:block", mobile: "md:hidden" };
// Written out in full so Tailwind generates each class.
const SPAN: Record<BlockWidth, string> = {
  3: "md:col-span-3", 4: "md:col-span-4", 6: "md:col-span-6", 8: "md:col-span-8", 9: "md:col-span-9", 12: "md:col-span-12",
};
const GALLERY_COLS: Record<number, string> = { 2: "md:grid-cols-2", 3: "md:grid-cols-3", 4: "md:grid-cols-4" };

const isExternal = (link: string) => /^https?:\/\//.test(link);

// True when a "#rrggbb" color is dark enough to need light text on top of it.
const isDarkColor = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) < 140;
};
const onDark = (b: HomeBlock) => b.bg === "dark" || (b.bg === "custom" && !!b.bgColor && isDarkColor(b.bgColor));

// Renders admin-entered links: store paths stay in the app, full addresses open in a new tab.
const SmartLink = ({ to, className, children }: { to: string; className?: string; children: React.ReactNode }) => {
  const link = to.trim();
  if (isExternal(link)) return <a href={link} target="_blank" rel="noopener noreferrer" className={className}>{children}</a>;
  if (link.startsWith("/")) return <Link to={link} className={className}>{children}</Link>;
  return <span className={className}>{children}</span>;
};

const ButtonLink = ({ label, link, dark, outline = false }: { label: string; link: string; dark: boolean; outline?: boolean }) => {
  if (!label.trim()) return null;
  const tone = outline
    ? (dark ? "border-2 border-white text-white hover:bg-white/10" : "border-2 border-primary text-primary hover:bg-primary/10")
    : (dark ? "bg-white text-black hover:bg-white/90" : "bg-primary text-primary-foreground hover:bg-primary/90");
  return (
    <SmartLink
      to={link}
      className={`inline-flex items-center justify-center min-h-[44px] max-w-full px-8 py-3 rounded-none text-xs md:text-sm font-sans font-bold tracking-[0.15em] uppercase text-center break-words transition-colors ${tone}`}
    >
      {label}
    </SmartLink>
  );
};

const Heading = ({ text, className = "" }: { text: string; className?: string }) =>
  text.trim() ? <h2 className={`font-serif break-words ${className || "text-2xl md:text-4xl text-center mb-6 md:mb-10"}`}>{text}</h2> : null;

const Body = ({ text, className = "" }: { text: string; className?: string }) =>
  text.trim() ? <p className={`text-sm md:text-lg leading-relaxed whitespace-pre-line break-words opacity-80 ${className}`}>{text}</p> : null;

const youtubeId = (url: string) => url.match(/(?:youtu\.be\/|[?&]v=|\/shorts\/|\/embed\/)([A-Za-z0-9_-]{6,})/)?.[1] || null;

const CategoryLinks = ({ title }: { title: string }) => {
  const { t, language } = useLanguage();
  const [categories, setCategories] = useState<any[]>([]);
  useEffect(() => {
    supabase.from("categories").select("*").order("sort_order").then(({ data }) => setCategories(data || []));
  }, []);
  if (categories.length === 0) return null;
  return (
    <div className="container px-4 md:px-8">
      <Heading text={title} />
      <div className="flex flex-wrap justify-center gap-2 md:gap-3">
        {categories.map(c => (
          <Link
            key={c.id}
            to={`/products?category=${c.slug}`}
            className="min-h-[44px] inline-flex items-center px-5 md:px-7 rounded-none border border-foreground/20 text-sm font-sans font-semibold tracking-wide hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
          >
            {localizeCategory(c, t, language)}
          </Link>
        ))}
      </div>
    </div>
  );
};

const Countdown = ({ block, dark }: { block: HomeBlock; dark: boolean }) => {
  const s = block.s;
  const end = new Date(s.endsAt).getTime();
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const left = Math.max(0, end - now);
  if (left === 0) return s.doneText.trim() ? <div className="container px-4 md:px-8 text-center"><Heading text={s.doneText} className="text-2xl md:text-4xl" /></div> : null;
  const parts = [
    [Math.floor(left / 86_400_000), "D"],
    [Math.floor(left / 3_600_000) % 24, "H"],
    [Math.floor(left / 60_000) % 60, "M"],
    [Math.floor(left / 1000) % 60, "S"],
  ] as const;
  return (
    <div className="container px-4 md:px-8 text-center space-y-4 md:space-y-6">
      <Heading text={s.heading} className="text-2xl md:text-4xl" />
      <div className="flex justify-center gap-2 md:gap-4" role="timer">
        {parts.map(([value, unit]) => (
          <div key={unit} className={`min-w-[60px] md:min-w-[88px] border px-2 py-3 md:py-4 ${dark ? "border-white/30" : "border-foreground/15 bg-card text-card-foreground"}`}>
            <div className="text-2xl md:text-4xl font-serif font-semibold tabular-nums leading-none">{String(value).padStart(2, "0")}</div>
            <div className="mt-1.5 text-[11px] font-sans font-semibold tracking-[0.2em] opacity-70">{unit}</div>
          </div>
        ))}
      </div>
      <ButtonLink label={s.buttonLabel} link={s.buttonLink} dark={dark} />
    </div>
  );
};

const BlockContent = ({ block }: { block: HomeBlock }) => {
  const s = block.s;
  const dark = onDark(block);
  switch (block.type) {
    case "hero":
      return <Hero height={s.height} interval={s.interval} />;
    case "products":
      return <FeaturedProducts source={s.source} categoryId={s.category} limit={s.count} columns={s.columns} title={s.title} subtitle={s.subtitle} />;
    case "consultation":
      return <BeautyConsultation mode="section" />;
    case "categories":
      return <CategoryLinks title={s.title} />;
    case "text":
      return (
        <div className={`container px-4 md:px-8 max-w-3xl space-y-4 ${s.align === "center" ? "text-center" : "text-left"}`}>
          <Heading text={s.heading} className={s.size === "large" ? "text-3xl md:text-5xl lg:text-6xl" : "text-2xl md:text-4xl"} />
          <Body text={s.body} />
        </div>
      );
    case "image": {
      const img = <img src={s.image} alt={s.alt} loading="lazy" className="block w-full h-auto" />;
      return (
        <div className={s.width === "full" ? "" : "container px-4 md:px-8"}>
          {s.link.trim() ? <SmartLink to={s.link} className="block">{img}</SmartLink> : img}
        </div>
      );
    }
    case "imageText":
      return (
        <div className="container px-4 md:px-8">
          <div className={`flex flex-col gap-6 md:gap-12 md:items-center ${s.side === "right" ? "md:flex-row-reverse" : "md:flex-row"}`}>
            {s.image.trim() && <div className="md:w-1/2"><img src={s.image} alt={s.heading} loading="lazy" className="block w-full h-auto" /></div>}
            <div className={`space-y-4 min-w-0 ${s.image.trim() ? "md:w-1/2" : "max-w-3xl mx-auto text-center"}`}>
              <Heading text={s.heading} className="text-2xl md:text-4xl" />
              <Body text={s.body} />
              <ButtonLink label={s.buttonLabel} link={s.buttonLink} dark={dark} />
            </div>
          </div>
        </div>
      );
    case "promo":
      return (
        <div className="container px-4 md:px-8 max-w-4xl text-center space-y-4 md:space-y-6">
          <Heading text={s.heading} className="text-2xl md:text-4xl lg:text-5xl" />
          <Body text={s.body} />
          <ButtonLink label={s.buttonLabel} link={s.buttonLink} dark={dark} />
        </div>
      );
    case "button":
      return (
        <div className={`container px-4 md:px-8 flex ${s.align === "left" ? "justify-start" : s.align === "right" ? "justify-end" : "justify-center"}`}>
          <ButtonLink label={s.label} link={s.link} dark={dark} outline={s.style === "outline"} />
        </div>
      );
    case "gallery":
      return (
        <div className="container px-4 md:px-8">
          <Heading text={s.title} />
          <div className={`grid grid-cols-2 gap-2 md:gap-4 ${GALLERY_COLS[s.columns] || GALLERY_COLS[3]}`}>
            {(s.images as string[]).map((src, i) => (
              <div key={i} className="aspect-square overflow-hidden bg-muted">
                <img src={src} alt="" loading="lazy" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      );
    case "countdown":
      return <Countdown block={block} dark={dark} />;
    case "cards": {
      const items = (s.items as BlockItem[]).filter(it => it.title.trim() || it.body.trim());
      return (
        <div className="container px-4 md:px-8">
          <Heading text={s.title} />
          <div className={`grid gap-4 md:gap-6 ${block.width >= 8 ? "sm:grid-cols-2" : ""} ${block.width === 12 && items.length >= 3 ? "lg:grid-cols-3" : ""}`}>
            {items.map((it, i) => (
              <div key={i} className={`rounded-none border p-6 md:p-8 space-y-2 min-w-0 ${dark ? "border-white/20" : "border-border bg-card text-card-foreground"}`}>
                {it.title.trim() && <h3 className="text-lg md:text-xl font-serif break-words">{it.title}</h3>}
                <Body text={it.body} className="!text-sm md:!text-base" />
              </div>
            ))}
          </div>
        </div>
      );
    }
    case "accordion": {
      const items = (s.items as BlockItem[]).filter(it => it.title.trim());
      return (
        <div className="container px-4 md:px-8 max-w-3xl">
          <Heading text={s.title} />
          <Accordion type="single" collapsible>
            {items.map((it, i) => (
              <AccordionItem key={i} value={`item-${i}`} className={dark ? "border-white/20" : ""}>
                <AccordionTrigger className="text-left text-base md:text-lg font-sans font-semibold min-h-[44px] break-words">{it.title}</AccordionTrigger>
                <AccordionContent><Body text={it.body} className="!text-sm md:!text-base" /></AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      );
    }
    case "video": {
      const url = s.url.trim();
      const id = youtubeId(url);
      return (
        <div className="container px-4 md:px-8 max-w-4xl">
          <Heading text={s.title} />
          <div className="aspect-video w-full overflow-hidden bg-black">
            {id
              ? <iframe title={s.title || "Video"} src={`https://www.youtube-nocookie.com/embed/${id}`} loading="lazy" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" className="w-full h-full border-0" />
              : <video src={url} controls playsInline preload="metadata" className="w-full h-full" />}
          </div>
        </div>
      );
    }
    case "spacer":
      return <div aria-hidden="true" style={{ height: s.height }} />;
    case "divider":
      return <div className="container px-4 md:px-8"><hr className="border-border" /></div>;
    case "html":
      return (
        <div className="container px-4 md:px-8">
          <iframe title="Custom content" srcDoc={sandboxDoc(s.code)} sandbox={SANDBOX} className="block w-full border-0" style={{ height: s.height }} />
        </div>
      );
    default:
      return null;
  }
};

const post = (message: Record<string, unknown>) => window.parent.postMessage(message, window.location.origin);
const nearestWidth = (cols: number): BlockWidth =>
  BLOCK_WIDTHS.reduce((best, w) => (Math.abs(w - cols) < Math.abs(best - cols) ? w : best), 12 as BlockWidth);

// The block being dragged in the editor preview (drag events cannot read their data until drop).
let draggingId: string | null = null;

const BlockShell = ({ block, preview, inRow }: { block: HomeBlock; preview: boolean; inRow: boolean }) => {
  const def = BLOCK_TYPES[block.type];
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(block.anim === "none");
  const [dropSide, setDropSide] = useState<"before" | "after" | null>(null);
  const [live, setLive] = useState<{ width?: BlockWidth; height?: number } | null>(null);
  const empty = isEmptyBlock(block);

  // Reveal-on-scroll effect; blocks without one are simply visible.
  useEffect(() => {
    if (block.anim === "none") { setShown(true); return; }
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") { setShown(true); return; }
    setShown(false);
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setShown(true); observer.disconnect(); }
    }, { threshold: 0.12 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [block.anim]);

  // Dragging a handle in the preview resizes the block; the editor saves the final size.
  const startResize = (axis: "width" | "height") => (e: React.PointerEvent) => {
    e.preventDefault();
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const colWidth = rect.width / block.width;
    let last: BlockWidth | number | null = null;
    const move = (ev: PointerEvent) => {
      const next = axis === "width"
        ? nearestWidth((ev.clientX - rect.left) / colWidth)
        : Math.max(8, Math.round((ev.clientY - rect.top) / 8) * 8);
      if (next === last) return;
      last = next;
      setLive(axis === "width" ? { width: next as BlockWidth } : { height: next });
      post({ type: DESIGN_RESIZE_MESSAGE, id: block.id, [axis]: next });
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      setLive(null);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const width = live?.width ?? block.width;
  const chrome = def.chrome ? `${BG[block.bg]} ${PAD[block.pad]} ${onDark(block) && block.bg === "custom" ? "text-white" : ""}` : "";
  const anim = block.anim === "none" ? "" : `transition-all duration-700 ease-out ${shown ? "opacity-100 translate-y-0" : `opacity-0 ${block.anim === "up" ? "translate-y-8" : ""}`}`;
  const heightResizable = block.type === "spacer" || block.type === "html";

  const dragProps = preview ? {
    onDragOver: (e: React.DragEvent) => {
      if (!draggingId || draggingId === block.id) return;
      e.preventDefault();
      const rect = e.currentTarget.getBoundingClientRect();
      const before = inRow ? e.clientX < rect.left + rect.width / 2 : e.clientY < rect.top + rect.height / 2;
      setDropSide(before ? "before" : "after");
    },
    onDragLeave: () => setDropSide(null),
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      if (draggingId && draggingId !== block.id && dropSide) post({ type: DESIGN_MOVE_MESSAGE, id: draggingId, targetId: block.id, after: dropSide === "after" });
      setDropSide(null);
      draggingId = null;
    },
  } : {};

  return (
    <div
      ref={ref}
      id={block.anchor || undefined}
      data-block-id={block.id}
      className={`group/block relative min-w-0 ${DEVICE[block.device]} ${inRow ? SPAN[width] : ""} ${chrome} ${anim}`}
      style={block.bg === "custom" && block.bgColor && def.chrome ? { backgroundColor: block.bgColor } : undefined}
      {...dragProps}
    >
      {empty
        ? (
          <div className="container px-4 md:px-8">
            <p className="rounded-md border-2 border-dashed border-foreground/20 py-8 text-center text-sm font-sans opacity-70">
              {def.label} · 내용을 입력하면 여기에 표시됩니다
            </p>
          </div>
        )
        : <BlockContent block={live?.height ? { ...block, s: { ...block.s, height: live.height } } : block} />}

      {preview && (
        <>
          <div className="absolute top-2 left-2 z-[60] hidden group-hover/block:flex items-stretch rounded-md bg-slate-900 text-white text-xs font-sans font-semibold shadow-lg overflow-hidden">
            <span
              draggable
              onDragStart={e => { draggingId = block.id; e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", block.id); }}
              onDragEnd={() => { draggingId = null; }}
              title="끌어서 순서 바꾸기"
              className="flex items-center px-1.5 cursor-grab active:cursor-grabbing border-r border-white/20"
            >
              <GripVertical className="h-3.5 w-3.5" />
            </span>
            <button onClick={() => post({ type: DESIGN_SELECT_MESSAGE, id: block.id })} className="inline-flex items-center gap-1.5 px-2.5 py-1.5">
              <Pencil className="h-3 w-3" />{def.label} 편집
            </button>
          </div>
          {/* A full-width block ends under the page scrollbar, so its handle sits a little inside the edge. */}
          {def.chrome && (
            <span
              onPointerDown={startResize("width")}
              title="끌어서 너비 조절"
              className={`absolute top-0 bottom-0 z-[60] hidden md:group-hover/block:flex w-3 cursor-ew-resize items-center justify-center bg-indigo-500/20 hover:bg-indigo-500/50 ${inRow ? "right-0" : "right-5"}`}
            >
              <span className="h-10 w-1 rounded-full bg-indigo-600" />
            </span>
          )}
          {heightResizable && (
            <span
              onPointerDown={startResize("height")}
              title="끌어서 높이 조절"
              className="absolute left-0 right-0 bottom-0 z-[60] hidden group-hover/block:flex h-3 cursor-ns-resize items-center justify-center bg-indigo-500/20 hover:bg-indigo-500/50"
            >
              <span className="h-1 w-10 rounded-full bg-indigo-600" />
            </span>
          )}
          {live && (
            <span className="absolute top-2 right-5 z-[60] rounded bg-indigo-600 px-2 py-1 text-xs font-sans font-semibold text-white">
              {live.width ? `${live.width} / 12칸` : `${live.height}px`}
            </span>
          )}
          {dropSide && (
            <span className={`pointer-events-none absolute z-[60] bg-indigo-600 ${inRow
              ? `top-0 bottom-0 w-1 ${dropSide === "before" ? "left-0" : "right-0"}`
              : `left-0 right-0 h-1 ${dropSide === "before" ? "top-0" : "bottom-0"}`}`} />
          )}
        </>
      )}
    </div>
  );
};

// Renders a list of blocks in order. Neighbouring blocks narrower than the full width share a row on PC.
export const BlockList = ({ blocks }: { blocks: HomeBlock[] }) => {
  // Inside the design editor's preview blocks get edit / drag / resize handles.
  const preview = designDraft.get() !== null;
  const visible = blocks.filter(b => b.visible && !BLOCK_TYPES[b.type].fixed && (preview || !isEmptyBlock(b)));

  const groups: HomeBlock[][] = [];
  for (const block of visible) {
    const last = groups[groups.length - 1];
    if (block.width < 12 && last && last[0].width < 12) last.push(block);
    else groups.push([block]);
  }

  return (
    <>
      {groups.map(group => group[0].width < 12
        ? (
          <div key={group[0].id} className="container px-0 grid grid-cols-1 md:grid-cols-12 items-stretch">
            {group.map(block => <BlockShell key={block.id} block={block} preview={preview} inRow />)}
          </div>
        )
        : <BlockShell key={group[0].id} block={group[0]} preview={preview} inRow={false} />)}
    </>
  );
};

// Blocks placed above ("top") or below ("bottom") a page's own content in the design editor.
export const PageBlocks = ({ page, part }: { page: BlockPageKey; part: "top" | "bottom" }) => {
  const { pages } = useDesign();
  const list = pages[page];
  const at = list.findIndex(b => b.type === "pageContent");
  return <BlockList blocks={part === "top" ? list.slice(0, at) : list.slice(at + 1)} />;
};

const HomeBlocks = ({ blocks }: { blocks: HomeBlock[] }) => <BlockList blocks={blocks} />;

export default HomeBlocks;
