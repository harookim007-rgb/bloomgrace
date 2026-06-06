import { useMemo } from "react";

interface FallingPetalsProps {
  count?: number;
  className?: string;
}

// Soft watercolor sakura petal — no stroke, gradient blush
const PetalShape = ({ tone = 0 }: { tone?: number }) => {
  const id = `petalGrad-${tone}`;
  const stops = [
    ["348 100% 98%", "345 85% 90%", "345 75% 82%"], // pale blush
    ["350 95% 97%", "348 80% 88%", "345 70% 80%"], // softer pink
    ["345 100% 99%", "345 75% 92%", "340 65% 84%"], // whisper pink
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

const FallingPetals = ({ count = 22, className = "" }: FallingPetalsProps) => {
  const petals = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 8 + Math.random() * 20,
        duration: 16 + Math.random() * 18,
        delay: -Math.random() * 26,
        sway: -60 + Math.random() * 120,
        rotateSpeed: 5 + Math.random() * 8,
        opacity: 0.45 + Math.random() * 0.4,
        tone: i % 3,
        blur: Math.random() > 0.6 ? 0.4 : 0,
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
            animation: `petal-fall ${p.duration}s linear ${p.delay}s infinite, petal-sway ${p.rotateSpeed}s ease-in-out ${p.delay}s infinite alternate`,
            // @ts-ignore
            ["--sway" as any]: `${p.sway}px`,
          }}
        >
          <PetalShape tone={p.tone} />
        </div>
      ))}
    </div>
  );
};

export default FallingPetals;
