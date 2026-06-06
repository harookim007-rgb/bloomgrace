import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import flowerPink from "@/assets/flower-pink.png";
import flowerBlue from "@/assets/flower-blue.png";
import flowerYellow from "@/assets/flower-yellow.png";
import flowerLeaf from "@/assets/flower-leaf.png";

const ASSETS = [flowerPink, flowerBlue, flowerYellow, flowerLeaf];

// Deterministic PRNG so flowers stay in place per route during a session
function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

interface ScatteredFloralsProps {
  /** How many flower elements to scatter */
  count?: number;
  /** Override seed (defaults to current route pathname) */
  seed?: string;
}

/**
 * Small, faded flower elements scattered around the viewport.
 * Sits in a fixed full-screen overlay behind content (z-index 0).
 */
const ScatteredFlorals = ({ count = 9, seed }: ScatteredFloralsProps) => {
  const { pathname } = useLocation();
  const key = seed ?? pathname;

  const items = useMemo(() => {
    const rand = mulberry32(hashString(key));
    return Array.from({ length: count }).map((_, i) => {
      const asset = ASSETS[Math.floor(rand() * ASSETS.length)];
      const size = 28 + Math.floor(rand() * 38); // 28–66px
      const top = rand() * 100;                  // 0–100 vh
      const left = rand() * 100;                 // 0–100 vw
      const rotate = Math.floor(rand() * 360);
      const opacity = 0.05 + rand() * 0.08;      // 0.05–0.13
      const delay = Math.floor(rand() * 1400);
      return { id: i, asset, size, top, left, rotate, opacity, delay };
    });
  }, [key, count]);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden z-0">
      {items.map((it) => (
        <img
          key={it.id}
          src={it.asset}
          alt=""
          loading="lazy"
          className="floral-decor"
          style={{
            position: "absolute",
            top: `${it.top}vh`,
            left: `${it.left}vw`,
            width: it.size,
            height: it.size,
            transform: `translate(-50%, -50%) rotate(${it.rotate}deg)`,
            animationDelay: `${it.delay}ms`,
            ["--floral-opacity" as any]: it.opacity,
          }}
          draggable={false}
        />
      ))}
    </div>
  );
};

export default ScatteredFlorals;
