import { Link } from "react-router-dom";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  className?: string;
  asLink?: boolean;
}

/**
 * BLOOM & GRACE — K-Beauty brand mark
 * Simple, graphic: a soft pink heart with a tulip bloom cut out of it.
 */
const BrandLogo = ({ size = "md", showTagline = true, className = "", asLink = true }: BrandLogoProps) => {
  const sizes = {
    sm: { text: "text-[15px]", mark: 24, tag: "text-[8.5px] tracking-[0.36em]", gap: "gap-2", mt: "mt-1" },
    md: { text: "text-lg md:text-2xl", mark: 30, tag: "text-[9.5px] md:text-[10.5px] tracking-[0.4em]", gap: "gap-2 md:gap-2.5", mt: "mt-1.5" },
    lg: { text: "text-2xl md:text-3xl", mark: 40, tag: "text-[11px] tracking-[0.44em]", gap: "gap-3", mt: "mt-2" },
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
 * Simple pink heart with a tulip silhouette cut out.
 * Bold, single-color, instantly readable at any size.
 */
export const BloomMark = ({ size = 30 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    className="shrink-0"
  >
    <defs>
      <linearGradient id="bg-heart" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="hsl(348 70% 70%)" />
        <stop offset="100%" stopColor="hsl(348 55% 55%)" />
      </linearGradient>
    </defs>

    {/* Solid pink heart, the body of the mark */}
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M32 56 C 10 42, 4 28, 10 18 C 14 11, 24 10, 32 18 C 40 10, 50 11, 54 18 C 60 28, 54 42, 32 56 Z
         M32 42 C 26 36, 26 28, 32 22 C 38 28, 38 36, 32 42 Z"
      fill="url(#bg-heart)"
    />

    {/* Two small leaves under the bloom for the "blooming" feel */}
    <path
      d="M28 44 C 24 44, 22 46, 22 49 C 25 49, 27 47, 28 44 Z"
      fill="hsl(348 70% 70%)"
      opacity="0.95"
    />
    <path
      d="M36 44 C 40 44, 42 46, 42 49 C 39 49, 37 47, 36 44 Z"
      fill="hsl(348 70% 70%)"
      opacity="0.95"
    />
  </svg>
);

export default BrandLogo;
