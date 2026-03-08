import { useDesignModeStore } from "@/stores/designModeStore";
import { useDesignModeKeyboard } from "@/hooks/useDesignModeKeyboard";
import DesignModeToolbar from "./DesignModeToolbar";
import MenuManagerPanel from "./MenuManagerPanel";
import WidgetPickerPanel from "./WidgetPickerPanel";
import SectionAdderPanel from "./SectionAdderPanel";
import GlobalDesignPanel from "./GlobalDesignPanel";
import SectionOverlay from "./SectionOverlay";

const DesignModeOverlay = () => {
  const { editMode, viewport } = useDesignModeStore();

  if (!editMode) return null;

  useDesignModeKeyboard();

  return (
    <>
      <DesignModeToolbar />
      <MenuManagerPanel />
      <WidgetPickerPanel />
      <SectionAdderPanel />
      <GlobalDesignPanel />
      <SectionOverlay />

      {/* Mobile viewport wrapper indicator */}
      {viewport === "mobile" && (
        <div className="fixed inset-0 top-[52px] pointer-events-none z-[9990] flex justify-center">
          <div className="w-[390px] h-full border-x-2 border-dashed border-primary/30" />
        </div>
      )}
    </>
  );
};

export default DesignModeOverlay;
