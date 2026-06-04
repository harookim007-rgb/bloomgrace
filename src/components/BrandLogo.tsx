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
export const BloomMark = ({ size = 40 }: { size?: number }) => {
  // Heart with the pointed TIP at the origin (0,0) and the two rounded lobes
  // extending UPWARD (away from center). When 5 are rotated 72° around (0,0),
  // tips meet at center and lobes radiate outward — a 5-petal heart flower.
  const heart =
    "M0 0 C -3 -6, -12 -10, -12 -16 C -12 -22, -5 -23, 0 -16 C 5 -23, 12 -22, 12 -16 C 12 -10, 3 -6, 0 0 Z";

  return (
    <svg
      width={size}
      height={size}
      viewBox="-24 -24 48 48"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="shrink-0"
    >
      {[0, 72, 144, 216, 288].map((deg) => (
        <path
          key={deg}
          d={heart}
          fill="hsl(var(--primary))"
          transform={`rotate(${deg})`}
        />
      ))}
    </svg>
  );
};

export default BrandLogo;
