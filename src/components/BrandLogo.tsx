import { Link } from "react-router-dom";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  className?: string;
  asLink?: boolean;
}

/**
 * BLOOM & GRACE — K-Beauty brand mark
 * 5 pink hearts arranged as a flower (inspired by user reference).
 */
const BrandLogo = ({ size = "md", showTagline = true, className = "", asLink = true }: BrandLogoProps) => {
  const sizes = {
    sm: { text: "text-[15px]", mark: 32, tag: "text-[8.5px] tracking-[0.36em]", gap: "gap-2", mt: "mt-1" },
    md: { text: "text-lg md:text-2xl", mark: 40, tag: "text-[9.5px] md:text-[10.5px] tracking-[0.4em]", gap: "gap-2 md:gap-3", mt: "mt-1.5" },
    lg: { text: "text-2xl md:text-3xl", mark: 52, tag: "text-[11px] tracking-[0.44em]", gap: "gap-3", mt: "mt-2" },
  }[size];

  const content = (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <div className={`flex items-center ${sizes.gap}`}>
        <span className={`${sizes.text} font-serif font-semibold tracking-[0.18em] md:tracking-[0.22em] uppercase text-foreground leading-none`}>
          Bloom
        </span>
        <BloomMark size={sizes.mark} />
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
 * 5 hearts arranged in a flower shape — pointed tips inward, rounded lobes outward.
 * Pink, solid, instantly legible.
 */
export const BloomMark = ({ size = 32 }: { size?: number }) => {
  // One heart pointing UP (tip at top-center near origin, lobes hanging below).
  // Placed so the tip sits near (0,0) and the heart extends downward.
  const heart =
    "M0 0 C -3 -6, -14 -6, -14 2 C -14 9, -6 14, 0 20 C 6 14, 14 9, 14 2 C 14 -6, 3 -6, 0 0 Z";

  return (
    <svg
      width={size}
      height={size}
      viewBox="-40 -40 80 80"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="shrink-0"
    >
      {[0, 72, 144, 216, 288].map((deg) => (
        <path
          key={deg}
          d={heart}
          fill="hsl(var(--primary))"
          transform={`rotate(${deg}) translate(0 -2)`}
        />
      ))}
    </svg>
  );
};

export default BrandLogo;
