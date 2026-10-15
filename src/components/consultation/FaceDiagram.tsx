import type { Zone } from "@/lib/consultationData";

// Line drawing of a face that softly pulses the areas being asked about or diagnosed
// (T-zone, cheeks, whole face, breakouts, redness).

const COLORS = { oily: "#e3a27a", dry: "#8fbbe0", sensitive: "#ee9aa5", balanced: "#a9d3a0", focus: "#d98fa0" };

const ZONE_SHAPES: Record<Exclude<Zone, "spots" | "redness">, JSX.Element> = {
  full: <path d="M64,92 C66,60 134,60 136,92 L136,120 C136,152 118,174 100,176 C82,174 64,152 64,120 Z" />,
  tzone: <path d="M72,76 C72,68 128,68 128,76 L128,88 C128,93 110,92 107,97 L107,133 C107,139 93,139 93,133 L93,97 C90,92 72,93 72,88 Z" />,
  cheeks: <g><ellipse cx="80" cy="130" rx="13" ry="10" /><ellipse cx="120" cy="130" rx="13" ry="10" /></g>,
};

type Highlight = { oily?: Zone[]; dry?: Zone[]; sensitive?: boolean; spots?: boolean; balanced?: boolean; focus?: Zone };

const Area = ({ zone, color, delay = 0 }: { zone: Zone; color: string; delay?: number }) => {
  const style = { fill: color, animation: `face-pulse 2.4s ease-in-out ${delay}s infinite` };
  if (zone === "spots") {
    return (
      <g style={{ ...style, fill: "#c25a68" }}>
        {[[90, 82], [111, 80], [78, 140], [122, 136], [100, 164], [86, 120]].map(([cx, cy]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2.8" />)}
      </g>
    );
  }
  if (zone === "redness") {
    return <g style={style}><ellipse cx="80" cy="130" rx="14" ry="10" /><ellipse cx="120" cy="130" rx="14" ry="10" /><ellipse cx="100" cy="132" rx="6" ry="5" /></g>;
  }
  return <g style={style}>{ZONE_SHAPES[zone]}</g>;
};

const FaceDiagram = ({ highlight, labels, className = "" }: {
  highlight: Highlight;
  labels?: { oily: string; dry: string; sensitive: string; breakouts: string; balanced: string };
  className?: string;
}) => {
  const legend = labels ? [
    highlight.oily?.length ? { color: COLORS.oily, text: labels.oily } : null,
    highlight.dry?.length ? { color: COLORS.dry, text: labels.dry } : null,
    highlight.sensitive ? { color: COLORS.sensitive, text: labels.sensitive } : null,
    highlight.spots ? { color: "#c25a68", text: labels.breakouts } : null,
    highlight.balanced ? { color: COLORS.balanced, text: labels.balanced } : null,
  ].filter(Boolean) as { color: string; text: string }[] : [];

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <style>{`@keyframes face-pulse { 0%, 100% { opacity: .35 } 50% { opacity: .8 } } @media (prefers-reduced-motion: reduce) { [style*="face-pulse"] { animation: none !important; opacity: .6 } }`}</style>
      <svg viewBox="30 40 140 200" className="w-40 h-auto md:w-48" role="img" aria-hidden="true">
        {highlight.balanced && <Area zone="full" color={COLORS.balanced} />}
        {highlight.dry?.map((z, i) => <Area key={`d${z}`} zone={z} color={COLORS.dry} delay={i * 0.3} />)}
        {highlight.oily?.map((z, i) => <Area key={`o${z}`} zone={z} color={COLORS.oily} delay={0.6 + i * 0.3} />)}
        {highlight.sensitive && <Area zone="redness" color={COLORS.sensitive} />}
        {highlight.spots && <Area zone="spots" color="#c25a68" delay={0.4} />}
        {highlight.focus && <Area zone={highlight.focus} color={COLORS.focus} />}
        <g fill="none" stroke="#5f6b78" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M62,96 C60,48 140,48 138,96 L138,120 C138,156 120,180 100,182 C80,180 62,156 62,120 Z" />
          <path d="M64,90 C70,62 92,54 112,58 C102,62 96,72 94,80 C84,70 72,74 64,90" />
          <path d="M59,104 C52,104 52,124 61,126" /><path d="M141,104 C148,104 148,124 139,126" />
          <path d="M76,96 Q86,90 96,96" /><path d="M104,96 Q114,90 124,96" />
          <ellipse cx="86" cy="106" rx="5.5" ry="2.6" /><ellipse cx="114" cy="106" rx="5.5" ry="2.6" />
          <path d="M100,110 L98,131 Q101,135 105,132" />
          <path d="M89,151 Q100,145 111,151 Q100,158 89,151" />
          <path d="M90,180 L88,202 C66,206 46,214 36,238" /><path d="M110,180 L112,202 C134,206 154,214 164,238" />
        </g>
      </svg>
      {legend.length > 0 && (
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5">
          {legend.map(l => (
            <span key={l.text} className="inline-flex items-center gap-1.5 text-xs font-sans text-muted-foreground">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: l.color }} />{l.text}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default FaceDiagram;
