import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, ChevronDown, ChevronUp, Plus, RotateCcw, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SITE_SETTINGS_KEY } from "@/hooks/useSiteSettings";
import { BODY_FONTS, HEADING_FONTS } from "@/lib/design";
import {
  FAQ_ICONS, FAQ_LANGUAGES, defaultFaq, defaultFaqStyle, newFaqId, normalizeFaq,
  type FaqCategory, type FaqIcon, type FaqSettings, type LangText,
} from "@/lib/faq";
import type { Language } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ICON_LABEL: Record<FaqIcon, string> = {
  sparkles: "반짝임 (제품)", package: "상자 (배송)", refresh: "화살표 (교환·반품)", shield: "방패 (회원)", leaf: "잎 (친환경)", message: "말풍선 (고객센터)",
};
const FONTS = [...new Set([...HEADING_FONTS, ...BODY_FONTS])];
const COLOR_FIELDS = [
  { key: "titleColor", label: "분류 제목 색" },
  { key: "questionColor", label: "질문 색" },
  { key: "answerColor", label: "답변 색" },
] as const;

const move = <T,>(list: T[], i: number, dir: -1 | 1) => {
  const next = [...list];
  [next[i], next[i + dir]] = [next[i + dir], next[i]];
  return next;
};

const AdminFaq = () => {
  const queryClient = useQueryClient();
  const [faq, setFaq] = useState<FaqSettings | null>(null);
  const [lang, setLang] = useState<Language>("en");
  const [openCat, setOpenCat] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    supabase.from("site_settings").select("settings").eq("id", "default").maybeSingle()
      .then(({ data }) => setFaq(normalizeFaq((data?.settings as any)?.faq)));
  }, []);

  const update = (next: FaqSettings) => { setFaq(next); setDirty(true); };
  const setCat = (id: string, patch: Partial<FaqCategory>) =>
    update({ ...faq!, categories: faq!.categories.map(c => (c.id === id ? { ...c, ...patch } : c)) });
  const setText = (t: LangText, value: string): LangText => ({ ...t, [lang]: value });

  const save = async () => {
    if (!faq) return;
    setSaving(true);
    const { data: row, error: readError } = await supabase.from("site_settings").select("settings").eq("id", "default").maybeSingle();
    const { error } = readError
      ? { error: readError }
      : await supabase.from("site_settings").upsert({ id: "default", settings: { ...((row?.settings as object) || {}), faq } as any });
    setSaving(false);
    if (error) { toast.error(`FAQ를 저장하지 못했습니다: ${error.message}`); return; }
    setDirty(false);
    queryClient.invalidateQueries({ queryKey: SITE_SETTINGS_KEY });
    toast.success("FAQ를 저장했습니다. Q&A 페이지에 바로 적용됩니다.");
  };

  if (!faq) return <p className="p-6 text-sm text-muted-foreground text-center">로딩 중...</p>;

  const langLabel = FAQ_LANGUAGES.find(l => l.code === lang)?.label;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold font-serif">FAQ 관리</h1>
          <p className="text-sm text-muted-foreground mt-1">Q&A 페이지의 질문·답변과 글꼴·색을 바꿉니다. 언어별로 따로 입력하고, 비워둔 언어는 영어로 표시됩니다.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-1.5" onClick={() => { if (window.confirm("처음 FAQ 내용으로 되돌릴까요? 저장해야 적용됩니다.")) update(defaultFaq()); }}>
            <RotateCcw className="h-4 w-4" />처음 내용으로
          </Button>
          <Button className="gap-1.5" onClick={save} disabled={saving || !dirty}><Save className="h-4 w-4" />{saving ? "저장 중..." : "저장"}</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">글꼴과 색</CardTitle>
          <CardDescription>비워두면 쇼핑몰 기본 디자인을 따릅니다</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <Label>글꼴</Label>
            <Select value={faq.style.font || "default"} onValueChange={v => update({ ...faq, style: { ...faq.style, font: v === "default" ? "" : v } })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="default">기본</SelectItem>
                {FONTS.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {COLOR_FIELDS.map(f => (
            <div key={f.key} className="space-y-1.5">
              <Label>{f.label}</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  aria-label={f.label}
                  value={faq.style[f.key] || "#333333"}
                  onChange={e => update({ ...faq, style: { ...faq.style, [f.key]: e.target.value } })}
                  className="h-10 w-14 cursor-pointer rounded-md border border-border bg-background p-1"
                />
                <Button variant="ghost" size="sm" disabled={!faq.style[f.key]} onClick={() => update({ ...faq, style: { ...faq.style, [f.key]: defaultFaqStyle[f.key] } })}>
                  기본
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="space-y-3">
          <div>
            <CardTitle className="text-lg">질문과 답변</CardTitle>
            <CardDescription>편집할 언어를 고른 뒤 분류를 펼쳐 수정하세요. 지금 편집 중: {langLabel}</CardDescription>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {FAQ_LANGUAGES.map(l => (
              <Button key={l.code} size="sm" variant={lang === l.code ? "default" : "outline"} onClick={() => setLang(l.code)}>{l.label}</Button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {faq.categories.map((cat, ci) => {
            const open = openCat === cat.id;
            return (
              <div key={cat.id} className={`rounded-lg border ${open ? "border-primary" : "border-border"}`}>
                <div className="flex items-center gap-1 p-2.5">
                  <button className="min-w-0 flex-1 text-left px-1" onClick={() => setOpenCat(open ? null : cat.id)} aria-expanded={open}>
                    <span className="block font-medium truncate">{cat.title[lang] || cat.title.en || "제목 없음"}</span>
                    <span className="block text-xs text-muted-foreground">질문 {cat.items.length}개</span>
                  </button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" disabled={ci === 0} onClick={() => update({ ...faq, categories: move(faq.categories, ci, -1) })} aria-label="위로"><ArrowUp className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" disabled={ci === faq.categories.length - 1} onClick={() => update({ ...faq, categories: move(faq.categories, ci, 1) })} aria-label="아래로"><ArrowDown className="h-4 w-4" /></Button>
                  <Button
                    variant="ghost" size="icon" className="h-8 w-8 text-destructive" aria-label="분류 삭제"
                    onClick={() => { if (window.confirm("이 분류와 안의 질문을 모두 삭제할까요?")) update({ ...faq, categories: faq.categories.filter(c => c.id !== cat.id) }); }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setOpenCat(open ? null : cat.id)} aria-label={open ? "접기" : "펼치기"}>
                    {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>

                {open && (
                  <div className="border-t border-border p-4 space-y-4">
                    <div className="grid gap-3 sm:grid-cols-[1fr_220px]">
                      <div className="space-y-1.5">
                        <Label>분류 제목 ({langLabel})</Label>
                        <Input value={cat.title[lang] || ""} placeholder={cat.title.en || ""} maxLength={120} onChange={e => setCat(cat.id, { title: setText(cat.title, e.target.value) })} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>아이콘</Label>
                        <Select value={cat.icon} onValueChange={v => setCat(cat.id, { icon: v as FaqIcon })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>{FAQ_ICONS.map(i => <SelectItem key={i} value={i}>{ICON_LABEL[i]}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                    </div>

                    {cat.items.map((item, ii) => (
                      <div key={item.id} className="rounded-md border border-border bg-muted/30 p-3 space-y-2">
                        <div className="flex items-center gap-1">
                          <Input
                            value={item.q[lang] || ""} placeholder={item.q.en || "질문"} maxLength={300} aria-label="질문"
                            className="min-w-0 flex-1 font-medium"
                            onChange={e => setCat(cat.id, { items: cat.items.map(x => (x.id === item.id ? { ...x, q: setText(x.q, e.target.value) } : x)) })}
                          />
                          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" disabled={ii === 0} onClick={() => setCat(cat.id, { items: move(cat.items, ii, -1) })} aria-label="위로"><ArrowUp className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" disabled={ii === cat.items.length - 1} onClick={() => setCat(cat.id, { items: move(cat.items, ii, 1) })} aria-label="아래로"><ArrowDown className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-destructive" onClick={() => setCat(cat.id, { items: cat.items.filter(x => x.id !== item.id) })} aria-label="질문 삭제"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                        <Textarea
                          rows={3} value={item.a[lang] || ""} placeholder={item.a.en || "답변"} maxLength={3000} aria-label="답변"
                          onChange={e => setCat(cat.id, { items: cat.items.map(x => (x.id === item.id ? { ...x, a: setText(x.a, e.target.value) } : x)) })}
                        />
                        {lang !== "en" && !item.q[lang] && <p className="text-xs text-muted-foreground">이 언어는 비어 있어 영어로 표시됩니다.</p>}
                      </div>
                    ))}
                    <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setCat(cat.id, { items: [...cat.items, { id: newFaqId("q"), q: {}, a: {} }] })}>
                      <Plus className="h-4 w-4" />질문 추가
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
          <Button
            variant="outline" className="w-full gap-1.5"
            onClick={() => { const id = newFaqId("c"); update({ ...faq, categories: [...faq.categories, { id, icon: "sparkles", title: {}, items: [] }] }); setOpenCat(id); }}
          >
            <Plus className="h-4 w-4" />분류 추가
          </Button>
          <p className="text-xs text-muted-foreground">영어 질문이 비어 있는 질문은 그 언어에서 표시되지 않습니다. 질문이 하나도 없는 분류는 Q&A 페이지에 나오지 않습니다.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminFaq;
