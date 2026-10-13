import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, ChevronDown, ChevronUp, Copy, Eye, EyeOff, Plus, Trash2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ImageUploader from "@/components/admin/ImageUploader";
import {
  BLOCK_GROUPS, BLOCK_TYPES, MAX_BLOCKS, cloneBlock, newBlock,
  type BlockField, type BlockItem, type BlockType, type HomeBlock,
} from "@/lib/homeBlocks";

interface BlockEditorProps {
  blocks: HomeBlock[];
  // `key` groups rapid edits of one field into a single undo step.
  onChange: (key: string, blocks: HomeBlock[]) => void;
  openId: string | null;
  setOpenId: (id: string | null) => void;
  // Scrolls the preview to a block.
  onFocus: (id: string) => void;
}

const DEVICE_LABEL = { all: "PC + 모바일", desktop: "PC만", mobile: "모바일만" } as const;
const BG_LABEL = { none: "없음", soft: "브랜드 연한색", tint: "연한 회색", dark: "어둡게" } as const;
const PAD_LABEL = { small: "좁게", normal: "기본", large: "넓게" } as const;

const Field = ({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label>{label}</Label>
    {children}
    {hint && <p className="text-xs text-muted-foreground leading-relaxed">{hint}</p>}
  </div>
);

// Short description shown in the list so blocks of the same type can be told apart.
const summary = (b: HomeBlock) => {
  const text = [b.s.heading, b.s.title, b.s.alt, b.s.url].find(v => typeof v === "string" && v.trim());
  if (text) return text as string;
  if (b.type === "products") return { featured: "추천 상품", new: "신상품", category: "카테고리 상품" }[b.s.source as string] || "";
  if (b.type === "spacer") return `${b.s.height}px`;
  return BLOCK_TYPES[b.type].desc;
};

const ItemsField = ({ field, items, onChange }: { field: Extract<BlockField, { kind: "items" }>; items: BlockItem[]; onChange: (items: BlockItem[]) => void }) => {
  const set = (i: number, patch: Partial<BlockItem>) => onChange(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  const move = (i: number, dir: -1 | 1) => {
    const next = [...items];
    [next[i], next[i + dir]] = [next[i + dir], next[i]];
    onChange(next);
  };
  return (
    <div className="space-y-2">
      {items.map((it, i) => (
        <div key={i} className="rounded-md border border-border p-2.5 space-y-2 bg-muted/30">
          <div className="flex items-center gap-1">
            <Input value={it.title} maxLength={160} placeholder={field.titleLabel} aria-label={field.titleLabel} className="h-9 min-w-0 flex-1" onChange={e => set(i, { title: e.target.value })} />
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" disabled={i === 0} onClick={() => move(i, -1)} aria-label="위로"><ArrowUp className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" disabled={i === items.length - 1} onClick={() => move(i, 1)} aria-label="아래로"><ArrowDown className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-destructive" onClick={() => onChange(items.filter((_, idx) => idx !== i))} aria-label="삭제"><Trash2 className="h-4 w-4" /></Button>
          </div>
          <Textarea value={it.body} rows={2} maxLength={2000} placeholder={field.bodyLabel} aria-label={field.bodyLabel} onChange={e => set(i, { body: e.target.value })} />
        </div>
      ))}
      <Button variant="outline" size="sm" className="w-full gap-1.5" disabled={items.length >= field.max} onClick={() => onChange([...items, { title: "", body: "" }])}>
        <Plus className="h-4 w-4" />{field.label} 추가 ({items.length}/{field.max})
      </Button>
    </div>
  );
};

const BlockEditor = ({ blocks, onChange, openId, setOpenId, onFocus }: BlockEditorProps) => {
  const [picking, setPicking] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    supabase.from("categories").select("id, name").order("sort_order").then(({ data }) => setCategories(data || []));
  }, []);

  const patch = (id: string, change: Partial<HomeBlock>, key: string) =>
    onChange(`block-${id}-${key}`, blocks.map(b => (b.id === id ? { ...b, ...change } : b)));
  const setting = (b: HomeBlock, key: string, value: unknown) => patch(b.id, { s: { ...b.s, [key]: value } }, key);

  const add = (type: BlockType) => {
    const block = newBlock(type);
    // A new block goes right below the one being edited, otherwise at the end.
    const at = openId ? blocks.findIndex(b => b.id === openId) + 1 : blocks.length;
    const next = [...blocks];
    next.splice(at || blocks.length, 0, block);
    onChange(`block-add-${block.id}`, next);
    setPicking(false);
    setOpenId(block.id);
    window.setTimeout(() => onFocus(block.id), 300);
  };

  const move = (i: number, dir: -1 | 1) => {
    const next = [...blocks];
    [next[i], next[i + dir]] = [next[i + dir], next[i]];
    onChange(`block-move-${Date.now()}`, next);
    window.setTimeout(() => onFocus(next[i + dir].id), 300);
  };

  const duplicate = (b: HomeBlock, i: number) => {
    const copy = cloneBlock(b);
    const next = [...blocks];
    next.splice(i + 1, 0, copy);
    onChange(`block-add-${copy.id}`, next);
    setOpenId(copy.id);
  };

  const remove = (b: HomeBlock) => {
    if (!window.confirm(`'${BLOCK_TYPES[b.type].label}' 블록을 삭제할까요?`)) return;
    onChange(`block-remove-${b.id}-${Date.now()}`, blocks.filter(x => x.id !== b.id));
    if (openId === b.id) setOpenId(null);
  };

  const toggle = (b: HomeBlock) => {
    const opening = openId !== b.id;
    setOpenId(opening ? b.id : null);
    if (opening && b.visible) onFocus(b.id);
  };

  const renderField = (b: HomeBlock, f: BlockField) => {
    if (f.showIf && !f.showIf(b.s)) return null;
    const value = b.s[f.key];
    let control: React.ReactNode;
    switch (f.kind) {
      case "select":
        control = (
          <Select value={String(value)} onValueChange={v => setting(b, f.key, f.options.find(o => String(o.value) === v)?.value)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{f.options.map(o => <SelectItem key={String(o.value)} value={String(o.value)}>{o.label}</SelectItem>)}</SelectContent>
          </Select>
        );
        break;
      case "category":
        control = categories.length === 0
          ? <p className="text-sm text-muted-foreground">등록된 카테고리가 없습니다. '카테고리 관리'에서 먼저 만들어 주세요.</p>
          : (
            <Select value={value || undefined} onValueChange={v => setting(b, f.key, v)}>
              <SelectTrigger><SelectValue placeholder="카테고리를 선택하세요" /></SelectTrigger>
              <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          );
        break;
      case "image":
        control = <ImageUploader value={value} onChange={url => setting(b, f.key, url)} folder="home" aspect="free" />;
        break;
      case "textarea":
        control = <Textarea value={value} rows={4} maxLength={f.max} onChange={e => setting(b, f.key, e.target.value)} />;
        break;
      case "code":
        control = <Textarea value={value} rows={10} maxLength={f.max} spellCheck={false} className="font-mono text-xs leading-relaxed" onChange={e => setting(b, f.key, e.target.value)} />;
        break;
      case "number":
        control = <Input type="number" min={f.min} max={f.max} value={value} onChange={e => setting(b, f.key, Number(e.target.value) || 0)} />;
        break;
      case "items":
        control = <ItemsField field={f} items={value as BlockItem[]} onChange={items => setting(b, f.key, items)} />;
        break;
      default:
        control = <Input value={value} maxLength={f.max} placeholder={f.placeholder} onChange={e => setting(b, f.key, e.target.value)} />;
    }
    return <Field key={f.key} label={f.label} hint={f.hint}>{control}</Field>;
  };

  const full = blocks.length >= MAX_BLOCKS;
  const noneVisible = blocks.length > 0 && !blocks.some(b => b.visible);

  return (
    <div className="space-y-3">
      <Button className="w-full gap-1.5" onClick={() => setPicking(p => !p)} disabled={full} aria-expanded={picking}>
        {picking ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}{picking ? "닫기" : "블록 추가"}
      </Button>

      {picking && (
        <div className="rounded-md border border-border bg-muted/30 p-3 space-y-3">
          <p className="text-xs text-muted-foreground">
            {openId ? "선택한 블록 바로 아래에 추가됩니다." : "맨 아래에 추가됩니다. 추가한 뒤 순서를 바꿀 수 있습니다."}
          </p>
          {BLOCK_GROUPS.map(group => (
            <div key={group} className="space-y-1.5">
              <p className="text-xs font-semibold text-muted-foreground">{group}</p>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(BLOCK_TYPES) as BlockType[]).filter(t => BLOCK_TYPES[t].group === group).map(type => {
                  const def = BLOCK_TYPES[type];
                  const used = !!def.single && blocks.some(b => b.type === type);
                  return (
                    <button
                      key={type}
                      disabled={used}
                      onClick={() => add(type)}
                      className="rounded-md border border-border bg-card p-2.5 text-left transition-colors hover:border-primary disabled:opacity-50 disabled:hover:border-border disabled:cursor-not-allowed"
                    >
                      <span className="block text-sm font-medium truncate">{def.label}</span>
                      <span className="block text-xs text-muted-foreground leading-snug">{used ? "이미 사용 중 (한 개만 가능)" : def.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {blocks.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-6 border border-dashed border-border rounded-md">
          홈 화면이 비어 있습니다. '블록 추가'로 시작하세요.
        </p>
      )}
      {noneVisible && (
        <p className="text-sm rounded-md border border-amber-200 bg-amber-50 text-amber-900 px-3 py-2">
          모든 블록이 숨김 상태라 홈 화면 본문이 비어 보입니다.
        </p>
      )}

      <ol className="space-y-2">
        {blocks.map((b, i) => {
          const def = BLOCK_TYPES[b.type];
          const open = openId === b.id;
          return (
            <li key={b.id} className={`rounded-md border bg-background ${open ? "border-primary" : "border-border"}`}>
              <div className="flex items-center gap-1 p-2">
                <button className="min-w-0 flex-1 text-left px-1" onClick={() => toggle(b)} aria-expanded={open}>
                  <span className={`block text-sm font-medium truncate ${b.visible ? "" : "text-muted-foreground line-through"}`}>
                    <span className="text-muted-foreground tabular-nums mr-1.5">{i + 1}</span>{def.label}
                  </span>
                  <span className="block text-xs text-muted-foreground truncate">
                    {b.device !== "all" && <span className="mr-1.5 rounded bg-muted px-1.5 py-0.5">{DEVICE_LABEL[b.device]}</span>}
                    {summary(b)}
                  </span>
                </button>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" disabled={i === 0} onClick={() => move(i, -1)} aria-label={`${def.label} 위로`}><ArrowUp className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" disabled={i === blocks.length - 1} onClick={() => move(i, 1)} aria-label={`${def.label} 아래로`}><ArrowDown className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => patch(b.id, { visible: !b.visible }, `visible-${Date.now()}`)} aria-label={`${def.label} ${b.visible ? "숨기기" : "보이기"}`}>
                  {b.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => toggle(b)} aria-label={open ? "설정 접기" : "설정 펼치기"}>
                  {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>

              {open && (
                <div className="border-t border-border p-3 space-y-4">
                  {def.fields.length === 0 && <p className="text-sm text-muted-foreground">이 블록은 따로 설정할 내용이 없습니다.</p>}
                  {def.fields.map(f => renderField(b, f))}

                  <div className={`grid gap-3 ${def.chrome ? "grid-cols-2" : "grid-cols-1"}`}>
                    <Field label="노출 기기">
                      <Select value={b.device} onValueChange={v => patch(b.id, { device: v as HomeBlock["device"] }, "device")}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{Object.entries(DEVICE_LABEL).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
                      </Select>
                    </Field>
                    {def.chrome && (
                      <>
                        <Field label="배경">
                          <Select value={b.bg} onValueChange={v => patch(b.id, { bg: v as HomeBlock["bg"] }, "bg")}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>{Object.entries(BG_LABEL).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
                          </Select>
                        </Field>
                        <Field label="위아래 여백">
                          <Select value={b.pad} onValueChange={v => patch(b.id, { pad: v as HomeBlock["pad"] }, "pad")}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>{Object.entries(PAD_LABEL).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
                          </Select>
                        </Field>
                      </>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Button variant="outline" className="gap-1.5" onClick={() => duplicate(b, i)} disabled={full || !!def.single}><Copy className="h-4 w-4" />복제</Button>
                    <Button variant="outline" className="gap-1.5 text-destructive hover:text-destructive" onClick={() => remove(b)}><Trash2 className="h-4 w-4" />삭제</Button>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ol>

      <p className="text-xs text-muted-foreground leading-relaxed">
        블록은 최대 {MAX_BLOCKS}개까지 넣을 수 있습니다. 미리보기에서 블록에 마우스를 올리면 나오는 '편집' 표시를 눌러도 설정이 열립니다.
        직접 입력한 문구는 모든 언어에서 그대로 표시됩니다.
      </p>
    </div>
  );
};

export default BlockEditor;
