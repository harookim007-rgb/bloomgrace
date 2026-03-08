import { useEffect } from "react";
import { useDesignModeStore } from "@/stores/designModeStore";

/**
 * Hook to add keyboard shortcuts and auto-save for design mode
 */
export const useDesignModeKeyboard = () => {
  const { editMode, undo, redo, autoSave, isDirty } = useDesignModeStore();

  useEffect(() => {
    if (!editMode) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editMode, undo, redo]);

  // Auto-save every 30s
  useEffect(() => {
    if (!editMode || !isDirty) return;
    const interval = setInterval(() => {
      autoSave();
    }, 30000);
    return () => clearInterval(interval);
  }, [editMode, isDirty, autoSave]);

  // Warn on navigate away if dirty
  useEffect(() => {
    if (!editMode || !isDirty) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [editMode, isDirty]);
};
