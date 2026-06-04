import { Link } from "react-router-dom";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  className?: string;
  asLink?: boolean;
}

/**
 * BLOOM & GRACE — K-Beauty wordmark with a unique double-layer sakura mark.
 */
const BrandLogo = ({ size = "md", showTagline = true, className = "", asLink = true }: BrandLogoProps) => {
  const sizes = {
    sm: { text: "text-[15px]", mark: 26, tag: "text-[8.5px] tracking-[0.36em]", gap: "gap-2", mt: "mt-1" },
    md: { text: "text-lg md:text-2xl", mark: 34, tag: "text-[9.5px] md:text-[10.5px] tracking-[0.4em]", gap: "gap-2 md:gap-2.5", mt: "mt-1.5" },
    lg: { text: "text-2xl md:text-3xl", mark: 44, tag: "text-[11px] tracking-[0.44em]", gap: "gap-3", mt: "mt-2" },
  }[size];

  const content = (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <div className={`flex items-center ${sizes.gap}`}>
        <span className={`${sizes.text} font-serif font-semibold tracking-[0.18em] md:tracking-[0.22em] uppercase text-foreground leading-none`}>
          Bloom
        </span>
        <SakuraMark size={sizes.mark} />
        <span className={`${sizes.text} font-serif font-semibold tracking-[0.18em] md:tracking-[0.22em] uppercase text-foreground leading-none`}>
          Grace
        </span>
      </div>
      {showTagline && (
        <span className={`${sizes.tag} ${sizes.mt} font-sans font-semibold uppercase text-primary leading-none`}>
          K-Beauty&nbsp;Shop
        </span>
      )}
    </div>
  );

  if (!asLink) return content;
  return (
    <Link to="/" aria-label="BLOOM & GRACE — K-Beauty Shop" className="inline-block">
      {content}
    </Link>
  );
};

/**
 * Unique sakura mark — two overlapping 5-petal blossoms (one solid, one rotated outline)
 * with a small gold center. Reads as a cherry-blossom rosette.
 */
export const SakuraMark = ({ size = 34 }: { size?: number }) => {
  // Petal with notched (cleft) tip — signature sakura silhouette.
  const petal =
    "M0 -2 C -6 -5, -10 -11, -8 -16 C -6.5 -19, -3.5 -19.5, -1.5 -17 L 0 -14.5 L 1.5 -17 C 3.5 -19.5, 6.5 -19, 8 -16 C 10 -11, 6 -5, 0 -2 Z";

  return (
    <svg
      width={size}
      height={size}
      viewBox="-22 -22 44 44"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="shrink-0"
    >
      <defs>
        <radialGradient id="sakuraFill" cx="50%" cy="35%" r="75%">
          <stop offset="0%" stopColor="hsl(348 100% 96%)" />
          <stop offset="55%" stopColor="hsl(348 82% 80%)" />
          <stop offset="100%" stopColor="hsl(348 65% 62%)" />
        </radialGradient>
      </defs>

      {/* Back layer: rotated outline petals (offset 36°) for depth */}
      <g opacity="0.55">
        {[36, 108, 180, 252, 324].map((deg) => (
          <path
            key={`b-${deg}`}
            d={petal}
            fill="hsl(348 60% 92%)"
            stroke="hsl(348 55% 60%)"
            strokeWidth="0.5"
            strokeLinejoin="round"
            transform={`rotate(${deg}) scale(0.85)`}
          />
        ))}
      </g>

      {/* Front layer: filled petals */}
      {[0, 72, 144, 216, 288].map((deg) => (
        <path
          key={`f-${deg}`}
          d={petal}
          fill="url(#sakuraFill)"
          stroke="hsl(348 55% 50%)"
          strokeWidth="0.7"
          strokeLinejoin="round"
          transform={`rotate(${deg})`}
        />
      ))}

      {/* Center: gold pistil with stamen dots */}
      <circle r="2.4" fill="hsl(45 92% 62%)" stroke="hsl(35 70% 45%)" strokeWidth="0.3" />
      {[0, 60, 120, 180, 240, 300].map((deg) => (
        <circle
          key={`s-${deg}`}
          cx={0}
          cy={-4.8}
          r={0.7}
          fill="hsl(40 85% 55%)"
          transform={`rotate(${deg})`}
        />
      ))}
    </svg>
  );
};

export default BrandLogo;
