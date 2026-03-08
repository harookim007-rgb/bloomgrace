import { useState } from "react";
import { useDesignModeStore } from "@/stores/designModeStore";
import { X } from "lucide-react";
import { toast } from "sonner";

const sectionTemplates = [
  { group: "히어로", items: [
    { id: "hero-full", label: "풀스크린 히어로", desc: "전체 화면 배경 이미지" },
    { id: "hero-split", label: "분할 히어로", desc: "텍스트 + 이미지 분할" },
    { id: "hero-slider", label: "슬라이더 히어로", desc: "여러 이미지 슬라이드" },
    { id: "hero-video", label: "비디오 히어로", desc: "배경 영상 히어로" },
  ]},
  { group: "텍스트+이미지", items: [
    { id: "text-img-left", label: "이미지 좌측", desc: "좌측 이미지 + 우측 텍스트" },
    { id: "text-img-right", label: "이미지 우측", desc: "좌측 텍스트 + 우측 이미지" },
    { id: "text-img-overlap", label: "오버랩", desc: "이미지 위에 텍스트" },
    { id: "text-img-grid", label: "그리드", desc: "2x2 이미지+텍스트 그리드" },
    { id: "text-center", label: "중앙 텍스트", desc: "가운데 정렬 텍스트" },
    { id: "text-columns", label: "컬럼 텍스트", desc: "2-3 컬럼 레이아웃" },
  ]},
  { group: "상품 그리드", items: [
    { id: "product-4col", label: "4열 그리드", desc: "4열 상품 그리드" },
    { id: "product-3col", label: "3열 그리드", desc: "3열 상품 그리드" },
    { id: "product-slider", label: "상품 슬라이더", desc: "가로 스크롤 상품" },
  ]},
  { group: "갤러리", items: [
    { id: "gallery-grid", label: "그리드 갤러리", desc: "정렬 그리드" },
    { id: "gallery-masonry", label: "마소니 갤러리", desc: "핀터레스트 스타일" },
    { id: "gallery-slider", label: "슬라이더 갤러리", desc: "전체 너비 슬라이더" },
  ]},
  { group: "리뷰/후기", items: [
    { id: "review-cards", label: "리뷰 카드", desc: "카드형 후기" },
    { id: "review-slider", label: "리뷰 슬라이더", desc: "슬라이드형 후기" },
  ]},
  { group: "CTA/배너", items: [
    { id: "cta-full", label: "풀너비 CTA", desc: "전체 너비 배너" },
    { id: "cta-split", label: "분할 CTA", desc: "이미지 + 액션" },
    { id: "cta-newsletter", label: "뉴스레터 CTA", desc: "구독 유도" },
    { id: "cta-countdown", label: "카운트다운 CTA", desc: "타임 세일" },
  ]},
  { group: "푸터형", items: [
    { id: "footer-minimal", label: "미니멀 푸터", desc: "간결한 하단" },
    { id: "footer-full", label: "풀 푸터", desc: "3열 정보 푸터" },
  ]},
  { group: "빈 섹션", items: [
    { id: "empty", label: "빈 섹션", desc: "빈 섹션에서 시작" },
  ]},
];

const SectionAdderPanel = () => {
  const { activePanel, setActivePanel, addSection, selectedSectionId } = useDesignModeStore();

  if (activePanel !== "section") return null;

  const handleAddSection = (templateId: string, label: string) => {
    const newSection = {
      id: `section-${Date.now()}`,
      type: templateId,
      label,
      widgets: [],
      settings: {
        background: "",
        backgroundImage: "",
        paddingTop: 80,
        paddingBottom: 80,
        maxWidth: "1200px",
        visibility: "all" as const,
        parallax: false,
      },
    };
    addSection(newSection, selectedSectionId || undefined);
    toast.success(`${label} 섹션이 추가되었습니다.`);
    setActivePanel("none");
  };

  return (
    <div className="fixed inset-0 top-[52px] bg-black/50 z-[9998] flex items-start justify-center pt-8 animate-fade-in" onClick={() => setActivePanel("none")}>
      <div className="bg-background w-[720px] max-h-[80vh] rounded-lg shadow-2xl border border-border overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <h3 className="text-sm font-semibold">섹션 추가</h3>
          <button onClick={() => setActivePanel("none")} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(80vh-52px)] p-5 space-y-6">
          {sectionTemplates.map(group => (
            <div key={group.group}>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{group.group}</h4>
              <div className="grid grid-cols-3 gap-2">
                {group.items.map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleAddSection(item.id, item.label)}
                    className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border/50 hover:border-primary/40 hover:bg-primary/5 transition-all text-center group"
                  >
                    <div className="w-full h-16 rounded bg-muted/50 border border-border/30 flex items-center justify-center">
                      <span className="text-[9px] text-muted-foreground uppercase tracking-wider">{item.label}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SectionAdderPanel;
