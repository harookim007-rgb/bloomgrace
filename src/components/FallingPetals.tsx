import { useMemo } from "react";

interface FallingPetalsProps {
  count?: number;
  className?: string;
}

// Sakura petal (pink) or leaf (green) — soft watercolor, no stroke
const PetalShape = ({ kind = "petal", tone = 0 }: { kind?: "petal" | "leaf"; tone?: number }) => {
  const id = `${kind}Grad-${tone}-${Math.random().toString(36).slice(2, 7)}`;

  if (kind === "leaf") {
    const stops = [
      ["95 55% 88%", "120 40% 70%", "135 45% 50%"], // fresh green
      ["80 50% 85%", "110 38% 65%", "140 42% 48%"], // sage green
      ["105 50% 90%", "125 42% 72%", "145 40% 52%"], // soft leaf
    ][tone % 3];
    return (
      <svg viewBox="-20 -20 40 40" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <defs>
          <radialGradient id={id} cx="50%" cy="40%" r="75%">
            <stop offset="0%" stopColor={`hsl(${stops[0]})`} stopOpacity="0.95" />
            <stop offset="55%" stopColor={`hsl(${stops[1]})`} stopOpacity="0.85" />
            <stop offset="100%" stopColor={`hsl(${stops[2]})`} stopOpacity="0.65" />
          </radialGradient>
        </defs>
        {/* Pointed oval leaf */}
        <path
          d="M0 -16 C 9 -10, 12 0, 9 9 C 5 14, 0 16, 0 16 C 0 16, -5 14, -9 9 C -12 0, -9 -10, 0 -16 Z"
          fill={`url(#${id})`}
        />
        <path
          d="M0 -14 L0 14"
          stroke={`hsl(${stops[2]})`}
          strokeWidth="0.6"
          strokeOpacity="0.5"
          fill="none"
        />
      </svg>
    );
  }

  const stops = [
    ["348 100% 98%", "345 85% 90%", "345 75% 82%"],
    ["350 95% 97%", "348 80% 88%", "345 70% 80%"],
    ["345 100% 99%", "345 75% 92%", "340 65% 84%"],
  ][tone % 3];
  return (
    <svg viewBox="-20 -20 40 40" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <radialGradient id={id} cx="50%" cy="35%" r="70%">
          <stop offset="0%" stopColor={`hsl(${stops[0]})`} stopOpacity="0.95" />
          <stop offset="55%" stopColor={`hsl(${stops[1]})`} stopOpacity="0.85" />
          <stop offset="100%" stopColor={`hsl(${stops[2]})`} stopOpacity="0.6" />
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
        size: 7 + Math.random() * 13,
        // Slower, more drifting fall
        duration: 42 + Math.random() * 30,
        delay: -Math.random() * 60,
        // Wider wind sway
        sway: 80 + Math.random() * 140,
        swayDir: Math.random() > 0.5 ? 1 : -1,
        // Slow gentle side-to-side
        swaySpeed: 5 + Math.random() * 5,
        opacity: 0.2 + Math.random() * 0.25,
        tone: i % 3,
        blur: 0.4 + Math.random() * 0.9,
        // Mix: ~55% pink petals, ~45% green leaves
        kind: (Math.random() < 0.55 ? "petal" : "leaf") as "petal" | "leaf",
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
