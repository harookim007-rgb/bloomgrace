import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft, Code2, Home, MessageSquareDashed, Monitor, Palette, PanelTop,
  Redo2, RotateCcw, Smartphone, Undo2, Upload,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { isAdminOtpVerified } from "@/lib/adminOtp";
import { SITE_SETTINGS_KEY } from "@/hooks/useSiteSettings";
import {
  BODY_FONTS, COLOR_PRESETS, CORNERS, DESIGN_DRAFT_MESSAGE, DESIGN_READY_MESSAGE, FONT_SCALES,
  HEADING_FONTS, defaultDesign, hexToHsl, hslToHex, normalizeDesign, sameDesign, type SiteDesign,
} from "@/lib/design";
import {
  BLOCK_PAGES, BLOCK_TYPES, BLOCK_WIDTHS, DESIGN_FOCUS_MESSAGE, DESIGN_MOVE_MESSAGE, DESIGN_RESIZE_MESSAGE,
  DESIGN_SELECT_MESSAGE, findBadLink, type BlockPageKey, type HomeBlock,
} from "@/lib/homeBlocks";
import BlockEditor from "@/components/admin/design/BlockEditor";
import AdminMenus from "@/components/admin/AdminMenus";
import PopupEditor from "@/components/admin/design/PopupEditor";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Viewport = "desktop" | "mobile";
type Tab = "theme" | "home" | "header" | "popup" | "advanced";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "theme", label: "테마", icon: Palette },
  { id: "home", label: "페이지 구성", icon: Home },
  { id: "header", label: "헤더·메뉴", icon: PanelTop },
  { id: "popup", label: "팝업", icon: MessageSquareDashed },
  { id: "advanced", label: "고급", icon: Code2 },
];

const PREVIEW_PAGES = [{ path: "/", label: "홈" }, ...BLOCK_PAGES.map(p => ({ path: p.path as string, label: p.label as string }))];

type HistoryEntry = { at: string; design: unknown };
const HISTORY_LIMIT = 10;

const linkOk = (link: string) => !link.trim() || link.trim().startsWith("/") || /^https?:\/\//.test(link.trim());

const COLOR_FIELDS: { key: keyof SiteDesign["colors"]; label: string; desc: string }[] = [
  { key: "primary", label: "브랜드 색", desc: "버튼, 강조 글자, 공지 띠" },
  { key: "background", label: "배경색", desc: "페이지 전체 배경" },
  { key: "foreground", label: "글자색", desc: "본문과 제목" },
];

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="border-b border-border px-4 py-5 space-y-4">
    <h2 className="text-sm font-semibold font-sans tracking-normal">{title}</h2>
    {children}
  </section>
);

