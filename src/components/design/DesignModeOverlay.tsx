import { useEffect } from "react";
import { useDesignModeStore } from "@/stores/designModeStore";
import DesignModeToolbar from "./DesignModeToolbar";
import MenuManagerPanel from "./MenuManagerPanel";
import WidgetPickerPanel from "./WidgetPickerPanel";
import SectionAdderPanel from "./SectionAdderPanel";
import GlobalDesignPanel from "./GlobalDesignPanel";
import SectionOverlay from "./SectionOverlay";

const DesignModeOverlay = () => {
  const editMode = useDesignModeStore(s => s.editMode);
  const viewport = useDesignModeStore(s => s.viewport);
  const undo = useDesignModeStore(s => s.undo);
  const redo = useDesignModeStore(s => s.redo);
  const isDirty = useDesignModeStore(s => s.isDirty);
  const autoSave = useDesignModeStore(s => s.autoSave);

  // Keyboard shortcuts
  useEffect(() => {
    if (!editMode) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();
        e.shiftKey ? redo() : undo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editMode, undo, redo]);

  // Auto-save every 30s
  useEffect(() => {
    if (!editMode || !isDirty) return;
    const interval = setInterval(autoSave, 30000);
    return () => clearInterval(interval);
  }, [editMode, isDirty, autoSave]);

  // Warn on navigate away
  useEffect(() => {
    if (!editMode || !isDirty) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [editMode, isDirty]);

  if (!editMode) return null;

  return (
    <>
      <DesignModeToolbar />
      <MenuManagerPanel />
      <WidgetPickerPanel />
      <SectionAdderPanel />
      <GlobalDesignPanel />
      <SectionOverlay />
      {viewport === "mobile" && (
        <div className="fixed inset-0 top-[52px] pointer-events-none z-[9990] flex justify-center">
          <div className="w-[390px] h-full border-x-2 border-dashed border-primary/30" />
        </div>
      )}
    </>
  );
};

export default DesignModeOverlay;
