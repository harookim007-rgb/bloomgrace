import { useEffect, useState } from "react";
import { X } from "lucide-react";

// A small speech bubble that points at an icon (sign-in, support chat) to explain what it does.
// Closing it keeps it hidden for the rest of the visit.
const HintBubble = ({
  id, text, side, delay = 800, hidden = false,
}: { id: string; text: string; side: "below-right" | "above-right"; delay?: number; hidden?: boolean }) => {
  const key = `hint-closed-${id}`;
  const [shown, setShown] = useState(false);

  useEffect(() => {
    let closed = false;
    try { closed = sessionStorage.getItem(key) === "1"; } catch { /* storage unavailable */ }
    if (closed) return;
    const timer = window.setTimeout(() => setShown(true), delay);
    return () => window.clearTimeout(timer);
  }, [key, delay]);

  if (!shown || hidden) return null;

  const close = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShown(false);
    try { sessionStorage.setItem(key, "1"); } catch { /* storage unavailable */ }
  };

  const below = side === "below-right";
  return (
    <span
      role="status"
      className={`pointer-events-auto absolute right-0 z-[55] flex items-center gap-1.5 whitespace-nowrap rounded-full bg-foreground pl-3.5 pr-1.5 py-1.5 text-xs font-sans font-semibold tracking-wide text-background shadow-luxury animate-fade-in ${below ? "top-full mt-2.5" : "bottom-full mb-3"}`}
    >
      {text}
      <button type="button" onClick={close} aria-label="Close" className="flex h-5 w-5 items-center justify-center rounded-full text-background/70 hover:bg-background/15 hover:text-background">
        <X className="h-3 w-3" />
      </button>
      <span aria-hidden="true" className={`absolute right-4 h-2.5 w-2.5 rotate-45 bg-foreground ${below ? "-top-1" : "-bottom-1"}`} />
    </span>
  );
};

export default HintBubble;
