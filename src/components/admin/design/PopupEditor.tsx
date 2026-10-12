import { useState } from "react";
import { ChevronDown, ChevronUp, Copy, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ImageUploader from "@/components/admin/ImageUploader";
import { MAX_POPUPS, POPUP_POSITIONS, newPopup, type SitePopup } from "@/lib/design";

interface PopupEditorProps {
  popups: SitePopup[];
  // `key` groups rapid edits of one field into a single undo step.
  onChange: (key: string, popups: SitePopup[]) => void;
}

const Field = ({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label>{label}</Label>
    {children}
    {hint && <p className="text-xs text-muted-foreground leading-relaxed">{hint}</p>}
  </div>
);

const status = (p: SitePopup) => {
  if (!p.enabled) return { label: "꺼짐", className: "bg-muted text-muted-foreground" };
  if (p.type === "image" ? !p.image.trim() : !p.html.trim()) return { label: "내용 없음", className: "bg-amber-100 text-amber-800" };
  const now = Date.now();
  if (p.startsAt && new Date(p.startsAt).getTime() > now) return { label: "예약됨", className: "bg-blue-100 text-blue-800" };
  if (p.endsAt && new Date(p.endsAt).getTime() < now) return { label: "기간 종료", className: "bg-muted text-muted-foreground" };
  return { label: "노출 중", className: "bg-emerald-100 text-emerald-800" };
};

const PopupEditor = ({ popups, onChange }: PopupEditorProps) => {
  const [openId, setOpenId] = useState<string | null>(null);

  const patch = (id: string, field: keyof SitePopup, value: SitePopup[keyof SitePopup]) =>
    onChange(`popup-${id}-${field}`, popups.map(p => (p.id === id ? { ...p, [field]: value } : p)));

  const add = () => {
    const popup = newPopup();
    onChange(`popup-add-${popup.id}`, [...popups, popup]);
    setOpenId(popup.id);
  };

  const duplicate = (p: SitePopup) => {
    const copy = { ...p, id: newPopup().id, name: `${p.name} (복사)`.slice(0, 60) };
    onChange(`popup-add-${copy.id}`, [...popups, copy]);
    setOpenId(copy.id);
  };

  const remove = (p: SitePopup) => {
    if (!window.confirm(`'${p.name}' 팝업을 삭제할까요?`)) return;
    onChange(`popup-remove-${p.id}-${Date.now()}`, popups.filter(x => x.id !== p.id));
  };

  return (
    <div className="space-y-3">
      {popups.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4 border border-dashed border-border rounded-md">
          등록된 팝업이 없습니다
        </p>
      )}

      {popups.map(p => {
        const open = openId === p.id;
        const st = status(p);
        const position = POPUP_POSITIONS.find(x => x.value === p.position)?.label;
        return (
          <div key={p.id} className="rounded-md border border-border bg-background">
            <div className="flex items-center gap-2 p-2.5">
              <button className="min-w-0 flex-1 text-left" onClick={() => setOpenId(open ? null : p.id)} aria-expanded={open}>
                <p className="text-sm font-medium truncate">{p.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  <span className={`inline-block rounded px-1.5 py-0.5 mr-1.5 ${st.className}`}>{st.label}</span>
                  {position} · {p.type === "image" ? "이미지" : "코드"}
                </p>
              </button>
              <Switch checked={p.enabled} onCheckedChange={v => patch(p.id, "enabled", v)} aria-label={`${p.name} 사용`} />
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => setOpenId(open ? null : p.id)} aria-label={open ? "접기" : "펼치기"}>
                {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>

            {open && (
              <div className="border-t border-border p-3 space-y-4">
                <Field label="이름" hint="관리용 이름입니다. 방문자에게는 보이지 않습니다">
                  <Input value={p.name} maxLength={60} onChange={e => patch(p.id, "name", e.target.value)} />
                </Field>

                <Field label="내용 종류">
                  <div className="grid grid-cols-2 gap-2">
                    <Button type="button" variant={p.type === "image" ? "default" : "outline"} onClick={() => patch(p.id, "type", "image")}>이미지</Button>
                    <Button type="button" variant={p.type === "html" ? "default" : "outline"} onClick={() => patch(p.id, "type", "html")}>코드 (HTML·JS)</Button>
                  </div>
                </Field>

                {p.type === "image" ? (
                  <>
                    <Field label="이미지">
                      <ImageUploader value={p.image} onChange={url => patch(p.id, "image", url)} folder="popups" aspect="free" />
                    </Field>
                    <Field label="클릭 시 이동 (선택)">
                      <Input value={p.link} maxLength={500} placeholder="/products 또는 https://..." onChange={e => patch(p.id, "link", e.target.value)} />
                    </Field>
                  </>
                ) : (
                  <>
                    <Field
                      label="HTML · CSS · JavaScript"
                      hint="<style>와 <script>를 함께 쓸 수 있습니다. 코드는 팝업 안에서만 실행되어 쇼핑몰 화면을 깨뜨리지 않습니다. 링크는 쇼핑몰 창에서 열립니다."
                    >
                      <Textarea
                        value={p.html}
                        rows={10}
                        maxLength={20000}
                        spellCheck={false}
                        className="font-mono text-xs leading-relaxed"
                        placeholder={'<div style="padding:24px;text-align:center">\n  <h2>Welcome</h2>\n  <a href="/products">Shop now</a>\n</div>'}
                        onChange={e => patch(p.id, "html", e.target.value)}
                      />
                    </Field>
                    <Field label="높이 (px)">
                      <Input type="number" min={120} max={800} value={p.height} onChange={e => patch(p.id, "height", Number(e.target.value) || 0)} />
                    </Field>
                  </>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <Field label="위치">
                    <Select value={p.position} onValueChange={v => patch(p.id, "position", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{POPUP_POSITIONS.map(x => <SelectItem key={x.value} value={x.value}>{x.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </Field>
                  <Field label="너비 (px)">
                    <Input type="number" min={240} max={720} value={p.width} onChange={e => patch(p.id, "width", Number(e.target.value) || 0)} />
                  </Field>
                  <Field label="노출 페이지">
                    <Select value={p.pages} onValueChange={v => patch(p.id, "pages", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">모든 페이지</SelectItem>
                        <SelectItem value="home">홈만</SelectItem>
                        <SelectItem value="products">상품 페이지만</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="기기">
                    <Select value={p.device} onValueChange={v => patch(p.id, "device", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">PC + 모바일</SelectItem>
                        <SelectItem value="desktop">PC만</SelectItem>
                        <SelectItem value="mobile">모바일만</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed -mt-1">
                  모바일에서는 화면이 좁아 위치와 관계없이 가운데에 하나씩 표시됩니다.
                </p>

                <Field label="시작 일시 (선택)">
                  <Input type="datetime-local" value={p.startsAt} onChange={e => patch(p.id, "startsAt", e.target.value)} />
                </Field>
                <Field label="종료 일시 (선택)">
                  <Input type="datetime-local" value={p.endsAt} onChange={e => patch(p.id, "endsAt", e.target.value)} />
                </Field>

                <Field label="다시 보지 않기 버튼">
                  <Select value={p.hideOption} onValueChange={v => patch(p.id, "hideOption", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">오늘 하루 보지 않기</SelectItem>
                      <SelectItem value="week">일주일 동안 보지 않기</SelectItem>
                      <SelectItem value="none">버튼 없음 (닫기만)</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Button variant="outline" className="gap-1.5" onClick={() => duplicate(p)} disabled={popups.length >= MAX_POPUPS}><Copy className="h-4 w-4" />복제</Button>
                  <Button variant="outline" className="gap-1.5 text-destructive hover:text-destructive" onClick={() => remove(p)}><Trash2 className="h-4 w-4" />삭제</Button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      <Button variant="outline" className="w-full gap-1.5" onClick={add} disabled={popups.length >= MAX_POPUPS}>
        <Plus className="h-4 w-4" />팝업 추가
      </Button>
      <p className="text-xs text-muted-foreground leading-relaxed">
        팝업은 최대 {MAX_POPUPS}개까지 만들 수 있습니다. 같은 위치의 팝업은 나란히(가운데) 또는 위아래(모서리)로 함께 표시됩니다.
      </p>
    </div>
  );
};

export default PopupEditor;
