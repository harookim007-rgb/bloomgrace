import { useMemo } from "react";

interface FallingPetalsProps {
  count?: number;
  className?: string;
}

const PetalShape = () => (
  <svg viewBox="-20 -20 40 40" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <defs>
      <radialGradient id="petalGrad" cx="50%" cy="40%" r="60%">
        <stop offset="0%" stopColor="hsl(348 100% 97%)" />
        <stop offset="60%" stopColor="hsl(348 80% 88%)" />
        <stop offset="100%" stopColor="hsl(348 70% 78%)" />
      </radialGradient>
    </defs>
    <path
      d="M0 14 C -10 10, -14 0, -10 -8 C -6 -14, -2 -16, 0 -14 C 2 -16, 6 -14, 10 -8 C 14 0, 10 10, 0 14 Z"
      fill="url(#petalGrad)"
      stroke="hsl(348 60% 70%)"
      strokeWidth="0.4"
      strokeOpacity="0.5"
    />
  </svg>
);

const FallingPetals = ({ count = 14, className = "" }: FallingPetalsProps) => {
  const petals = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 10 + Math.random() * 18,
        duration: 14 + Math.random() * 14,
        delay: -Math.random() * 20,
        sway: 20 + Math.random() * 40,
        rotateSpeed: 4 + Math.random() * 6,
        opacity: 0.35 + Math.random() * 0.45,
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
            animation: `petal-fall ${p.duration}s linear ${p.delay}s infinite, petal-sway ${p.rotateSpeed}s ease-in-out ${p.delay}s infinite alternate`,
            // @ts-ignore custom prop
            ["--sway" as any]: `${p.sway}px`,
          }}
        >
          <PetalShape />
        </div>
      ))}
    </div>
  );
};

export default FallingPetals;
