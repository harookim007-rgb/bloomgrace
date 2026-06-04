import { Link } from "react-router-dom";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  className?: string;
  asLink?: boolean;
}

const BrandLogo = ({ size = "md", showTagline = true, className = "", asLink = true }: BrandLogoProps) => {
  const sizes = {
    sm: { text: "text-[15px]", mark: 20, tag: "text-[8px] tracking-[0.28em]", gap: "gap-2", mt: "mt-1" },
    md: { text: "text-[18px] md:text-[24px]", mark: 26, tag: "text-[9px] md:text-[10px] tracking-[0.32em]", gap: "gap-2 md:gap-2.5", mt: "mt-1.5" },
    lg: { text: "text-[28px] md:text-[34px]", mark: 34, tag: "text-[10.5px] tracking-[0.36em]", gap: "gap-3", mt: "mt-2" },
  }[size];

  const content = (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <div className={`flex items-center ${sizes.gap}`}>
        <span className={`${sizes.text} font-serif font-semibold tracking-[0.14em] md:tracking-[0.18em] uppercase text-foreground leading-none`}>
          Bloom
        </span>
        <SakuraMark size={sizes.mark} />
        <span className={`${sizes.text} font-serif font-semibold tracking-[0.14em] md:tracking-[0.18em] uppercase text-foreground leading-none`}>
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

export const SakuraMark = ({ size = 34 }: { size?: number }) => {
  const petal =
    "M0 -2.2 C -4.3 -5.2, -7.4 -10.5, -6.3 -14.8 C -5.5 -18.3, -2.6 -19.5, -0.8 -16.8 L 0 -15.1 L 0.8 -16.8 C 2.6 -19.5, 5.5 -18.3, 6.3 -14.8 C 7.4 -10.5, 4.3 -5.2, 0 -2.2 Z";

  return (
    <svg
      width={size}
      height={size}
      viewBox="-20 -20 40 40"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="shrink-0"
    >
      <g opacity="0.12" transform="translate(0 0.9)">
        {[0, 72, 144, 216, 288].map((deg) => (
          <path
            key={`shadow-${deg}`}
            d={petal}
            fill="hsl(var(--primary))"
            strokeLinejoin="round"
            transform={`rotate(${deg})`}
          />
        ))}
      </g>
      {[0, 72, 144, 216, 288].map((deg) => (
        <path
          key={`petal-${deg}`}
          d={petal}
          fill="hsl(var(--primary))"
          stroke="hsl(var(--background))"
          strokeWidth="0.9"
          strokeLinejoin="round"
          transform={`rotate(${deg})`}
        />
      ))}
      <circle r="2.5" fill="hsl(var(--primary-soft))" stroke="hsl(var(--primary))" strokeWidth="0.7" />
      {[0, 72, 144, 216, 288].map((deg) => (
        <circle
          key={`center-${deg}`}
          cx={0}
          cy={-4.1}
          r={0.55}
          fill="hsl(var(--background))"
          transform={`rotate(${deg})`}
        />
      ))}
    </svg>
  );
};

export default BrandLogo;
