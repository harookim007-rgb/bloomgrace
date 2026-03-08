import { useDesignModeStore } from "@/stores/designModeStore";
import { 
  Menu, Plus, LayoutGrid, Undo2, Redo2, Monitor, Smartphone, 
  Palette, Eye, RotateCcw, Upload, LogOut, PanelTop, Layers
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const DesignModeToolbar = () => {
  const {
    editMode, viewport, currentPageName, activePanel, isDirty, lastAutoSave,
    headerOverlap, headerEditMode,
    setEditMode, setViewport, setActivePanel, setHeaderOverlap, setHeaderEditMode,
    undo, redo, undoStack, redoStack, publish, revertToPublished,
  } = useDesignModeStore();

  if (!editMode) return null;

  const handlePublish = () => {
    publish();
    toast.success("게시 완료! 방문자에게 바로 반영됩니다.");
  };

  const handleRevert = () => {
    if (window.confirm("마지막 게시 이후의 모든 변경사항이 사라집니다. 되돌리시겠습니까?")) {
      revertToPublished();
      toast.info("마지막 게시 상태로 되돌렸습니다.");
    }
  };

  const handlePreview = () => {
    window.open(`${window.location.origin}?preview=true`, "_blank");
  };

  const ToolbarBtn = ({ icon: Icon, label, onClick, active, disabled }: any) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          disabled={disabled}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium rounded transition-colors whitespace-nowrap
            ${active ? "bg-white/20 text-white" : "text-white/70 hover:text-white hover:bg-white/10"}
            ${disabled ? "opacity-30 cursor-not-allowed" : ""}`}
        >
          <Icon className="h-3.5 w-3.5" />
          <span className="hidden lg:inline">{label}</span>
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">{label}</TooltipContent>
    </Tooltip>
  );

  return (
    <div className="fixed top-0 left-0 right-0 h-[52px] bg-[#1A1A1A] text-white z-[9999] flex items-center px-3 gap-1 shadow-2xl select-none">
      {/* Left section */}
      <div className="flex items-center gap-0.5">
        <ToolbarBtn icon={Menu} label="메뉴 관리" onClick={() => setActivePanel(activePanel === "menu" ? "none" : "menu")} active={activePanel === "menu"} />
        <ToolbarBtn icon={Plus} label="위젯 추가" onClick={() => setActivePanel(activePanel === "widget" ? "none" : "widget")} active={activePanel === "widget"} />
        <ToolbarBtn icon={LayoutGrid} label="섹션 추가" onClick={() => setActivePanel(activePanel === "section" ? "none" : "section")} active={activePanel === "section"} />
        <div className="w-px h-6 bg-white/20 mx-1" />
        <ToolbarBtn icon={Undo2} label="실행취소" onClick={undo} disabled={undoStack.length === 0} />
        <ToolbarBtn icon={Redo2} label="재실행" onClick={redo} disabled={redoStack.length === 0} />
      </div>

      {/* Center section */}
      <div className="flex-1 flex items-center justify-center gap-2">
        <span className="text-[10px] text-white/40">홈 &gt;</span>
        <span className="text-[12px] font-medium text-white">{currentPageName}</span>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-0.5">
        <ToolbarBtn icon={PanelTop} label="상단 편집" onClick={() => setHeaderEditMode(!headerEditMode)} active={headerEditMode} />
        <ToolbarBtn icon={Layers} label="겹치기" onClick={() => setHeaderOverlap(!headerOverlap)} active={headerOverlap} />
        <div className="w-px h-6 bg-white/20 mx-1" />

        {/* Viewport toggle */}
        <div className="flex items-center bg-white/10 rounded overflow-hidden">
          <button
            onClick={() => setViewport("desktop")}
            className={`px-2 py-1.5 text-[11px] flex items-center gap-1 transition-colors ${viewport === "desktop" ? "bg-white/20 text-white" : "text-white/50 hover:text-white"}`}
          >
            <Monitor className="h-3.5 w-3.5" /> <span className="hidden xl:inline">PC</span>
          </button>
          <button
            onClick={() => setViewport("mobile")}
            className={`px-2 py-1.5 text-[11px] flex items-center gap-1 transition-colors ${viewport === "mobile" ? "bg-white/20 text-white" : "text-white/50 hover:text-white"}`}
          >
            <Smartphone className="h-3.5 w-3.5" /> <span className="hidden xl:inline">Mobile</span>
          </button>
        </div>

        <div className="w-px h-6 bg-white/20 mx-1" />

        <ToolbarBtn icon={Palette} label="공통 디자인" onClick={() => setActivePanel(activePanel === "global-design" ? "none" : "global-design")} active={activePanel === "global-design"} />
        <ToolbarBtn icon={Eye} label="미리보기" onClick={handlePreview} />
        <ToolbarBtn icon={RotateCcw} label="되돌리기" onClick={handleRevert} />

        <button
          onClick={handlePublish}
          className="ml-2 px-4 py-1.5 bg-primary text-primary-foreground text-[11px] font-semibold rounded hover:bg-primary/90 transition-colors flex items-center gap-1.5"
        >
          <Upload className="h-3.5 w-3.5" />
          게시하기
        </button>

        <button
          onClick={() => setEditMode(false)}
          className="ml-1 px-2.5 py-1.5 text-white/50 hover:text-white text-[11px] transition-colors flex items-center gap-1"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden lg:inline">나가기</span>
        </button>
      </div>

      {/* Auto-save indicator */}
      {lastAutoSave && (
        <div className="absolute bottom-0 right-3 translate-y-full bg-[#1A1A1A]/90 text-[9px] text-white/40 px-2 py-0.5 rounded-b">
          자동저장됨 {lastAutoSave}
        </div>
      )}
      {isDirty && (
        <div className="absolute top-1 right-1 w-2 h-2 bg-yellow-400 rounded-full" title="저장되지 않은 변경사항" />
      )}
    </div>
  );
};

export default DesignModeToolbar;
