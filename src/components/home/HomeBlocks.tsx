import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Pencil } from "lucide-react";
import Hero from "@/components/Hero";
import FeaturedProducts from "@/components/FeaturedProducts";
import BeautyConsultation from "@/components/BeautyConsultation";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { localizeCategory } from "@/lib/categoryI18n";
import { designDraft } from "@/lib/design";
import { BLOCK_TYPES, DESIGN_SELECT_MESSAGE, SANDBOX, isEmptyBlock, sandboxDoc, type BlockItem, type HomeBlock } from "@/lib/homeBlocks";

const BG: Record<HomeBlock["bg"], string> = {
  none: "",
  soft: "bg-[hsl(var(--primary-soft))]",
  tint: "bg-muted/70",
  dark: "bg-foreground text-background",
};
const PAD: Record<HomeBlock["pad"], string> = {
  small: "py-6 md:py-10",
  normal: "py-10 md:py-20",
  large: "py-16 md:py-32",
};
const DEVICE: Record<HomeBlock["device"], string> = { all: "", desktop: "hidden md:block", mobile: "md:hidden" };

const isExternal = (link: string) => /^https?:\/\//.test(link);

// Renders admin-entered links: store paths stay in the app, full addresses open in a new tab.
const SmartLink = ({ to, className, children }: { to: string; className?: string; children: React.ReactNode }) => {
  const link = to.trim();
  if (isExternal(link)) return <a href={link} target="_blank" rel="noopener noreferrer" className={className}>{children}</a>;
  if (link.startsWith("/")) return <Link to={link} className={className}>{children}</Link>;
  return <span className={className}>{children}</span>;
};

const ButtonLink = ({ label, link, dark }: { label: string; link: string; dark: boolean }) => {
  if (!label.trim()) return null;
  return (
    <SmartLink
      to={link}
      className={`inline-flex items-center justify-center min-h-[44px] px-8 py-3 rounded-none text-xs md:text-sm font-sans font-bold tracking-[0.15em] uppercase transition-colors ${dark ? "bg-background text-foreground hover:bg-background/90" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}
    >
      {label}
    </SmartLink>
  );
};

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
      {title.trim() && <h2 className="text-2xl md:text-4xl font-serif text-center mb-6 md:mb-10 break-words">{title}</h2>}
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

const BlockContent = ({ block }: { block: HomeBlock }) => {
  const s = block.s;
  const dark = block.bg === "dark";
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
          {s.heading.trim() && <h2 className={`font-serif break-words ${s.size === "large" ? "text-3xl md:text-5xl lg:text-6xl" : "text-2xl md:text-4xl"}`}>{s.heading}</h2>}
          <Body text={s.body} />
        </div>
      );
    case "image": {
      if (!s.image.trim()) return null;
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
              {s.heading.trim() && <h2 className="text-2xl md:text-4xl font-serif break-words">{s.heading}</h2>}
              <Body text={s.body} />
              <ButtonLink label={s.buttonLabel} link={s.buttonLink} dark={dark} />
            </div>
          </div>
        </div>
      );
    case "promo":
      return (
        <div className="container px-4 md:px-8 max-w-4xl text-center space-y-4 md:space-y-6">
          {s.heading.trim() && <h2 className="text-2xl md:text-4xl lg:text-5xl font-serif break-words">{s.heading}</h2>}
          <Body text={s.body} />
          <ButtonLink label={s.buttonLabel} link={s.buttonLink} dark={dark} />
        </div>
      );
    case "cards": {
      const items = (s.items as BlockItem[]).filter(it => it.title.trim() || it.body.trim());
      if (items.length === 0 && !s.title.trim()) return null;
      return (
        <div className="container px-4 md:px-8">
          {s.title.trim() && <h2 className="text-2xl md:text-4xl font-serif text-center mb-6 md:mb-12 break-words">{s.title}</h2>}
          <div className={`grid gap-4 md:gap-6 sm:grid-cols-2 ${items.length >= 3 ? "lg:grid-cols-3" : ""}`}>
            {items.map((it, i) => (
              <div key={i} className={`rounded-none border p-6 md:p-8 space-y-2 min-w-0 ${dark ? "border-background/20" : "border-border bg-card text-card-foreground"}`}>
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
      if (items.length === 0 && !s.title.trim()) return null;
      return (
        <div className="container px-4 md:px-8 max-w-3xl">
          {s.title.trim() && <h2 className="text-2xl md:text-4xl font-serif text-center mb-6 md:mb-10 break-words">{s.title}</h2>}
          <Accordion type="single" collapsible>
            {items.map((it, i) => (
              <AccordionItem key={i} value={`item-${i}`} className={dark ? "border-background/20" : ""}>
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
      if (!id && !isExternal(url)) return null;
      return (
        <div className="container px-4 md:px-8 max-w-4xl">
          {s.title.trim() && <h2 className="text-2xl md:text-4xl font-serif text-center mb-6 md:mb-10 break-words">{s.title}</h2>}
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
      if (!s.code.trim()) return null;
      return (
        <div className="container px-4 md:px-8">
          <iframe title="Custom content" srcDoc={sandboxDoc(s.code)} sandbox={SANDBOX} className="block w-full border-0" style={{ height: s.height }} />
        </div>
      );
  }
};

// The home page body: every visible block from the design, in order.
const HomeBlocks = ({ blocks }: { blocks: HomeBlock[] }) => {
  // Inside the design editor's preview each block gets an "edit" tag that opens its settings.
  const preview = designDraft.get() !== null;
  return (
    <>
      {blocks.filter(b => b.visible && (preview || !isEmptyBlock(b))).map(block => {
        const def = BLOCK_TYPES[block.type];
        const chrome = def.chrome ? `${BG[block.bg]} ${PAD[block.pad]}` : "";
        const empty = isEmptyBlock(block);
        return (
          <div key={block.id} data-block-id={block.id} className={`group/block relative ${DEVICE[block.device]} ${chrome}`}>
            {empty
              ? (
                <div className="container px-4 md:px-8">
                  <p className="rounded-md border-2 border-dashed border-foreground/20 py-8 text-center text-sm font-sans opacity-70">
                    {def.label} · 내용을 입력하면 여기에 표시됩니다
                  </p>
                </div>
              )
              : <BlockContent block={block} />}
            {preview && (
              <button
                onClick={() => window.parent.postMessage({ type: DESIGN_SELECT_MESSAGE, id: block.id }, window.location.origin)}
                className="absolute top-2 left-2 z-40 hidden group-hover/block:inline-flex items-center gap-1.5 rounded-md bg-slate-900 text-white text-xs font-sans font-semibold px-2.5 py-1.5 shadow-lg"
              >
                <Pencil className="h-3 w-3" />{def.label} 편집
              </button>
            )}
          </div>
        );
      })}
    </>
  );
};

export default HomeBlocks;
