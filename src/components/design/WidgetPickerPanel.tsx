import { useState } from "react";
import { useDesignModeStore } from "@/stores/designModeStore";
import { X, Type, Image, MousePointerClick, Minus, Square, Star, SlidersHorizontal, Video, Grid3X3, Film, ShoppingBag, Trophy, Sparkles, ShoppingCart, Timer, MessageSquare, Award, Mail, Clock, Bell, Share2, Instagram, MessageCircle, Code, Paintbrush, FileCode } from "lucide-react";
import { toast } from "sonner";

const categories = [
  { id: "basic", label: "기본" },
  { id: "media", label: "미디어" },
  { id: "shopping", label: "쇼핑" },
  { id: "marketing", label: "마케팅" },
  { id: "social", label: "소셜" },
  { id: "code", label: "코드" },
];

const widgets: Record<string, { id: string; label: string; icon: any; desc: string }[]> = {
  basic: [
    { id: "text", label: "텍스트", icon: Type, desc: "제목/본문/인용구" },
    { id: "image", label: "이미지", icon: Image, desc: "단일/다중 이미지" },
    { id: "button", label: "버튼", icon: MousePointerClick, desc: "단일/그룹 버튼" },
    { id: "divider", label: "구분선", icon: Minus, desc: "섹션 구분선" },
    { id: "spacer", label: "빈 공간", icon: Square, desc: "여백 추가" },
    { id: "icon", label: "아이콘", icon: Star, desc: "장식 아이콘" },
  ],
  media: [
    { id: "slider", label: "이미지 슬라이더", icon: SlidersHorizontal, desc: "Swiper 슬라이더" },
    { id: "video", label: "동영상", icon: Video, desc: "YouTube/Vimeo/업로드" },
    { id: "gallery", label: "갤러리", icon: Grid3X3, desc: "그리드/마소니/슬라이딩" },
    { id: "bg-video", label: "배경 영상 섹션", icon: Film, desc: "배경 비디오" },
  ],
  shopping: [
    { id: "product-grid", label: "상품 그리드", icon: ShoppingBag, desc: "상품 카탈로그" },
    { id: "best-products", label: "베스트 상품", icon: Trophy, desc: "인기 상품 모음" },
    { id: "new-products", label: "신상품", icon: Sparkles, desc: "최신 상품" },
    { id: "cart-button", label: "장바구니 버튼", icon: ShoppingCart, desc: "장바구니 CTA" },
    { id: "countdown-sale", label: "타임세일", icon: Timer, desc: "카운트다운 세일" },
  ],
  marketing: [
    { id: "review-slider", label: "리뷰 슬라이더", icon: MessageSquare, desc: "고객 후기" },
    { id: "brand-badge", label: "브랜드 배지", icon: Award, desc: "신뢰 아이콘" },
    { id: "newsletter", label: "뉴스레터 구독", icon: Mail, desc: "구독 폼" },
    { id: "countdown", label: "카운트다운 타이머", icon: Clock, desc: "이벤트 카운트다운" },
    { id: "notice-bar", label: "공지사항 바", icon: Bell, desc: "상단 공지" },
  ],
  social: [
    { id: "sns-links", label: "SNS 링크 모음", icon: Share2, desc: "소셜 미디어 링크" },
    { id: "instagram", label: "인스타그램 피드", icon: Instagram, desc: "인스타 갤러리" },
    { id: "kakao", label: "카카오채널 버튼", icon: MessageCircle, desc: "카카오톡 상담" },
  ],
  code: [
    { id: "html", label: "HTML 위젯", icon: Code, desc: "커스텀 HTML" },
    { id: "css", label: "CSS 추가", icon: Paintbrush, desc: "스타일 삽입" },
    { id: "js", label: "JS 삽입", icon: FileCode, desc: "스크립트 삽입" },
  ],
};

const WidgetPickerPanel = () => {
  const { activePanel, setActivePanel } = useDesignModeStore();
  const [activeCategory, setActiveCategory] = useState("basic");

  if (activePanel !== "widget") return null;

  const handleAddWidget = (widgetId: string, label: string) => {
    toast.success(`${label} 위젯이 추가되었습니다.`);
  };

  return (
    <div className="fixed left-0 top-[52px] bottom-0 w-[360px] bg-background border-r border-border shadow-2xl z-[9998] flex flex-col animate-fade-in">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold">위젯 추가</h3>
        <button onClick={() => setActivePanel("none")} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Category tabs */}
      <div className="flex border-b border-border overflow-x-auto">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors border-b-2
              ${activeCategory === cat.id ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Widget grid */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="grid grid-cols-2 gap-2">
          {(widgets[activeCategory] || []).map(widget => {
            const Icon = widget.icon;
            return (
              <button
                key={widget.id}
                onClick={() => handleAddWidget(widget.id, widget.label)}
                className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all text-center group cursor-grab active:cursor-grabbing"
                draggable
              >
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div>
                  <p className="text-[11px] font-medium">{widget.label}</p>
                  <p className="text-[9px] text-muted-foreground mt-0.5">{widget.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WidgetPickerPanel;
