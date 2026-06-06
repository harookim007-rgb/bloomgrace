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
    sm: { text: "text-[15px]", mark: 24, tag: "text-[8px] tracking-[0.28em]", gap: "gap-2", mt: "mt-1" },
    md: { text: "text-[18px] md:text-[24px]", mark: 32, tag: "text-[9px] md:text-[10px] tracking-[0.32em]", gap: "gap-2 md:gap-2.5", mt: "mt-1.5" },
    lg: { text: "text-[28px] md:text-[34px]", mark: 42, tag: "text-[10.5px] tracking-[0.36em]", gap: "gap-3", mt: "mt-2" },
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
        filter: "drop-shadow(0 2px 4px hsl(348 60% 55% / 0.15))",
      }}
      className="shrink-0 object-contain select-none"
      draggable={false}
    />
  );
};

export default BrandLogo;
