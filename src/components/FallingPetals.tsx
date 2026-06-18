import { useMemo } from "react";

interface FallingPetalsProps {
  count?: number;
  className?: string;
}

// Soft watercolor sakura petal / leaf — no stroke, ultra-refined gradient
const PetalShape = ({ kind = "petal", tone = 0 }: { kind?: "petal" | "leaf"; tone?: number }) => {
  const id = `${kind}Grad-${tone}-${Math.random().toString(36).slice(2, 7)}`;

  if (kind === "leaf") {
    // Muted sage / olive / soft jade — luxurious botanical palette
    const stops = [
      ["100 35% 92%", "120 28% 74%", "135 30% 54%"], // soft sage
      ["85 30% 90%", "110 24% 68%", "140 28% 50%"],  // dusty olive
      ["110 32% 93%", "125 26% 72%", "145 26% 56%"], // pale jade
    ][tone % 3];
    return (
      <svg viewBox="-20 -20 40 40" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <defs>
          <radialGradient id={id} cx="50%" cy="38%" r="78%">
            <stop offset="0%" stopColor={`hsl(${stops[0]})`} stopOpacity="0.9" />
            <stop offset="55%" stopColor={`hsl(${stops[1]})`} stopOpacity="0.78" />
            <stop offset="100%" stopColor={`hsl(${stops[2]})`} stopOpacity="0.55" />
          </radialGradient>
        </defs>
        <path
          d="M0 -16 C 8 -10, 11 0, 8 9 C 4 14, 0 16, 0 16 C 0 16, -4 14, -8 9 C -11 0, -8 -10, 0 -16 Z"
          fill={`url(#${id})`}
        />
        <path
          d="M0 -13 L0 13"
          stroke={`hsl(${stops[2]})`}
          strokeWidth="0.4"
          strokeOpacity="0.35"
          fill="none"
        />
      </svg>
    );
  }

  // Refined pink palettes — blush, rose, champagne-rose
  const stops = [
    ["348 100% 98%", "345 70% 91%", "345 55% 84%"], // blush
    ["350 90% 97%", "348 65% 89%", "344 55% 82%"],  // rose
    ["20 40% 96%", "350 50% 92%", "342 45% 85%"],   // champagne rose
  ][tone % 3];
  return (
    <svg viewBox="-20 -20 40 40" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <radialGradient id={id} cx="50%" cy="32%" r="72%">
          <stop offset="0%" stopColor={`hsl(${stops[0]})`} stopOpacity="0.95" />
          <stop offset="55%" stopColor={`hsl(${stops[1]})`} stopOpacity="0.82" />
          <stop offset="100%" stopColor={`hsl(${stops[2]})`} stopOpacity="0.55" />
        </radialGradient>
      </defs>
      <path
        d="M0 15 C -11 12, -15 2, -11 -7 C -7 -14, -2 -16, 0 -13 C 2 -16, 7 -14, 11 -7 C 15 2, 11 12, 0 15 Z"
        fill={`url(#${id})`}
      />
    </svg>
  );
};

const FallingPetals = ({ count = 14, className = "" }: FallingPetalsProps) => {
  const petals = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        // Slightly smaller, more refined sizes
        size: 6 + Math.random() * 11,
        // Slower, more luxurious drift
        duration: 55 + Math.random() * 35,
        delay: -Math.random() * 80,
        // Wider gentle wind sway
        sway: 100 + Math.random() * 160,
        swayDir: Math.random() > 0.5 ? 1 : -1,
        // Very slow side-to-side breeze
        swaySpeed: 7 + Math.random() * 6,
        // Softer, more subtle opacity
        opacity: 0.18 + Math.random() * 0.22,
        tone: i % 3,
        // Finer, more dreamy blur
        blur: 0.6 + Math.random() * 1.1,
        // Mix: ~50% pink petals, ~50% green leaves
        kind: (Math.random() < 0.5 ? "petal" : "leaf") as "petal" | "leaf",
      })),
    [count]
  );

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {petals.map((p) => (
        <div
          key={p.id}
          className="absolute top-[-40px]"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            filter: p.blur ? `blur(${p.blur}px)` : undefined,
            animation: `petal-fall ${p.duration}s linear ${p.delay}s infinite, petal-sway ${p.swaySpeed}s ease-in-out ${p.delay}s infinite alternate`,
            // @ts-ignore
            ["--sway" as any]: `${p.sway * p.swayDir}px`,
          }}
        >
          <PetalShape kind={p.kind} tone={p.tone} />
        </div>
      ))}
    </div>
  );
};

export default FallingPetals;