const AdminDesign = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const frameRef = useRef<HTMLIFrameElement>(null);

  const [published, setPublished] = useState<SiteDesign | null>(null);
  const [history, setHistory] = useState<SiteDesign[]>([]);
  const [index, setIndex] = useState(0);
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const [tab, setTab] = useState<Tab>("theme");
  const [previewPath, setPreviewPath] = useState("/");
  const [frameKey, setFrameKey] = useState(0);
  const [openBlock, setOpenBlock] = useState<string | null>(null);
  const [versions, setVersions] = useState<HistoryEntry[]>([]);
  const importRef = useRef<HTMLInputElement>(null);
  const [publishing, setPublishing] = useState(false);
  const lastEdit = useRef({ key: "", at: 0 });
  const stageRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState({ w: 0, h: 0 });

  const draft = history[index];
  const dirty = !!draft && !!published && !sameDesign(draft, published);

  // Admin screens share one gate: signed in as admin and 2-step verified in /admin.
  useEffect(() => {
    if (authLoading) return;
    if (!user || !isAdmin || !isAdminOtpVerified(user.id)) navigate("/admin", { replace: true });
  }, [authLoading, user, isAdmin, navigate]);

  useEffect(() => {
    supabase.from("site_settings").select("settings").eq("id", "default").maybeSingle().then(({ data, error }) => {
      if (error) toast.error(`디자인 설정을 불러오지 못했습니다: ${error.message}`);
      const design = normalizeDesign((data?.settings as any)?.design);
      setVersions(Array.isArray((data?.settings as any)?.designHistory) ? (data?.settings as any).designHistory : []);
      setPublished(design);
      setHistory([design]);
      setIndex(0);
    });
  }, []);

  // The page whose blocks are being edited follows the page shown in the preview.
  const blockPage: "home" | BlockPageKey = BLOCK_PAGES.find(p => p.path === previewPath)?.key ?? "home";
  const listOf = (design: SiteDesign, page: "home" | BlockPageKey) => (page === "home" ? design.home.blocks : design.pages[page]);
  const withList = (design: SiteDesign, page: "home" | BlockPageKey, blocks: HomeBlock[]): SiteDesign =>
    page === "home" ? { ...design, home: { blocks } } : { ...design, pages: { ...design.pages, [page]: blocks } };
  const pageOfBlock = (design: SiteDesign, id: string): "home" | BlockPageKey | null =>
    design.home.blocks.some(b => b.id === id) ? "home" : (BLOCK_PAGES.find(p => design.pages[p.key].some(b => b.id === id))?.key ?? null);

  const sendDraft = useCallback(() => {
    if (!draft) return;
    frameRef.current?.contentWindow?.postMessage({ type: DESIGN_DRAFT_MESSAGE, design: draft }, window.location.origin);
  }, [draft]);

  // The preview asks for the draft each time it (re)loads; every later edit is pushed to it.
  useEffect(() => { sendDraft(); }, [sendDraft]);
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type === DESIGN_READY_MESSAGE) sendDraft();
      // The preview's "edit" tag on a block opens that block's settings here.
      if (e.data?.type === DESIGN_SELECT_MESSAGE && typeof e.data.id === "string") {
        setTab("home");
        setOpenBlock(e.data.id);
      }
      if (!draft) return;
      // A block was dragged next to another block in the preview.
      if (e.data?.type === DESIGN_MOVE_MESSAGE) {
        const { id, targetId, after } = e.data;
        const page = pageOfBlock(draft, targetId);
        if (!page || pageOfBlock(draft, id) !== page) return;
        const list = listOf(draft, page);
        const moved = list.find(b => b.id === id);
        const rest = list.filter(b => b.id !== id);
        const at = rest.findIndex(b => b.id === targetId) + (after ? 1 : 0);
        if (!moved) return;
        rest.splice(at, 0, moved);
        change(`block-move-${Date.now()}`, withList(draft, page, rest));
      }
      // A block's edge was dragged in the preview to change its width or height.
      if (e.data?.type === DESIGN_RESIZE_MESSAGE) {
        const page = pageOfBlock(draft, e.data.id);
        if (!page) return;
        const patchBlock = (b: HomeBlock): HomeBlock => {
          if (BLOCK_WIDTHS.includes(e.data.width) && BLOCK_TYPES[b.type].chrome) return { ...b, width: e.data.width };
          if (typeof e.data.height === "number" && (b.type === "spacer" || b.type === "html")) return { ...b, s: { ...b.s, height: Math.min(1200, Math.max(8, Math.round(e.data.height))) } };
          return b;
        };
        change(`block-resize-${e.data.id}`, withList(draft, page, listOf(draft, page).map(b => (b.id === e.data.id ? patchBlock(b) : b))));
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  });

  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  // `key` groups rapid edits of one control (dragging a color, typing) into a single undo step.
  const change = (key: string, next: SiteDesign) => {
    const now = Date.now();
    const merge = lastEdit.current.key === key && now - lastEdit.current.at < 800 && index > 0;
    lastEdit.current = { key, at: now };
    const base = history.slice(0, merge ? index : index + 1);
    setHistory([...base, next].slice(-60));
    setIndex(Math.min(base.length, 59));
  };

  const undo = () => { lastEdit.current.key = ""; setIndex(i => Math.max(0, i - 1)); };
  const redo = () => { lastEdit.current.key = ""; setIndex(i => Math.min(history.length - 1, i + 1)); };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== "z") return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      e.preventDefault();
      if (e.shiftKey) redo(); else undo();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const publish = async () => {
    if (!draft) return;
    if (draft.announcement.enabled && !draft.announcement.text.trim()) {
      setTab("header");
      toast.error("공지 띠를 켰다면 문구를 입력하세요.");
      return;
    }
    if (!linkOk(draft.announcement.link)) {
      setTab("header");
      toast.error("공지 링크는 '/'로 시작하거나 'http(s)://'로 시작해야 합니다.");
      return;
    }
    const badBlock = findBadLink([...draft.home.blocks, ...BLOCK_PAGES.flatMap(p => draft.pages[p.key])]);
    if (badBlock) {
      const page = pageOfBlock(draft, badBlock.id);
      setPreviewPath(page && page !== "home" ? BLOCK_PAGES.find(p => p.key === page)!.path : "/");
      setTab("home");
      setOpenBlock(badBlock.id);
      toast.error(`'${BLOCK_TYPES[badBlock.type].label}' 블록의 링크는 '/' 또는 'http(s)://'로 시작해야 합니다.`);
      return;
    }
    const badPopup = draft.popups.find(p =>
      (p.type === "image" && !linkOk(p.link)) ||
      (p.startsAt && p.endsAt && new Date(p.endsAt) <= new Date(p.startsAt)));
    if (badPopup) {
      setTab("popup");
      toast.error(`'${badPopup.name}' 팝업을 확인하세요. 링크는 '/' 또는 'http(s)://'로 시작해야 하고, 종료 일시는 시작 일시보다 뒤여야 합니다.`);
      return;
    }
    // Clamp typed numbers (popup sizes) to their allowed range before saving.
    const next = normalizeDesign(draft);
    setPublishing(true);
    // Merge into the latest saved settings so 사이트 설정 values are never overwritten.
    const { data: row, error: readError } = await supabase.from("site_settings").select("settings").eq("id", "default").maybeSingle();
    const current = ((row?.settings as any) || {}) as { design?: unknown; designHistory?: HistoryEntry[] };
    // Keep the design being replaced so it can be brought back from 게시 이력.
    const history: HistoryEntry[] = [
      ...(current.design ? [{ at: new Date().toISOString(), design: current.design }] : []),
      ...(Array.isArray(current.designHistory) ? current.designHistory : []),
    ].slice(0, HISTORY_LIMIT);
    const { error } = readError
      ? { error: readError }
      : await supabase.from("site_settings").upsert({ id: "default", settings: { ...current, design: next, designHistory: history } as any });
    setPublishing(false);
    if (error) { toast.error(`게시하지 못했습니다: ${error.message}`); return; }
    setPublished(next);
    setVersions(history);
    setHistory(h => h.map((d, i) => (i === index ? next : d)));
    queryClient.invalidateQueries({ queryKey: SITE_SETTINGS_KEY });
    toast.success("게시했습니다. 쇼핑몰에 바로 적용됩니다.");
  };

  const discard = () => {
    if (!published || !dirty) return;
    if (!window.confirm("게시하지 않은 변경을 모두 버리고 현재 게시된 디자인으로 되돌릴까요?")) return;
    change("discard", published);
  };

  const resetToDefault = () => {
    if (!window.confirm("모든 디자인 설정을 처음 상태로 되돌릴까요? 게시하기 전까지는 쇼핑몰에 반영되지 않습니다.")) return;
    change("reset", defaultDesign);
  };

  const exit = () => {
    if (dirty && !window.confirm("게시하지 않은 변경이 있습니다. 나가면 사라집니다. 나갈까요?")) return;
    navigate("/admin");
  };

  const focusBlock = (id: string) => {
    frameRef.current?.contentWindow?.postMessage({ type: DESIGN_FOCUS_MESSAGE, id }, window.location.origin);
  };

  // Opening a block from the preview may be for a page other than the one whose list is showing.
  useEffect(() => {
    if (!draft || !openBlock) return;
    const page = pageOfBlock(draft, openBlock);
    const path = page === "home" ? "/" : BLOCK_PAGES.find(p => p.key === page)?.path;
    if (path && path !== previewPath) setPreviewPath(path);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openBlock]);

  const exportDesign = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(draft, null, 2)], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `youthroom-design-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importDesign = async (file: File | undefined) => {
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("not a design");
      change("import", normalizeDesign(parsed));
      toast.success("디자인 파일을 불러왔습니다. 미리보기를 확인하고 게시하세요.");
    } catch {
      toast.error("디자인 파일을 읽을 수 없습니다. 이 화면에서 내보낸 .json 파일인지 확인하세요.");
    }
    if (importRef.current) importRef.current.value = "";
  };

  const restoreVersion = (entry: HistoryEntry) => {
    change(`restore-${entry.at}`, normalizeDesign(entry.design));
    toast.info("이전 게시본을 불러왔습니다. 미리보기를 확인하고 게시하세요.");
  };

  // The PC preview renders at a real desktop width and is scaled down to fit, so it shows the
  // desktop layout (not the tablet one) even when the editor leaves it less room.
  // "ready" must match the moment the editor (not the loading screen) is on the page; otherwise
  // the size watcher below would start before the preview area exists and never measure it.
  const ready = !authLoading && !!draft && !!published;
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    // A zero size is reported while the panel is momentarily not laid out; keeping the last
    // real size stops the preview from collapsing.
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) setStage({ w: width, h: height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [ready]);
  const frameWidth = viewport === "mobile" ? 390 : 1440;
  const scale = stage.w ? Math.min(1, stage.w / frameWidth) : 1;

  if (!ready) {
    return <div className="min-h-dvh flex items-center justify-center text-muted-foreground">로딩 중...</div>;
  }

  return (
    <div className="h-dvh flex flex-col bg-muted/30">
      <header className="shrink-0 bg-card border-b border-border px-3 py-2 flex flex-wrap items-center gap-x-2 gap-y-2">
        <Button variant="ghost" size="sm" onClick={exit} className="gap-1.5">
          <ArrowLeft className="h-4 w-4" /><span className="hidden sm:inline">관리자</span>
        </Button>
        <div className="mr-auto min-w-0">
          <h1 className="text-base font-bold font-serif leading-tight truncate">디자인 모드</h1>
          <p className="text-xs text-muted-foreground leading-tight truncate">
            {dirty ? "게시하지 않은 변경이 있습니다" : "게시된 디자인과 같습니다"}
          </p>
        </div>

        <Select value={previewPath} onValueChange={setPreviewPath}>
          <SelectTrigger className="h-10 w-[130px]" aria-label="미리보기 페이지"><SelectValue /></SelectTrigger>
          <SelectContent>{PREVIEW_PAGES.map(pg => <SelectItem key={pg.path} value={pg.path}>{pg.label}</SelectItem>)}</SelectContent>
        </Select>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" onClick={undo} disabled={index === 0} title="실행취소" aria-label="실행취소"><Undo2 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" onClick={redo} disabled={index >= history.length - 1} title="다시실행" aria-label="다시실행"><Redo2 className="h-4 w-4" /></Button>
        </div>
        <div className="flex items-center rounded-md border border-border overflow-hidden">
          {([["desktop", Monitor, "PC"], ["mobile", Smartphone, "모바일"]] as const).map(([value, Icon, label]) => (
            <button
              key={value}
              onClick={() => setViewport(value)}
              aria-pressed={viewport === value}
              className={`flex items-center gap-1.5 px-3 h-10 text-sm transition-colors ${viewport === value ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:text-foreground"}`}
            >
              <Icon className="h-4 w-4" />{label}
            </button>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={discard} disabled={!dirty} className="gap-1.5 h-10">
          <RotateCcw className="h-4 w-4" /><span className="hidden md:inline">변경 취소</span>
        </Button>
        <Button size="sm" onClick={publish} disabled={!dirty || publishing} className="gap-1.5 h-10">
          <Upload className="h-4 w-4" />{publishing ? "게시 중..." : "게시하기"}
        </Button>
      </header>

      <div className="flex-1 min-h-0 flex flex-col lg:flex-row">
        <aside className="lg:w-[380px] shrink-0 bg-card border-b lg:border-b-0 lg:border-r border-border flex flex-col max-h-[50dvh] lg:max-h-none">
          <div className="shrink-0 grid grid-cols-5 border-b border-border" role="tablist">
            {TABS.map(t => (
              <button
                key={t.id}
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={`flex flex-col items-center gap-1 py-2.5 text-xs font-medium border-b-2 transition-colors ${tab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              >
                <t.icon className="h-4 w-4" />
                <span className="truncate max-w-full px-1">{t.label}</span>
              </button>
            ))}
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto">
          {tab === "theme" && (<>
          <Section title="색상">
            <div className="flex flex-wrap gap-2">
              {COLOR_PRESETS.map(preset => {
                const active = JSON.stringify(preset.colors) === JSON.stringify(draft.colors);
                return (
                  <button
                    key={preset.name}
                    onClick={() => change(`preset-${preset.name}`, { ...draft, colors: preset.colors })}
                    className={`flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs transition-colors ${active ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground hover:text-foreground"}`}
                  >
                    <span className="flex">
                      <span className="h-4 w-4 rounded-full border border-border" style={{ background: `hsl(${preset.colors.primary})` }} />
                      <span className="h-4 w-4 rounded-full border border-border -ml-1.5" style={{ background: `hsl(${preset.colors.background})` }} />
                    </span>
                    {preset.name}
                  </button>
                );
              })}
            </div>
            {COLOR_FIELDS.map(field => (
              <div key={field.key} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <Label htmlFor={`color-${field.key}`}>{field.label}</Label>
                  <p className="text-xs text-muted-foreground">{field.desc}</p>
                </div>
                <input
                  id={`color-${field.key}`}
                  type="color"
                  value={hslToHex(draft.colors[field.key])}
                  onChange={e => change(`color-${field.key}`, { ...draft, colors: { ...draft.colors, [field.key]: hexToHsl(e.target.value) } })}
                  className="h-10 w-14 shrink-0 cursor-pointer rounded-md border border-border bg-background p-1"
                />
              </div>
            ))}
          </Section>

          <Section title="글꼴">
            <div className="space-y-1.5">
              <Label>제목 글꼴</Label>
              <Select value={draft.fonts.heading} onValueChange={v => change("font-heading", { ...draft, fonts: { ...draft.fonts, heading: v } })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{HEADING_FONTS.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>본문 글꼴</Label>
              <Select value={draft.fonts.body} onValueChange={v => change("font-body", { ...draft, fonts: { ...draft.fonts, body: v } })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{BODY_FONTS.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>글자 크기</Label>
              <div className="grid grid-cols-3 gap-2">
                {FONT_SCALES.map(s => (
                  <Button
                    key={s.value}
                    type="button"
                    variant={draft.fonts.scale === s.value ? "default" : "outline"}
                    onClick={() => change("font-scale", { ...draft, fonts: { ...draft.fonts, scale: s.value } })}
                  >
                    {s.label}
                  </Button>
                ))}
              </div>
            </div>
          </Section>

          <Section title="모서리 모양">
            <div className="grid grid-cols-3 gap-2">
              {CORNERS.map(c => (
                <Button
                  key={c.value}
                  type="button"
                  variant={draft.layout.corners === c.value ? "default" : "outline"}
                  onClick={() => change("corners", { ...draft, layout: { ...draft.layout, corners: c.value } })}
                >
                  {c.label}
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">쇼핑몰의 버튼, 입력칸, 상자 모서리에 적용됩니다</p>
          </Section>
          </>)}

          {tab === "home" && (
            <Section title="페이지 블록">
              <div className="space-y-1.5">
                <Label>편집할 페이지</Label>
                <Select value={previewPath} onValueChange={path => { setPreviewPath(path); setOpenBlock(null); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{PREVIEW_PAGES.map(pg => <SelectItem key={pg.path} value={pg.path}>{pg.label}</SelectItem>)}</SelectContent>
                </Select>
                {blockPage !== "home" && (
                  <p className="text-xs text-muted-foreground leading-relaxed">이 페이지의 원래 내용은 그대로 두고, 그 위와 아래에 블록을 넣을 수 있습니다.</p>
                )}
              </div>
              <BlockEditor
                key={blockPage}
                home={blockPage === "home"}
                blocks={listOf(draft, blockPage)}
                onChange={(key, blocks) => change(key, withList(draft, blockPage, blocks))}
                openId={openBlock}
                setOpenId={setOpenBlock}
                onFocus={focusBlock}
                onExternalSave={() => setFrameKey(k => k + 1)}
              />
            </Section>
          )}

          {tab === "header" && (<>
          <Section title="헤더">
            {([
              ["sticky", "헤더 상단 고정", "스크롤해도 메뉴가 화면 위에 따라옵니다"],
              ["greeting", "인사말 띠", "헤더 위의 언어별 인사 문구"],
              ["floating", "플로팅 버튼", "화면 오른쪽의 루틴 탭과 상담 버튼"],
            ] as const).map(([key, label, desc]) => (
              <div key={key} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <Label htmlFor={`header-${key}`}>{label}</Label>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
                <Switch
                  id={`header-${key}`}
                  checked={draft.header[key]}
                  onCheckedChange={v => change(`header-${key}`, { ...draft, header: { ...draft.header, [key]: v } })}
                />
              </div>
            ))}
          </Section>

          <Section title="공지 띠">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <Label htmlFor="announcement-enabled">상단 공지 띠 표시</Label>
                <p className="text-xs text-muted-foreground">모든 페이지 맨 위에 한 줄로 표시됩니다</p>
              </div>
              <Switch
                id="announcement-enabled"
                checked={draft.announcement.enabled}
                onCheckedChange={v => change("announcement-enabled", { ...draft, announcement: { ...draft.announcement, enabled: v } })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="announcement-text">문구</Label>
              <Input
                id="announcement-text"
                value={draft.announcement.text}
                maxLength={120}
                placeholder="예: Free shipping on orders over $50"
                onChange={e => change("announcement-text", { ...draft, announcement: { ...draft.announcement, text: e.target.value } })}
              />
              <p className="text-xs text-muted-foreground">입력한 문구 그대로 모든 언어에서 표시됩니다</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="announcement-link">링크 (선택)</Label>
              <Input
                id="announcement-link"
                value={draft.announcement.link}
                maxLength={300}
                placeholder="/products 또는 https://..."
                onChange={e => change("announcement-link", { ...draft, announcement: { ...draft.announcement, link: e.target.value } })}
              />
            </div>
          </Section>

          <Section title="메뉴 구성">
            <AdminMenus compact onSaved={() => setFrameKey(k => k + 1)} />
          </Section>
          </>)}

          {tab === "popup" && (
            <Section title="팝업">
              <PopupEditor popups={draft.popups} onChange={(key, popups) => change(key, { ...draft, popups })} />
            </Section>
          )}

          {tab === "advanced" && (<>
          <Section title="효과">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <Label htmlFor="petals">꽃잎 효과</Label>
                <p className="text-xs text-muted-foreground">떨어지는 꽃잎과 배경 꽃 장식</p>
              </div>
              <Switch
                id="petals"
                checked={draft.effects.petals}
                onCheckedChange={v => change("petals", { ...draft, effects: { petals: v } })}
              />
            </div>
          </Section>

          <Section title="CSS 직접 입력">
            <Textarea
              value={draft.customCss}
              rows={10}
              maxLength={20000}
              spellCheck={false}
              aria-label="CSS 직접 입력"
              className="font-mono text-xs leading-relaxed"
              placeholder={"/* 예: 상품 이름을 굵게 */\nh3 { font-weight: 700; }"}
              onChange={e => change("custom-css", { ...draft, customCss: e.target.value })}
            />
            <p className="text-xs text-muted-foreground leading-relaxed">
              쇼핑몰 모든 페이지에 적용되고 관리자 화면에는 적용되지 않습니다. 화면이 이상해지면 내용을 지우고 다시 게시하세요.
            </p>
          </Section>

          <Section title="백업">
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={exportDesign}>파일로 내보내기</Button>
              <Button variant="outline" onClick={() => importRef.current?.click()}>파일에서 가져오기</Button>
            </div>
            <input ref={importRef} type="file" accept="application/json,.json" className="hidden" onChange={e => importDesign(e.target.files?.[0])} />
            <p className="text-xs text-muted-foreground leading-relaxed">지금 편집 중인 디자인 전체(테마, 블록, 팝업 등)를 파일로 저장하거나 불러옵니다.</p>
          </Section>

          <Section title="게시 이력">
            {versions.length === 0
              ? <p className="text-sm text-muted-foreground">아직 이력이 없습니다. 게시할 때마다 이전 디자인이 여기에 보관됩니다.</p>
              : (
                <ul className="space-y-2">
                  {versions.map(v => (
                    <li key={v.at} className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2">
                      <span className="min-w-0 text-sm truncate">{new Date(v.at).toLocaleString("ko-KR", { dateStyle: "medium", timeStyle: "short" })}까지 사용</span>
                      <Button variant="outline" size="sm" className="shrink-0" onClick={() => restoreVersion(v)}>불러오기</Button>
                    </li>
                  ))}
                </ul>
              )}
            <p className="text-xs text-muted-foreground leading-relaxed">최근 {HISTORY_LIMIT}개까지 보관됩니다. 불러온 뒤 게시해야 쇼핑몰에 적용됩니다.</p>
          </Section>

          <div className="px-4 py-5">
            <Button variant="outline" className="w-full" onClick={resetToDefault} disabled={sameDesign(draft, defaultDesign)}>
              처음 디자인으로 되돌리기
            </Button>
            <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
              게시하기 전까지는 쇼핑몰에 반영되지 않습니다.
            </p>
          </div>
          </>)}
          </div>
        </aside>

        <main className="flex-1 min-w-0 min-h-0 p-3 lg:p-5 flex flex-col gap-2">
          <p className="shrink-0 text-xs text-muted-foreground text-center">
            {viewport === "mobile" ? "모바일 화면 (390px)" : "PC 화면 (1440px)"}{scale < 1 ? ` · ${Math.round(scale * 100)}%로 축소해서 표시` : ""}
          </p>
          <div ref={stageRef} className="flex-1 min-h-0 flex justify-center overflow-hidden">
            <div
              className="relative overflow-hidden bg-background border border-border rounded-lg shadow-sm"
              style={{ width: frameWidth * scale, height: stage.h }}
            >
              <iframe
                key={`${previewPath}-${frameKey}`}
                ref={frameRef}
                src={previewPath}
                title="쇼핑몰 미리보기"
                className="absolute top-0 left-0 border-0"
                style={{ width: frameWidth, height: scale ? stage.h / scale : stage.h, transform: `scale(${scale})`, transformOrigin: "top left" }}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDesign;
