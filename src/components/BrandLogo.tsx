import { Link } from "react-router-dom";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  className?: string;
  asLink?: boolean;
}

/**
 * BLOOM & GRACE — premium K-Beauty brand mark
 * Inspired by line-art heart-flower monograms: a continuous-line heart
 * cradling a blooming lotus, evoking love + Korean floral beauty.
 */
const BrandLogo = ({ size = "md", showTagline = true, className = "", asLink = true }: BrandLogoProps) => {
  const sizes = {
    sm: { text: "text-[15px]", mark: 26, tag: "text-[8.5px] tracking-[0.38em]", gap: "gap-2", mt: "mt-1" },
    md: { text: "text-lg md:text-2xl", mark: 34, tag: "text-[9.5px] md:text-[10.5px] tracking-[0.42em]", gap: "gap-2 md:gap-3", mt: "mt-1.5" },
    lg: { text: "text-2xl md:text-3xl", mark: 44, tag: "text-[11px] tracking-[0.46em]", gap: "gap-3", mt: "mt-2" },
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
 * Continuous-line heart embracing a lotus bloom.
 * Drawn with thin elegant strokes — premium / editorial / K-beauty.
 */
export const BloomMark = ({ size = 34 }: { size?: number }) => {
  const stroke = "hsl(var(--primary))";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="shrink-0"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Outer heart — single elegant line */}
      <path
        d="M32 54
           C 14 42, 8 30, 12 20
           C 15 12, 25 11, 32 19
           C 39 11, 49 12, 52 20
           C 56 30, 50 42, 32 54 Z"
        stroke={stroke}
        strokeWidth="1.4"
        fill="none"
      />

      {/* Inner lotus — three layered petals nested in the heart */}
      {/* Left outer petal */}
      <path
        d="M32 44
           C 22 40, 19 32, 22 26
           C 25 22, 30 23, 32 28"
        stroke={stroke}
        strokeWidth="1.2"
        fill="none"
      />
      {/* Right outer petal */}
      <path
        d="M32 44
           C 42 40, 45 32, 42 26
           C 39 22, 34 23, 32 28"
        stroke={stroke}
        strokeWidth="1.2"
        fill="none"
      />
      {/* Center petal (the bloom) — closed teardrop */}
      <path
        d="M32 42
           C 27 38, 27 30, 32 24
           C 37 30, 37 38, 32 42 Z"
        stroke={stroke}
        strokeWidth="1.2"
        fill="hsl(var(--primary) / 0.08)"
      />
      {/* Tiny stamen accent */}
      <path
        d="M32 34 L 32 28"
        stroke={stroke}
        strokeWidth="1"
      />
      <circle cx="32" cy="27" r="1" fill={stroke} />
    </svg>
  );
};

export default BrandLogo;
