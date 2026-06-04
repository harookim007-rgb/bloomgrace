import { Link } from "react-router-dom";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  className?: string;
  asLink?: boolean;
}

/**
 * BLOOM & GRACE brand logo
 * - Custom ornament between BLOOM and GRACE: heart morphing into a blooming flower
 * - Optional tagline "KOREAN COSMETICS" underneath
 */
const BrandLogo = ({ size = "md", showTagline = true, className = "", asLink = true }: BrandLogoProps) => {
  const sizes = {
    sm: { text: "text-base", ornament: 18, tag: "text-[9px] tracking-[0.32em]", gap: "gap-1.5", mt: "mt-0.5" },
    md: { text: "text-lg md:text-2xl", ornament: 22, tag: "text-[10px] md:text-[11px] tracking-[0.34em]", gap: "gap-2", mt: "mt-1" },
    lg: { text: "text-2xl md:text-3xl", ornament: 28, tag: "text-xs tracking-[0.38em]", gap: "gap-2.5", mt: "mt-1.5" },
  }[size];

  const content = (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <div className={`flex items-center ${sizes.gap}`}>
        <span className={`${sizes.text} font-serif font-bold tracking-[0.12em] md:tracking-[0.18em] uppercase text-foreground`}>
          BLOOM
        </span>
        <BloomMark size={sizes.ornament} />
        <span className={`${sizes.text} font-serif font-bold tracking-[0.12em] md:tracking-[0.18em] uppercase text-foreground`}>
          GRACE
        </span>
      </div>
      {showTagline && (
        <span className={`${sizes.tag} ${sizes.mt} font-sans font-semibold uppercase text-primary/80`}>
          Korean&nbsp;Cosmetics
        </span>
      )}
    </div>
  );

  if (!asLink) return content;
  return <Link to="/" aria-label="BLOOM & GRACE — Korean Cosmetics">{content}</Link>;
};

/**
 * Ornamental mark: a heart that opens into a blooming flower.
 * Hand-built SVG so it scales crisply and inherits theme color.
 */
export const BloomMark = ({ size = 24 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    className="shrink-0"
  >
    <defs>
      <linearGradient id="bg-petal" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.95" />
        <stop offset="100%" stopColor="hsl(var(--secondary))" stopOpacity="0.9" />
      </linearGradient>
      <radialGradient id="bg-center" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="hsl(var(--primary-soft))" />
        <stop offset="100%" stopColor="hsl(var(--primary))" />
      </radialGradient>
    </defs>

    {/* Four outer petals (rotated hearts forming a flower) */}
    {[0, 90, 180, 270].map((deg) => (
      <g key={deg} transform={`rotate(${deg} 24 24)`}>
        <path
          d="M24 12 C 20 6, 12 8, 12 16 C 12 21, 18 24, 24 28 C 30 24, 36 21, 36 16 C 36 8, 28 6, 24 12 Z"
          fill="url(#bg-petal)"
          opacity="0.55"
          transform="translate(0 -4) scale(0.55) translate(20 20)"
        />
      </g>
    ))}

    {/* Two diagonal accent petals for depth */}
    {[45, 135, 225, 315].map((deg) => (
      <g key={deg} transform={`rotate(${deg} 24 24)`}>
        <ellipse
          cx="24"
          cy="14"
          rx="3.2"
          ry="6"
          fill="hsl(var(--primary))"
          opacity="0.35"
        />
      </g>
    ))}

    {/* Central heart - the soul of the mark */}
    <path
      d="M24 32 C 16 26, 12 21, 14 16.5 C 15.5 13, 19.5 12.5, 22 15 L 24 17 L 26 15 C 28.5 12.5, 32.5 13, 34 16.5 C 36 21, 32 26, 24 32 Z"
      fill="url(#bg-center)"
      stroke="hsl(var(--primary))"
      strokeWidth="0.6"
    />

    {/* Tiny highlight - the craftsmanship dot */}
    <circle cx="20" cy="18" r="1.2" fill="hsl(var(--background))" opacity="0.7" />
  </svg>
);

export default BrandLogo;
