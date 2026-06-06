// Subtle faded Hangul characters as a luxury K-beauty background motif.
// Decorative only — not localized.

interface Props {
  className?: string;
  variant?: "corner" | "side" | "scattered";
}

const HangulWatermark = ({ className = "", variant = "scattered" }: Props) => {
  const words = ["아름다움", "꽃", "한국의 미", "은은함", "벚꽃", "고요", "순수"];

  if (variant === "corner") {
    return (
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute select-none font-serif text-foreground/[0.04] ${className}`}
        style={{ fontFamily: "'Noto Sans KR', serif" }}
      >
        <div className="text-[120px] md:text-[180px] leading-none font-bold">아름다움</div>
      </div>
    );
  }

  if (variant === "side") {
    return (
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute select-none ${className}`}
        style={{ writingMode: "vertical-rl", fontFamily: "'Noto Sans KR', serif" }}
      >
        <span className="text-[60px] md:text-[90px] leading-[1.2] tracking-[0.4em] text-foreground/[0.05] font-light">
          한국의 아름다움
        </span>
      </div>
    );
  }

  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden select-none ${className}`}>
      {words.map((w, i) => (
        <span
          key={i}
          className="absolute font-serif font-light text-foreground/[0.045]"
          style={{
            fontFamily: "'Noto Sans KR', serif",
            top: `${(i * 17 + 8) % 90}%`,
            left: `${(i * 23 + 5) % 85}%`,
            fontSize: `${48 + (i % 4) * 22}px`,
            transform: `rotate(${(i % 2 ? -1 : 1) * (i * 3)}deg)`,
            letterSpacing: "0.15em",
          }}
        >
          {w}
        </span>
      ))}
    </div>
  );
};

export default HangulWatermark;
