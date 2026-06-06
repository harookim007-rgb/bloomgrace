import { Link } from "react-router-dom";
import sakuraLogo from "@/assets/sakura-logo-3d.png";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  className?: string;
  asLink?: boolean;
}

const BrandLogo = ({ size = "md", showTagline = true, className = "", asLink = true }: BrandLogoProps) => {
  const sizes = {
    sm: { text: "text-[15px]", mark: 26, tag: "text-[8px] tracking-[0.28em]", gap: "gap-1.5", mt: "mt-1" },
    md: { text: "text-[19px] md:text-[25px]", mark: 36, tag: "text-[9px] md:text-[10px] tracking-[0.32em]", gap: "gap-1.5 md:gap-2", mt: "mt-1.5" },
    lg: { text: "text-[28px] md:text-[36px]", mark: 50, tag: "text-[10.5px] tracking-[0.36em]", gap: "gap-2 md:gap-2.5", mt: "mt-2" },
  }[size];

  const content = (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <div className={`flex items-center ${sizes.gap}`}>
        <span className={`${sizes.text} font-serif font-semibold tracking-[0.14em] md:tracking-[0.18em] uppercase text-foreground leading-none`}>
          Bloom
        </span>
        <span className="relative inline-flex items-center justify-center" aria-hidden="true">
          <SakuraMark size={sizes.mark} />
        </span>
        <span className={`${sizes.text} font-serif font-semibold tracking-[0.14em] md:tracking-[0.18em] uppercase text-foreground leading-none`}>
          Grace
        </span>
      </div>
      {showTagline && (
        <span className={`${sizes.tag} ${sizes.mt} font-sans font-semibold uppercase text-primary/80 leading-none`}>
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

export const SakuraMark = ({ size = 32 }: { size?: number }) => {
  return (
    <img
      src={sakuraLogo}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      style={{
        width: size,
        height: size,
        filter: "drop-shadow(0 2px 5px hsl(348 55% 60% / 0.22))",
      }}
      className="shrink-0 object-contain select-none -mx-0.5"
      draggable={false}
    />
  );
};

export default BrandLogo;
