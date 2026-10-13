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
import { BLOCK_TYPES, DESIGN_FOCUS_MESSAGE, DESIGN_SELECT_MESSAGE, findBadLink } from "@/lib/homeBlocks";
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
  { id: "home", label: "홈 구성", icon: Home },
  { id: "header", label: "헤더·메뉴", icon: PanelTop },
  { id: "popup", label: "팝업", icon: MessageSquareDashed },
  { id: "advanced", label: "고급", icon: Code2 },
];

const PREVIEW_PAGES = [
  { path: "/", label: "홈" },
  { path: "/products", label: "상품 목록" },
  { path: "/ranking", label: "랭킹" },
  { path: "/contact", label: "문의" },
];

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
      setPublished(design);
      setHistory([design]);
      setIndex(0);
    });
  }, []);

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
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [sendDraft]);

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
    const badBlock = findBadLink(draft.home.blocks);
    if (badBlock) {
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
    const { error } = readError
      ? { error: readError }
      : await supabase.from("site_settings").upsert({ id: "default", settings: { ...((row?.settings as object) || {}), design: next } as any });
    setPublishing(false);
    if (error) { toast.error(`게시하지 못했습니다: ${error.message}`); return; }
    setPublished(next);
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

  // Blocks only exist on the home page, so show it before scrolling the preview to one.
  const focusBlock = (id: string) => {
    if (previewPath !== "/") { setPreviewPath("/"); return; }
    frameRef.current?.contentWindow?.postMessage({ type: DESIGN_FOCUS_MESSAGE, id }, window.location.origin);
  };

  // The PC preview renders at a real desktop width and is scaled down to fit, so it shows the
  // desktop layout (not the tablet one) even when the editor leaves it less room.
  const ready = !!draft && !!published;
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

  if (authLoading || !draft || !published) {
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
            <Section title="홈 화면 블록">
              <BlockEditor
                blocks={draft.home.blocks}
                onChange={(key, blocks) => change(key, { ...draft, home: { blocks } })}
                openId={openBlock}
                setOpenId={setOpenBlock}
                onFocus={focusBlock}
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
