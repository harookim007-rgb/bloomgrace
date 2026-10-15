import { useEffect, useState } from "react";

// A speech bubble that points at an icon (sign-in, support chat) to explain what it does.
// It shows on every page load and goes away once the visitor hovers over it or taps it.
const HintBubble = ({
  text, side, delay = 600, hidden = false,
}: { text: string; side: "below-right" | "above-right"; delay?: number; hidden?: boolean }) => {
  const [shown, setShown] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setShown(true), delay);
    return () => window.clearTimeout(timer);
  }, [delay]);

  if (!shown || hidden || dismissed) return null;

  const below = side === "below-right";
  return (
    <span
      role="status"
      onMouseEnter={() => setDismissed(true)}
      onClick={() => setDismissed(true)}
      className={`absolute right-0 z-[55] whitespace-nowrap rounded-full border-[1.5px] border-primary bg-white px-4 py-2 text-sm font-sans font-semibold tracking-wide text-primary shadow-[0_8px_24px_-6px_hsl(var(--primary)/0.35)] animate-fade-in cursor-default ${below ? "top-full mt-3" : "bottom-full mb-3.5"}`}
    >
      {text}
      <span
        aria-hidden="true"
        className={`absolute right-5 h-3 w-3 rotate-45 bg-white border-primary ${below ? "-top-[7px] border-l-[1.5px] border-t-[1.5px]" : "-bottom-[7px] border-r-[1.5px] border-b-[1.5px]"}`}
      />
    </span>
  );
};

export default HintBubble;
