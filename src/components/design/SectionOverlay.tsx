import { useDesignModeStore } from "@/stores/designModeStore";
import { GripVertical, Settings, Copy, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

const SectionOverlay = () => {
  const { editMode, sections, selectedSectionId, setSelectedSection, setActivePanel, duplicateSection, deleteSection, addSection } = useDesignModeStore();

  if (!editMode) return null;

  return (
    <div className="fixed left-0 top-[52px] bottom-0 w-8 z-[9995] flex flex-col pointer-events-none">
      {sections.map((section, idx) => {
        const isSelected = selectedSectionId === section.id;
        return (
          <div key={section.id} className="relative group pointer-events-auto" style={{ flex: 1 }}>
            {/* Section indicator */}
            <div
              className={`absolute inset-0 flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer
                ${isSelected ? "bg-primary/10 border-r-2 border-primary" : "hover:bg-muted/50 hover:border-r border-border/30"}`}
              onClick={() => setSelectedSection(isSelected ? null : section.id)}
            >
              <GripVertical className="h-3 w-3 text-muted-foreground/40" />
              <span className="text-[7px] text-muted-foreground writing-vertical" style={{ writingMode: "vertical-lr" }}>{section.label}</span>
            </div>

            {/* Section actions (show on hover/select) */}
            {isSelected && (
              <div className="absolute left-9 top-1/2 -translate-y-1/2 flex flex-col gap-1 bg-background border border-border rounded-lg shadow-lg p-1">
                <button onClick={() => setActivePanel("section-settings")} className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground" title="섹션 설정">
                  <Settings className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => duplicateSection(section.id)} className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground" title="복제">
                  <Copy className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => {
                    if (window.confirm("이 섹션을 삭제하시겠습니까?")) {
                      deleteSection(section.id);
                      toast.info("섹션이 삭제되었습니다.");
                    }
                  }}
                  className="p-1.5 hover:bg-destructive/10 rounded text-muted-foreground hover:text-destructive"
                  title="삭제"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* Add section between */}
            <div className="absolute left-0 right-0 -bottom-2 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-auto z-10">
              <button
                onClick={() => {
                  setActivePanel("section");
                  setSelectedSection(section.id);
                }}
                className="w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SectionOverlay;
