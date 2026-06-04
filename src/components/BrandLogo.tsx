import { Link } from "react-router-dom";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  className?: string;
  asLink?: boolean;
}

/**
 * BLOOM & GRACE — K-Beauty brand mark
 * A clean cherry-blossom (sakura) symbol between the wordmark.
 */
const BrandLogo = ({ size = "md", showTagline = true, className = "", asLink = true }: BrandLogoProps) => {
  const sizes = {
    sm: { text: "text-[15px]", mark: 22, tag: "text-[8.5px] tracking-[0.36em]", gap: "gap-2", mt: "mt-1" },
    md: { text: "text-lg md:text-2xl", mark: 28, tag: "text-[9.5px] md:text-[10.5px] tracking-[0.4em]", gap: "gap-2 md:gap-2.5", mt: "mt-1.5" },
    lg: { text: "text-2xl md:text-3xl", mark: 36, tag: "text-[11px] tracking-[0.44em]", gap: "gap-3", mt: "mt-2" },
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
 * Sakura (cherry blossom) — 5 notched petals around a small golden center.
 * Notched petal tip is the signature shape of cherry blossom.
 */
export const SakuraMark = ({ size = 28 }: { size?: number }) => {
  // One petal pointing UP from origin: rounded base curves up to a cleft tip.
  // Tip notch sits around y=-22. Petal width ~14.
  const petal =
    "M0 0 C -7 -4, -10 -10, -7 -16 C -5 -20, -2 -21, -1.2 -18.5 L 0 -16 L 1.2 -18.5 C 2 -21, 5 -20, 7 -16 C 10 -10, 7 -4, 0 0 Z";

  return (
    <svg
      width={size}
      height={size}
      viewBox="-24 -24 48 48"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="shrink-0"
    >
      <defs>
        <radialGradient id="sakuraPetal" cx="50%" cy="80%" r="80%">
          <stop offset="0%" stopColor="hsl(348 90% 92%)" />
          <stop offset="60%" stopColor="hsl(348 78% 78%)" />
          <stop offset="100%" stopColor="hsl(348 65% 64%)" />
        </radialGradient>
      </defs>
      {[0, 72, 144, 216, 288].map((deg) => (
        <path
          key={deg}
          d={petal}
          fill="url(#sakuraPetal)"
          stroke="hsl(348 55% 55%)"
          strokeWidth="0.6"
          strokeLinejoin="round"
          transform={`rotate(${deg})`}
        />
      ))}
      {/* center */}
      <circle r="2.2" fill="hsl(45 90% 65%)" />
      {/* tiny stamen dots */}
      {[0, 72, 144, 216, 288].map((deg) => (
        <circle
          key={`s-${deg}`}
          cx={0}
          cy={-4.5}
          r={0.7}
          fill="hsl(45 80% 55%)"
          transform={`rotate(${deg})`}
        />
      ))}
    </svg>
  );
};

export default BrandLogo;
