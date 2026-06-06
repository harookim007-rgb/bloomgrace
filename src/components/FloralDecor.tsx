import floralCorner from "@/assets/floral-corner.png";

type Corner = "top-left" | "top-right" | "bottom-left" | "bottom-right";

interface FloralDecorProps {
  corner?: Corner;
  size?: number;
  opacity?: number;
  delay?: number;
  className?: string;
}

/**
 * Faded watercolor floral corner decoration that fades in.
 * Use inside a `relative` container.
 */
const FloralDecor = ({
  corner = "top-left",
  size = 280,
  opacity = 0.22,
  delay = 0,
  className = "",
}: FloralDecorProps) => {
  const positions: Record<Corner, React.CSSProperties> = {
    "top-left": { top: 0, left: 0 },
    "top-right": { top: 0, right: 0, transform: "scaleX(-1)" },
    "bottom-left": { bottom: 0, left: 0, transform: "scaleY(-1)" },
    "bottom-right": { bottom: 0, right: 0, transform: "scale(-1, -1)" },
  };

  return (
    <img
      src={floralCorner}
      alt=""
      aria-hidden="true"
      loading="lazy"
      className={`floral-decor ${className}`}
      style={{
        ...positions[corner],
        width: size,
        height: size,
        animationDelay: `${delay}ms`,
        ["--floral-opacity" as any]: opacity,
      }}
      draggable={false}
    />
  );
};

export default FloralDecor;
