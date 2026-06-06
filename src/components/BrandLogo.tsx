import { Link } from "react-router-dom";
import floralLogo from "@/assets/sakura-logo-3d.png";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  className?: string;
  asLink?: boolean;
}

const BrandLogo = ({ size = "md", showTagline = true, className = "", asLink = true }: BrandLogoProps) => {
  const sizes = {
    sm: { text: "text-[22px]", mark: 36, tag: "text-[8px] tracking-[0.28em]", gap: "gap-2", mt: "mt-0.5" },
    md: { text: "text-[28px] md:text-[34px]", mark: 48, tag: "text-[9px] md:text-[10px] tracking-[0.32em]", gap: "gap-2 md:gap-3", mt: "mt-1" },
    lg: { text: "text-[40px] md:text-[52px]", mark: 72, tag: "text-[10.5px] tracking-[0.36em]", gap: "gap-3 md:gap-4", mt: "mt-1.5" },
  }[size];

  const content = (
    <div className={`inline-flex items-center ${sizes.gap} ${className}`}>
      <FloralMark size={sizes.mark} />
      <div className="flex flex-col items-start leading-none">
        <span className={`${sizes.text} font-elegant font-medium tracking-[0.04em] text-foreground leading-[1] whitespace-nowrap`}>
          Bloom <span className="text-primary">&amp;</span> Grace
        </span>
        {showTagline && (
          <span className={`${sizes.tag} ${sizes.mt} font-sans font-semibold uppercase text-primary/80 leading-none`}>
            K-Beauty&nbsp;Shop
          </span>
        )}
      </div>
    </div>
  );

  if (!asLink) return content;
  return (
    <Link to="/" aria-label="Bloom & Grace — K-Beauty Shop" className="inline-block">
      {content}
    </Link>
  );
};

export const FloralMark = ({ size = 40 }: { size?: number }) => (
  <img
    src={floralLogo}
    alt=""
    aria-hidden="true"
    width={size}
    height={size}
    style={{ width: size, height: size, filter: "drop-shadow(0 4px 10px hsl(345 55% 55% / 0.22))" }}
    className="shrink-0 object-contain select-none"
    draggable={false}
  />
);

// Backwards compatibility alias
export const SakuraMark = FloralMark;

export default BrandLogo;
