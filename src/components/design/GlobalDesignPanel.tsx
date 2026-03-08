import { useState } from "react";
import { useDesignModeStore } from "@/stores/designModeStore";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const tabs = [
  { id: "typography", label: "서체" },
  { id: "colors", label: "색상" },
  { id: "layout", label: "레이아웃" },
  { id: "buttons", label: "버튼" },
  { id: "header-footer", label: "헤더/푸터" },
];

const fonts = [
  "Pretendard", "Noto Sans KR", "나눔고딕", "나눔명조",
  "DM Sans", "DM Serif Display", "Playfair Display",
];

const GlobalDesignPanel = () => {
  const { activePanel, setActivePanel, globalDesign, updateGlobalDesign } = useDesignModeStore();
  const [activeTab, setActiveTab] = useState("typography");

  if (activePanel !== "global-design") return null;

  const ColorPicker = ({ label, path, value }: { label: string; path: string; value: string }) => (
    <div className="flex items-center justify-between gap-2">
      <Label className="text-xs flex-1">{label}</Label>
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded border border-border" style={{ background: `hsl(${value})` }} />
        <Input
          value={value}
          onChange={e => updateGlobalDesign(path, e.target.value)}
          className="w-32 text-xs h-7"
          placeholder="H S% L%"
        />
      </div>
    </div>
  );

  return (
    <div className="fixed right-0 top-[52px] bottom-0 w-[420px] bg-background border-l border-border shadow-2xl z-[9998] flex flex-col animate-fade-in">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold">공통 디자인</h3>
        <button onClick={() => setActivePanel("none")} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors border-b-2
              ${activeTab === tab.id ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {activeTab === "typography" && (
          <>
            <div>
              <Label className="text-xs">기본 서체</Label>
              <Select value={globalDesign.typography.bodyFont} onValueChange={v => updateGlobalDesign("typography.bodyFont", v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {fonts.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">제목 서체</Label>
              <Select value={globalDesign.typography.headingFont} onValueChange={v => updateGlobalDesign("typography.headingFont", v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {fonts.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">기본 본문 크기: {globalDesign.typography.bodySize}px</Label>
              <Slider value={[globalDesign.typography.bodySize]} onValueChange={([v]) => updateGlobalDesign("typography.bodySize", v)} min={12} max={18} step={1} className="mt-2" />
            </div>
            <div>
              <Label className="text-xs">줄 간격: {globalDesign.typography.lineHeight}</Label>
              <Slider value={[globalDesign.typography.lineHeight * 10]} onValueChange={([v]) => updateGlobalDesign("typography.lineHeight", v / 10)} min={14} max={24} step={2} className="mt-2" />
            </div>
            <div>
              <Label className="text-xs">자간: {globalDesign.typography.letterSpacing}em</Label>
              <Slider value={[(globalDesign.typography.letterSpacing + 0.05) * 100]} onValueChange={([v]) => updateGlobalDesign("typography.letterSpacing", v / 100 - 0.05)} min={0} max={25} step={1} className="mt-2" />
            </div>
            <div className="border-t border-border pt-4 space-y-3">
              <Label className="text-xs font-semibold">크기별 설정</Label>
              {[
                { key: "h1Size", label: "H1", def: 48 },
                { key: "h2Size", label: "H2", def: 36 },
                { key: "h3Size", label: "H3", def: 24 },
              ].map(item => (
                <div key={item.key}>
                  <Label className="text-[10px] text-muted-foreground">{item.label}: {(globalDesign.typography as any)[item.key]}px</Label>
                  <Slider value={[(globalDesign.typography as any)[item.key]]} onValueChange={([v]) => updateGlobalDesign(`typography.${item.key}`, v)} min={14} max={72} step={2} className="mt-1" />
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === "colors" && (
          <div className="space-y-3">
            <ColorPicker label="메인 컬러" path="colors.primary" value={globalDesign.colors.primary} />
            <ColorPicker label="포인트 컬러" path="colors.accent" value={globalDesign.colors.accent} />
            <ColorPicker label="배경 색상" path="colors.background" value={globalDesign.colors.background} />
            <ColorPicker label="본문 텍스트색" path="colors.bodyText" value={globalDesign.colors.bodyText} />
            <ColorPicker label="제목 텍스트색" path="colors.headingText" value={globalDesign.colors.headingText} />
            <ColorPicker label="링크 색상" path="colors.linkColor" value={globalDesign.colors.linkColor} />
            <ColorPicker label="링크 Hover 색상" path="colors.linkHover" value={globalDesign.colors.linkHover} />
            <ColorPicker label="버튼 기본색" path="colors.buttonBg" value={globalDesign.colors.buttonBg} />
            <ColorPicker label="버튼 텍스트색" path="colors.buttonText" value={globalDesign.colors.buttonText} />
            <ColorPicker label="헤더 배경색" path="colors.headerBg" value={globalDesign.colors.headerBg} />
            <ColorPicker label="푸터 배경색" path="colors.footerBg" value={globalDesign.colors.footerBg} />
          </div>
        )}

        {activeTab === "layout" && (
          <>
            <div>
              <Label className="text-xs">본문 폭: {globalDesign.layout.maxWidth}px</Label>
              <Select value={String(globalDesign.layout.maxWidth)} onValueChange={v => updateGlobalDesign("layout.maxWidth", parseInt(v))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[1100, 1200, 1400, 1600, 1920].map(w => (
                    <SelectItem key={w} value={String(w)}>{w === 1920 ? "전체너비" : `${w}px`}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">섹션 패딩 상하: {globalDesign.layout.sectionPaddingY}px</Label>
              <Slider value={[globalDesign.layout.sectionPaddingY]} onValueChange={([v]) => updateGlobalDesign("layout.sectionPaddingY", v)} min={20} max={120} step={10} className="mt-2" />
            </div>
            <div>
              <Label className="text-xs">섹션 패딩 좌우: {globalDesign.layout.sectionPaddingX}px</Label>
              <Slider value={[globalDesign.layout.sectionPaddingX]} onValueChange={([v]) => updateGlobalDesign("layout.sectionPaddingX", v)} min={0} max={80} step={10} className="mt-2" />
            </div>
            <div>
              <Label className="text-xs">모서리 둥글기: {globalDesign.layout.borderRadius}px</Label>
              <Slider value={[globalDesign.layout.borderRadius]} onValueChange={([v]) => updateGlobalDesign("layout.borderRadius", v)} min={0} max={24} step={4} className="mt-2" />
            </div>
          </>
        )}

        {activeTab === "buttons" && (
          <>
            <div>
              <Label className="text-xs">버튼 모양</Label>
              <Select value={globalDesign.button.shape} onValueChange={v => updateGlobalDesign("button.shape", v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="square">직각</SelectItem>
                  <SelectItem value="rounded">약간둥글</SelectItem>
                  <SelectItem value="pill">완전둥글 (Pill)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">버튼 타입</Label>
              <Select value={globalDesign.button.type} onValueChange={v => updateGlobalDesign("button.type", v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="filled">채워진</SelectItem>
                  <SelectItem value="outline">외곽선</SelectItem>
                  <SelectItem value="text">텍스트만</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">버튼 크기</Label>
              <Select value={globalDesign.button.size} onValueChange={v => updateGlobalDesign("button.size", v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sm">소</SelectItem>
                  <SelectItem value="md">중</SelectItem>
                  <SelectItem value="lg">대</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">텍스트 대소문자</Label>
              <Select value={globalDesign.button.textTransform} onValueChange={v => updateGlobalDesign("button.textTransform", v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">그대로</SelectItem>
                  <SelectItem value="uppercase">대문자</SelectItem>
                  <SelectItem value="lowercase">소문자</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Hover 효과</Label>
              <Select value={globalDesign.button.hoverEffect} onValueChange={v => updateGlobalDesign("button.hoverEffect", v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="lighten">밝아짐</SelectItem>
                  <SelectItem value="darken">어두워짐</SelectItem>
                  <SelectItem value="color-change">색상변경</SelectItem>
                  <SelectItem value="none">없음</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Preview */}
            <div className="border-t border-border pt-4">
              <Label className="text-xs text-muted-foreground mb-2 block">미리보기</Label>
              <button
                className="px-6 py-2.5 text-sm font-medium transition-all"
                style={{
                  background: globalDesign.button.type === "filled" ? `hsl(${globalDesign.colors.buttonBg})` : "transparent",
                  color: globalDesign.button.type === "filled" ? `hsl(${globalDesign.colors.buttonText})` : `hsl(${globalDesign.colors.buttonBg})`,
                  border: globalDesign.button.type === "outline" ? `2px solid hsl(${globalDesign.colors.buttonBg})` : "none",
                  borderRadius: globalDesign.button.shape === "pill" ? "999px" : globalDesign.button.shape === "rounded" ? "8px" : "0",
                  textTransform: globalDesign.button.textTransform as any,
                }}
              >
                버튼 미리보기
              </button>
            </div>
          </>
        )}

        {activeTab === "header-footer" && (
          <>
            <div className="space-y-4">
              <h4 className="text-xs font-semibold">헤더</h4>
              <div>
                <Label className="text-xs">헤더 높이: {globalDesign.header.height}px</Label>
                <Slider value={[globalDesign.header.height]} onValueChange={([v]) => updateGlobalDesign("header.height", v)} min={52} max={100} step={4} className="mt-2" />
              </div>
              <div>
                <Label className="text-xs">헤더 배경</Label>
                <Select value={globalDesign.header.background} onValueChange={v => updateGlobalDesign("header.background", v)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="white">흰색</SelectItem>
                    <SelectItem value="dark">다크</SelectItem>
                    <SelectItem value="transparent">투명</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs">겹치기 기본값</Label>
                <Switch checked={globalDesign.header.overlap} onCheckedChange={v => updateGlobalDesign("header.overlap", v)} />
              </div>
              <div>
                <Label className="text-xs">로고 크기: {globalDesign.header.logoSize}%</Label>
                <Slider value={[globalDesign.header.logoSize]} onValueChange={([v]) => updateGlobalDesign("header.logoSize", v)} min={50} max={200} step={10} className="mt-2" />
              </div>
            </div>

            <div className="border-t border-border pt-4 space-y-4">
              <h4 className="text-xs font-semibold">푸터</h4>
              <div>
                <Label className="text-xs">푸터 배경색</Label>
                <Input value={globalDesign.footer.background} onChange={e => updateGlobalDesign("footer.background", e.target.value)} className="mt-1" placeholder="H S% L%" />
              </div>
              <div>
                <Label className="text-xs">푸터 레이아웃</Label>
                <Select value={globalDesign.footer.layout} onValueChange={v => updateGlobalDesign("footer.layout", v)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1col">1열</SelectItem>
                    <SelectItem value="2col">2열</SelectItem>
                    <SelectItem value="3col">3열</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="p-3 border-t border-border">
        <Button onClick={() => { toast.success("디자인 설정이 저장되었습니다."); }} className="w-full">저장</Button>
      </div>
    </div>
  );
};

export default GlobalDesignPanel;
